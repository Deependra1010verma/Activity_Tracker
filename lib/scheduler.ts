import { ReviewRating } from "@/lib/types";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const ratingMultipliers: Record<ReviewRating, number> = {
  again: 0.3,
  hard: 0.8,
  good: 1.35,
  easy: 1.9,
};

const easeDelta: Record<ReviewRating, number> = {
  again: -0.25,
  hard: -0.1,
  good: 0.03,
  easy: 0.12,
};

export function addDays(dateIso: string, days: number) {
  const date = new Date(dateIso);
  return new Date(date.getTime() + days * DAY_IN_MS).toISOString();
}

export function formatShortDate(dateIso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(new Date(dateIso));
}

export function getRelativeStatus(nextReviewAt: string) {
  const now = Date.now();
  const target = new Date(nextReviewAt).getTime();
  const deltaDays = Math.floor((target - now) / DAY_IN_MS);

  if (deltaDays <= 0) {
    return "Due now";
  }

  if (deltaDays === 1) {
    return "Tomorrow";
  }

  return `In ${deltaDays} days`;
}

export function projectNextInterval(
  currentIntervalDays: number,
  ease: number,
  rating: ReviewRating,
) {
  if (rating === "again") {
    return {
      nextIntervalDays: 1,
      nextEase: Math.max(1.3, ease + easeDelta[rating]),
    };
  }

  const raw = currentIntervalDays * ease * ratingMultipliers[rating];
  return {
    nextIntervalDays: Math.max(2, Math.round(raw)),
    nextEase: Math.min(2.9, Math.max(1.3, ease + easeDelta[rating])),
  };
}

