import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/AuthShell";
import { LoginForm } from "@/components/admin/AuthForms";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Giriş" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  const session = await getSession();
  if (session.user && session.isAdmin) redirect("/admin");
  const { hata } = await searchParams;

  return (
    <AuthShell
      title="Giriş yap"
      lead="Blog yazılarını eklemek ve düzenlemek için yönetici hesabınla giriş yap."
      footnote="Yalnızca yönetici hesapları giriş yapabilir. Yeni hesap açılmaz."
    >
      <LoginForm notice={hata === "baglanti" ? "Bağlantının süresi dolmuş ya da geçersiz. Yeniden dene." : undefined} />
    </AuthShell>
  );
}
