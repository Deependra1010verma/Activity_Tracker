import { ConceptCard, PromptStyle } from "@/lib/types";

export type ReviewCardRow = {
  id: string;
  prompt_style: PromptStyle;
  prompt: string;
  answer: string;
  current_interval_days: number;
  ease: number;
  streak: number;
  last_reviewed_at: string | null;
  next_review_at: string;
  exam_priority: "low" | "medium" | "high" | null;
  concepts:
    | Array<{
        concept_text: string;
        learning_entries: Array<{
          id: string;
          title: string;
          subject: string;
          profile_id: string;
        }>;
      }>
    | null;
  card_tags: Array<{ tag: string }> | null;
};

export function mapCardRowToConceptCard(card: ReviewCardRow): ConceptCard {
  const conceptRow = card.concepts?.[0];
  const entryRow = conceptRow?.learning_entries?.[0];

  return {
    id: card.id,
    profileId: entryRow?.profile_id ?? "",
    concept: conceptRow?.concept_text ?? "Untitled concept",
    subject: entryRow?.subject ?? "General",
    sourceTitle: entryRow?.title ?? "Untitled source",
    promptStyle: card.prompt_style,
    prompt: card.prompt,
    answer: card.answer,
    tags: card.card_tags?.map((tag) => tag.tag) ?? [],
    lastReviewedAt: card.last_reviewed_at,
    nextReviewAt: card.next_review_at,
    currentIntervalDays: card.current_interval_days,
    ease: Number(card.ease),
    streak: card.streak,
    examPriority: card.exam_priority ?? undefined,
  };
}
