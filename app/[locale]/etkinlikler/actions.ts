"use server";

import { createClient } from "@supabase/supabase-js";
import { updateTag } from "next/cache";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";
import { CONTENT_TAG } from "@/lib/supabase/public";

export type RegisterError =
  | "invalid_name"
  | "invalid_email"
  | "invalid_department"
  | "duplicate"
  | "full"
  | "closed"
  | "not_found"
  | "rate_limited"
  | "failed";

export type RegisterState = { status: "idle" | "done" } | { status: "error"; code: RegisterError };

const KNOWN: RegisterError[] = ["invalid_name", "invalid_email", "invalid_department", "duplicate", "full", "closed", "not_found", "rate_limited"];

/** Registers a visitor for an event. The database checks the fields, the capacity and the deadline. */
export async function registerForEvent(_prev: RegisterState, form: FormData): Promise<RegisterState> {
  // Bots fill the hidden field; people never see it. Pretend it worked so they do not retry.
  if (String(form.get("website") ?? "").trim()) return { status: "done" };

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.rpc("register_for_event", {
    p_slug: String(form.get("slug") ?? ""),
    p_name: String(form.get("name") ?? ""),
    p_email: String(form.get("email") ?? ""),
    p_department: String(form.get("department") ?? ""),
  });
  if (error) {
    console.error("registerForEvent failed", error);
    return { status: "error", code: "failed" };
  }
  if (data === "ok") {
    // The remaining places shown on the site change with every registration.
    updateTag(CONTENT_TAG);
    return { status: "done" };
  }
  const code = KNOWN.find((known) => known === data) ?? "failed";
  return { status: "error", code };
}
