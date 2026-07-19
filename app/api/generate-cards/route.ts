import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { summary, imageBase64, mimeType, topic, learnerMode } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in .env" },
        { status: 500 }
      );
    }

    if (!summary && !imageBase64) {
      return NextResponse.json({ error: "Summary or Image is required" }, { status: 400 });
    }

    const modeContext = learnerMode === "neet" 
      ? "You are generating flashcards for a 10th-grade student preparing for NEET. Focus on core biology, chemistry, and physics principles. Keep concepts bite-sized and clear."
      : "You are generating flashcards for a self-learner. Focus on practical understanding, real-world application, and clear definitions.";

    let prompt = `${modeContext}\n\n`;

    if (imageBase64) {
      prompt += `I have provided an image of my handwritten or printed notes about the topic "${topic}".
1. First, extract the raw text (summary) from this image as accurately as possible.
2. Then, extract the core atomic concepts (key takeaways) that must be memorized from these notes. Keep each concept concise (1-2 sentences max).
`;
    } else {
      prompt += `Based on the user's notes below about the topic "${topic}", extract the core atomic concepts (key takeaways) that must be memorized. Keep each concept concise (1-2 sentences max).\n\nUser Notes:\n${summary}`;
    }

    prompt += `\n\nYou MUST return the response strictly as a JSON object with the following schema:
{
  "summary": "The full extracted text of the notes (if an image was provided) OR the original summary text.",
  "concepts": ["Concept 1", "Concept 2", "Concept 3"]
}`;

    const contents: any[] = [prompt];
    
    if (imageBase64 && mimeType) {
      contents.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    if (!data.concepts || data.concepts.length === 0) {
      return NextResponse.json(
        { error: "Could not extract concepts. Please provide more detailed notes." },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      concepts: data.concepts,
      summary: data.summary 
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate concepts with AI." },
      { status: 500 }
    );
  }
}
