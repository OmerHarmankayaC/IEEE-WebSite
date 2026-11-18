import Image from "next/image";
import Link from "next/link";

/** Split screen used by the login and password pages: a navy poster panel and the form. */
export function AuthShell({ title, lead, children, footnote }: { title: string; lead: string; children: React.ReactNode; footnote?: string }) {
  return (
    <div className="auth-page">
      <div className="auth-art" aria-hidden="true">
        <span className="auth-art__sun" />
        <span className="auth-art__square" />
        <span className="auth-art__title">Yönetim paneli</span>
        <span className="auth-art__lead">Blog yazılarını buradan ekler, düzenler ve yayınlarsın.</span>
      </div>
      <main className="auth-card">
        <div className="auth-card__body">
          <Image src="/images/brand/ieee-tedu-logo.png" alt="IEEE TED University Student Branch" width={1278} height={150} className="auth-card__logo" priority />
          <div className="stack" style={{ gap: 8 }}>
            <h1 className="auth-card__title">{title}</h1>
            <p className="auth-card__lead">{lead}</p>
          </div>
          {children}
          {footnote && <p className="auth-card__foot">{footnote}</p>}
          <Link href="/" className="auth-card__back">
            Siteye dön
          </Link>
        </div>
      </main>
    </div>
  );
}
