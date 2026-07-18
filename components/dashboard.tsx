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
          {greeting}, {profile.fullName.split(" ")[0]}! {profile.learnerMode === "neet" ? "🌸" : "⚡"}
        </h2>
        <p className="cute-subtitle">
          {stats.dueToday > 0
            ? `You have ${stats.dueToday} things to remember today. Let's make them stick forever!`
            : "You're all caught up for today! Learn something new?"}
        </p>

        <div className="metrics" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", margin: "2rem 0" }}>
          <div className="metric" style={{ background: "rgba(236, 72, 153, 0.05)", borderColor: "rgba(236, 72, 153, 0.1)", borderRadius: "var(--radius-lg)", padding: "1.5rem" }}>
            <p className="metric-label" style={{ color: "var(--primary)", fontWeight: 800, margin: 0 }}>Active Memories</p>
            <p className="metric-value" style={{ color: "var(--primary)", fontSize: "2.5rem", fontWeight: 900, margin: "0.5rem 0 0" }}>{stats.activeCards}</p>
          </div>
          
          <div className="metric" style={{ background: "rgba(139, 92, 246, 0.05)", borderColor: "rgba(139, 92, 246, 0.1)", borderRadius: "var(--radius-lg)", padding: "1.5rem", textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <p className="metric-label" style={{ color: "var(--secondary)", fontWeight: 800, margin: 0 }}>Retention</p>
              <span style={{ color: "var(--secondary)", fontWeight: 900, fontSize: "1.2rem" }}>{stats.retentionScore}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${stats.retentionScore}%` }}></div>
            </div>
          </div>
        </div>

        <div className="cta-buttons-container">
          <Link href={`/learn?profile=${profile.id}`} className="cta-btn capture">
            <span className="cta-icon">✨</span>
            <h3 className="cta-title">Log New Learning</h3>
            <p className="cta-desc">Jho aaj padha, use yahan save karo</p>
          </Link>

          <Link href={`/review?profile=${profile.id}`} className="cta-btn review">
            <span className="cta-icon">🧠</span>
            <h3 className="cta-title">Start Revision</h3>
            <p className="cta-desc">Revise karke memory permanent banao</p>
          </Link>
        </div>
      </div>

      <div className="glass-panel">
        <div className="section-header">
          <h3>Your Recent Notes</h3>
          {entries.length > 0 && (
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600 }}>{entries.length} recent</span>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", fontWeight: 800 }}>No notes yet</h4>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>Click "Log New Learning" to add your first note!</p>
          </div>
        ) : (
          <div className="note-grid">
            {entries.map((entry) => (
              <div key={entry.id} className="note-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <h4 className="note-title" title={entry.title}>{entry.title}</h4>
                </div>
                <p className="note-summary">{entry.summary}</p>
                <div className="note-footer">
                  <span className="badge">{entry.subject}</span>
                  <span className="note-date">
                    {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
