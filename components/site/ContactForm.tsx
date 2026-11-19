"use client";

import { useActionState, useState } from "react";
import { sendMessage, type ContactState } from "@/app/[locale]/iletisim/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ContactForm({ t }: { t: Dictionary["contact"] }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { status: "idle" });
  const [round, setRound] = useState(0);
  const [dismissed, setDismissed] = useState(-1);

  if (state.status === "sent" && dismissed !== round) {
    return (
      <div className="form-sent" role="status">
        <strong>{t.sentTitle}</strong>
        <p>{t.sentBody}</p>
        <button type="button" className="text-link" style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }} onClick={() => setDismissed(round)}>
          {t.another}
        </button>
      </div>
    );
  }

  const error = state.status === "error" ? t.errors[state.code] : null;

  return (
    <form action={action} className="contact-form" onSubmit={() => setRound((value) => value + 1)} noValidate={false}>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-field">
        <label htmlFor="contact-name">{t.name}</label>
        <input id="contact-name" name="name" type="text" autoComplete="name" required maxLength={100} />
      </div>
      <div className="form-field">
        <label htmlFor="contact-email">{t.email}</label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={200} />
      </div>
      <div className="form-field">
        <label htmlFor="contact-message">{t.message}</label>
        <textarea id="contact-message" name="message" required minLength={5} maxLength={5000} />
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <button type="submit" className="btn btn--primary" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? t.sending : t.send}
      </button>
    </form>
  );
}
