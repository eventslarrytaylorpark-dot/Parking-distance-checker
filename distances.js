export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { destination, addresses } = req.body;
  if (!destination || !addresses?.length) return res.status(400).json({ error: 'Missing fields.' });

  const prompt = `Calculate accurate walking distance and time from each parking lot to the venue. Use realistic Google Maps walking routing (not straight-line). Return ONLY valid JSON with no markdown or extra text.

Venue: ${destination}

Parking locations:
${addresses.map((a, i) => `${i + 1}. ${a}`).join('\n')}

JSON format:
{"destination_resolved":"full venue name and address","results":[{"parking_input":"as given","parking_resolved":"full resolved address","distance_meters":350,"walk_time_seconds":260}]}`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 2000, messages: [{ role: 'user', content: prompt }] })
    });
    if (!r.ok) { const e = await r.json().catch(()=>({})); return res.status(r.status).json({ error: e?.error?.message || 'API error' }); }
    const data = await r.json();
    const text = data.content.map(b => b.type === 'text' ? b.text : '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    let parsed;
    try { parsed = JSON.parse(clean); } catch(e) { const m = clean.match(/\{[\s\S]*\}/); parsed = m ? JSON.parse(m[0]) : null; }
    if (!parsed) return res.status(500).json({ error: 'Invalid response from AI. Try again.' });
    res.json(parsed);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
