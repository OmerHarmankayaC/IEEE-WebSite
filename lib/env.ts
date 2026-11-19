// Public Supabase settings. Both are meant to be public (they ship to every visitor's browser)
// and every table is protected by row level security, so the production values are kept here
// as defaults. Environment variables, when set, take precedence.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oprcovsrvseeiuclwgqn.supabase.co";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_LRsNoVtFz0Vm1h5YNNYHbg_aOc_RPYK";

export const IMAGE_BUCKET = "blog-images";
export const TEAM_BUCKET = "team-photos";

/** Absolute site address, used for links in metadata and the sitemap. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export function publicImageUrl(path: string | null | undefined): string | null {
  if (!path || !SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}

/** Team photos are either bundled under /images/team/ or stored in the team-photos bucket. */
export function teamPhotoUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/")) return path;
  return `${SUPABASE_URL}/storage/v1/object/public/${TEAM_BUCKET}/${path}`;
}
