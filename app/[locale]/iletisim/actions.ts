"use server";

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";

export type ContactState = { status: "idle" | "sent" } | { status: "error"; code: ContactError };
export type ContactError = "invalid_name" | "invalid_email" | "invalid_body" | "rate_limited" | "failed";

const KNOWN: ContactError[] = ["invalid_name", "invalid_email", "invalid_body", "rate_limited"];

/** Sends a contact form message. The database checks the fields and the sending limits. */
export async function sendMessage(_prev: ContactState, form: FormData): Promise<ContactState> {
  // Bots fill the hidden field; people never see it. Pretend it worked so they do not retry.
  if (String(form.get("website") ?? "").trim()) return { status: "sent" };

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error } = await supabase.rpc("send_message", {
    p_name: String(form.get("name") ?? ""),
    p_email: String(form.get("email") ?? ""),
    p_body: String(form.get("message") ?? ""),
  });
  if (!error) return { status: "sent" };

  const code = KNOWN.find((known) => error.message === known) ?? "failed";
  return { status: "error", code };
}
