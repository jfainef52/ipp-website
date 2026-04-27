const NOTION_VERSION = '2022-06-28';

function notionHeaders() {
  return {
    'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

function richText(arr = []) {
  return arr.map(t => (t.plain_text || '')).join('');
}

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderBlocks(blocks) {
  return blocks.map(block => {
    const type = block.type;
    const c = block[type];
    if (!c) return '';
    const txt = escHtml(richText(c.rich_text));
    switch (type) {
      case 'paragraph':          return txt ? `<p>${txt}</p>` : '';
      case 'heading_1':          return `<h2>${txt}</h2>`;
      case 'heading_2':          return `<h3>${txt}</h3>`;
      case 'heading_3':          return `<h4>${txt}</h4>`;
      case 'bulleted_list_item': return `<li>${txt}</li>`;
      case 'numbered_list_item': return `<li>${txt}</li>`;
      case 'quote':              return `<blockquote>${txt}</blockquote>`;
      case 'callout':            return `<p><em>${txt}</em></p>`;
      default:                   return '';
    }
  }).join('\n');
}

export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).send('Missing slug');
  const dbId = process.env.NOTION_DATABASE_ID;
  const base = 'https://www.integratedplanningpartners.com';
  try {
    const queryRes = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: notionHeaders(),
      body: JSON.stringify({
        filter: { property: 'Slug', rich_text: { equals: slug } },
        page_size: 1,
      }),
    });
    if (!queryRes.ok) throw new Error(`Notion query failed: ${queryRes.status}`);
    const queryData = await queryRes.json();
    const page = queryData.results?.[0];
    if (!page) return res.status(404).send('Article not found');
    const props = page.properties;
    const title   = escHtml(richText(props.Title?.title || props.Name?.title || []));
    const summary = escHtml(richText(props.Summary?.rich_text || []));
    const author  = escHtml(richText(props.Author?.rich_text || [])) || 'Jeffrey Faine, CLU · RICP';
    const pubDate = props.Date?.date?.start || '';
    const blocksRes = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`, {
      headers: notionHeaders(),
    });
    const blocksData = blocksRes.ok ? await blocksRes.json() : { results: [] };
    const bodyHtml = renderBlocks(blocksData.results || []);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title} — Integrated Planning Partners</title>
  <meta name="description" content="${summary}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${summary}">
  <meta property="og:type" content="article">
  <link rel="canonical" href="${base}/article.html?slug=${encodeURIComponent(slug)}">
  <script>if(!/googlebot|bingbot|crawler|spider/i.test(navigator.userAgent))window.location.replace('${base}/article.html?slug=${encodeURIComponent(slug)}');<\/script>
</head>
<body>
  <h1>${title}</h1>
  <p>${summary}</p>
  ${pubDate ? `<time datetime="${pubDate}">${pubDate}</time>` : ''}
  <div>${bodyHtml}</div>
</body>
</html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send('<h1>Error</h1><p>' + escHtml(err.message) + '</p>');
  }
}
