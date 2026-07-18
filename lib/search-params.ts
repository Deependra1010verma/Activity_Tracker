export type PageSearchParams = Record<string, string | string[] | undefined>;

export type SearchParamsInput = Promise<PageSearchParams>;

export async function resolveProfileId(searchParams?: SearchParamsInput) {
  const resolved = searchParams ? await searchParams : undefined;
  const profile = resolved?.profile;

  if (Array.isArray(profile)) {
    return profile[0];
  }

  return profile;
}
