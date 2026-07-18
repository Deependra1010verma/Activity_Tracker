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
    
    router.push("/auth");
    router.refresh();
  }

  return (
    <div style={{ position: "absolute", top: "1rem", right: "2rem", zIndex: 100 }} className="auth-controls">
      {email ? <span className="user-email">{email}</span> : null}
      <button className="btn-logout" onClick={() => void handleSignOut()} type="button">
        Logout
      </button>
    </div>
  );
}
