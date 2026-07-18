import { addDays } from "@/lib/scheduler";
import { getSubjectPresetsForMode } from "@/lib/subject-presets";
import {
  ConceptCard,
  LearningEntry,
  Profile,
  ReviewLog,
} from "@/lib/types";

const today = "2026-07-18T09:00:00.000Z";

export const sampleProfiles: Profile[] = [
  {
    id: "deependra",
    fullName: "Deependra",
    role: "self_learner",
    learnerMode: "general",
    grade: null,
    targetExam: null,
    dailyGoalMinutes: 45,
    weeklyTargetCards: 80,
    tagline: "Concept-first memory system for coding and backend learning.",
    subjects: getSubjectPresetsForMode("general"),
  },
  {
    id: "sister",
    fullName: "Sister",
    role: "student",
    learnerMode: "neet",
    grade: "10th",
    targetExam: "NEET",
    dailyGoalMinutes: 60,
    weeklyTargetCards: 140,
    tagline: "Exam-focused recall with chapter-wise revision and weak topic tracking.",
    subjects: getSubjectPresetsForMode("neet"),
  },
];

export const sampleLearningEntries: LearningEntry[] = [
  {
    id: "entry-binary-search",
    profileId: "deependra",
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
    sourceType: "self notes",
  },
  {
    id: "entry-http-caching",
    profileId: "deependra",
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
    sourceType: "article",
  },
  {
    id: "entry-cell-biology",
    profileId: "sister",
    title: "Cell Organelles Revision",
    subject: "Biology",
    createdAt: "2026-07-18T05:45:00.000Z",
    summary:
      "Mitochondria, ribosomes, lysosomes aur plastids ke role ko chapter-wise revise kiya.",
    concepts: [
      "Mitochondria ko powerhouse kyun kehte hain.",
      "Ribosomes protein synthesis ke site hote hain.",
      "Lysosomes intracellular digestion me help karte hain.",
    ],
    sourceType: "NCERT",
  },
  {
    id: "entry-motion",
    profileId: "sister",
    title: "Numericals on Motion",
    subject: "Physics",
    createdAt: "2026-07-17T16:00:00.000Z",
    summary:
      "Speed, velocity aur acceleration ke basic numericals ki practice ki.",
    concepts: [
      "Velocity direction ke saath defined hoti hai.",
      "Acceleration velocity change ki rate hai.",
      "Uniform motion me speed constant rehti hai.",
    ],
    sourceType: "module",
  },
];

export const sampleCards: ConceptCard[] = [
  {
    id: "card-binary-definition",
    profileId: "deependra",
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
    examPriority: "medium",
  },
  {
    id: "card-binary-why",
    profileId: "deependra",
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
    examPriority: "low",
  },
  {
    id: "card-cache-scenario",
    profileId: "deependra",
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
    examPriority: "medium",
  },
  {
    id: "card-bio-fill-blank",
    profileId: "sister",
    concept: "Ribosomes are the site of protein synthesis.",
    subject: "Biology",
    sourceTitle: "Cell Organelles Revision",
    promptStyle: "fill_blank",
    prompt: "Fill in the blank: Ribosomes are the site of ______ synthesis.",
    answer: "protein",
    tags: ["ncert", "line-based"],
    lastReviewedAt: "2026-07-17T10:00:00.000Z",
    nextReviewAt: today,
    currentIntervalDays: 2,
    ease: 2.1,
    streak: 1,
    examPriority: "high",
  },
  {
    id: "card-bio-why",
    profileId: "sister",
    concept: "Mitochondria are called the powerhouse of the cell.",
    subject: "Biology",
    sourceTitle: "Cell Organelles Revision",
    promptStyle: "why",
    prompt: "Mitochondria ko powerhouse of the cell kyun kaha jata hai?",
    answer:
      "Kyuki yahi cell respiration ke through ATP produce karte hain jo energy currency hoti hai.",
    tags: ["definition", "neet"],
    lastReviewedAt: "2026-07-16T07:30:00.000Z",
    nextReviewAt: today,
    currentIntervalDays: 3,
    ease: 2.2,
    streak: 2,
    examPriority: "high",
  },
  {
    id: "card-physics-mcq",
    profileId: "sister",
    concept: "Velocity is speed with direction.",
    subject: "Physics",
    sourceTitle: "Numericals on Motion",
    promptStyle: "mcq",
    prompt:
      "Which statement is correct? A. Speed is vector B. Velocity is scalar C. Velocity includes direction D. Distance is vector",
    answer: "C. Velocity includes direction.",
    tags: ["mcq", "motion"],
    lastReviewedAt: "2026-07-15T08:00:00.000Z",
    nextReviewAt: addDays(today, 1),
    currentIntervalDays: 4,
    ease: 2.3,
    streak: 3,
    examPriority: "medium",
  },
];

export const sampleReviewLogs: ReviewLog[] = [
  {
    id: "review-1",
    profileId: "deependra",
    cardId: "card-binary-definition",
    reviewedAt: "2026-07-17T08:00:00.000Z",
    rating: "good",
    nextReviewAt: "2026-07-18T09:00:00.000Z",
  },
  {
    id: "review-2",
    profileId: "sister",
    cardId: "card-bio-why",
    reviewedAt: "2026-07-16T07:30:00.000Z",
    rating: "good",
    nextReviewAt: "2026-07-18T09:00:00.000Z",
  },
];

export function getProfile(profileId?: string) {
  return (
    sampleProfiles.find((profile) => profile.id === profileId) ??
    sampleProfiles[0]
  );
}

export function getEntriesForProfile(profileId: string) {
  return sampleLearningEntries.filter((entry) => entry.profileId === profileId);
}

export function getCardsForProfile(profileId: string) {
  return sampleCards.filter((card) => card.profileId === profileId);
}
