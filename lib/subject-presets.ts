import { LearnerMode, SubjectPreset } from "@/lib/types";

const subjectPresets: Record<LearnerMode, SubjectPreset[]> = {
  general: [
    {
      id: "general-memory-space",
      name: "General Memory Space",
      accent: "Terracotta",
      focus: "Coding, backend, tools, aur self-learning recall",
    },
  ],
  school: [
    {
      id: "school-neet-space",
      name: "School + NEET Space",
      accent: "Leaf",
      focus: "School chapters, NCERT lines, and exam-oriented revision",
    },
  ],
  neet: [
    {
      id: "school-neet-space",
      name: "School + NEET Space",
      accent: "Leaf",
      focus: "School chapters, NCERT lines, and exam-oriented revision",
    },
  ],
};

export function getSubjectPresetsForMode(mode: LearnerMode) {
  return subjectPresets[mode];
}

export function getTaglineForMode(mode: LearnerMode) {
  if (mode === "neet") {
    return "School + NEET recall workflow with chapter revision and weak topic tracking.";
  }

  if (mode === "school") {
    return "School + NEET aligned revision flow for tests, chapters, and retention.";
  }

  return "Concept-first memory system for coding and backend learning.";
}
