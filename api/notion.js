// api/notion.js — IPP Website Notion Proxy
// Handles two actions:
//   GET /api/notion?action=list            → returns all published articles
//   GET /api/notion?action=page&slug=...   → returns single article + blocks

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID  = process.env.NOTION_DATABASE_ID;

const headers = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': '2022-06-28',
  'Content-Type': 'application/json',
};

// ── CORS headers for browser fetch from integratedplanningpartners.com
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600',
};

export default async function handler(req, res) {
  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeaders(cors).end();
  }

  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  const { action, slug } = req.query;

  try {
    if (action === 'list') {
      return await handleList(res);
    } else if (action === 'page' && slug) {
      return await handlePage(res, slug);
    } else {
      return res.status(400).json({ error: 'Invalid action. Use ?action=list or ?action=page&slug=...' });
    }
  } catch (err) {
    console.error('Notion proxy error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}

// ── LIST: Query the database for all published articles
async function handleList(res) {
  const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      filter: {
        property: 'Published',
        checkbox: { equals: true }
      },
      sorts: [
        { property: 'PublishedDate', direction: 'descending' }
      ]
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(response.status).json({ error: 'Notion API error', detail: err });
  }

  const data = await response.json();

  // Map Notion page properties → clean article objects
  const articles = data.results.map(page => {
    const props = page.properties;
    return {
      id:       page.id,
      slug:     getProp(props, 'Slug',          'rich_text'),
      title:    getProp(props, 'Name',           'title'),
      summary:  getProp(props, 'Summary',        'rich_text'),
      category: getProp(props, 'Category',       'select'),
      type:     getProp(props, 'Type',           'select'),
      readTime: getProp(props, 'ReadTime',       'rich_text'),
      date:     getProp(props, 'PublishedDate',  'date'),
    };
  }).filter(a => a.slug); // only return articles that have a slug

  return res.status(200).json({ articles });
}

// ── PAGE: Fetch a single article by slug + its content blocks
async function handlePage(res, slug) {
  // First query the DB to find the page with this slug
  const queryResp = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      filter: {
        and: [
          { property: 'Slug',      rich_text: { equals: slug } },
          { property: 'Published', checkbox:  { equals: true } }
        ]
      }
    }),
  });

  if (!queryResp.ok) {
    const err = await queryResp.text();
    return res.status(queryResp.status).json({ error: 'Notion API error', detail: err });
  }

  const queryData = await queryResp.json();
  if (!queryData.results.length) {
    return res.status(404).json({ error: 'Article not found' });
  }

  const page = queryData.results[0];
  const props = page.properties;

  // Fetch the page blocks (article body)
  const blocksResp = await fetch(`https://api.notion.com/v1/blocks/${page.id}/children?page_size=100`, {
    headers,
  });

  if (!blocksResp.ok) {
    const err = await blocksResp.text();
    return res.status(blocksResp.status).json({ error: 'Notion blocks error', detail: err });
  }

  const blocksData = await blocksResp.json();

  return res.status(200).json({
    article: {
      id:       page.id,
      slug:     getProp(props, 'Slug',          'rich_text'),
      title:    getProp(props, 'Name',           'title'),
      summary:  getProp(props, 'Summary',        'rich_text'),
      category: getProp(props, 'Category',       'select'),
      type:     getProp(props, 'Type',           'select'),
      readTime: getProp(props, 'ReadTime',       'rich_text'),
      date:     getProp(props, 'PublishedDate',  'date'),
    },
    blocks: blocksData.results,
  });
}

// ── HELPERS: Extract values from Notion property types
function getProp(props, name, type) {
  const prop = props[name];
  if (!prop) return null;
  switch (type) {
    case 'title':      return prop.title?.map(t => t.plain_text).join('') || null;
    case 'rich_text':  return prop.rich_text?.map(t => t.plain_text).join('') || null;
    case 'select':     return prop.select?.name || null;
    case 'date':       return prop.date?.start || null;
    case 'checkbox':   return prop.checkbox ?? false;
    default:           return null;
  }
}
