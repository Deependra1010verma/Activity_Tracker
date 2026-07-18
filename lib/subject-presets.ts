import { LearnerMode, SubjectPreset } from "@/lib/types";

const subjectPresets: Record<LearnerMode, SubjectPreset[]> = {
  general: [
    {
      id: "dsa",
      name: "DSA",
      accent: "Terracotta",
      focus: "Core concepts and patterns",
    },
    {
      id: "web",
      name: "Web",
      accent: "Sand",
      focus: "Caching, APIs, browser behavior",
    },
    {
      id: "backend",
      name: "Backend",
      accent: "Clay",
      focus: "Databases, queues, auth",
    },
  ],
  school: [
    {
      id: "science",
      name: "Science",
      accent: "Leaf",
      focus: "Definitions, diagrams, and short answers",
    },
    {
      id: "maths",
      name: "Maths",
      accent: "Sun",
      focus: "Formula recall and problem patterns",
    },
    {
      id: "social",
      name: "Social Science",
      accent: "Sky",
      focus: "Dates, terms, and cause-effect recall",
    },
  ],
  neet: [
    {
      id: "biology",
      name: "Biology",
      accent: "Leaf",
      focus: "NCERT lines and process recall",
    },
    {
      id: "physics",
      name: "Physics",
      accent: "Sun",
      focus: "Formula meaning and application",
    },
    {
      id: "chemistry",
      name: "Chemistry",
      accent: "Sky",
      focus: "Reactions, exceptions, trends",
    },
  ],
};

export function getSubjectPresetsForMode(mode: LearnerMode) {
  return subjectPresets[mode];
}

export function getTaglineForMode(mode: LearnerMode) {
  if (mode === "neet") {
    return "Exam-focused recall with chapter-wise revision and weak topic tracking.";
  }

  if (mode === "school") {
    return "School-first memory workflow for tests, chapters, and clear recall.";
  }

  return "Concept-first memory system for coding and backend learning.";
}
