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
  profile_id?: string | null;
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

type HomeShellProps = {
  profile?: Profile;
  stats?: DashboardStats;
  entries?: LearningEntry[];
  userEmail?: string | null;
  needsProfile?: boolean;
};

export function HomeShell({ profile, stats, entries = [], userEmail, needsProfile }: HomeShellProps) {
  useEffect(() => {
    if (profile?.learnerMode) {
      document.body.className = profile.learnerMode === "neet" ? "theme-neet" : "";
    }
  }, [profile]);

  if (needsProfile) {
    return (
      <section className="section-panel">
        <span className="eyebrow">Profile missing</span>
        <h2 className="section-title">Account mil gaya, profile abhi nahi</h2>
        <p className="section-copy">
          Signed in user <strong>{userEmail}</strong> detect ho gaya hai. Ab onboarding
          complete karke `profiles` row aur internal workspace config create kar do.
        </p>
        <Link className="primary-button" href="/onboarding">
          Complete onboarding
        </Link>
      </section>
    );
  }

  if (!profile || !stats) {
    return (
      <section className="section-panel">
        <span className="eyebrow">Load issue</span>
        <h2 className="section-title">Dashboard load nahi ho paaya</h2>
        <p className="section-copy">Unexpected dashboard error aaya.</p>
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
      <AuthControls email={userEmail} />
      <DashboardView profile={profile} stats={stats} entries={entries} />
    </>
  );
}
