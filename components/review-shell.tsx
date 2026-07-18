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

export function ReviewShell() {
  const [state, setState] = useState<LoadState>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cards, setCards] = useState<ConceptCard[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReviewData() {
      if (!hasSupabaseEnv()) {
        setState("error");
        setError("Supabase env values missing hain. `.env` check karo.");
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

      setUser({ id: currentUser.id, email: currentUser.email, profile_id: currentUser.profile_id });

      let profileRow = null;
      let subjectRows: SubjectRow[] = [];
      let cardRows: ReviewCardRow[] = [];

      const cachedProfileId = currentUser.profile_id;
      const profileSelect = "id, full_name, role, learner_mode, grade, target_exam, daily_goal_minutes, weekly_target_cards";
      const cardSelect = "id, prompt_style, prompt, answer, current_interval_days, ease, streak, last_reviewed_at, next_review_at, exam_priority, concepts!inner(concept_text, learning_entries!inner(id, title, subject, profile_id)), card_tags(tag)";
      const nowIso = new Date().toISOString();

      try {
        if (cachedProfileId) {
          const [profileRes, subjectRes, cardRes] = await Promise.all([
            supabase.from("profiles").select(profileSelect).eq("id", cachedProfileId).maybeSingle(),
            supabase.from("subjects").select("id, name, accent, focus").eq("profile_id", cachedProfileId).order("created_at", { ascending: true }),
            supabase.from("cards").select(cardSelect).eq("concepts.learning_entries.profile_id", cachedProfileId).lte("next_review_at", nowIso).order("next_review_at", { ascending: true })
          ]);

          if (profileRes.error) throw profileRes.error;
          if (subjectRes.error) throw subjectRes.error;
          if (cardRes.error) throw cardRes.error;

          profileRow = profileRes.data;
          subjectRows = (subjectRes.data ?? []) as unknown as SubjectRow[];
          cardRows = (cardRes.data ?? []) as unknown as ReviewCardRow[];
        } else {
          const { data: pRow, error: pError } = await supabase.from("profiles").select(profileSelect).eq("auth_user_id", currentUser.id).maybeSingle();
          if (pError) throw pError;
          profileRow = pRow;

          if (profileRow) {
            const [subjectRes, cardRes] = await Promise.all([
              supabase.from("subjects").select("id, name, accent, focus").eq("profile_id", profileRow.id).order("created_at", { ascending: true }),
              supabase.from("cards").select(cardSelect).eq("concepts.learning_entries.profile_id", profileRow.id).lte("next_review_at", nowIso).order("next_review_at", { ascending: true })
            ]);

            if (subjectRes.error) throw subjectRes.error;
            if (cardRes.error) throw cardRes.error;

            subjectRows = (subjectRes.data ?? []) as unknown as SubjectRow[];
            cardRows = (cardRes.data ?? []) as unknown as ReviewCardRow[];
          }
        }
      } catch (err: any) {
        setState("error");
        setError(err.message || "Review data load nahi ho paaya.");
        return;
      }

      if (!profileRow) {
        setState("needs_profile");
        return;
      }

      setProfile(
        mapProfileRowToProfile(profileRow as ProfileRow, subjectRows.map(mapSubjectRow)),
      );
      setCards(cardRows.map((card) => mapCardRowToConceptCard(card)));
      
      document.body.className = profileRow.learner_mode === "neet" ? "theme-neet" : "";
      
      setState("ready");
    }

    void loadReviewData();
  }, []);

  if (state === "loading") {
    return (
      <section className="section-panel">
        <h2 className="section-title">Preparing your review queue</h2>
        <p className="section-copy">Due cards aur profile load kar rahe hain.</p>
      </section>
    );
  }

  if (state === "signed_out") {
    return (
      <section className="section-panel">
        <h2 className="section-title">Sign in required</h2>
        <p className="section-copy">Review queue dekhne ke liye pahle login karo.</p>
        <Link className="primary-button" href="/auth">
          Go to auth
        </Link>
      </section>
    );
  }

  if (state === "needs_profile") {
    return (
      <section className="section-panel">
        <h2 className="section-title">Complete onboarding first</h2>
        <p className="section-copy">
          Signed in user <strong>{user?.email}</strong> mil gaya hai, but profile abhi
          create nahi hui.
        </p>
        <Link className="primary-button" href="/onboarding">
          Open onboarding
        </Link>
      </section>
    );
  }

  if (state === "error" || !profile) {
    return (
      <section className="section-panel">
        <h2 className="section-title">Review queue load nahi ho paaya</h2>
        <p className="section-copy">{error || "Unexpected review error aaya."}</p>
      </section>
    );
  }

  return <ReviewBoardView cards={cards} profile={profile} />;
}
