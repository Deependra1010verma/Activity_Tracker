import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { LearnShell } from "@/components/learn-shell";
import { AuthForm } from "@/components/auth-form";
import { mapProfileRowToProfile, mapSubjectRow, ProfileRow, SubjectRow } from "@/lib/profile-mappers";

export const dynamic = "force-dynamic";

type LearnPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get("mock_auth_session")?.value;
  const resolvedParams = await searchParams;
  const entryId = resolvedParams.entryId as string | undefined;

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
  let editEntry = undefined;

  const cachedProfileId = currentUser.profile_id;
  const profileSelect = "id, full_name, role, learner_mode, grade, target_exam, daily_goal_minutes, weekly_target_cards";

  if (cachedProfileId) {
    const promises: Promise<any>[] = [
      supabase.from("profiles").select(profileSelect).eq("id", cachedProfileId).maybeSingle(),
      supabase.from("subjects").select("id, name, accent, focus").eq("profile_id", cachedProfileId).order("created_at", { ascending: true })
    ];
    
    if (entryId) {
      promises.push(
        supabase.from("learning_entries")
          .select("id, title, summary, concepts(concept_text)")
          .eq("id", entryId)
          .eq("profile_id", cachedProfileId)
          .maybeSingle()
      );
    }
    
    const results = await Promise.all(promises);
    profileRow = results[0].data;
    subjectRows = results[1].data as unknown as SubjectRow[] ?? [];
    
    if (entryId && results[2]?.data) {
      const entryData = results[2].data;
      editEntry = {
        id: entryData.id,
        title: entryData.title,
        summary: entryData.summary,
        concepts: entryData.concepts?.map((c: any) => c.concept_text) ?? []
      };
    }
  } else {
    const { data: pRow } = await supabase.from("profiles").select(profileSelect).eq("auth_user_id", currentUser.id).maybeSingle();
    profileRow = pRow;
    if (profileRow) {
      const { data: sRows } = await supabase.from("subjects").select("id, name, accent, focus").eq("profile_id", profileRow.id).order("created_at", { ascending: true });
      subjectRows = sRows as unknown as SubjectRow[] ?? [];
      
      if (entryId) {
        const { data: entryData } = await supabase.from("learning_entries")
          .select("id, title, summary, concepts(concept_text)")
          .eq("id", entryId)
          .eq("profile_id", profileRow.id)
          .maybeSingle();
          
        if (entryData) {
          editEntry = {
            id: entryData.id,
            title: entryData.title,
            summary: entryData.summary,
            concepts: entryData.concepts?.map((c: any) => c.concept_text) ?? []
          };
        }
      }
    }
  }

  if (!profileRow) {
    return <LearnShell needsProfile userEmail={currentUser.email} />;
  }

  const profile = mapProfileRowToProfile(profileRow as any, subjectRows.map(mapSubjectRow));

  return <LearnShell profile={profile} userEmail={currentUser.email} editEntry={editEntry} />;
}
