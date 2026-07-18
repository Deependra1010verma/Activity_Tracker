export type ReviewRating = "again" | "hard" | "good" | "easy";

export type PromptStyle =
  | "definition"
  | "why"
  | "comparison"
  | "scenario"
  | "reverse"
  | "fill_blank"
  | "mcq"
  | "assertion_reason";

export type LearnerMode = "general" | "school" | "neet";

export type LearnerRole = "self_learner" | "student";

export type Profile = {
  id: string;
  fullName: string;
  role: LearnerRole;
  learnerMode: LearnerMode;
  grade: string | null;
  targetExam: string | null;
  dailyGoalMinutes: number;
  weeklyTargetCards: number;
  tagline: string;
  subjects: SubjectPreset[];
};

export type SubjectPreset = {
  id: string;
  name: string;
  accent: string;
  focus: string;
};

export type ConceptCard = {
  id: string;
  profileId: string;
  concept: string;
  subject: string;
  sourceTitle: string;
  promptStyle: PromptStyle;
  prompt: string;
  answer: string;
  tags: string[];
  lastReviewedAt: string | null;
  nextReviewAt: string;
  currentIntervalDays: number;
  ease: number;
  streak: number;
  examPriority?: "low" | "medium" | "high";
};

export type LearningEntry = {
  id: string;
  profileId: string;
  title: string;
  subject: string;
  createdAt: string;
  summary: string;
  concepts: string[];
  sourceType?: string;
};

export type ReviewLog = {
  id: string;
  profileId: string;
  cardId: string;
  reviewedAt: string;
  rating: ReviewRating;
  nextReviewAt: string;
};
