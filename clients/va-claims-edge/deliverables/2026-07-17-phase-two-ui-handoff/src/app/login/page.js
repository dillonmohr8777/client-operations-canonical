"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("We could not sign you in with those details. Check your email and password, then try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="login-page">
      <a className="skip-link" href="#login-form">Skip to sign in</a>
      <div className="login-shell">
        <section className="login-story" aria-labelledby="login-title">
          <img className="login-ribbon" src="/shield-motion-ribbons.png" width="1672" height="941" alt="" aria-hidden="true" />
          <div className="login-brand">
            <span className="brand-logo-plaque">
              <img src="/va-claims-edge-logo.png" width="1280" height="952" alt="VA Claims Edge, Get an Edge!" />
              <small>Secure client portal</small>
            </span>
          </div>
          <div className="login-story-copy">
            <p className="eyebrow">Your claim. One clear path.</p>
            <h1 id="login-title">Welcome back to your claim journey.</h1>
            <p>Follow progress, respond to requests, and stay connected with your advisor in one protected workspace.</p>
          </div>
          <ul className="trust-points" aria-label="Portal benefits">
            <li><span aria-hidden="true">01</span><div><strong>See your next step</strong><p>Know the current stage and what moves your claim forward.</p></div></li>
            <li><span aria-hidden="true">02</span><div><strong>Keep files together</strong><p>Review requests and shared documents in one protected place.</p></div></li>
            <li><span aria-hidden="true">03</span><div><strong>Reach your advisor</strong><p>Keep important updates connected to your claim.</p></div></li>
          </ul>
        </section>

        <section className="login-panel" aria-labelledby="sign-in-heading">
          <div className="login-form-wrap">
            <p className="eyebrow">Secure portal access</p>
            <h2 id="sign-in-heading">Sign in to continue</h2>
            <p className="form-intro">Use the email address connected to your VA Claims Edge account.</p>

            <form id="login-form" onSubmit={handleSubmit} noValidate>
              <label className="field">
                <span>Email address</span>
                <input type="email" autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} required aria-describedby={error ? "login-error" : undefined} />
              </label>
              <label className="field">
                <span>Password</span>
                <span className="password-field">
                  <input type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required aria-describedby={error ? "login-error" : undefined} />
                  <button type="button" className="reveal-button" aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Hide" : "Show"}</button>
                </span>
              </label>

              {error ? <div className="form-alert" id="login-error" role="alert"><strong>Sign in unsuccessful</strong><span>{error}</span></div> : null}

              <button className="primary-button" type="submit" disabled={pending || !email || !password}>
                <span>{pending ? "Signing in" : "Sign in securely"}</span><span aria-hidden="true">Continue</span>
              </button>
            </form>

            <p className="support-copy">Need help with access? Contact your VA Claims Edge advisor.</p>
            <div className="security-note"><span aria-hidden="true" /> Protected account access</div>
          </div>
        </section>
      </div>
    </main>
  );
}
