import { LearnerMode, LearnerRole } from "@/lib/types";

export type StarterAccountKey = "primary" | "sister";

export type StarterAccount = {
  key: StarterAccountKey;
  authUserId: string;
  email: string;
  fullName: string;
  learnerMode: LearnerMode;
  role: LearnerRole;
  grade: string | null;
  targetExam: string | null;
  dailyGoalMinutes: number;
  weeklyTargetCards: number;
};

export const starterAccounts: Record<StarterAccountKey, StarterAccount> = {
  primary: {
    key: "primary",
    authUserId: "00000000-0000-0000-0000-000000000001",
    email: "deependra.recall.v2@example.com",
    fullName: "Deependra",
    learnerMode: "general",
    role: "self_learner",
    grade: null,
    targetExam: null,
    dailyGoalMinutes: 45,
    weeklyTargetCards: 80,
  },
  sister: {
    key: "sister",
    authUserId: "00000000-0000-0000-0000-000000000002",
    email: "khushbu.recall.v2@example.com",
    fullName: "Khushbu",
    learnerMode: "neet",
    role: "student",
    grade: "10th",
    targetExam: "NEET",
    dailyGoalMinutes: 60,
    weeklyTargetCards: 140,
  },
};

export function getStarterAccountByEmail(email?: string | null) {
  if (!email) {
    return null;
  }

  return (
    Object.values(starterAccounts).find(
      (account) => account.email.toLowerCase() === email.trim().toLowerCase(),
    ) ?? null
  );
}
