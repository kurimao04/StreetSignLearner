// api/scan.js
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Pull the API key securely from Vercel's server environment
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'API key configuration missing on Vercel server.' });
  }

  try {
    // 1. Receive base64 data and the selected target language from index.html
    const { image, lang } = req.body; 

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // 2. Map the language flag ('en' or 'tl') to explicit instructions for Gemini
    const targetLanguage = lang === 'tl' ? 'Tagalog (Filipino)' : 'English';

    // Forward the frame to Google Gemini Flash Vision API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { 
              // 3. We dynamically inject the target language requirement directly into the system prompt text
              text: `Analyze the street sign visible in this environment context. Return a strictly raw JSON object containing only two keys: "title" (the common name of the sign) and "purpose" (a brief 1-2 sentence description explaining its meaning or driving rule). 
              
              CRITICAL REQUIREMENT: You must write the values of both "title" and "purpose" entirely in ${targetLanguage}. Do not mix languages.
              
              Format explicitly as JSON without markdown code fences.` 
            },
            { inlineData: { mimeType: "image/jpeg", data: image } }
          ]
        }]
      })
    });

  const resData = await response.json();
    
    if (!resData.candidates || resData.candidates.length === 0) {
      throw new Error("No response matching structure from Gemini API");
    }

    const rawText = resData.candidates[0].content.parts[0].text.trim();
    
    // Safety check to remove unexpected markdown wrapping blocks
    const cleanJSONString = rawText.replace(/```json|```/g, '');
    const parsedData = JSON.parse(cleanJSONString);
    
    // Deliver the structured sign details back to the app frontend safely
    return res.status(200).json(parsedData);

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ error: 'Failed to analyze image matrix via AI model.', details: error.message });
  }
}
