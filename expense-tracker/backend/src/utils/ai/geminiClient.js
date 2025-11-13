const buildPrompt = (text) => `
You are an assistant that extracts structured transaction data from Vietnamese natural language sentences.
Return ONLY valid JSON following this schema:
{
  "type": "income" | "expense",
  "amount": number (VND),
  "category": string,
  "date": "YYYY-MM-DD",
  "description": string
}
Assume the current timezone is Asia/Ho_Chi_Minh. Infer the date from relative expressions (hôm nay, hôm qua, etc.).
Sentence: """${text}"""
`;

const parseGeminiResponse = (payload) => {
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini response missing content');
  }

  const trimmed = text
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const json = JSON.parse(trimmed);
  const confidence =
    payload?.candidates?.[0]?.safetyRatings?.reduce((acc, rating) => acc * rating.probability || 1, 1) ||
    payload?.candidates?.[0]?.confidence ||
    0.8;
  return { ...json, confidence };
};

const parseWithGemini = async (text) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(text) }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          topP: 0.8,
          topK: 40,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  return parseGeminiResponse(data);
};

module.exports = {
  parseWithGemini,
};
