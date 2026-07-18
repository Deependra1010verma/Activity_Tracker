import { LearnerMode, PromptStyle } from "@/lib/types";

export const learnerModeLabels: Record<LearnerMode, string> = {
  general: "General Learning",
  school: "School + NEET",
  neet: "School + NEET",
};

export const promptStyleLabels: Record<PromptStyle, string> = {
  definition: "Definition",
  why: "Why",
  comparison: "Compare",
  scenario: "Scenario",
  reverse: "Reverse",
  fill_blank: "Fill blank",
  mcq: "MCQ",
  assertion_reason: "Assertion-Reason",
};

export const learnerModeCopy: Record<
  LearnerMode,
  {
    hero: string;
    captureLabel: string;
    conceptsLabel: string;
    prompts: Array<{ title: string; copy: string }>;
  }
> = {
  general: {
    hero: "Concept-first workflow for coding, backend, and self-learning topics.",
    captureLabel:
      "Aaj jo naya padha usko short notes, rules, ya examples ke form me likho.",
    conceptsLabel:
      "Ek concept per line likho. Har line future recall card me convert hogi.",
    prompts: [
      {
        title: "Definition recall",
        copy: "Concept ko beginner-friendly language me explain karna.",
      },
      {
        title: "Why-based recall",
        copy: "Rule ya behavior ke peeche reasoning puchhna.",
      },
      {
        title: "Scenario-based recall",
        copy: "Real problem dekar application test karna.",
      },
      {
        title: "Comparison recall",
        copy: "Do options me kab kya choose karna hai.",
      },
    ],
  },
  school: {
    hero: "Unified school + NEET flow for chapter revision and line-by-line clarity.",
    captureLabel:
      "Aaj kis chapter ya topic ka revision kiya, uske key points yahan likho.",
    conceptsLabel:
      "Important facts, definitions, formula lines, ya steps ek-ek line me likho.",
    prompts: [
      {
        title: "Direct answer",
        copy: "Exam me aane wala straight question-answer recall.",
      },
      {
        title: "Fill in the blank",
        copy: "Keywords aur exact terms yaad rakhne ke liye.",
      },
      {
        title: "Reason-based recall",
        copy: "Small why-type answers for understanding.",
      },
      {
        title: "Short writing prompt",
        copy: "2-3 line answer practice for school tests.",
      },
    ],
  },
  neet: {
    hero: "Unified school + NEET review system with chapter practice and weak topic targeting.",
    captureLabel:
      "Chapter, NCERT line, test mistake, ya module concept add karo so it comes back before forgetting.",
    conceptsLabel:
      "Important lines, exceptions, formulas, reactions, or biological facts ek-ek line me likho.",
    prompts: [
      {
        title: "NCERT line recall",
        copy: "Exact biology/chemistry fact ko retain karna.",
      },
      {
        title: "MCQ recall",
        copy: "Options ke beech conceptual distinction practice karna.",
      },
      {
        title: "Assertion-Reason",
        copy: "Reasoning aur trap-based understanding test karna.",
      },
      {
        title: "Formula and exception",
        copy: "Physics/Chemistry ke high-yield facts repeat karna.",
      },
    ],
  },
};
