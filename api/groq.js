export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured in environment variables.' });
  }

  try {
    const { messages, systemPrompt } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt || `Du bist ein Elite Business Coach und AI Assistent für Medical Spa, eine wachsende Kosmetik- und Medical-Spa-Marke. Das Motto ist "Restore. Renew. Thrive."
Du unterstützt das Leadership Team: die Founderin (Vision, Strategie, Investoren), den CEO (operative Führung, Vertrieb, Skalierung) und CMO/CAO (Marketing, Branding, Operations, SOPs).
Deine Aufgaben: Strategieberatung, Aufgabenpriorisierung, Marketingideen, Vertriebsoptimierung, SOP-Erstellung, Sprint-Reviews, Team-Coaching.
Antworte immer auf Deutsch, präzise, motivierend und auf das Luxussegment der Medical-Spa-Industrie zugeschnitten. Sei konkret und liefere umsetzbare Empfehlungen.`
          },
          ...messages
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Keine Antwort erhalten.';

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('Groq API error:', error);
    return res.status(500).json({ error: 'Fehler bei der Verbindung zum AI Assistenten.' });
  }
}
