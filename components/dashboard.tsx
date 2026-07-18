import Link from "next/link";
import { DashboardStats, Profile } from "@/lib/types";

type DashboardViewProps = {
  profile: Profile;
  stats: DashboardStats;
};

export function DashboardView({ profile, stats }: DashboardViewProps) {
  const isGreetingMorning = new Date().getHours() < 12;
  const isGreetingEvening = new Date().getHours() >= 18;
  const greeting = isGreetingMorning
    ? "Good morning"
    : isGreetingEvening
      ? "Good evening"
      : "Hello";

  return (
    <div className="centered-page" style={{ flexDirection: "column", gap: "2rem" }}>
      <div className="cute-card" style={{ maxWidth: "600px", width: "100%", textAlign: "center" }}>
        <h2 className="cute-title">
          {greeting}, {profile.fullName.split(" ")[0]}! {profile.learnerMode === "neet" ? "🌸" : "⚡"}
        </h2>
        <p className="cute-subtitle">
          {stats.dueToday > 0
            ? `You have ${stats.dueToday} things to remember today. Let's make them stick forever!`
            : "You're all caught up for today! Learn something new?"}
        </p>

        <div className="metrics" style={{ margin: "2rem 0" }}>
          <div className="metric" style={{ background: "rgba(236, 72, 153, 0.05)", borderColor: "rgba(236, 72, 153, 0.1)" }}>
            <p className="metric-label" style={{ color: "var(--primary)" }}>Active Memories</p>
            <p className="metric-value" style={{ color: "var(--primary)" }}>{stats.activeCards}</p>
          </div>
          <div className="metric" style={{ background: "rgba(139, 92, 246, 0.05)", borderColor: "rgba(139, 92, 246, 0.1)" }}>
            <p className="metric-label" style={{ color: "var(--secondary)" }}>Retention Score</p>
            <p className="metric-value" style={{ color: "var(--secondary)" }}>{stats.retentionScore}%</p>
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
    </div>
  );
}
