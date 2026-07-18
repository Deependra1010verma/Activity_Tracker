"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthControls } from "@/components/auth-controls";
import { AuthForm } from "@/components/auth-form";
import { DashboardView } from "@/components/dashboard";
import {
  buildDashboardStats,
  buildWeakTopics,
  mapLearningEntryRow,
} from "@/lib/dashboard-mappers";
import { mapProfileRowToProfile, mapSubjectRow } from "@/lib/profile-mappers";
import { mapCardRowToConceptCard, ReviewCardRow } from "@/lib/review-mappers";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import {
  ConceptCard,
  DashboardStats,
  LearningEntry,
  Profile,
  WeakTopic,
} from "@/lib/types";

type AuthUser = {
  id: string;
  email?: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string;
  role: Profile["role"];
  learner_mode: Profile["learnerMode"];
  grade: string | null;
  target_exam: string | null;
  daily_goal_minutes: number;
  weekly_target_cards: number;
};

type SubjectRow = {
  id: string;
  name: string;
  accent: string | null;
  focus: string | null;
};

type LearningEntryRow = {
  id: string;
  profile_id: string;
  title: string;
  subject: string;
  created_at: string;
  summary: string;
  source_type: string | null;
  concepts: Array<{ concept_text: string }> | null;
};

type LoadState = "loading" | "signed_out" | "needs_profile" | "ready" | "error";

export function HomeShell() {
  const [state, setState] = useState<LoadState>("loading");
  const [cards, setCards] = useState<ConceptCard[]>([]);
  const [entries, setEntries] = useState<LearningEntry[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!hasSupabaseEnv()) {
        setState("error");
        setError("Supabase env values missing hain. `.env` setup verify karo.");
        return;
      }

      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setState("error");
        setError("Supabase client initialize nahi ho paaya.");
        return;
      }

      const sessionStr = localStorage.getItem("mock_auth_session");
      let currentUser = null;
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          currentUser = session?.user;
        } catch (e) {
          console.error("Invalid mock session", e);
        }
      }

      if (!currentUser) {
        setState("signed_out");
        return;
      }

      setUser({
        id: currentUser.id,
        email: currentUser.email,
      });

      const { data: rawProfileRow, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, full_name, role, learner_mode, grade, target_exam, daily_goal_minutes, weekly_target_cards",
        )
        .eq("auth_user_id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        setState("error");
        setError(profileError.message);
        return;
      }

      const profileRow = rawProfileRow as ProfileRow | null;

      if (!profileRow) {
        setState("needs_profile");
        return;
      }

      const [
        { data: rawSubjectRows, error: subjectError },
        { data: rawEntryRows, error: entryError },
        { data: rawCardRows, error: cardError },
      ] = await Promise.all([
        supabase
          .from("subjects")
          .select("id, name, accent, focus")
          .eq("profile_id", profileRow.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("learning_entries")
          .select(
            "id, profile_id, title, subject, created_at, summary, source_type, concepts(concept_text)",
          )
          .eq("profile_id", profileRow.id)
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("cards")
          .select(
            "id, prompt_style, prompt, answer, current_interval_days, ease, streak, last_reviewed_at, next_review_at, exam_priority, concepts(concept_text, learning_entries(id, title, subject, profile_id)), card_tags(tag)",
          )
          .order("next_review_at", { ascending: true })
          .limit(8),
      ]);

      if (subjectError || entryError || cardError) {
        setState("error");
        setError(subjectError?.message || entryError?.message || cardError?.message || "Dashboard data load nahi ho paaya.");
        return;
      }

      const subjectRows = (rawSubjectRows ?? []) as unknown as SubjectRow[];
      const entryRows = (rawEntryRows ?? []) as unknown as LearningEntryRow[];
      const cardRows = (rawCardRows ?? []) as unknown as ReviewCardRow[];

      const mappedEntries = entryRows.map((entry) => mapLearningEntryRow(entry));
      const mappedCards = cardRows.map((card) => mapCardRowToConceptCard(card));
      const filteredCards = mappedCards.filter(
        (card) => card.profileId === profileRow.id,
      );
      const nextStats = buildDashboardStats({
        totalEntries: mappedEntries.length,
        cards: filteredCards,
      });
      const nextWeakTopics = buildWeakTopics(filteredCards);

      setProfile(
        mapProfileRowToProfile(profileRow, subjectRows.map(mapSubjectRow)),
      );
      setEntries(mappedEntries);
      setCards(filteredCards);
      setStats(nextStats);
      setWeakTopics(nextWeakTopics);
      setState("ready");
    }

    void loadDashboard();
  }, []);

  if (state === "loading") {
    return (
      <section className="section-panel">
        <h2 className="section-title">Loading your dashboard</h2>
        <p className="section-copy">
          Session aur profile data load kar rahe hain. First visit par thoda time lag sakta hai.
        </p>
      </section>
    );
  }

  if (state === "signed_out") {
    return <AuthForm />;
  }

  if (state === "needs_profile") {
    return (
      <section className="section-panel">
        <span className="eyebrow">Profile missing</span>
        <h2 className="section-title">Account mil gaya, profile abhi nahi</h2>
        <p className="section-copy">
          Signed in user <strong>{user?.email}</strong> detect ho gaya hai. Ab onboarding
          complete karke `profiles` row aur internal workspace config create kar do.
        </p>
        <Link className="primary-button" href="/onboarding">
          Complete onboarding
        </Link>
      </section>
    );
  }

  if (state === "error" || !profile || !stats) {
    return (
      <section className="section-panel">
        <span className="eyebrow">Load issue</span>
        <h2 className="section-title">Dashboard load nahi ho paaya</h2>
        <p className="section-copy">{error || "Unexpected dashboard error aaya."}</p>
        <div className="hero-actions">
          <Link className="secondary-button" href="/auth">
            Open auth
          </Link>
          <Link className="secondary-button" href="/onboarding">
            Open onboarding
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="chips" style={{ marginBottom: "1rem" }}>
        <span className="chip">{profile.fullName}</span>
        <Link className="chip" href="/onboarding">
          Edit profile
        </Link>
      </div>
      <AuthControls email={user?.email} />
      <DashboardView
        cards={cards}
        entries={entries}
        profile={profile}
        stats={stats}
        weakTopics={weakTopics}
      />
    </>
  );
}
