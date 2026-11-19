import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RegistrationsList } from "@/components/admin/RegistrationsList";
import { requireAdmin } from "@/lib/auth";
import { formatEventDay, formatTime } from "@/lib/events";

export const metadata: Metadata = { title: "Kayıtlar" };

export default async function RegistrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase } = await requireAdmin();

  const [{ data: event }, { data: rows }] = await Promise.all([
    supabase.from("posts").select("id, slug, title_tr, event_starts_at, event_capacity").eq("id", id).eq("kind", "event").maybeSingle(),
    supabase
      .from("event_registrations")
      .select("id, name, email, department, created_at")
      .eq("post_id", id)
      .order("created_at", { ascending: true })
      .returns<{ id: string; name: string; email: string; department: string | null; created_at: string }[]>(),
  ]);
  if (!event) notFound();

  const registrations = rows ?? [];
  const when = event.event_starts_at ? `${formatEventDay(event.event_starts_at, "tr")}, ${formatTime(event.event_starts_at, "tr")}` : null;

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="stack" style={{ gap: 8 }}>
          <span className="mono mono--muted">
            <Link href="/admin/etkinlikler" style={{ textDecoration: "none" }}>
              Etkinlikler
            </Link>{" "}
            / Kayıtlar
          </span>
          <h1 className="admin-title">{event.title_tr}</h1>
          <span className="mono mono--muted">
            {when}
            {when && " "}
            ({event.event_capacity ? `${registrations.length} / ${event.event_capacity} kişi` : `${registrations.length} kişi`})
          </span>
        </div>
        <div className="chip-row">
          <Link href={`/admin/etkinlikler/${event.id}`} className="btn btn--outline btn--small">
            Etkinliği düzenle
          </Link>
          {registrations.length > 0 && (
            <a href={`/admin/etkinlikler/${event.id}/kayitlar/indir`} className="btn btn--sun btn--small" download>
              Excel için indir
            </a>
          )}
        </div>
      </div>
      <RegistrationsList registrations={registrations} />
    </div>
  );
}
