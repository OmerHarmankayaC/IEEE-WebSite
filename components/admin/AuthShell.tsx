import Image from "next/image";
import Link from "next/link";

/** Centered card on the grid background, used by the login and password pages. */
export function AuthShell({ title, lead, children, footnote }: { title: string; lead: string; children: React.ReactNode; footnote?: string }) {
  return (
    <div className="auth-page">
      <main className="auth-card">
        <div className="auth-card__bar">
          <span>YÖNETİM PANELİ</span>
          <span className="mono--muted">IEEE TEDU</span>
        </div>
        <div className="auth-card__body">
          <Image src="/images/brand/ieee-tedu-logo.png" alt="IEEE TED University Student Branch" width={1278} height={150} className="auth-card__logo" priority />
          <div className="stack" style={{ gap: 8 }}>
            <h1 className="auth-card__title">{title}</h1>
            <p className="auth-card__lead">{lead}</p>
          </div>
          {children}
        </div>
        {footnote && <div className="auth-card__foot mono mono--muted">{footnote}</div>}
      </main>
      <Link href="/" className="mono" style={{ color: "var(--ink)", textDecoration: "none", padding: "12px 0" }}>
        ← SİTEYE DÖN
      </Link>
    </div>
  );
}
