import { getTaglineForMode } from "@/lib/subject-presets";
import { LearnerMode, LearnerRole, Profile, SubjectPreset } from "@/lib/types";

export type ProfileRow = {
  id: string;
  full_name: string;
  role: LearnerRole;
  learner_mode: LearnerMode;
  grade: string | null;
  target_exam: string | null;
  daily_goal_minutes: number;
  weekly_target_cards: number;
};

export type SubjectRow = {
  id: string;
  name: string;
  accent: string | null;
  focus: string | null;
};

export function mapSubjectRow(subject: SubjectRow): SubjectPreset {
  return {
    id: subject.id,
    name: subject.name,
    accent: subject.accent ?? "Default",
    focus: subject.focus ?? "Custom subject focus",
  };
}

export function mapProfileRowToProfile(
  profile: ProfileRow,
  subjects: SubjectPreset[],
): Profile {
  return {
    id: profile.id,
    fullName: profile.full_name,
    role: profile.role,
    learnerMode: profile.learner_mode,
    grade: profile.grade,
    targetExam: profile.target_exam,
    dailyGoalMinutes: profile.daily_goal_minutes,
    weeklyTargetCards: profile.weekly_target_cards,
    tagline: getTaglineForMode(profile.learner_mode),
    subjects,
  };
}
