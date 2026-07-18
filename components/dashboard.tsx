import Link from "next/link";
import { sampleCards, sampleLearningEntries } from "@/lib/mock-data";
import { formatShortDate, getRelativeStatus } from "@/lib/scheduler";

function getDashboardStats() {
  const dueToday = sampleCards.filter(
    (card) => new Date(card.nextReviewAt).getTime() <= Date.now(),
  ).length;

  return {
    totalEntries: sampleLearningEntries.length,
    activeCards: sampleCards.length,
    dueToday,
    retentionTarget: "88%",
  };
}

export function DashboardView() {
  const stats = getDashboardStats();
  const dueCards = sampleCards
    .slice()
    .sort(
      (left, right) =>
        new Date(left.nextReviewAt).getTime() -
        new Date(right.nextReviewAt).getTime(),
    );

  return (
    <>
      <section className="hero">
        <div className="hero-panel hero-copy">
          <span className="eyebrow">Daily memory workflow</span>
          <h2 className="headline">Learn once. Recall for years.</h2>
          <p className="lede">
            Ye app tumhari daily learning ko capture karega, usko atomic recall
            cards me tod dega, aur phir spaced intervals par dobara puchhega so
            that knowledge sirf notes me nahi, dimaag me rahe.
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/learn">
              Capture today&apos;s learning
            </Link>
            <Link className="secondary-button" href="/review">
              Open review queue
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="metrics">
            <div className="metric">
              <p className="metric-label">Learning entries</p>
              <p className="metric-value">{stats.totalEntries}</p>
            </div>
            <div className="metric">
              <p className="metric-label">Active cards</p>
              <p className="metric-value">{stats.activeCards}</p>
            </div>
            <div className="metric">
              <p className="metric-label">Due now</p>
              <p className="metric-value">{stats.dueToday}</p>
            </div>
            <div className="metric">
              <p className="metric-label">Target retention</p>
              <p className="metric-value">{stats.retentionTarget}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid-two">
        <div className="section-panel">
          <h3 className="section-title">Due Queue Preview</h3>
          <p className="section-copy">
            Same concept ko har baar thoda different angle se puchhna is app ka
            main behavior hai.
          </p>
          <div className="stack">
            {dueCards.map((card) => (
              <article className="list-card" key={card.id}>
                <div className="chips">
                  <span className="chip">{card.subject}</span>
                  <span className="chip">{card.promptStyle}</span>
                </div>
                <h4 style={{ marginTop: "0.75rem" }}>{card.prompt}</h4>
                <div className="list-meta">
                  <span>{card.sourceTitle}</span>
                  <span>{getRelativeStatus(card.nextReviewAt)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="section-panel">
          <h3 className="section-title">Today&apos;s Capture Pattern</h3>
          <p className="section-copy">
            Har learning item se concept extraction aur multiple question styles
            generate honge.
          </p>
          <div className="stack">
            {sampleLearningEntries.map((entry) => (
              <article className="list-card" key={entry.id}>
                <div className="chips">
                  <span className="chip">{entry.subject}</span>
                  <span className="chip">{formatShortDate(entry.createdAt)}</span>
                </div>
                <h4 style={{ marginTop: "0.75rem" }}>{entry.title}</h4>
                <p className="section-copy" style={{ marginBottom: "0.75rem" }}>
                  {entry.summary}
                </p>
                <div className="chips">
                  {entry.concepts.map((concept) => (
                    <span className="chip" key={concept}>
                      {concept}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

