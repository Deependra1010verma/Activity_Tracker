import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { ReviewShell } from "@/components/review-shell";
import { AuthForm } from "@/components/auth-form";
import { mapProfileRowToProfile, mapSubjectRow, ProfileRow, SubjectRow } from "@/lib/profile-mappers";
import { mapCardRowToConceptCard, ReviewCardRow } from "@/lib/review-mappers";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
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
  let cardRows: ReviewCardRow[] = [];

  const cachedProfileId = currentUser.profile_id;
  const profileSelect = "id, full_name, role, learner_mode, grade, target_exam, daily_goal_minutes, weekly_target_cards";
  const cardSelect = "id, prompt_style, prompt, answer, current_interval_days, ease, streak, last_reviewed_at, next_review_at, exam_priority, concepts!inner(concept_text, learning_entries!inner(id, title, subject, profile_id)), card_tags(tag)";
  const nowIso = new Date().toISOString();

  if (cachedProfileId) {
    const [profileRes, subjectRes, cardRes] = await Promise.all([
      supabase.from("profiles").select(profileSelect).eq("id", cachedProfileId).maybeSingle(),
      supabase.from("subjects").select("id, name, accent, focus").eq("profile_id", cachedProfileId).order("created_at", { ascending: true }),
      supabase.from("cards").select(cardSelect).eq("concepts.learning_entries.profile_id", cachedProfileId).lte("next_review_at", nowIso).order("next_review_at", { ascending: true })
    ]);
    profileRow = profileRes.data;
    subjectRows = subjectRes.data as unknown as SubjectRow[] ?? [];
    cardRows = cardRes.data as unknown as ReviewCardRow[] ?? [];
  } else {
    const { data: pRow } = await supabase.from("profiles").select(profileSelect).eq("auth_user_id", currentUser.id).maybeSingle();
    profileRow = pRow;
    if (profileRow) {
      const [subjectRes, cardRes] = await Promise.all([
        supabase.from("subjects").select("id, name, accent, focus").eq("profile_id", profileRow.id).order("created_at", { ascending: true }),
        supabase.from("cards").select(cardSelect).eq("concepts.learning_entries.profile_id", profileRow.id).lte("next_review_at", nowIso).order("next_review_at", { ascending: true })
      ]);
      subjectRows = subjectRes.data as unknown as SubjectRow[] ?? [];
      cardRows = cardRes.data as unknown as ReviewCardRow[] ?? [];
    }
  }

  if (!profileRow) {
    return <ReviewShell needsProfile userEmail={currentUser.email} />;
  }

  const profile = mapProfileRowToProfile(profileRow as any, subjectRows.map(mapSubjectRow));
  const cards = cardRows.map(mapCardRowToConceptCard);

  return <ReviewShell profile={profile} cards={cards} userEmail={currentUser.email} />;
}
