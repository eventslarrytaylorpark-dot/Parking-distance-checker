require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/distances', async (req, res) => {
  if (!ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server.' });
  }

  const { destination, addresses } = req.body;

  if (!destination || !addresses || !Array.isArray(addresses) || addresses.length === 0) {
    return res.status(400).json({ error: 'Missing destination or addresses.' });
  }

  if (addresses.length > 30) {
    return res.status(400).json({ error: 'Maximum 30 addresses per request.' });
  }

  const prompt = `Calculate accurate walking distance and time from each parking lot to the venue. Use realistic Google Maps walking routing (not straight-line). Return ONLY valid JSON with no markdown or extra text.

Venue: ${destination}

Parking locations:
${addresses.map((a, i) => `${i + 1}. ${a}`).join('\n')}

JSON format:
{"destination_resolved":"full venue name and address","results":[{"parking_input":"as given","parking_resolved":"full resolved address","distance_meters":350,"walk_time_seconds":260}]}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err?.error?.message || `Anthropic API error ${response.status}` });
    }

    const data = await response.json();
    const text = data.content.map(b => b.type === 'text' ? b.text : '').join('');
    const clean = text.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else return res.status(500).json({ error: 'Model returned invalid JSON. Please try again.' });
    }

    res.json(parsed);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Parking Distance Checker running at http://localhost:${PORT}`);
});
