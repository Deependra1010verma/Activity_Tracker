import Link from "next/link";
import { learnerModeLabels, promptStyleLabels } from "@/lib/profile-copy";
import { formatShortDate, getRelativeStatus } from "@/lib/scheduler";
import {
  ConceptCard,
  DashboardStats,
  LearningEntry,
  Profile,
  WeakTopic,
} from "@/lib/types";

type DashboardViewProps = {
  cards: ConceptCard[];
  entries: LearningEntry[];
  profile: Profile;
  stats: DashboardStats;
  weakTopics: WeakTopic[];
};

export function DashboardView({
  cards,
  entries,
  profile,
  stats,
  weakTopics,
}: DashboardViewProps) {
  const dueCards = cards
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
          <span className="eyebrow">{learnerModeLabels[profile.learnerMode]}</span>
          <h2 className="headline">{profile.fullName}&apos;s memory system</h2>
          <p className="lede">{profile.tagline}</p>
          <p className="section-copy" style={{ margin: 0 }}>
            Daily goal: {profile.dailyGoalMinutes} minutes · Weekly recall target:{" "}
            {profile.weeklyTargetCards} cards
            {profile.targetExam ? ` · Target exam: ${profile.targetExam}` : ""}
            {profile.grade ? ` · Grade: ${profile.grade}` : ""}
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href={`/learn?profile=${profile.id}`}>
              Capture learning
            </Link>
            <Link className="secondary-button" href={`/review?profile=${profile.id}`}>
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
              <p className="metric-label">Retention score</p>
              <p className="metric-value">{stats.retentionScore}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid-two">
        <div className="section-panel">
          <h3 className="section-title">Workspace status</h3>
          <p className="section-copy">
            Ye workspace sirf current logged-in account ka data read kar raha hai. Is
            login ke bahar kisi aur learner ka combined view nahi dikhaya jayega.
          </p>
          <div className="stack">
            <article className="list-card">
              <div className="chips">
                <span className="chip">{profile.fullName}</span>
                <span className="chip">{learnerModeLabels[profile.learnerMode]}</span>
              </div>
              <h4 style={{ marginTop: "0.75rem" }}>Personal space active</h4>
              <div className="list-meta">
                <span>{profile.targetExam ?? "Self-paced learning"}</span>
                <span>{profile.weeklyTargetCards} cards/week</span>
              </div>
            </article>
          </div>
        </div>

        <div className="section-panel">
          <h3 className="section-title">Current track</h3>
          <p className="section-copy">
            Interface ab simplified rahega: Deependra ke liye `general` track aur
            Khushbu ke liye `school + neet` track.
          </p>
          <div className="stack">
            <article className="list-card">
              <h4>{profile.tagline}</h4>
              <p className="section-copy" style={{ marginTop: "0.45rem" }}>
                Question types aur review behavior isi selected track ke hisaab se adapt
                honge.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="grid-two">
        <div className="section-panel">
          <h3 className="section-title">Weekly pulse</h3>
          <p className="section-copy">
            Ye section batata hai ki recall consistency aur reinforcement need kaha par hai.
          </p>
          <div className="stack">
            <article className="list-card">
              <h4>Reviewed in last 7 days</h4>
              <p className="metric-value" style={{ marginTop: "0.5rem" }}>
                {stats.reviewedThisWeek}
              </p>
            </article>
            <article className="list-card">
              <h4>High priority cards</h4>
              <p className="metric-value" style={{ marginTop: "0.5rem" }}>
                {stats.highPriority}
              </p>
            </article>
            <article className="list-card">
              <h4>Weak topics flagged</h4>
              <p className="metric-value" style={{ marginTop: "0.5rem" }}>
                {stats.weakTopicsCount}
              </p>
            </article>
          </div>
        </div>

        <div className="section-panel">
          <h3 className="section-title">Recall pressure</h3>
          <p className="section-copy">
            Ye metric batata hai ki current track me kin cards ko extra reinforcement
            ki zarurat hai.
          </p>
          <div className="stack">
            {weakTopics.length > 0 ? (
              <article className="list-card">
                <h4>{stats.weakTopicsCount} card(s) need reinforcement</h4>
                <p className="section-copy" style={{ marginTop: "0.45rem" }}>
                  System low-ease ya low-streak cards ko jaldi wapas layega so recall
                  stable ho sake.
                </p>
              </article>
            ) : (
              <article className="list-card">
                <h4>No weak cards flagged</h4>
                <p className="section-copy" style={{ marginTop: "0.45rem" }}>
                  Abhi tak cards healthy lag rahe hain. Consistency maintain rakho.
                </p>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="grid-two">
        <div className="section-panel">
          <h3 className="section-title">Due Queue Preview</h3>
          <p className="section-copy">
            Question pattern learner type ke hisaab se adapt hota hai, taaki general
            aur school + NEET dono use-cases natural feel karein.
          </p>
          <div className="stack">
            {dueCards.map((card) => (
              <article className="list-card" key={card.id}>
                <div className="chips">
                  <span className="chip">{promptStyleLabels[card.promptStyle]}</span>
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
          <h3 className="section-title">Recent learning capture</h3>
          <p className="section-copy">
            Jo aaj padha gaya hai wahi raw material banega future recall cards ka.
          </p>
          <div className="stack">
            {entries.map((entry) => (
              <article className="list-card" key={entry.id}>
                <div className="chips">
                  <span className="chip">{formatShortDate(entry.createdAt)}</span>
                  {entry.sourceType ? <span className="chip">{entry.sourceType}</span> : null}
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
