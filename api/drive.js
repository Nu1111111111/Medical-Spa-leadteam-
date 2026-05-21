export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
  if (!GOOGLE_SCRIPT_URL) return res.status(500).json({ error: 'GOOGLE_SCRIPT_URL not configured' });
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    if (!response.ok) return res.status(response.status).json({ error: await response.text() });
    return res.status(200).json(await response.json());
  } catch (error) {
    return res.status(500).json({ error: 'Drive Fehler.' });
  }
}
