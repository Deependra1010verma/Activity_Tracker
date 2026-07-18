"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ReviewBoardView } from "@/components/review-board";
import { mapProfileRowToProfile, mapSubjectRow } from "@/lib/profile-mappers";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { ConceptCard, Profile, PromptStyle } from "@/lib/types";

type AuthUser = {
  id: string;
  email?: string | null;
};

type LoadState = "loading" | "signed_out" | "needs_profile" | "ready" | "error";

type CardRow = {
  id: string;
  prompt_style: PromptStyle;
  prompt: string;
  answer: string;
  current_interval_days: number;
  ease: number;
  streak: number;
  last_reviewed_at: string | null;
  next_review_at: string;
  exam_priority: "low" | "medium" | "high" | null;
  concepts:
    | Array<{
        concept_text: string;
        learning_entries: Array<{
          id: string;
          title: string;
          subject: string;
          profile_id: string;
        }>;
      }>
    | null;
  card_tags: Array<{ tag: string }> | null;
};

function mapCardRow(card: CardRow): ConceptCard {
  const conceptRow = card.concepts?.[0];
  const entryRow = conceptRow?.learning_entries?.[0];

  return {
    id: card.id,
    profileId: entryRow?.profile_id ?? "",
    concept: conceptRow?.concept_text ?? "Untitled concept",
    subject: entryRow?.subject ?? "General",
    sourceTitle: entryRow?.title ?? "Untitled source",
    promptStyle: card.prompt_style,
    prompt: card.prompt,
    answer: card.answer,
    tags: card.card_tags?.map((tag) => tag.tag) ?? [],
    lastReviewedAt: card.last_reviewed_at,
    nextReviewAt: card.next_review_at,
    currentIntervalDays: card.current_interval_days,
    ease: Number(card.ease),
    streak: card.streak,
    examPriority: card.exam_priority ?? undefined,
  };
}

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

      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        setState("error");
        setError(userError.message);
        return;
      }

      if (!currentUser) {
        setState("signed_out");
        return;
      }

      setUser({ id: currentUser.id, email: currentUser.email });

      const { data: profileRow, error: profileError } = await supabase
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

      if (!profileRow) {
        setState("needs_profile");
        return;
      }

      const { data: subjectRows, error: subjectError } = await supabase
        .from("subjects")
        .select("id, name, accent, focus")
        .eq("profile_id", profileRow.id)
        .order("created_at", { ascending: true });

      if (subjectError) {
        setState("error");
        setError(subjectError.message);
        return;
      }

      const nowIso = new Date().toISOString();
      const { data: cardRows, error: cardError } = await supabase
        .from("cards")
        .select(
          "id, prompt_style, prompt, answer, current_interval_days, ease, streak, last_reviewed_at, next_review_at, exam_priority, concepts(concept_text, learning_entries(id, title, subject, profile_id)), card_tags(tag)",
        )
        .lte("next_review_at", nowIso)
        .order("next_review_at", { ascending: true });

      if (cardError) {
        setState("error");
        setError(cardError.message);
        return;
      }

      setProfile(
        mapProfileRowToProfile(profileRow, (subjectRows ?? []).map(mapSubjectRow)),
      );
      setCards((cardRows ?? []).map((card) => mapCardRow(card as CardRow)));
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
