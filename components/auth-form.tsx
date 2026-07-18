"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

type AuthMode = "signin" | "signup";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const envReady = hasSupabaseEnv();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!envReady) {
      setError("Supabase env values missing hain. Pehle .env.local configure karo.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase client initialize nahi ho paaya.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        setMessage(
          "Account create ho gaya. Agar auto-login mil gaya hai to onboarding par jao, warna email verify karke sign in karo.",
        );

        router.push("/onboarding");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        setMessage("Login successful. Onboarding par redirect kar rahe hain.");
        router.push("/onboarding");
      }
    } catch (submissionError) {
      const nextError =
        submissionError instanceof Error
          ? submissionError.message
          : "Unexpected auth error aaya.";
      setError(nextError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="grid-two">
      <div className="section-panel">
        <span className="eyebrow">Separate accounts</span>
        <h2 className="section-title">Sign up for each learner</h2>
        <p className="section-copy">
          Tum aur tumhari bahan ke alag accounts honge. Isi se review schedule,
          due cards, aur learning history independent rahegi.
        </p>

        <div className="chips" style={{ marginBottom: "1rem" }}>
          <button
            className="secondary-button"
            onClick={() => setMode("signup")}
            type="button"
          >
            Create account
          </button>
          <button
            className="secondary-button"
            onClick={() => setMode("signin")}
            type="button"
          >
            Sign in
          </button>
        </div>

        <form className="capture-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <div className="field">
              <label htmlFor="full-name">Full name</label>
              <input
                id="full-name"
                name="fullName"
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Example: Deependra"
                value={fullName}
              />
            </div>
          ) : null}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              type="email"
              value={email}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              type="password"
              value={password}
            />
          </div>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Please wait..."
              : mode === "signup"
                ? "Create learner account"
                : "Sign in"}
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
        <span className="eyebrow">What happens next</span>
        <h3 className="section-title">Profile onboarding flow</h3>
        <div className="stack">
          <article className="list-card">
            <h4>1. Choose learner mode</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              `general`, `school`, ya `neet` ke hisaab se subject presets aur
              prompt templates load honge.
            </p>
          </article>
          <article className="list-card">
            <h4>2. Save profile row</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              Signup ke baad `profiles` table me full name, grade, target exam,
              daily goal aur weekly card target save karenge.
            </p>
          </article>
          <article className="list-card">
            <h4>3. Attach subject presets</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              First pass me tumhari profile ke liye DSA/Web/Backend defaults milengi.
              Sister ko same system me second profile ke roop me add karenge.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
