import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { LearnShell } from "@/components/learn-shell";
import { AuthForm } from "@/components/auth-form";
import { mapProfileRowToProfile, mapSubjectRow, ProfileRow, SubjectRow } from "@/lib/profile-mappers";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get("mock_auth_session")?.value;

  if (!sessionStr) {
    return <AuthForm />;
  }

  let session;
  try {
    session = JSON.parse(sessionStr);
  } catch (e) {
    return <AuthForm />;
  }

  const currentUser = session?.user;
  if (!currentUser) return <AuthForm />;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return <div>Missing Supabase Config</div>;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  let profileRow = null;
  let subjectRows: SubjectRow[] = [];

  const cachedProfileId = currentUser.profile_id;
  const profileSelect = "id, full_name, role, learner_mode, grade, target_exam, daily_goal_minutes, weekly_target_cards";

  if (cachedProfileId) {
    const [profileRes, subjectRes] = await Promise.all([
      supabase.from("profiles").select(profileSelect).eq("id", cachedProfileId).maybeSingle(),
      supabase.from("subjects").select("id, name, accent, focus").eq("profile_id", cachedProfileId).order("created_at", { ascending: true })
    ]);
    profileRow = profileRes.data;
    subjectRows = subjectRes.data as unknown as SubjectRow[] ?? [];
  } else {
    const { data: pRow } = await supabase.from("profiles").select(profileSelect).eq("auth_user_id", currentUser.id).maybeSingle();
    profileRow = pRow;
    if (profileRow) {
      const { data: sRows } = await supabase.from("subjects").select("id, name, accent, focus").eq("profile_id", profileRow.id).order("created_at", { ascending: true });
      subjectRows = sRows as unknown as SubjectRow[] ?? [];
    }
  }

  if (!profileRow) {
    return <LearnShell needsProfile userEmail={currentUser.email} />;
  }

  const profile = mapProfileRowToProfile(profileRow as any, subjectRows.map(mapSubjectRow));

  return <LearnShell profile={profile} userEmail={currentUser.email} />;
}
