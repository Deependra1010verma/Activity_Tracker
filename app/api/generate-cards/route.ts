import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { summary, topic, learnerMode } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured in .env" },
        { status: 500 }
      );
    }

    if (!summary) {
      return NextResponse.json({ error: "Summary is required" }, { status: 400 });
    }

    const modeContext = learnerMode === "neet" 
      ? "You are generating flashcards for a 10th-grade student preparing for NEET. Focus on core biology, chemistry, and physics principles. Keep concepts bite-sized and clear."
      : "You are generating flashcards for a self-learner. Focus on practical understanding, real-world application, and clear definitions.";

    const prompt = `
${modeContext}

Based on the user's notes below about the topic "${topic}", extract the core atomic concepts (key takeaways) that must be memorized.
Output them as a simple numbered list, one concept per line. Keep each concept concise (1-2 sentences max).
Do not include any introductory or concluding text, only the numbered list.

User Notes:
${summary}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    
    // Parse the numbered list into an array of strings
    const concepts = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /^\d+\./.test(line))
      .map((line) => line.replace(/^\d+\.\s*/, "").trim());

    if (concepts.length === 0) {
      return NextResponse.json(
        { error: "Could not extract concepts. Please provide more detailed notes." },
        { status: 400 }
      );
    }

    return NextResponse.json({ concepts });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate concepts with AI." },
      { status: 500 }
    );
  }
}
