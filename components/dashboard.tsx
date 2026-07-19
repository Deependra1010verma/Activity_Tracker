import Link from "next/link";
import { DashboardStats, LearningEntry, Profile } from "@/lib/types";

type DashboardViewProps = {
  profile: Profile;
  stats: DashboardStats;
  entries?: LearningEntry[];
};

export function DashboardView({ profile, stats, entries = [] }: DashboardViewProps) {
  const isGreetingMorning = new Date().getHours() < 12;
  const isGreetingEvening = new Date().getHours() >= 18;
  const greeting = isGreetingMorning
    ? "Good morning"
    : isGreetingEvening
      ? "Good evening"
      : "Hello";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      <div className="cute-card" style={{ width: "100%", textAlign: "center" }}>
        <h2 className="cute-title">
          {greeting}, {profile.fullName.split(" ")[0]}! {profile.learnerMode === "neet" ? "🐼🎀✨" : "⚡"}
        </h2>
        <p className="cute-subtitle">
          {stats.dueToday > 0
            ? profile.learnerMode === "neet" 
              ? `You have ${stats.dueToday} cute things to revise today! Let's do this! 🌸` 
              : `You have ${stats.dueToday} things to remember today. Let's make them stick forever!`
            : profile.learnerMode === "neet"
              ? "You're all caught up! Time to learn something totally new! 💖"
              : "You're all caught up for today! Learn something new?"}
        </p>



        <div className="cta-buttons-container">
          <Link href={`/learn?profile=${profile.id}`} className="cta-btn capture">
            <span className="cta-icon">{profile.learnerMode === "neet" ? "📝🐼" : "✨"}</span>
            <h3 className="cta-title">Log New Learning</h3>
            <p className="cta-desc">Jho aaj padha, use yahan save karo</p>
          </Link>

          <Link href={`/review?profile=${profile.id}`} className="cta-btn review">
            <span className="cta-icon">{profile.learnerMode === "neet" ? "🔍💖" : "🧠"}</span>
            <h3 className="cta-title">Start Revision</h3>
            <p className="cta-desc">Revise karke memory permanent banao</p>
          </Link>
        </div>
      </div>

      <div className="glass-panel">
        <div className="section-header">
          <h3>Your Recent Notes {profile.learnerMode === "neet" ? "🎀🐼" : ""}</h3>
          {entries.length > 0 && (
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600 }}>{entries.length} recent</span>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{profile.learnerMode === "neet" ? "💤🐼" : "📝"}</div>
            <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", fontWeight: 800 }}>No notes yet</h4>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>Click "Log New Learning" to add your first note!</p>
          </div>
        ) : (
          <div className="note-grid">
            {entries.map((entry) => (
              <Link key={entry.id} href={`/learn?entryId=${entry.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="note-card" style={{ height: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                    <h4 className="note-title" title={entry.title}>{entry.title}</h4>
                  </div>
                  <p className="note-summary">{entry.summary}</p>
                  <div className="note-footer">
                    {entry.subject !== "General Memory Space" && (
                      <span className="badge">{entry.subject}</span>
                    )}
                    <span className="note-date">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
