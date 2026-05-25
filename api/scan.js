// api/scan.js
export default async function handler(req, res) {
  // Only allow POST requests (which send the image)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Pull the API key safely from Vercel's server environment
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  try {
    const { image } = req.body; // Receive the base64 image from index.html

    // Forward the image to Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `Analyze the street sign visible in this environment context. Return a strictly raw JSON object containing only two keys: "title" (the common name of the sign) and "purpose" (a brief 1-2 sentence description explaining its meaning or driving rule). Translate into English if the system is globally specified. Format explicitly as JSON without markdown code fences.` },
            { inlineData: { mimeType: "image/jpeg", data: image } }
          ]
        }]
      })
    });

    const resData = await response.json();
    const rawText = resData.candidates[0].content.parts[0].text.trim();
    const cleanJSONString = rawText.replace(/```json|```/g, '');
    
    // Send the clean result back to the mobile browser
    return res.status(200).json(JSON.parse(cleanJSONString));

  } catch (error) {
    return res.status(500).json({ error: 'Failed to analyze image', details: error.message });
  }
}
