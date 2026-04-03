// api/coach.js — Vercel Serverless Function
// Proxy sicuro tra il frontend e OpenAI GPT-4o mini
 
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
 
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const { system, message } = req.body;
  if (!message) return res.status(400).json({ error: 'Missing message' });
 
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 800,
        temperature: 0.75,
        messages: [
          ...(system ? [{ role: 'system', content: system }] : []),
          { role: 'user', content: message }
        ]
      })
    });
 
    if (!response.ok) {
      const err = await response.json();
      console.error('OpenAI error:', err);
      return res.status(500).json({ error: 'OpenAI error', detail: err });
    }
 
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ reply });
 
  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
};
