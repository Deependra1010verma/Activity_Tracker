import { addDays } from "@/lib/scheduler";
import { ConceptCard, LearningEntry, ReviewLog } from "@/lib/types";

const today = "2026-07-18T09:00:00.000Z";

export const sampleLearningEntries: LearningEntry[] = [
  {
    id: "entry-binary-search",
    title: "Binary Search Fundamentals",
    subject: "DSA",
    createdAt: "2026-07-18T06:30:00.000Z",
    summary:
      "Sorted arrays par search ko half-half eliminate karke O(log n) me solve karna.",
    concepts: [
      "Binary search only works when the search space is ordered.",
      "Midpoint compare karke search interval shrink hota hai.",
      "Loop invariant maintain karna off-by-one bugs avoid karta hai.",
    ],
  },
  {
    id: "entry-http-caching",
    title: "HTTP Caching Basics",
    subject: "Web",
    createdAt: "2026-07-17T15:20:00.000Z",
    summary:
      "Browser, CDN, aur server cache headers ka role aur stale data avoid karna.",
    concepts: [
      "Cache-Control freshness define karta hai.",
      "ETag conditional revalidation me help karta hai.",
      "Public vs private cache behavior alag hota hai.",
    ],
  },
];

export const sampleCards: ConceptCard[] = [
  {
    id: "card-binary-definition",
    concept: "Binary search requires a sorted collection.",
    subject: "DSA",
    sourceTitle: "Binary Search Fundamentals",
    promptStyle: "definition",
    prompt: "Binary search chalne ke liye array me sabse important precondition kya hoti hai?",
    answer:
      "Collection sorted ya monotonic honi chahiye, tabhi midpoint comparison se half search space safely eliminate kar sakte ho.",
    tags: ["searching", "foundation"],
    lastReviewedAt: "2026-07-17T08:00:00.000Z",
    nextReviewAt: today,
    currentIntervalDays: 2,
    ease: 2.2,
    streak: 2,
  },
  {
    id: "card-binary-why",
    concept: "Binary search is O(log n) because it discards half the space.",
    subject: "DSA",
    sourceTitle: "Binary Search Fundamentals",
    promptStyle: "why",
    prompt: "Binary search linear search se fast kyun hota hai?",
    answer:
      "Har step me roughly aadha search space eliminate hota hai, isliye comparisons ki count logarithmic hoti hai.",
    tags: ["complexity", "why"],
    lastReviewedAt: "2026-07-16T08:00:00.000Z",
    nextReviewAt: addDays(today, 1),
    currentIntervalDays: 3,
    ease: 2.35,
    streak: 3,
  },
  {
    id: "card-cache-scenario",
    concept: "ETag supports conditional revalidation.",
    subject: "Web",
    sourceTitle: "HTTP Caching Basics",
    promptStyle: "scenario",
    prompt:
      "Agar browser ke paas cached response hai, to server se bina full data download kiye freshness kaise verify karega?",
    answer:
      "Browser ETag ya Last-Modified ke saath conditional request bhejta hai. Agar content same ho to server 304 Not Modified return karta hai.",
    tags: ["http", "scenario"],
    lastReviewedAt: "2026-07-15T09:15:00.000Z",
    nextReviewAt: today,
    currentIntervalDays: 4,
    ease: 2.4,
    streak: 4,
  },
];

export const sampleReviewLogs: ReviewLog[] = [
  {
    id: "review-1",
    cardId: "card-binary-definition",
    reviewedAt: "2026-07-17T08:00:00.000Z",
    rating: "good",
    nextReviewAt: "2026-07-18T09:00:00.000Z",
  },
  {
    id: "review-2",
    cardId: "card-cache-scenario",
    reviewedAt: "2026-07-15T09:15:00.000Z",
    rating: "easy",
    nextReviewAt: "2026-07-18T09:00:00.000Z",
  },
];

