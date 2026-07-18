import Link from "next/link";
import {
  getCardsForProfile,
  getEntriesForProfile,
  sampleProfiles,
} from "@/lib/mock-data";
import { learnerModeLabels, promptStyleLabels } from "@/lib/profile-copy";
import { formatShortDate, getRelativeStatus } from "@/lib/scheduler";
import { Profile } from "@/lib/types";

type DashboardViewProps = {
  profile: Profile;
  showProfilePreview?: boolean;
};

function buildProfileHref(profileId: string) {
  return `/?profile=${profileId}`;
}

export function DashboardView({
  profile,
  showProfilePreview = true,
}: DashboardViewProps) {
  const entries = getEntriesForProfile(profile.id);
  const cards = getCardsForProfile(profile.id);
  const dueToday = cards.filter(
    (card) => new Date(card.nextReviewAt).getTime() <= Date.now(),
  ).length;
  const highPriority = cards.filter(
    (card) => card.examPriority === "high",
  ).length;

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
              <p className="metric-value">{entries.length}</p>
            </div>
            <div className="metric">
              <p className="metric-label">Active cards</p>
              <p className="metric-value">{cards.length}</p>
            </div>
            <div className="metric">
              <p className="metric-label">Due now</p>
              <p className="metric-value">{dueToday}</p>
            </div>
            <div className="metric">
              <p className="metric-label">High priority</p>
              <p className="metric-value">{highPriority}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid-two">
        <div className="section-panel">
          <h3 className="section-title">
            {showProfilePreview ? "Switch learner" : "Profile setup status"}
          </h3>
          <p className="section-copy">
            {showProfilePreview
              ? "Final app me ye section Supabase auth ke baad real account switch ya login flow me replace hoga. Abhi ye multi-profile behavior preview karta hai."
              : "Abhi app tumhari real Supabase profile read kar raha hai. Sister profile ko baad me same base par add karenge."}
          </p>
          <div className="stack">
            {showProfilePreview
              ? sampleProfiles.map((item) => (
                  <Link
                    className="list-card"
                    href={buildProfileHref(item.id)}
                    key={item.id}
                  >
                    <div className="chips">
                      <span className="chip">{item.fullName}</span>
                      <span className="chip">{learnerModeLabels[item.learnerMode]}</span>
                    </div>
                    <h4 style={{ marginTop: "0.75rem" }}>{item.tagline}</h4>
                    <div className="list-meta">
                      <span>{item.targetExam ?? "Self-paced learning"}</span>
                      <span>{item.dailyGoalMinutes} min/day</span>
                    </div>
                  </Link>
                ))
              : [
                  <article className="list-card" key="active-profile">
                    <div className="chips">
                      <span className="chip">{profile.fullName}</span>
                      <span className="chip">{learnerModeLabels[profile.learnerMode]}</span>
                    </div>
                    <h4 style={{ marginTop: "0.75rem" }}>
                      Your main profile is active
                    </h4>
                    <div className="list-meta">
                      <span>{profile.targetExam ?? "No exam target set"}</span>
                      <span>{profile.weeklyTargetCards} cards/week</span>
                    </div>
                  </article>,
                ]}
          </div>
        </div>

        <div className="section-panel">
          <h3 className="section-title">Subjects and focus</h3>
          <p className="section-copy">
            Har learner ke liye subject buckets aur question behavior alag rakha jayega.
          </p>
          <div className="stack">
            {profile.subjects.map((subject) => (
              <article className="list-card" key={subject.id}>
                <div className="chips">
                  <span className="chip">{subject.name}</span>
                  <span className="chip">{subject.accent}</span>
                </div>
                <h4 style={{ marginTop: "0.75rem" }}>{subject.focus}</h4>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid-two">
        <div className="section-panel">
          <h3 className="section-title">Due Queue Preview</h3>
          <p className="section-copy">
            Question pattern learner type ke hisaab se adapt hota hai, taaki engineering
            aur NEET dono use-cases natural feel karein.
          </p>
          <div className="stack">
            {dueCards.map((card) => (
              <article className="list-card" key={card.id}>
                <div className="chips">
                  <span className="chip">{card.subject}</span>
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
                  <span className="chip">{entry.subject}</span>
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
