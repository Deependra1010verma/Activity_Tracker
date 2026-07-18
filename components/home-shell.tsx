"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardView } from "@/components/dashboard";
import { mapProfileRowToProfile, mapSubjectRow } from "@/lib/profile-mappers";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { Profile } from "@/lib/types";

type AuthUser = {
  id: string;
  email?: string | null;
};

type LoadState = "loading" | "signed_out" | "needs_profile" | "ready" | "error";

export function HomeShell() {
  const [state, setState] = useState<LoadState>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
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

      setUser({
        id: currentUser.id,
        email: currentUser.email,
      });

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

      setProfile(
        mapProfileRowToProfile(profileRow, (subjectRows ?? []).map(mapSubjectRow)),
      );
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
    return (
      <section className="grid-two">
        <div className="section-panel">
          <span className="eyebrow">Sign in required</span>
          <h2 className="section-title">Pahle login karo</h2>
          <p className="section-copy">
            Dashboard ab real Supabase session se profile read karta hai. Login ke bina
            sample preview nahi dikhayenge, taki actual flow clear rahe.
          </p>
          <Link className="primary-button" href="/auth">
            Go to auth
          </Link>
        </div>
        <div className="section-panel">
          <span className="eyebrow">Flow</span>
          <div className="stack">
            <article className="list-card">
              <h4>1. Create account</h4>
              <p className="section-copy" style={{ marginTop: "0.45rem" }}>
                `/auth` par email/password se account banao ya sign in karo.
              </p>
            </article>
            <article className="list-card">
              <h4>2. Complete onboarding</h4>
              <p className="section-copy" style={{ marginTop: "0.45rem" }}>
                Pahle tumhari `general` learner profile save hogi.
              </p>
            </article>
          </div>
        </div>
      </section>
    );
  }

  if (state === "needs_profile") {
    return (
      <section className="section-panel">
        <span className="eyebrow">Profile missing</span>
        <h2 className="section-title">Account mil gaya, profile abhi nahi</h2>
        <p className="section-copy">
          Signed in user <strong>{user?.email}</strong> detect ho gaya hai. Ab onboarding
          complete karke `profiles` row aur default subjects create kar do.
        </p>
        <Link className="primary-button" href="/onboarding">
          Complete onboarding
        </Link>
      </section>
    );
  }

  if (state === "error" || !profile) {
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
        <span className="chip">{user?.email}</span>
        <Link className="chip" href="/onboarding">
          Edit profile
        </Link>
      </div>
      <DashboardView profile={profile} showProfilePreview={false} />
    </>
  );
}
