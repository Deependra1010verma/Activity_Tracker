import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { HomeShell } from "@/components/home-shell";
import { AuthForm } from "@/components/auth-form";
import { 
  buildDashboardStats, 
  buildWeakTopics, 
  mapLearningEntryRow 
} from "@/lib/dashboard-mappers";
import { mapProfileRowToProfile, mapSubjectRow, ProfileRow, SubjectRow } from "@/lib/profile-mappers";
import { mapCardRowToConceptCard, ReviewCardRow } from "@/lib/review-mappers";
import { LearningEntryRow } from "@/lib/dashboard-mappers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
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
  let entryRows: LearningEntryRow[] = [];
  let cardRows: ReviewCardRow[] = [];
  let totalNotesCount = 0;

  const cachedProfileId = currentUser.profile_id;
  const profileSelect = "id, full_name, role, learner_mode, grade, target_exam, daily_goal_minutes, weekly_target_cards";
  const cardSelect = "id, prompt_style, prompt, answer, current_interval_days, ease, streak, last_reviewed_at, next_review_at, exam_priority, concepts!inner(concept_text, learning_entries!inner(id, title, subject, profile_id)), card_tags(tag)";

  if (cachedProfileId) {
    const [profileRes, subjectRes, entryRes, cardRes, entryCountRes] = await Promise.all([
      supabase.from("profiles").select(profileSelect).eq("id", cachedProfileId).maybeSingle(),
      supabase.from("subjects").select("id, name, accent, focus").eq("profile_id", cachedProfileId).order("created_at", { ascending: true }),
      supabase.from("learning_entries").select("id, profile_id, title, subject, created_at, summary, source_type, concepts(concept_text)").eq("profile_id", cachedProfileId).order("created_at", { ascending: false }).limit(6),
      supabase.from("cards").select(cardSelect).eq("concepts.learning_entries.profile_id", cachedProfileId).order("next_review_at", { ascending: true }).limit(8),
      supabase.from("learning_entries").select("*", { count: "exact", head: true }).eq("profile_id", cachedProfileId)
    ]);
    profileRow = profileRes.data;
    subjectRows = subjectRes.data as unknown as SubjectRow[] ?? [];
    entryRows = entryRes.data as unknown as LearningEntryRow[] ?? [];
    cardRows = cardRes.data as unknown as ReviewCardRow[] ?? [];
    totalNotesCount = entryCountRes.count ?? 0;
  } else {
    const { data: pRow } = await supabase.from("profiles").select(profileSelect).eq("auth_user_id", currentUser.id).maybeSingle();
    profileRow = pRow;
    if (profileRow) {
      const [subjectRes, entryRes, cardRes, entryCountRes] = await Promise.all([
        supabase.from("subjects").select("id, name, accent, focus").eq("profile_id", profileRow.id).order("created_at", { ascending: true }),
        supabase.from("learning_entries").select("id, profile_id, title, subject, created_at, summary, source_type, concepts(concept_text)").eq("profile_id", profileRow.id).order("created_at", { ascending: false }).limit(6),
        supabase.from("cards").select(cardSelect).eq("concepts.learning_entries.profile_id", profileRow.id).order("next_review_at", { ascending: true }).limit(8),
        supabase.from("learning_entries").select("*", { count: "exact", head: true }).eq("profile_id", profileRow.id)
      ]);
      subjectRows = subjectRes.data as unknown as SubjectRow[] ?? [];
      entryRows = entryRes.data as unknown as LearningEntryRow[] ?? [];
      cardRows = cardRes.data as unknown as ReviewCardRow[] ?? [];
      totalNotesCount = entryCountRes.count ?? 0;
    }
  }

  if (!profileRow) {
    return <HomeShell needsProfile userEmail={currentUser.email} />;
  }

  const mappedEntries = entryRows.map(mapLearningEntryRow);
  const mappedCards = cardRows.map(mapCardRowToConceptCard);
  const stats = buildDashboardStats({ totalEntries: totalNotesCount, cards: mappedCards });
  const profile = mapProfileRowToProfile(profileRow as any, subjectRows.map(mapSubjectRow));

  return <HomeShell profile={profile} stats={stats} entries={mappedEntries} userEmail={currentUser.email} />;
}
