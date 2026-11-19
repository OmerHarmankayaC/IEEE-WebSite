"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/admin/AuthShell";
import { createBrowserSupabase } from "@/lib/supabase/browser";

/**
 * Landing page of the admin invitation e-mail. Supabase sends the new session in the
 * address fragment (#access_token=...), which only the browser can read.
 */
export default function InvitePage() {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) {
      queueMicrotask(() => setFailed(true));
      return;
    }
    createBrowserSupabase()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        if (error) setFailed(true);
        else router.replace("/admin/yeni-sifre");
      });
  }, [router]);

  return failed ? (
    <AuthShell title="Bağlantı geçersiz" lead="Davet bağlantısının süresi dolmuş ya da daha önce kullanılmış olabilir. Seni davet eden yöneticiden yeni bir davet iste.">
      <Link href="/admin/giris" className="btn btn--outline">
        Giriş sayfasına git
      </Link>
    </AuthShell>
  ) : (
    <AuthShell title="Davet açılıyor" lead="Hesabın hazırlanıyor, birazdan şifreni belirleyeceğin sayfaya geçeceksin.">
      <span />
    </AuthShell>
  );
}
