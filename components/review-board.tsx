import { sampleCards } from "@/lib/mock-data";
import {
  formatShortDate,
  getRelativeStatus,
  projectNextInterval,
} from "@/lib/scheduler";
import { ReviewRating } from "@/lib/types";

const ratings: Array<{
  label: string;
  tone: ReviewRating;
}> = [
  { label: "Again", tone: "again" },
  { label: "Hard", tone: "hard" },
  { label: "Good", tone: "good" },
  { label: "Easy", tone: "easy" },
];

export function ReviewBoardView() {
  const dueCards = sampleCards
    .filter((card) => new Date(card.nextReviewAt).getTime() <= Date.now())
    .sort(
      (left, right) =>
        new Date(left.nextReviewAt).getTime() -
        new Date(right.nextReviewAt).getTime(),
    );

  const activeCard = dueCards[0] ?? sampleCards[0];
  const previews = ratings.map((rating) => {
    const result = projectNextInterval(
      activeCard.currentIntervalDays,
      activeCard.ease,
      rating.tone,
    );

    return {
      ...rating,
      nextInDays: result.nextIntervalDays,
    };
  });

  return (
    <section className="grid-two">
      <div className="review-shell">
        <div className="review-card">
          <span className="eyebrow">{activeCard.subject}</span>
          <h2 className="review-prompt">{activeCard.prompt}</h2>
          <p className="section-copy">
            Source: {activeCard.sourceTitle} · Style: {activeCard.promptStyle}
          </p>
          <div className="review-answer">
            <strong>Expected recall:</strong> {activeCard.answer}
          </div>
          <div className="rating-row">
            {previews.map((preview) => (
              <button
                className="rating-button"
                data-tone={preview.tone}
                key={preview.tone}
                type="button"
              >
                {preview.label}
                <br />
                <small>Next in {preview.nextInDays}d</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="section-panel">
        <h3 className="section-title">Queue snapshot</h3>
        <p className="section-copy">
          Due items pe focus rahega. Later hum is page ko keyboard-first review
          experience banayenge.
        </p>
        <div className="timeline">
          {sampleCards.map((card) => (
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

