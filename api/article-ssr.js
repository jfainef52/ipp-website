const NOTION_VERSION = '2022-06-28';
function notionHeaders() {
  return { 'Authorization': `Bearer ${process.env.NOTION_TOKEN}`, 'Notion-Version': NOTION_VERSION, 'Content-Type': 'application/json' };
}
function richText(arr = []) { return arr.map(t => t.plain_text || '').join(''); }
function escHtml(str = '') { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function renderBlocks(blocks) {
  return blocks.map(block => {
    const type = block.type, c = block[type];
    if (!c) return '';
    const txt = escHtml(richText(c.rich_text));
    if (type === 'paragraph') return txt ? `<p>${txt}</p>` : '';
    if (type === 'heading_1') return `<h2>${txt}</h2>`;
    if (type === 'heading_2') return `<h3>${txt}</h3>`;
    if (type === 'heading_3') return `<h4>${txt}</h4>`;
    if (type === 'bulleted_list_item' || type === 'numbered_list_item') return `<li>${txt}</li>`;
    if (type === 'quote') return `<blockquote>${txt}</blockquote>`;
    if (type === 'callout') return `<p><em>${txt}</em></p>`;
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
    if (!qr.ok) throw new Error(`Notion query: ${qr.status}`);
    const qd = await qr.json();
    const page = qd.results?.[0];
    if (!page) return res.status(404).send('Article not found');
    const p = page.properties;
    const title = escHtml(richText(p.Name?.title || []));
    const summary = escHtml(richText(p.Summary?.rich_text || []));
    const pubDate = p.PublishedDate?.date?.start || '';
    const br = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`, { headers: notionHeaders() });
    const bd = br.ok ? await br.json() : { results: [] };
    const body = renderBlocks(bd.results || []);
    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${title} — Integrated Planning Partners</title><meta name="description" content="${summary}"><meta property="og:title" content="${title}"><meta property="og:description" content="${summary}"><meta property="og:type" content="article"><link rel="canonical" href="${base}/article.html?slug=${encodeURIComponent(slug)}"><script>if(!/googlebot|bingbot|crawler|spider/i.test(navigator.userAgent))window.location.replace('${base}/article.html?slug=${encodeURIComponent(slug)}');<\/script></head><body><h1>${title}</h1><p>${summary}</p>${pubDate?`<time datetime="${pubDate}">${pubDate}</time>`:''}<div>${body}</div></body></html>`;
    res.setHeader('Content-Type','text/html;charset=utf-8');
    res.setHeader('Cache-Control','s-maxage=3600,stale-while-revalidate');
    res.status(200).send(html);
  } catch(err) {
    res.status(500).send('<h1>Error</h1><p>'+escHtml(err.message)+'</p>');
  }
}
