import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/AuthShell";
import { ForgotPasswordForm } from "@/components/admin/AuthForms";

export const metadata: Metadata = { title: "Şifremi unuttum" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Şifremi unuttum" lead="Yönetici e-postanı yaz, şifreni yenilemen için bir bağlantı gönderelim.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
