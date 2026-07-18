"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnFormView } from "@/components/learn-form";
import { mapProfileRowToProfile, mapSubjectRow } from "@/lib/profile-mappers";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { Profile } from "@/lib/types";

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

type LoadState = "loading" | "signed_out" | "needs_profile" | "ready" | "error";

type LearnShellProps = {
  profile?: Profile;
  userEmail?: string | null;
  needsProfile?: boolean;
  editEntry?: {
    id: string;
    title: string;
    summary: string;
    concepts: string[];
  };
};

export function LearnShell({ profile, userEmail, needsProfile, editEntry }: LearnShellProps) {
  useEffect(() => {
    if (profile?.learnerMode) {
      document.body.className = profile.learnerMode === "neet" ? "theme-neet" : "";
    }
  }, [profile]);

  if (needsProfile) {
    return (
      <section className="section-panel">
        <h2 className="section-title">Complete onboarding first</h2>
        <p className="section-copy">
          Signed in user <strong>{userEmail}</strong> detect ho gaya hai, but profile
          abhi create nahi hui.
        </p>
        <Link className="primary-button" href="/onboarding">
          Open onboarding
        </Link>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="section-panel">
        <h2 className="section-title">Capture flow load nahi ho paaya</h2>
        <p className="section-copy">Unexpected load error aaya.</p>
      </section>
    );
  }

  return <LearnFormView profile={profile} editEntry={editEntry} />;
}
