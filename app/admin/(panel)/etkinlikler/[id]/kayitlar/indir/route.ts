import { getSession } from "@/lib/auth";

// The registrations of one event as a CSV file. Semicolons and a byte order mark make
// Excel with Turkish settings open it correctly, Turkish letters included.

const cell = (value: string | null) => {
  let text = value ?? "";
  // A cell that starts like a formula would run as one in Excel.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

const formatter = new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Istanbul" });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, isAdmin } = await getSession();
  if (!user || !isAdmin) return new Response("Yetki yok", { status: 403 });
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Bulunamadı", { status: 404 });

  const [{ data: event }, { data: rows }] = await Promise.all([
    supabase.from("posts").select("slug").eq("id", id).eq("kind", "event").maybeSingle(),
    supabase
      .from("event_registrations")
      .select("name, email, department, created_at")
      .eq("post_id", id)
      .order("created_at", { ascending: true })
      .returns<{ name: string; email: string; department: string | null; created_at: string }[]>(),
  ]);
  if (!event) return new Response("Bulunamadı", { status: 404 });

  const lines = [
    ["Sıra", "Ad soyad", "E-posta", "Bölüm", "Kayıt zamanı"].map(cell).join(";"),
    ...(rows ?? []).map((row, index) =>
      [String(index + 1), row.name, row.email, row.department, formatter.format(new Date(row.created_at))].map(cell).join(";"),
    ),
  ];

  return new Response("﻿" + lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kayitlar-${event.slug}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
