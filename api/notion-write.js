export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.NOTION_TOKEN;
  if (!token) return res.status(500).json({ error: 'Missing NOTION_TOKEN' });

  const { action, body } = req.body;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  };

  try {
    if (action === 'create') {
      const r = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST', headers, body: JSON.stringify(body)
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    if (action === 'append') {
      const { pageId, children } = body;
      const r = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
        method: 'PATCH', headers, body: JSON.stringify({ children })
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
