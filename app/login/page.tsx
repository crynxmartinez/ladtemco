"use client";

import Image from "next/image";
import { Eye, LockKeyhole, Moon, ShieldCheck, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [dark, setDark] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  const signIn = (portal: "member" | "admin") => router.push(portal === "member" ? "/member/dashboard" : "/admin/overview");
  return <main className="login-page">
    <button className="theme-fab" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">{dark ? <Sun /> : <Moon />}</button>
    <section className="login-shell">
      <aside className="brand-panel">
        <Image src="/logo.jpg" alt="Ladtemco logo" width={170} height={170} priority />
        <h1>LADTEMCO</h1><p>Languyan District Teachers Multi Purpose Cooperative</p>
        <strong>Transparency.<br/>Accountability.<br/>Member trust.</strong>
      </aside>
      <form className="login-card" onSubmit={(e) => { e.preventDefault(); signIn(id.toLowerCase().includes("admin") ? "admin" : "member"); }}>
        <p className="eyebrow">COOPERATIVE MANAGEMENT SYSTEM</p><h2>Welcome to Ladtemco</h2>
        <p className="muted">Members and officers sign in using their individual account.</p>
        <label>Member or Officer ID<input value={id} onChange={e => setId(e.target.value)} placeholder="Try member or admin" required /></label>
        <label>Password<span className="password-field"><input type="password" value={password} onChange={e => setPassword(e.target.value)} required /><Eye size={18}/></span></label>
        <div className="login-row"><label className="check"><input type="checkbox"/> Remember this device</label><button type="button" className="link-button">Forgot password?</button></div>
        <button className="primary-button" type="submit">Sign in</button>
        <div className="demo-actions"><button type="button" onClick={() => signIn("member")}>Open member demo</button><button type="button" onClick={() => signIn("admin")}>Open admin demo</button></div>
        <p className="security-note"><ShieldCheck size={18}/> Your account and financial information are protected.</p>
        <p className="muted small"><LockKeyhole size={14}/> Local demonstration only. Authentication will be hardened before public release.</p>
      </form>
    </section>
  </main>;
}
