"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { promptStyleLabels } from "@/lib/profile-copy";
import {
  addDays,
  projectNextInterval,
} from "@/lib/scheduler";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { ConceptCard, Profile, ReviewRating } from "@/lib/types";
import Link from "next/link";

const ratings: Array<{
  label: string;
  tone: ReviewRating;
}> = [
  { label: "Again 😭", tone: "again" },
  { label: "Hard 🤔", tone: "hard" },
  { label: "Good 😌", tone: "good" },
  { label: "Easy 🤩", tone: "easy" },
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // You can customize voice/speed here if needed
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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

  useEffect(() => {
    if (autoPlayAudio && activeCard && !showAnswer) {
      speak(activeCard.prompt);
    }
  }, [activeCard?.id, autoPlayAudio, showAnswer]);

  useEffect(() => {
    if (autoPlayAudio && showAnswer && activeCard) {
      speak(activeCard.answer);
    }
  }, [showAnswer, autoPlayAudio, activeCard?.id]);

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
    if (!activeCard) return;
    setError("");

    if (!hasSupabaseEnv()) {
      setError("Database is not configured properly.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Could not connect to database.");
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

      if (reviewError) throw reviewError;

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

      if (cardError) throw cardError;

      setQueue((currentQueue) =>
        currentQueue.filter((card) => card.id !== activeCard.id)
      );
      setShowAnswer(false);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteCard() {
    if (!activeCard) return;
    if (!confirm("Are you sure you want to completely delete this flashcard?")) return;

    setError("");
    if (!hasSupabaseEnv()) {
      setError("Database is not configured properly.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Could not connect to database.");
      return;
    }

    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase
        .from("cards")
        .delete()
        .eq("id", activeCard.id);

      if (deleteError) throw deleteError;

      setQueue((currentQueue) =>
        currentQueue.filter((card) => card.id !== activeCard.id)
      );
      setShowAnswer(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete card.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (!activeCard || dueCards.length === 0) {
    return (
      <div className="centered-page">
        <div className="cute-card" style={{ maxWidth: "500px", textAlign: "center" }}>
          <h2 className="cute-title">All Done! 🎉</h2>
          <p className="cute-subtitle">
            You've reviewed everything for now. Your brain is getting stronger!
          </p>
          <Link href="/" className="btn-primary" style={{ display: "inline-block", textDecoration: "none" }}>
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="centered-page">
      <div style={{ maxWidth: "700px", width: "100%", position: "relative" }}>
        
        <Link href="/" className="btn-back" style={{ top: "-3rem" }}>
          ← Back to Dashboard
        </Link>
        
        {/* Top Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ color: "var(--text-muted)", fontWeight: "800" }}>
            {dueCards.length} cards remaining today
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input 
                type="checkbox" 
                checked={autoPlayAudio} 
                onChange={(e) => setAutoPlayAudio(e.target.checked)} 
                style={{ cursor: "pointer" }}
              />
              Auto-Play Audio 🎧
            </label>
          </div>
        </div>

        <div className="flashcard">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
            <div className="flashcard-tag">
              {promptStyleLabels[activeCard.promptStyle]}
            </div>
            <button 
              type="button"
              onClick={handleDeleteCard}
              disabled={isDeleting}
              style={{ background: "none", border: "none", color: "var(--again)", cursor: "pointer", fontSize: "1.2rem", padding: "0.2rem", opacity: 0.7 }}
              title="Delete this card"
            >
              🗑️
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <h2 className="flashcard-prompt">{activeCard.prompt}</h2>
            <button 
              onClick={() => speak(activeCard.prompt)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", position: "absolute", right: "-30px", top: "5px", opacity: 0.5 }}
              title="Read Aloud"
            >
              🔊
            </button>
          </div>
          
          <p style={{ color: "var(--text-muted)", fontWeight: "700", marginBottom: "2rem" }}>
            From: {activeCard.sourceTitle}
          </p>

          {showAnswer ? (
            <div style={{ position: "relative" }}>
              <div className="flashcard-answer">
                {activeCard.answer}
              </div>
              <button 
                onClick={() => speak(activeCard.answer)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", position: "absolute", right: "-30px", top: "5px", opacity: 0.5 }}
                title="Read Aloud"
              >
                🔊
              </button>
            </div>
          ) : (
            <div style={{ margin: "2rem 0" }}>
              <button
                className="btn-primary"
                style={{ background: "var(--secondary)", boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)" }}
                disabled={isSubmitting}
                onClick={() => setShowAnswer(true)}
                type="button"
              >
                Reveal Answer ✨
              </button>
            </div>
          )}

          {showAnswer && (
            <div className="rating-grid">
              {previews.map((preview) => (
                <button
                  className="btn-rating"
                  data-tone={preview.tone}
                  disabled={isSubmitting}
                  key={preview.tone}
                  onClick={() => void handleRate(preview.tone)}
                  type="button"
                >
                  <div style={{ fontSize: "1.2rem", marginBottom: "0.2rem" }}>{preview.label}</div>
                  <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>Next in {preview.nextInDays}d</div>
                </button>
              ))}
            </div>
          )}

          {error ? (
            <div className="msg-error" style={{ marginTop: "1rem" }}>{error}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
