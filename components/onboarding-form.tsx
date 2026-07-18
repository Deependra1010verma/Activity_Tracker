"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSubjectPresetsForMode, getTaglineForMode } from "@/lib/subject-presets";
import { getStarterAccountByEmail } from "@/lib/starter-accounts";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { LearnerMode, LearnerRole } from "@/lib/types";

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: {
    full_name?: string;
  };
};

type ExistingProfileRow = {
  id: string;
  role: LearnerRole;
  learner_mode: LearnerMode;
  grade: string | null;
  target_exam: string | null;
  daily_goal_minutes: number;
  weekly_target_cards: number;
};

export function OnboardingForm() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [learnerMode, setLearnerMode] = useState<LearnerMode>("general");
  const [role, setRole] = useState<LearnerRole>("self_learner");
  const [grade, setGrade] = useState("");
  const [targetExam, setTargetExam] = useState("");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState("45");
  const [weeklyTargetCards, setWeeklyTargetCards] = useState("80");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const envReady = hasSupabaseEnv();
  const subjectPresets = getSubjectPresetsForMode(learnerMode);

  useEffect(() => {
    async function loadUser() {
      if (!envReady) {
        setIsLoadingUser(false);
        return;
      }

      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setIsLoadingUser(false);
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

      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          user_metadata: {
            full_name: currentUser.user_metadata.full_name,
          },
        });
        setFullName(currentUser.user_metadata.full_name ?? "");

        const starterAccount = getStarterAccountByEmail(currentUser.email);

        if (starterAccount) {
          setFullName(starterAccount.fullName);
          setLearnerMode(starterAccount.learnerMode);
          setRole(starterAccount.role);
          setGrade(starterAccount.grade ?? "");
          setTargetExam(starterAccount.targetExam ?? "");
          setDailyGoalMinutes(String(starterAccount.dailyGoalMinutes));
          setWeeklyTargetCards(String(starterAccount.weeklyTargetCards));
        }

        const { data: rawExistingProfile } = await supabase
          .from("profiles")
          .select(
            "id, role, learner_mode, grade, target_exam, daily_goal_minutes, weekly_target_cards",
          )
          .eq("auth_user_id", currentUser.id)
          .maybeSingle();

        const existingProfile = rawExistingProfile as ExistingProfileRow | null;

        if (existingProfile) {
          const mode = existingProfile.learner_mode as LearnerMode;
          setLearnerMode(mode);
          setRole(existingProfile.role as LearnerRole);
          setGrade(existingProfile.grade ?? "");
          setTargetExam(existingProfile.target_exam ?? "");
          setDailyGoalMinutes(String(existingProfile.daily_goal_minutes));
          setWeeklyTargetCards(String(existingProfile.weekly_target_cards));
        }
      }

      setIsLoadingUser(false);
    }

    void loadUser();
  }, [envReady]);

  useEffect(() => {
    if (learnerMode === "general") {
      setRole("self_learner");
      setDailyGoalMinutes("45");
      setWeeklyTargetCards("80");
      setTargetExam("");
      setGrade("");
      return;
    }

    setRole("student");

    if (learnerMode === "neet") {
      setDailyGoalMinutes("60");
      setWeeklyTargetCards("140");
      setTargetExam("NEET");
      setGrade("10th");
      return;
    }

    setDailyGoalMinutes("40");
    setWeeklyTargetCards("90");
    setTargetExam("");
    setGrade("10th");
  }, [learnerMode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!envReady) {
      setError("Supabase env values missing hain. Pehle .env configure karo.");
      return;
    }

    if (!user) {
      setError("Pehle sign in karo, phir profile onboarding complete karo.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase client initialize nahi ho paaya.");
      return;
    }

    setIsSubmitting(true);

    try {
      const profilePayload = {
        auth_user_id: user.id,
        full_name: fullName.trim(),
        role,
        learner_mode: learnerMode,
        grade: grade.trim() || null,
        target_exam: targetExam.trim() || null,
        daily_goal_minutes: Number(dailyGoalMinutes),
        weekly_target_cards: Number(weeklyTargetCards),
      };

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "auth_user_id" })
        .select("id")
        .single();

      if (profileError) {
        throw profileError;
      }

      const profileId = profile.id as string;

      const { error: deleteSubjectsError } = await supabase
        .from("subjects")
        .delete()
        .eq("profile_id", profileId);

      if (deleteSubjectsError) {
        throw deleteSubjectsError;
      }

      const { error: subjectError } = await supabase.from("subjects").insert(
        subjectPresets.map((subject) => ({
          profile_id: profileId,
          name: subject.name,
          accent: subject.accent,
          focus: subject.focus,
        })),
      );

      if (subjectError) {
        throw subjectError;
      }

      setMessage(
        "Profile save ho gayi. Dashboard ab isi DB profile ko read karega.",
      );
      router.push("/");
    } catch (submissionError) {
      const nextError =
        submissionError instanceof Error
          ? submissionError.message
          : "Unexpected onboarding error aaya.";
      setError(nextError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid-two">
      <div className="section-panel">
        <span className="eyebrow">Step 1: your profile first</span>
        <h2 className="section-title">Create your learner profile</h2>
        <p className="section-copy">
          Base app multi-user rahega, but pahle tumhari profile complete karna best hai.
          Jab ye stable ho jayegi, tab same flow se sister profile add kar denge.
        </p>
        <p className="section-copy">
          Is step me sirf tumhari main profile complete karni hai. Sister ke liye baad me
          alag account se login karke same onboarding dobara use hoga.
        </p>

        {!envReady ? (
          <p className="section-copy" style={{ color: "#b91c1c" }}>
            Supabase env values missing hain. `.env` check karo.
          </p>
        ) : null}

        {isLoadingUser ? (
          <p className="section-copy">Checking signed-in user...</p>
        ) : null}

        {!isLoadingUser && !user ? (
          <p className="section-copy" style={{ color: "#b45309" }}>
            Abhi signed-in user detect nahi hua. Pahle `/auth` par sign in karo.
          </p>
        ) : null}

        {user ? (
          <p className="section-copy">
            Signed in as: <strong>{user.email}</strong>
          </p>
        ) : null}

        <form className="capture-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              name="fullName"
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Example: Deependra"
              value={fullName}
            />
          </div>

          <div className="field">
            <label htmlFor="learnerMode">Learner mode</label>
            <select
              id="learnerMode"
              name="learnerMode"
              onChange={(event) => setLearnerMode(event.target.value as LearnerMode)}
              value={learnerMode}
            >
              <option value="general">General Learning</option>
              <option value="neet">School + NEET</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              onChange={(event) => setRole(event.target.value as LearnerRole)}
              value={role}
            >
              <option value="self_learner">Self learner</option>
              <option value="student">Student</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="grade">Grade</label>
            <input
              id="grade"
              name="grade"
              onChange={(event) => setGrade(event.target.value)}
              placeholder="Optional for your profile"
              value={grade}
            />
          </div>

          <div className="field">
            <label htmlFor="targetExam">Target exam</label>
            <input
              id="targetExam"
              name="targetExam"
              onChange={(event) => setTargetExam(event.target.value)}
              placeholder="Optional now, can stay empty"
              value={targetExam}
            />
          </div>

          <div className="field">
            <label htmlFor="dailyGoalMinutes">Daily goal in minutes</label>
            <input
              id="dailyGoalMinutes"
              min="10"
              name="dailyGoalMinutes"
              onChange={(event) => setDailyGoalMinutes(event.target.value)}
              type="number"
              value={dailyGoalMinutes}
            />
          </div>

          <div className="field">
            <label htmlFor="weeklyTargetCards">Weekly target cards</label>
            <input
              id="weeklyTargetCards"
              min="10"
              name="weeklyTargetCards"
              onChange={(event) => setWeeklyTargetCards(event.target.value)}
              type="number"
              value={weeklyTargetCards}
            />
          </div>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving profile..." : "Save my profile"}
          </button>
        </form>

        {message ? (
          <p className="section-copy" style={{ color: "#166534", marginTop: "1rem" }}>
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="section-copy" style={{ color: "#b91c1c", marginTop: "1rem" }}>
            {error}
          </p>
        ) : null}
      </div>

      <div className="section-panel">
        <span className="eyebrow">Prepared for profile 2</span>
        <h3 className="section-title">Why one-by-one is better</h3>
        <p className="section-copy">
          Backend aur schema already 2 profiles support karte hain. Pahle tumhari profile
          complete karna better hai because isi flow ko polish karke baad me sister ke
          liye reuse karenge.
        </p>
        <div className="stack">
          <article className="list-card">
            <h4>Current selected mode</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              {learnerMode === "general" ? "general" : "school + neet"} ·{" "}
              {getTaglineForMode(learnerMode)}
            </p>
          </article>
          <article className="list-card">
            <h4>Internal workspace bucket</h4>
            <div className="chips" style={{ marginTop: "0.75rem" }}>
              {subjectPresets.map((subject) => (
                <span className="chip" key={subject.id}>
                  {subject.name}
                </span>
              ))}
            </div>
          </article>
          <article className="list-card">
            <h4>When sister gets added</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              Bas learner mode `neet` select karenge, grade and exam set karenge, aur
              school + NEET focused workspace bucket automatically attach ho jayega.
            </p>
          </article>
          <article className="list-card">
            <h4>Rollout order</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              1. Tumhari profile live karo. 2. Learn + review loop verify karo. 3. Tab
              sister account par same onboarding run karo.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
