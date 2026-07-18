"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { StarterAccount } from "@/lib/starter-accounts";
import { getSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

export function AuthForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
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
      setError("Supabase env values missing hain. Pehle `.env` configure karo.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase client initialize nahi ho paaya.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/starter-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      const payload = (await response.json()) as {
        account?: StarterAccount;
        error?: string;
      };

      if (!response.ok || !payload.account) {
        throw new Error(payload.error ?? "Invalid username or password.");
      }

      const starterAccount = payload.account;

      // Bypass Supabase Auth completely and use a local session mock
      const mockSession = {
        user: {
          id: starterAccount.authUserId,
          email: starterAccount.email,
          user_metadata: {
            full_name: starterAccount.fullName,
          }
        }
      };
      
      localStorage.setItem("mock_auth_session", JSON.stringify(mockSession));

      setMessage("Login successful. Tumhara personal workspace open kar rahe hain.");
      router.push("/");
      router.refresh();
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
      <div className="section-panel auth-panel auth-panel-primary">
        <span className="eyebrow">Memory studio</span>
        <h2 className="headline auth-headline">Come back tomorrow and it still feels fresh.</h2>
        <p className="section-copy auth-copy">
          Har login ke baad tumhara khud ka calm, focused recall space khulega jahan
          learning, review aur streaks neatly alag rahenge.
        </p>

        <form className="capture-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              value={username}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              type="password"
              value={password}
            />
          </div>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Please wait..." : "Login"}
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

      <div className="section-panel auth-panel">
        <span className="eyebrow">Why it feels better</span>
        <h3 className="section-title">Simple, private, repeatable</h3>
        <div className="stack">
          <article className="list-card">
            <h4>One login, one study world</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              Har learner ka dashboard aur review queue independent rahega, isliye focus
              tootega nahi.
            </p>
          </article>
          <article className="list-card">
            <h4>Gentle daily rhythm</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              UI intentionally clean rakha gaya hai taaki tum bas aao, login karo, aur
              recall loop me ghus jao.
            </p>
          </article>
          <article className="list-card">
            <h4>Built for repeat visits</h4>
            <p className="section-copy" style={{ marginTop: "0.45rem" }}>
              Soft visuals, focused cards aur clear actions website ko noisy nahi hone
              dete.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
