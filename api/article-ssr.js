export default async function handler(req, res) {
  const { slug } = req.query;
  if (!slug) return res.status(400).send('Missing slug');

  const base = 'https://www.integratedplanningpartners.com';

  try {
    const apiRes = await fetch(`${base}/api/notion?action=page&slug=${encodeURIComponent(slug)}`);
    if (!apiRes.ok) throw new Error(`notion API returned ${apiRes.status}`);
    const article = await apiRes.json();

    if (!article || !article.title) {
      return res.status(404).send('Article not found');
    }

    const escape = (str = '') =>
      str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    const bodyHtml = article.body || article.content || '';
    const title    = escape(article.title);
    const summary  = escape(article.summary || article.description || '');
    const author   = escape(article.author || 'Jeffrey Faine, CLU · RICP');
    const pubDate  = article.publishedDate || article.date || '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Integrated Planning Partners</title>
  <meta name="description" content="${summary}">
  <meta name="author" content="${author}">
  ${pubDate ? `<meta name="article:published_time" content="${pubDate}">` : ''}
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${summary}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${base}/article.html?slug=${encodeURIComponent(slug)}">
  <meta property="og:site_name" content="Integrated Planning Partners">
  <link rel="canonical" href="${base}/article.html?slug=${encodeURIComponent(slug)}">
  <script>
    const bot = /googlebot|bingbot|crawler|spider|slurp|duckduckbot|baidu|yandex/i;
    if (!bot.test(navigator.userAgent)) {
      window.location.replace('${base}/article.html?slug=${encodeURIComponent(slug)}');
    }
  <\/script>
</head>
<body>
  <header><a href="${base}">Integrated Planning Partners</a></header>
  <main>
    <article>
      <h1>${title}</h1>
      ${summary ? `<p class="summary">${summary}</p>` : ''}
      ${pubDate ? `<time datetime="${pubDate}">${pubDate}</time>` : ''}
      <div class="article-body">${bodyHtml}</div>
    </article>
  </main>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send(`<h1>Error</h1><p>${err.message}</p>`);
  }
}
