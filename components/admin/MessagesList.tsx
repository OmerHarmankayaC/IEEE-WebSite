"use client";

import { useState, useTransition } from "react";
import { deleteMessage, setMessageRead } from "@/app/admin/panel-actions";
import { ConfirmDialog } from "./ConfirmDialog";

export type MessageRow = { id: string; name: string; email: string; body: string; status: "new" | "read"; created_at: string };

const formatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

export function MessagesList({ messages }: { messages: MessageRow[] }) {
  const [filter, setFilter] = useState<"all" | "new">("all");
  const [deleting, setDeleting] = useState<MessageRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const shown = filter === "new" ? messages.filter((message) => message.status === "new") : messages;

  const run = (task: () => Promise<{ ok: boolean; error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await task();
      if (!result.ok) setError(result.error ?? "İşlem yapılamadı.");
    });

  return (
    <>
      <div className="segmented" role="group" aria-label="Mesajları süz">
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
          Tümü ({messages.length})
        </button>
        <button type="button" aria-pressed={filter === "new"} onClick={() => setFilter("new")}>
          Okunmamış ({messages.filter((message) => message.status === "new").length})
        </button>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <div className="info-box">{filter === "new" ? "Okunmamış mesaj yok." : "Henüz mesaj gelmedi."}</div>
      ) : (
        <ul className="admin-list">
          {shown.map((message) => (
            <li key={message.id} className={message.status === "new" ? "message message--new" : "message"}>
              <div className="message__head">
                <div className="message__from">
                  <strong>{message.name}</strong>
                  <a href={`mailto:${message.email}`}>{message.email}</a>
                </div>
                <div className="message__meta">
                  {message.status === "new" && <span className="badge badge--featured">Yeni</span>}
                  <span className="mono mono--muted">{formatter.format(new Date(message.created_at))}</span>
                </div>
              </div>
              <p className="message__body">{message.body}</p>
              <div className="message__actions">
                <a className="btn btn--sun btn--small" href={`mailto:${message.email}?subject=${encodeURIComponent("IEEE TEDU: mesajın hakkında")}`}>
                  Yanıtla
                </a>
                <button
                  type="button"
                  className="btn btn--outline btn--small"
                  disabled={pending}
                  onClick={() => run(() => setMessageRead(message.id, message.status === "new"))}
                >
                  {message.status === "new" ? "Okundu işaretle" : "Okunmadı işaretle"}
                </button>
                <button type="button" className="btn btn--outline btn--small btn--danger-outline" disabled={pending} onClick={() => setDeleting(message)}>
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {deleting && (
        <ConfirmDialog
          title="Mesajı sil"
          body={`${deleting.name} adlı kişinin mesajı kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
          confirmLabel="Mesajı sil"
          busy={pending}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            run(async () => {
              const result = await deleteMessage(deleting.id);
              setDeleting(null);
              return result;
            })
          }
        />
      )}
    </>
  );
}
