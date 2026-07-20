"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

const navigation = [
  { href: "/dashboard", label: "Dashboard", short: "DB" },
  { href: "/clients", label: "Clients", short: "CL" },
  { href: "/pipeline", label: "Pipeline", short: "PL" },
  { href: "/notes", label: "Notes", short: "NT" },
  { href: "/settings", label: "Settings", short: "ST" },
];

export default function AppShell({ children, userLabel = "Team member", onSignOut }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const navigationId = useId();

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setSignOutError("");

    try {
      if (onSignOut) {
        await onSignOut();
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/login");
      router.refresh();
    } catch {
      setSignOutError("We could not sign you out. Try again before closing this device.");
    } finally {
      setSigningOut(false);
    }
  }

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <button
        className="sidebar-scrim"
        type="button"
        aria-label="Close navigation"
        tabIndex={open ? 0 : -1}
        data-open={open}
        onClick={() => setOpen(false)}
      />

      <aside className="sidebar" id={navigationId} data-open={open} aria-label="Primary navigation">
        <div className="sidebar-brand">
          <span className="brand-logo-plaque">
            <img src="/va-claims-edge-logo.png" width="1280" height="952" alt="VA Claims Edge, Get an Edge!" />
            <small>Operations portal</small>
          </span>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-label">Workspace</span>
          {navigation.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
                <span className="nav-glyph" aria-hidden="true">{item.short}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <span className="user-avatar" aria-hidden="true">{initials(userLabel)}</span>
          <span className="user-summary"><strong>{userLabel}</strong><small>Authorized workspace</small></span>
          <button type="button" className="text-button" onClick={handleSignOut} disabled={signingOut} aria-describedby={signOutError ? "sign-out-error" : undefined}>{signingOut ? "Signing out" : "Sign out"}</button>
          {signOutError ? <p className="sidebar-alert" id="sign-out-error" role="alert">{signOutError}</p> : null}
        </div>
      </aside>

      <div className="app-column">
        <img className="shell-ribbon" src="/shield-motion-ribbons.png" width="1672" height="941" alt="" aria-hidden="true" />
        <header className="topbar">
          <button
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-controls={navigationId}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true">Menu</span>
            <span className="sr-only">Toggle navigation</span>
          </button>
          <div className="topbar-context"><span>VA Claims Edge</span><strong>Claim operations</strong></div>
          <div className="environment-pill"><span aria-hidden="true" /> Secure workspace</div>
        </header>
        <main id="main-content" className="app-main">{children}</main>
      </div>
    </div>
  );
}

function initials(label) {
  return label.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "TM";
}
