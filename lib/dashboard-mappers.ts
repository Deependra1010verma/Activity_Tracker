import { DashboardStats, LearningEntry, WeakTopic } from "@/lib/types";
import { mapCardRowToConceptCard } from "@/lib/review-mappers";

export type LearningEntryRow = {
  id: string;
  profile_id: string;
  title: string;
  subject: string;
  created_at: string;
  summary: string;
  source_type: string | null;
  concepts: Array<{ concept_text: string }> | null;
};

export function mapLearningEntryRow(row: LearningEntryRow): LearningEntry {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    subject: row.subject,
    createdAt: row.created_at,
    summary: row.summary,
    concepts: row.concepts?.map((concept) => concept.concept_text) ?? [],
    sourceType: row.source_type ?? undefined,
  };
}

export function buildDashboardStats(params: {
  totalEntries: number;
  cards: ReturnType<typeof mapCardRowToConceptCard>[];
}) {
  const { totalEntries, cards } = params;
  const dueToday = cards.filter(
    (card) => new Date(card.nextReviewAt).getTime() <= Date.now(),
  ).length;
  const highPriority = cards.filter(
    (card) => card.examPriority === "high",
  ).length;
  const reviewedThisWeek = cards.filter((card) => {
    if (!card.lastReviewedAt) {
      return false;
    }

    const delta = Date.now() - new Date(card.lastReviewedAt).getTime();
    return delta <= 7 * 24 * 60 * 60 * 1000;
  }).length;
  const weakTopicsCount = cards.filter(
    (card) => card.ease <= 2.15 || card.streak <= 1,
  ).length;
  const averageEase =
    cards.length > 0
      ? cards.reduce((sum, card) => sum + card.ease, 0) / cards.length
      : 2.3;
  const retentionScore = Math.max(
    60,
    Math.min(96, Math.round((averageEase / 2.9) * 100)),
  );

  const stats: DashboardStats = {
    totalEntries,
    activeCards: cards.length,
    dueToday,
    highPriority,
    reviewedThisWeek,
    weakTopicsCount,
    retentionScore,
  };

  return stats;
}

export function buildWeakTopics(cards: ReturnType<typeof mapCardRowToConceptCard>[]) {
  const counts = new Map<string, number>();

  for (const card of cards) {
    if (card.ease > 2.15 && card.streak > 1) {
      continue;
    }

    counts.set(card.subject, (counts.get(card.subject) ?? 0) + 1);
  }

  const weakTopics: WeakTopic[] = [...counts.entries()]
    .map(([subject, count]) => ({ subject, count }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 4);

  return weakTopics;
}
