"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { learnerModeLabels, promptStyleLabels } from "@/lib/profile-copy";
import {
  addDays,
  formatShortDate,
  getRelativeStatus,
  projectNextInterval,
} from "@/lib/scheduler";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { ConceptCard, Profile, ReviewRating } from "@/lib/types";

const ratings: Array<{
  label: string;
  tone: ReviewRating;
}> = [
  { label: "Again", tone: "again" },
  { label: "Hard", tone: "hard" },
  { label: "Good", tone: "good" },
  { label: "Easy", tone: "easy" },
];

type ReviewBoardViewProps = {
  cards: ConceptCard[];
  profile: Profile;
};

export function ReviewBoardView({ cards, profile }: ReviewBoardViewProps) {
  const router = useRouter();
  const [queue, setQueue] = useState(cards);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const dueCards = useMemo(
    () =>
      queue
        .filter((card) => new Date(card.nextReviewAt).getTime() <= Date.now())
        .sort(
          (left, right) =>
            new Date(left.nextReviewAt).getTime() -
            new Date(right.nextReviewAt).getTime(),
        ),
    [queue],
  );

  const activeCard = dueCards[0] ?? queue[0];

  const previews = activeCard
    ? ratings.map((rating) => {
        const result = projectNextInterval(
          activeCard.currentIntervalDays,
          activeCard.ease,
          rating.tone,
        );

        return {
          ...rating,
          nextInDays: result.nextIntervalDays,
        };
      })
    : [];

  async function handleRate(rating: ReviewRating) {
    if (!activeCard) {
      return;
    }

    setMessage("");
    setError("");

    if (!hasSupabaseEnv()) {
      setError("Supabase env values missing hain. `.env` verify karo.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase client initialize nahi ho paaya.");
      return;
    }

    setIsSubmitting(true);

    try {
      const projection = projectNextInterval(
        activeCard.currentIntervalDays,
        activeCard.ease,
        rating,
      );
      const nextReviewAt = addDays(
        new Date().toISOString(),
        projection.nextIntervalDays,
      );
      const nextStreak = rating === "again" ? 0 : activeCard.streak + 1;

      const { error: reviewError } = await supabase.from("reviews").insert({
        card_id: activeCard.id,
        rating,
        next_review_at: nextReviewAt,
      });

      if (reviewError) {
        throw reviewError;
      }

      const { error: cardError } = await supabase
        .from("cards")
        .update({
          current_interval_days: projection.nextIntervalDays,
          ease: projection.nextEase,
          streak: nextStreak,
          last_reviewed_at: new Date().toISOString(),
          next_review_at: nextReviewAt,
        })
        .eq("id", activeCard.id);

      if (cardError) {
        throw cardError;
      }

      setQueue((currentQueue) =>
        currentQueue.map((card) =>
          card.id === activeCard.id
            ? {
                ...card,
                currentIntervalDays: projection.nextIntervalDays,
                ease: projection.nextEase,
                streak: nextStreak,
                lastReviewedAt: new Date().toISOString(),
                nextReviewAt,
              }
            : card,
        ),
      );

      setMessage(
        `${rating.toUpperCase()} saved. Next review ${projection.nextIntervalDays} day(s) me aayega.`,
      );
      setShowAnswer(false);
      router.refresh();
    } catch (submissionError) {
      const nextError =
        submissionError instanceof Error
          ? submissionError.message
          : "Unexpected review save error aaya.";
      setError(nextError);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!activeCard) {
    return (
      <section className="section-panel">
        <h2 className="section-title">No due cards right now</h2>
        <p className="section-copy">
          Abhi queue khali hai. Naye concepts add karo ya next interval ka wait karo.
        </p>
      </section>
    );
  }

  return (
    <section className="grid-two">
      <div className="review-shell">
        <div className="review-card">
          <span className="eyebrow">
            {profile.fullName} · {learnerModeLabels[profile.learnerMode]}
          </span>
          <h2 className="review-prompt">{activeCard.prompt}</h2>
          <p className="section-copy">
            Source: {activeCard.sourceTitle} · Style:{" "}
            {promptStyleLabels[activeCard.promptStyle]}
          </p>
          {showAnswer ? (
            <div className="review-answer">
              <strong>Expected recall:</strong> {activeCard.answer}
            </div>
          ) : (
            <button
              className="secondary-button"
              disabled={isSubmitting}
              onClick={() => setShowAnswer(true)}
              type="button"
            >
              Show answer
            </button>
          )}
          <div className="rating-row">
            {previews.map((preview) => (
              <button
                className="rating-button"
                data-tone={preview.tone}
                disabled={isSubmitting || !showAnswer}
                key={preview.tone}
                onClick={() => void handleRate(preview.tone)}
                type="button"
              >
                {preview.label}
                <br />
                <small>Next in {preview.nextInDays}d</small>
              </button>
            ))}
          </div>
          {message ? (
            <p className="section-copy" style={{ color: "#166534", marginTop: "1rem" }}>
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="section-copy" style={{ color: "#b91c1c", marginTop: "1rem" }}>
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <div className="section-panel">
        <h3 className="section-title">Queue snapshot</h3>
        <p className="section-copy">
          {profile.learnerMode === "neet"
            ? "Due items ke saath weak and high-yield topics ko zyada importance milegi."
            : "Due items learner ke actual performance ke hisaab se dobara aayenge."}
        </p>
        <div className="timeline">
          {queue.map((card) => (
            <article className="timeline-item" key={card.id}>
              <div>
                <strong>{card.concept}</strong>
                <p className="section-copy" style={{ margin: "0.35rem 0 0" }}>
                  {card.prompt}
                </p>
              </div>
              <div className="muted" style={{ textAlign: "right" }}>
                <div>{getRelativeStatus(card.nextReviewAt)}</div>
                <div>{formatShortDate(card.nextReviewAt)}</div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
