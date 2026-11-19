"use client";

import { useActionState } from "react";
import { registerForEvent, type RegisterState } from "@/app/[locale]/etkinlikler/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function RegistrationForm({ slug, t, calendarHref }: { slug: string; t: Dictionary["events"]; calendarHref: string }) {
  const [state, action, pending] = useActionState<RegisterState, FormData>(registerForEvent, { status: "idle" });

  if (state.status === "done") {
    return (
      <div className="form-sent" role="status">
        <strong>{t.doneTitle}</strong>
        <p>{t.doneBody}</p>
        <a href={calendarHref} className="text-link">
          {t.addToCalendar}
        </a>
      </div>
    );
  }

  const error = state.status === "error" ? t.errors[state.code] : null;

  return (
    <form action={action} className="contact-form registration-form" aria-label={t.formTitle}>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <input type="hidden" name="slug" value={slug} />
      <div className="form-field">
        <label htmlFor="reg-name">{t.name}</label>
        <input id="reg-name" name="name" type="text" autoComplete="name" required minLength={2} maxLength={100} />
      </div>
      <div className="form-field">
        <label htmlFor="reg-email">{t.email}</label>
        <input id="reg-email" name="email" type="email" autoComplete="email" required maxLength={200} />
      </div>
      <div className="form-field">
        <label htmlFor="reg-department">{t.department}</label>
        <input id="reg-department" name="department" type="text" autoComplete="organization-title" maxLength={100} />
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="reg-website">Website</label>
        <input id="reg-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="registration-form__privacy">{t.privacy}</p>
      <button type="submit" className="btn btn--sun" disabled={pending}>
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
