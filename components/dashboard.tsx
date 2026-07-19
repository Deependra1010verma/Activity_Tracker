"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardStats, LearningEntry, Profile } from "@/lib/types";

type DashboardViewProps = {
  profile: Profile;
  stats: DashboardStats;
  entries?: LearningEntry[];
};

export function DashboardView({ profile, stats, entries = [] }: DashboardViewProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  const isGreetingMorning = new Date().getHours() < 12;
  const isGreetingEvening = new Date().getHours() >= 18;
  const greeting = isGreetingMorning
    ? "Good morning"
    : isGreetingEvening
      ? "Good evening"
      : "Hello";

  const uniqueTopics = Array.from(new Set(entries.map(e => e.title))).filter(Boolean);
  const displayedEntries = selectedTopic === "all" ? entries : entries.filter(e => e.title === selectedTopic);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      <div className="cute-card" style={{ width: "100%", textAlign: "center" }}>
        <h2 className="cute-title">
          {greeting}, {profile.fullName.split(" ")[0]}! {profile.learnerMode === "neet" ? "🐼🎀✨" : "⚡"}
        </h2>




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
        <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <h3 style={{ margin: 0 }}>Your Recent Notes {profile.learnerMode === "neet" ? "🎀🐼" : ""}</h3>
          {entries.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <select 
                value={selectedTopic} 
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="cute-input"
                style={{ padding: "0.4rem 0.8rem", width: "auto", minWidth: "150px", margin: 0 }}
              >
                <option value="all">All Topics</option>
                {uniqueTopics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>
                {displayedEntries.length} notes
              </span>
            </div>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{profile.learnerMode === "neet" ? "💤🐼" : "📝"}</div>
            <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", fontWeight: 800 }}>No notes yet</h4>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>Click "Log New Learning" to add your first note!</p>
          </div>
        ) : displayedEntries.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h4 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", fontWeight: 800 }}>No notes found</h4>
            <p style={{ margin: 0, color: "var(--text-muted)" }}>No notes match the selected topic.</p>
          </div>
        ) : (
          <div className="note-grid">
            {displayedEntries.map((entry) => (
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
