"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ReviewBoardView } from "@/components/review-board";
import { mapProfileRowToProfile, mapSubjectRow } from "@/lib/profile-mappers";
import { mapCardRowToConceptCard, ReviewCardRow } from "@/lib/review-mappers";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { ConceptCard, Profile } from "@/lib/types";

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

type ReviewShellProps = {
  profile?: Profile;
  cards?: ConceptCard[];
  userEmail?: string | null;
  needsProfile?: boolean;
};

export function ReviewShell({ profile, cards = [], userEmail, needsProfile }: ReviewShellProps) {
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
          Signed in user <strong>{userEmail}</strong> mil gaya hai, but profile abhi
          create nahi hui.
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
        <h2 className="section-title">Review queue load nahi ho paaya</h2>
        <p className="section-copy">Unexpected review error aaya.</p>
      </section>
    );
  }

  return <ReviewBoardView cards={cards} profile={profile} />;
}
