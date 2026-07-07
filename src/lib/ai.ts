import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getSpeakingFeedback(transcript: string, question: string) {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `As an IELTS Speaking Coach, analyze the following candidate response to the question: "${question}".
    Response: "${transcript}"
    
    Provide feedback in JSON format with:
    - fluency: score (0-9) and comment
    - vocabulary: score (0-9) and suggestions
    - grammar: score (0-9) and corrections
    - pronunciation: general tips based on transcript (e.g. word stresses if identifiable)
    - overallInfo: summary tip for improvement`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fluency: { 
            type: Type.OBJECT,
            properties: { score: { type: Type.NUMBER }, comment: { type: Type.STRING } }
          },
          vocabulary: { 
            type: Type.OBJECT,
            properties: { score: { type: Type.NUMBER }, suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } }
          },
          grammar: { 
            type: Type.OBJECT,
            properties: { score: { type: Type.NUMBER }, corrections: { type: Type.ARRAY, items: { type: Type.STRING } } }
          },
          pronunciation: { type: Type.STRING },
          overallInfo: { type: Type.STRING }
        }
      }
    }
  });
  
  return JSON.parse(result.text || "{}");
}

export async function upgradeWriting(sentence: string) {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Upgrade this simple English sentence to a natural IELTS Band 7+ level suitable for the Speaking test.
    
    STRICT RULES:
    - Use natural, high-frequency spoken English.
    - DO NOT use excessively formal or "inflated" academic wording (e.g., avoid "familial unit", "cornerstone of my life", "my biological progenitors").
    - Focus on richer but native-like collocations and slightly more developed ideas.
    - Ensure the structure remains fluency-friendly.
    - Example of good upgrade: "I come from a close-knit family" instead of "I belong to a close-knit familial unit".
    
    Original: "${sentence}"
    Return JSON: { "original": string, "upgraded": string, "explanation": string }`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(result.text || "{}");
}

export async function generateEssayIdeas(topic: string, category: string) {
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate IELTS Task 2 essay ideas for the topic: "${topic}" in category: "${category}".
    Provide 3 main arguments, a thesis statement, and relevant examples.
    Return JSON: { "thesis": string, "arguments": string[], "examples": string[] }`,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(result.text || "{}");
}
