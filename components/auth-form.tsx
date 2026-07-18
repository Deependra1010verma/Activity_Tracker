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

      setMessage("Welcome back! ✨");
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
    <div className="centered-page">
      <div className="cute-card" style={{ maxWidth: "450px", width: "100%", textAlign: "center" }}>
        <h2 className="cute-title" style={{ fontSize: "2.5rem" }}>Welcome ✨</h2>
        <p className="cute-subtitle">Ready to learn something new today?</p>

        <form className="cute-form" onSubmit={handleSubmit}>
          <div className="cute-field" style={{ textAlign: "left" }}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              className="cute-input"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="e.g. Deependra"
              value={username}
            />
          </div>

          <div className="cute-field" style={{ textAlign: "left" }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="cute-input"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              value={password}
            />
          </div>

          <button className="btn-primary" disabled={isSubmitting} type="submit" style={{ marginTop: "1rem" }}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {message ? (
          <div className="msg-success" style={{ marginTop: "1.5rem" }}>{message}</div>
        ) : null}

        {error ? (
          <div className="msg-error" style={{ marginTop: "1.5rem" }}>{error}</div>
        ) : null}
      </div>
    </div>
  );
}
