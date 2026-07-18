import { NextRequest, NextResponse } from "next/server";
import { starterAccounts } from "@/lib/starter-accounts";

function getStarterAccountForCredentials(username: string, password: string) {
  const primaryUsername = (process.env.STARTER_ONE_USERNAME ?? "").trim().toLowerCase();
  const primaryPassword = process.env.STARTER_ONE_PASSWORD ?? "";
  const sisterUsername = (process.env.STARTER_TWO_USERNAME ?? "").trim().toLowerCase();
  const sisterPassword = process.env.STARTER_TWO_PASSWORD ?? "";

  if (username === primaryUsername && password === primaryPassword) {
    return starterAccounts.primary;
  }

  if (username === sisterUsername && password === sisterPassword) {
    return starterAccounts.sister;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  const username = body.username?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password required." },
      { status: 400 },
    );
  }

  const account = getStarterAccountForCredentials(username, password);

  if (!account) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  // Fetch profile to cache profile_id and learner_mode
  let profileId = null;
  let learnerMode = null;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, learner_mode")
        .eq("auth_user_id", account.authUserId)
        .maybeSingle();

      if (profile) {
        profileId = profile.id;
        learnerMode = profile.learner_mode;
      }
    } catch (e) {
      console.error("Failed to fetch profile during SSR login", e);
    }
  }

  const mockSession = {
    user: {
      id: account.authUserId,
      email: account.email,
      user_metadata: {
        full_name: account.fullName,
      },
      profile_id: profileId,
      learner_mode: learnerMode,
    },
  };

  const response = NextResponse.json({ account, mockSession });
  
  response.cookies.set("mock_auth_session", JSON.stringify(mockSession), {
    path: "/",
    httpOnly: false, // Accessible to JS if needed, but primarily for server reading
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
  });

  return response;
}
