import type { Metadata } from "next";
import Link from "next/link";
import { PlusIcon } from "@/components/icons";
import { requireAdmin } from "@/lib/auth";
import { eventPhase, toEventInfo, type EventInfo, type EventRow } from "@/lib/events";

export const metadata: Metadata = { title: "Etkinlikler" };

type Row = EventRow & {
  id: string;
  slug: string;
  status: "draft" | "published";
  featured: boolean;
  title_tr: string;
};

const formatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Istanbul",
});

/** Upcoming events first (soonest on top), then past ones (latest on top). */
function arrange(rows: Row[]) {
  const now = Date.now();
  const events = rows
    .map((row) => ({ row, info: toEventInfo(row) }))
    .filter((item): item is { row: Row; info: EventInfo } => item.info !== null)
    .map((item) => ({ ...item, phase: eventPhase(item.info, now) }));
  const upcoming = events.filter((item) => item.phase !== "past").sort((a, b) => Date.parse(a.info.startsAt) - Date.parse(b.info.startsAt));
  const past = events.filter((item) => item.phase === "past").sort((a, b) => Date.parse(b.info.startsAt) - Date.parse(a.info.startsAt));
  return [...upcoming, ...past];
}

export default async function AdminEventsPage() {
  const { supabase } = await requireAdmin();
  const [{ data }, { data: regs }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, slug, status, featured, title_tr, event_starts_at, event_ends_at, event_location, event_location_url, event_committee, event_registration, event_registration_url, event_registration_closes_at, event_capacity, event_guide")
      .eq("kind", "event")
      .returns<Row[]>(),
    supabase.from("event_registrations").select("post_id").returns<{ post_id: string }[]>(),
  ]);

  const counts = new Map<string, number>();
  for (const reg of regs ?? []) counts.set(reg.post_id, (counts.get(reg.post_id) ?? 0) + 1);

  const ordered = arrange(data ?? []);

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="stack" style={{ gap: 10 }}>
          <h1 className="admin-title">Etkinlikler</h1>
        </div>
        <Link href="/admin/etkinlikler/yeni" className="btn btn--sun btn--small">
          <PlusIcon />
          Yeni etkinlik
        </Link>
      </div>

      <div className="table-box">
        <div className="posts-table events-table">
          <div className="posts-table__row posts-table__head" aria-hidden="true">
            <span>Etkinlik</span>
            <span>Tarih</span>
            <span>Durum</span>
            <span>Kayıt</span>
            <span style={{ textAlign: "right" }}>İşlemler</span>
          </div>
          {ordered.length === 0 ? (
            <p className="posts-table__empty">Henüz etkinlik yok. İlkini eklemek için Yeni etkinlik düğmesine bas.</p>
          ) : (
            <ul className="posts-table__list">
              {ordered.map(({ row, info, phase }) => {
                const registered = counts.get(row.id) ?? 0;
                return (
                  <li key={row.id} className={phase === "past" ? "posts-table__row posts-table__row--past" : "posts-table__row"}>
                    <span className="stack" style={{ gap: 4, minWidth: 0 }}>
                      <Link href={`/admin/etkinlikler/${row.id}`} className="posts-table__name">
                        {row.title_tr}
                        {row.featured && <span className="badge badge--featured">Öne çıkan</span>}
                      </Link>
                      <span className="mono mono--muted posts-table__slug">/etkinlikler/{row.slug}</span>
                    </span>
                    <span className="posts-table__cell mono">{formatter.format(new Date(info.startsAt))}</span>
                    <span className="posts-table__cell stack" style={{ gap: 6, alignItems: "flex-start" }}>
                      <span className={row.status === "published" ? "badge badge--published" : "badge badge--draft"}>
                        {row.status === "published" ? "Yayında" : "Taslak"}
                      </span>
                      <span className="mono mono--muted">{phase === "past" ? "Bitti" : phase === "ongoing" ? "Sürüyor" : "Yaklaşıyor"}</span>
                    </span>
                    <span className="posts-table__cell mono">
                      {info.registration === "site"
                        ? info.capacity !== null
                          ? `${registered} / ${info.capacity}`
                          : `${registered} kişi`
                        : info.registration === "external"
                          ? "Dış bağlantı"
                          : "Kayıt yok"}
                    </span>
                    <span className="posts-table__actions">
                      {info.registration === "site" && (
                        <Link href={`/admin/etkinlikler/${row.id}/kayitlar`} className="btn btn--outline btn--small">
                          Kayıtlar
                        </Link>
                      )}
                      <Link href={`/admin/etkinlikler/${row.id}`} className="btn btn--outline btn--small">
                        Düzenle
                      </Link>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="posts-table__foot mono mono--muted">
            <span>{ordered.length} etkinlik</span>
            <span>Yaklaşanlar üstte, bitenler altta.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
