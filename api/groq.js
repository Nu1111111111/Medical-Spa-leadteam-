export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
  try {
    const { messages, systemPrompt } = req.body;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt || 'Du bist ein Business Coach für Medical Spa.' }, ...messages],
        max_tokens: 1024, temperature: 0.7,
      }),
    });
    if (!response.ok) return res.status(response.status).json({ error: await response.text() });
    const data = await response.json();
    return res.status(200).json({ reply: data.choices?.[0]?.message?.content || 'Keine Antwort.' });
  } catch (error) {
    return res.status(500).json({ error: 'Fehler beim AI Assistenten.' });
  }
}
