"use client";

import { useState, useTransition } from "react";
import { inviteAdmin, removeAdmin } from "@/app/admin/panel-actions";
import { ConfirmDialog } from "./ConfirmDialog";

export type AdminRow = { user_id: string; email: string; added_at: string; last_sign_in_at: string | null };

const formatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

export function AdminsManager({ admins, currentUserId }: { admins: AdminRow[]; currentUserId: string }) {
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<AdminRow | null>(null);
  const [pending, startTransition] = useTransition();

  const invite = () =>
    startTransition(async () => {
      setError(null);
      setNotice(null);
      const result = await inviteAdmin(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setNotice(
        result.data.invited
          ? `${email.trim()} adresine davet gönderildi. Kişi e-postadaki bağlantıyla şifresini belirleyip giriş yapabilir.`
          : `${email.trim()} adresinin zaten bir hesabı vardı; yönetici yetkisi verildi. Kendi şifresiyle giriş yapabilir.`,
      );
      setEmail("");
    });

  return (
    <>
      <section className="panel" aria-labelledby="invite-title">
        <h2 className="panel__bar" id="invite-title">
          Yönetici davet et
        </h2>
        <form
          className="panel__body"
          onSubmit={(event) => {
            event.preventDefault();
            invite();
          }}
        >
          <div className="field">
            <label className="field__label" htmlFor="invite-email">
              E-posta adresi
            </label>
            <div className="team-admin__new">
              <input id="invite-email" className="input" type="email" required placeholder="ornek@tedu.edu.tr" value={email} onChange={(event) => setEmail(event.target.value)} />
              <button type="submit" className="btn btn--sun btn--small" disabled={pending || !email.trim()}>
                {pending ? "Gönderiliyor…" : "Davet gönder"}
              </button>
            </div>
          </div>
          <p className="help-text">Davet edilen kişiye bir e-posta gider. Bağlantıya tıklayıp şifresini belirledikten sonra bu panele girebilir.</p>
          {notice && (
            <p className="info-box" role="status">
              {notice}
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
      </section>

      <ul className="admin-list">
        {admins.map((admin) => {
          const isMe = admin.user_id === currentUserId;
          return (
            <li key={admin.user_id} className="admin-person">
              <span className="admin-person__who">
                <strong>{admin.email}</strong>
                <span className="mono mono--muted">
                  {formatter.format(new Date(admin.added_at))} tarihinde eklendi.{" "}
                  {admin.last_sign_in_at ? `Son giriş: ${formatter.format(new Date(admin.last_sign_in_at))}.` : "Henüz giriş yapmadı."}
                </span>
              </span>
              {isMe ? (
                <span className="badge badge--draft">Sen</span>
              ) : (
                <button type="button" className="btn btn--outline btn--small btn--danger-outline" onClick={() => setRemoving(admin)}>
                  Yöneticilikten çıkar
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {removing && (
        <ConfirmDialog
          title="Yöneticilikten çıkar"
          body={`${removing.email} artık bu panele giremeyecek. Hesabı silinmez; istersen daha sonra yeniden davet edebilirsin.`}
          confirmLabel="Yöneticilikten çıkar"
          busy={pending}
          onCancel={() => setRemoving(null)}
          onConfirm={() =>
            startTransition(async () => {
              const result = await removeAdmin(removing.user_id);
              if (!result.ok) setError(result.error);
              setRemoving(null);
            })
          }
        />
      )}
    </>
  );
}
