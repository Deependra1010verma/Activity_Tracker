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

  return NextResponse.json({ account });
}
