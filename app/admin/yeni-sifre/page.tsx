import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/AuthShell";
import { NewPasswordForm } from "@/components/admin/AuthForms";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Yeni şifre" };

export default async function NewPasswordPage() {
  await requireAdmin();
  return (
    <AuthShell title="Yeni şifre" lead="Yönetici hesabın için yeni bir şifre belirle. En az 8 karakter olmalı.">
      <NewPasswordForm />
    </AuthShell>
  );
}
