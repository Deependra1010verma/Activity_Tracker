export type ReviewRating = "again" | "hard" | "good" | "easy";

export type PromptStyle =
  | "definition"
  | "why"
  | "comparison"
  | "scenario"
  | "reverse";

export type ConceptCard = {
  id: string;
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
};

export type LearningEntry = {
  id: string;
  title: string;
  subject: string;
  createdAt: string;
  summary: string;
  concepts: string[];
};

export type ReviewLog = {
  id: string;
  cardId: string;
  reviewedAt: string;
  rating: ReviewRating;
  nextReviewAt: string;
};

