const NOTION_VERSION = '2022-06-28';
function notionHeaders() {
  return { 'Authorization': `Bearer ${process.env.NOTION_TOKEN}`, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json' };
}
function richText(arr = []) { return arr.map(t => t.plain_text || '').join(''); }
function escHtml(s = '') { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function renderBlocks(blocks) {
  return blocks.map(b => {
    const c = b[b.type]; if (!c) return '';
    const t = escHtml(richText(c.rich_text));
    if (b.type === 'paragraph') return t ? `<p>${t}</p>` : '';
    if (b.type === 'heading_1') return `<h2>${t}</h2>`;
    if (b.type === 'heading_2') return `<h3>${t}</h3>`;
    if (b.type === 'heading_3') return `<h4>${t}</h4>`;
    if (b.type === 'bulleted_list_item' || b.type === 'numbered_list_item') return `<li>${t}</li>`;
    if (b.type === 'quote') return `<blockquote>${t}</blockquote>`;
    if (b.type === 'callout') return `<p><em>${t}</em></p>`;
    return '';
  }).join('\n');
}
export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).send('Missing slug');
  const dbId = process.env.NOTION_DATABASE_ID;
  const base = 'https://www.integratedplanningpartners.com';
  try {
    const qr = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST', headers: notionHeaders(),
      body: JSON.stringify({ filter: { property: 'Slug', rich_text: { equals: slug } }, page_size: 1 }),
    });
    if (!qr.ok) { const e = await qr.text(); throw new Error(`Notion ${qr.status}: ${e}`); }
    const qd = await qr.json();
    const page = qd.results?.[0];
    if (!page) return res.status(404).json({ debug: true, results: qd.results?.length, db: dbId, slug });
    const p = page.properties;
    const title = escHtml(richText(p.Name?.title || []));
    const summary = escHtml(richText(p.Summary?.rich_text || []));
    const pubDate = p.PublishedDate?.date?.start || '';
    const br = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`, { headers: notionHeaders() });
    const bd = br.ok ? await br.json() : { results: [] };
    const body = renderBlocks(bd.results || []);
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title} — Integrated Planning Partners</title><meta name="description" content="${summary}"><meta property="og:title" content="${title}"><meta property="og:description" content="${summary}"><meta property="og:type" content="article"><link rel="canonical" href="${base}/article.html?slug=${encodeURIComponent(slug)}"><script>if(!/googlebot|bingbot|crawler|spider/i.test(navigator.userAgent))window.location.replace('${base}/article.html?slug=${encodeURIComponent(slug)}');<\/script></head><body><h1>${title}</h1><p>${summary}</p>${pubDate ? `<time>${pubDate}</time>` : ''}<div>${body}</div></body></html>`;
    res.setHeader('Content-Type', 'text/html;charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600,stale-while-revalidate');
    res.status(200).send(html);
  } catch(err) {
    res.status(500).send('<h1>Error</h1><p>' + escHtml(err.message) + '</p>');
  }
}
