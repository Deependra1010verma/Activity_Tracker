import { LearnerMode, PromptStyle } from "@/lib/types";

type GeneratedCard = {
  promptStyle: PromptStyle;
  prompt: string;
  answer: string;
  examPriority: "low" | "medium" | "high";
  tags: string[];
};

function sanitizeConcept(concept: string) {
  return concept.trim().replace(/\.$/, "");
}

export function generateCardsForConcept(
  concept: string,
  learnerMode: LearnerMode,
  subject: string,
): GeneratedCard[] {
  const cleanConcept = sanitizeConcept(concept);

  if (learnerMode === "neet") {
    return [
      {
        promptStyle: "fill_blank",
        prompt: `Fill in the blank: ${cleanConcept.replace(/\b(is|are|was|were)\b/i, "_____")}`,
        answer: cleanConcept,
        examPriority: "high",
        tags: [subject.toLowerCase(), "high-yield"],
      },
    ];
  }

  if (learnerMode === "school") {
    return [
      {
        promptStyle: "definition",
        prompt: `${cleanConcept} ko short answer style me explain karo.`,
        answer: cleanConcept,
        examPriority: "medium",
        tags: [subject.toLowerCase(), "short-answer"],
      },
    ];
  }

  return [
    {
      promptStyle: "definition",
      prompt: `${cleanConcept} ka simple explanation kya hai?`,
      answer: cleanConcept,
      examPriority: "medium",
      tags: [subject.toLowerCase(), "definition"],
    },
  ];
}
