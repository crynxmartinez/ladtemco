"use client";

import Image from "next/image";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const demos = {
  admin: "/admin-demo/index.html",
  member: "/member-demo/index.html",
};

export default function LoginPage() {
  const [dark, setDark] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const role = id.trim().toLowerCase();
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  return <main className="login-page">
    <button className="theme-fab" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? <Sun /> : <Moon />}</button>
    <section className="login-shell">
      <aside className="brand-panel">
        <Image src="/logo.jpg" alt="Ladtemco logo" width={170} height={170} priority />
        <h1>LADTEMCO</h1><p>Languyan District Teachers Multi Purpose Cooperative</p>
        <strong>Transparency.<br/>Accountability.<br/>Member trust.</strong>
      </aside>
      <form className="login-card" action={role === "admin" ? demos.admin : demos.member} autoComplete="off" onSubmit={(e) => {
        if ((role !== "admin" && role !== "member") || password !== "demo") {
          e.preventDefault();
          setError("Use member or admin as your demo ID and demo as the password.");
        }
      }}>
        <p className="eyebrow">COOPERATIVE MANAGEMENT SYSTEM</p><h2>Welcome to Ladtemco</h2>
        <p className="muted">Use the demo ID <b>member</b> or <b>admin</b> with the password <b>demo</b>, or open either demo directly.</p>
        <label>Demo ID<input value={id} onChange={e => { setId(e.target.value); setError(""); }} placeholder="member or admin" required /></label>
        <label>Demo password<span className="password-field"><input type={showPassword ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }} required /><button aria-label={showPassword ? "Hide demo password" : "Show demo password"} type="button" className="link-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span></label>
        {error && <p role="alert">{error}</p>}
        <button className="primary-button" type="submit">Sign in</button>
        <div className="demo-actions"><a className="secondary-button" href={demos.member}>Open member demo</a><a className="secondary-button" href={demos.admin}>Open admin demo</a></div>
        <p className="muted small">Client preview with sample records. Demo changes are saved in this browser.</p>
      </form>
    </section>
  </main>;
}
