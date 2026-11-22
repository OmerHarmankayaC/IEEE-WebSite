import type { RegistrationStatus } from "@/lib/events";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** A short line about registration, for lists and cards. */
export function registrationLine(status: RegistrationStatus, t: Dictionary["events"]): string | null {
  switch (status.kind) {
    case "open-site":
      return status.remaining === null ? t.open : t.spotsLeft.replace("{n}", String(status.remaining));
    case "open-external":
      return t.open;
    case "closed":
      return t.closed;
    case "full":
      return t.full;
    default:
      return null;
  }
}
