export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

  if (!GOOGLE_SCRIPT_URL) {
    return res.status(500).json({ error: 'GOOGLE_SCRIPT_URL not configured in environment variables.' });
  }

  try {
    const { fileName, fileData, mimeType, category, description, visibility } = req.body;

    // Forward to Google Apps Script
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        fileData,
        mimeType,
        category,
        description,
        visibility,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Drive proxy error:', error);
    return res.status(500).json({ error: 'Fehler beim Hochladen in Google Drive.' });
  }
}
