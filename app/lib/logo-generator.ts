// app/lib/logo-generator.ts v4.0.1
import { GoogleGenAI } from "@google/genai";

export async function generateLogo() {
  // Create a new instance right before the call to use the latest API key from the dialog
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: 'A professional, minimalist logo for a tech application named "LLM API Sentinel". The logo should feature a stylized shield combined with a pulse line or a global network grid, representing monitoring, security, and connectivity. Use a color palette of deep navy blue, emerald green, and white. High-tech, clean, vector style, white background.',
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      },
    },
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
}
