import { Link } from "@tanstack/react-router";
import { ReactNode } from "react";
import { BrandLogo } from "./brand-logo";

export function SiteHeader() {
  return (
    <div className="pointer-events-none sticky top-4 z-50 flex justify-center px-4">
      <header className="pointer-events-auto w-full max-w-6xl">
        <div
          className="flex h-16 items-center justify-between rounded-[18px] border border-white/60 bg-white/70 pl-4 pr-3 backdrop-blur-xl shadow-float"
          style={{ backdropFilter: "saturate(1.8) blur(20px)" }}
        >
          <Link to="/" className="flex items-center">
            <BrandLogo size="md" />
          </Link>
          <nav className="hidden items-center gap-8 text-[13px] font-medium text-muted-foreground md:flex">
            <a href="#solution" className="transition-colors hover:text-foreground">Platform</a>
            <a href="#workflow" className="transition-colors hover:text-foreground">Workflow</a>
            <a href="#architecture" className="transition-colors hover:text-foreground">Architecture</a>
            <a href="#problem" className="transition-colors hover:text-foreground">Why CrossLens</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="hidden rounded-xl px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-muted sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-xl bg-gradient-brand px-4 py-2 text-[13px] font-semibold text-white shadow-brand transition-transform hover:-translate-y-[1px]"
            >
              Request demo
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t bg-background">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-8 py-14 text-sm text-muted-foreground md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" />
          <span className="hidden text-muted-foreground md:inline">
            · Your Courtroom Never Forgets.
          </span>
        </div>
        <div className="flex flex-wrap gap-8">
          <a href="#solution" className="hover:text-foreground">Platform</a>
          <a href="#architecture" className="hover:text-foreground">Architecture</a>
          <a href="#" className="hover:text-foreground">Security</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
        <div className="text-xs">© {new Date().getFullYear()} CrossLens Labs</div>
      </div>
    </footer>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  subtitle,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-7xl px-6 py-32 md:px-10 ${className}`}>
      {eyebrow ? (
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </div>
      ) : null}
      {title ? (
        <h2 className="mb-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl">
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <p className="mb-14 max-w-2xl text-base text-muted-foreground md:text-lg">
          {subtitle}
        </p>
      ) : (
        <div className="mb-12" />
      )}
      {children}
    </section>
  );
}
