import Link from "next/link";
import { sampleProfiles } from "@/lib/mock-data";
import { learnerModeLabels } from "@/lib/profile-copy";

type ProfileSwitcherProps = {
  currentProfileId: string;
  route: "/" | "/learn" | "/review";
};

export function ProfileSwitcher({
  currentProfileId,
  route,
}: ProfileSwitcherProps) {
  return (
    <div className="chips" style={{ marginBottom: "1rem" }}>
      {sampleProfiles.map((profile) => {
        const isActive = profile.id === currentProfileId;

        return (
          <Link
            className="chip"
            href={`${route}?profile=${profile.id}`}
            key={profile.id}
            style={{
              background: isActive ? "rgba(194, 65, 12, 0.16)" : undefined,
              fontWeight: isActive ? 700 : 400,
            }}
          >
            {profile.fullName} · {learnerModeLabels[profile.learnerMode]}
          </Link>
        );
      })}
    </div>
  );
}
