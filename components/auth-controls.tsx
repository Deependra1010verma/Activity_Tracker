"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type AuthControlsProps = {
  email?: string | null;
};

export function AuthControls({ email }: AuthControlsProps) {
  const router = useRouter();

  async function handleSignOut() {
    localStorage.removeItem("mock_auth_session");
    
    // Slight delay before redirecting helps UI transitions
    await new Promise(resolve => setTimeout(resolve, 50));
    router.push("/auth");
    router.refresh();
  }

  return (
    <div className="chips" style={{ marginBottom: "1rem" }}>
      {email ? <span className="chip">{email}</span> : null}
      <button className="secondary-button" onClick={() => void handleSignOut()} type="button">
        Logout
      </button>
    </div>
  );
}
