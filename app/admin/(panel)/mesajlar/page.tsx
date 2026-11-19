import type { Metadata } from "next";
import { MessagesList, type MessageRow } from "@/components/admin/MessagesList";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Mesajlar" };

export default async function MessagesPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("messages")
    .select("id, name, email, body, status, created_at")
    .order("created_at", { ascending: false })
    .limit(500)
    .returns<MessageRow[]>();
  const messages = data ?? [];
  const unread = messages.filter((message) => message.status === "new").length;

  return (
    <div className="admin-page">
      <div className="admin-head">
        <div className="stack" style={{ gap: 6 }}>
          <h1 className="admin-title">Mesajlar</h1>
          <span className="mono mono--muted">
            {messages.length} mesaj, {unread} tanesi okunmamış. İletişim formundan gelenler burada toplanır.
          </span>
        </div>
      </div>
      <MessagesList messages={messages} />
    </div>
  );
}
