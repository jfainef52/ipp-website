export default async function handler(req, res) {
  const base = 'https://www.integratedplanningpartners.com';

  try {
    const apiRes = await fetch(`${base}/api/notion?action=list`);
    if (!apiRes.ok) throw new Error(`notion API returned ${apiRes.status}`);
    const { articles } = await apiRes.json();

    const staticPages = [
      '', '/about.html', '/process.html', '/resources.html',
      '/incomearc.html', '/structurereview.html', '/ltc-impact.html',
    ];

    const staticUrls = staticPages.map(path => `
  <url>
    <loc>${base}${path}</loc>
    <changefreq>monthly</changefreq>
    <priority>${path === '' ? '1.0' : '0.6'}</priority>
  </url>`).join('');

    const articleUrls = (articles || []).map(a => `
  <url>
    <loc>${base}/article.html?slug=${encodeURIComponent(a.slug)}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticUrls}
${articleUrls}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send(`<?xml version="1.0"?><e>${err.message}</e>`);
  }
}
