"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/browser";

export function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(notice ?? null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    const { error: signInError } = await createBrowserSupabase().auth.signInWithPassword({
      email: String(data.get("email")).trim(),
      password: String(data.get("password")),
    });
    if (signInError) {
      setBusy(false);
      setError("E-posta ya da şifre hatalı.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <form className="stack" style={{ gap: 24 }} onSubmit={submit}>
      <div className="stack" style={{ gap: 16 }}>
        <label className="field">
          <span className="field__label">E-posta</span>
          <input className="input input--large" name="email" type="email" autoComplete="username" required placeholder="ornek@tedu.edu.tr" />
        </label>
        <label className="field">
          <span className="field__label">Şifre</span>
          <input className="input input--large" name="password" type="password" autoComplete="current-password" required />
        </label>
      </div>
      {error && (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn--sun" disabled={busy}>
        {busy ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
      <Link href="/admin/sifremi-unuttum" className="auth-link">
        Şifremi unuttum
      </Link>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email")).trim();
    setBusy(true);
    setError(null);
    const { error: resetError } = await createBrowserSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/auth/callback?next=/admin/yeni-sifre`,
    });
    setBusy(false);
    if (resetError) setError("Bağlantı gönderilemedi. Birkaç dakika sonra yeniden dene.");
    else setSent(true);
  };

  if (sent) {
    return (
      <p className="notice notice--success" role="status">
        Bu adresle bir yönetici hesabı varsa şifre yenileme bağlantısı e-postana gönderildi. Gelen kutunu ve gereksiz klasörünü kontrol et.
      </p>
    );
  }

  return (
    <form className="stack" style={{ gap: 24 }} onSubmit={submit}>
      <label className="field">
        <span className="field__label">E-posta</span>
        <input className="input input--large" name="email" type="email" autoComplete="username" required placeholder="ornek@tedu.edu.tr" />
      </label>
      {error && (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn--sun" disabled={busy}>
        {busy ? "Gönderiliyor…" : "Bağlantıyı gönder"}
      </button>
      <Link href="/admin/giris" className="auth-link">
        Girişe dön
      </Link>
    </form>
  );
}

export function NewPasswordForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    if (password.length < 8) return setError("Şifre en az 8 karakter olmalı.");
    if (password !== String(data.get("repeat"))) return setError("Şifreler aynı değil.");
    setBusy(true);
    setError(null);
    const { error: updateError } = await createBrowserSupabase().auth.updateUser({ password });
    if (updateError) {
      setBusy(false);
      setError("Şifre değiştirilemedi. Bağlantının süresi dolmuş olabilir, yeni bir bağlantı iste.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <form className="stack" style={{ gap: 24 }} onSubmit={submit}>
      <div className="stack" style={{ gap: 16 }}>
        <label className="field">
          <span className="field__label">Yeni şifre</span>
          <input className="input input--large" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </label>
        <label className="field">
          <span className="field__label">Yeni şifre (tekrar)</span>
          <input className="input input--large" name="repeat" type="password" autoComplete="new-password" minLength={8} required />
        </label>
      </div>
      {error && (
        <p className="notice notice--error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn--sun" disabled={busy}>
        {busy ? "Kaydediliyor…" : "Şifreyi kaydet"}
      </button>
    </form>
  );
}
