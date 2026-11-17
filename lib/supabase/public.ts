import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";

/** Cache tag shared by every public read. Admin actions expire it after each change. */
export const CONTENT_TAG = "content";

/**
 * Anonymous client for public pages. Its requests go through the Next.js data cache,
 * so visitors do not hit the database on every page view.
 */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) =>
        fetch(input, { ...init, next: { tags: [CONTENT_TAG], revalidate: 3600 } }),
    },
  });
}
