"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteRegistration } from "@/app/admin/panel-actions";
import { TrashIcon } from "@/components/icons";
import { ConfirmDialog } from "./ConfirmDialog";

type Registration = { id: string; name: string; email: string; department: string | null; created_at: string };

const formatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

export function RegistrationsList({ registrations }: { registrations: Registration[] }) {
  const router = useRouter();
  const [target, setTarget] = useState<Registration | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [deleting, startDeleting] = useTransition();

  const copyEmails = async () => {
    try {
      await navigator.clipboard.writeText(registrations.map((item) => item.email).join(", "));
      setMessage({ kind: "success", text: `${registrations.length} e-posta adresi kopyalandı.` });
    } catch {
      setMessage({ kind: "error", text: "Kopyalanamadı. Tarayıcın panoya erişime izin vermiyor olabilir." });
    }
  };

  const confirmDelete = () => {
    if (!target) return;
    startDeleting(async () => {
      const result = await deleteRegistration(target.id);
      setTarget(null);
      if (!result.ok) setMessage({ kind: "error", text: result.error });
      else router.refresh();
    });
  };

  if (registrations.length === 0) {
    return <p className="empty-note">Henüz kayıt yok. Sitedeki form doldurulduğunda kayıtlar burada görünür.</p>;
  }

  return (
    <>
      <div className="toolbar-row">
        <button type="button" className="btn btn--outline btn--small" onClick={copyEmails}>
          E-postaları kopyala
        </button>
      </div>
      {message && (
        <p className={`notice notice--${message.kind}`} role={message.kind === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      )}
      <div className="table-box">
        <table className="reg-table">
          <thead>
            <tr>
              <th scope="col">Sıra</th>
              <th scope="col">Ad soyad</th>
              <th scope="col">E-posta</th>
              <th scope="col">Bölüm</th>
              <th scope="col">Kayıt zamanı</th>
              <th scope="col">
                <span className="visually-hidden">İşlemler</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((item, index) => (
              <tr key={item.id}>
                <td className="mono mono--muted">{index + 1}</td>
                <td>{item.name}</td>
                <td>
                  <a href={`mailto:${item.email}`}>{item.email}</a>
                </td>
                <td>{item.department ?? <span className="mono mono--muted">Yok</span>}</td>
                <td className="mono mono--muted">{formatter.format(new Date(item.created_at))}</td>
                <td style={{ textAlign: "right" }}>
                  <button type="button" className="icon-button icon-button--danger" aria-label={`${item.name} kaydını sil`} onClick={() => setTarget(item)}>
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {target && (
        <ConfirmDialog
          title="Bu kayıt silinsin mi?"
          body={`${target.name} (${target.email}) bu etkinliğin kayıtlarından çıkarılacak. Kontenjanda yeri boşalır.`}
          confirmLabel={deleting ? "Siliniyor…" : "Evet, sil"}
          busy={deleting}
          onCancel={() => setTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}
