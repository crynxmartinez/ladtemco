"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, Building2, CalendarDays, ChartNoAxesCombined, CheckSquare, ClipboardCheck, Coins, FileText, HandCoins, Home, Menu, Moon, ReceiptText, Settings, ShieldCheck, Sun, Users, WalletCards } from "lucide-react";

const memberNav = [
  ["dashboard", "Dashboard", Home], ["contributions", "My Contributions", Coins], ["share-capital", "Share Capital", WalletCards],
  ["fund-transparency", "Fund Transparency", ChartNoAxesCombined], ["projects", "Projects & Liquidations", Building2],
  ["documents", "Documents", FileText], ["meetings", "Meetings", CalendarDays], ["profile", "Profile & Security", ShieldCheck],
] as const;
const adminNav = [
  ["overview", "Overview", Home], ["members", "Members", Users], ["contributions", "Contributions", Coins], ["share-capital", "Share Capital", WalletCards],
  ["funds", "Funds & Budgets", Building2], ["expenses", "Expenses & Advances", HandCoins], ["liquidations", "Liquidations", ReceiptText],
  ["approvals", "Approvals", CheckSquare], ["reports", "Reports", ChartNoAxesCombined], ["meetings-documents", "Meetings & Documents", FileText],
  ["audit-trail", "Audit Trail", ClipboardCheck], ["users-roles", "Users & Roles", Users], ["settings", "Settings", Settings],
] as const;

export function PortalShell({ portal, active, name, role, children }: { portal: "member" | "admin"; active: string; name: string; role: string; children: React.ReactNode }) {
  const [dark, setDark] = useState(false); const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const saved = localStorage.getItem("ladtemco-theme") === "dark";
      setDark(saved);
      document.documentElement.dataset.theme = saved ? "dark" : "light";
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  const toggleTheme = () => { const next = !dark; setDark(next); document.documentElement.dataset.theme = next ? "dark" : "light"; localStorage.setItem("ladtemco-theme", next ? "dark" : "light"); };
  const nav = portal === "member" ? memberNav : adminNav;
  const mobile = portal === "member" ? memberNav.slice(0, 4) : adminNav.filter(([id]) => ["overview", "members", "approvals", "reports"].includes(id));
  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
      <Link className="sidebar-brand" href={portal === "member" ? "/member/dashboard" : "/admin/overview"}><Image src="/logo.jpg" alt="Ladtemco" width={72} height={72}/><span><b>LADTEMCO</b><small>{portal === "member" ? "Member Portal" : "Administration"}</small></span></Link>
      <div className="identity"><span>{name.split(" ").map(x => x[0]).slice(0,2).join("")}</span><div><b>{name}</b><small>{role} · Individual account</small></div></div>
      <nav>{nav.map(([id, label, Icon]) => <Link key={id} href={`/${portal}/${id}`} className={active === id ? "active" : ""} onClick={() => setMobileMenu(false)}><Icon size={19}/><span>{label}</span></Link>)}</nav>
      <Link className="sign-out" href="/login">Sign out</Link>
    </aside>
    <div className="workspace">
      <header className="topbar"><button className="icon-button mobile-menu" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu"><Menu/></button><div><p className="eyebrow">{portal === "member" ? "MEMBER PORTAL" : "ADMINISTRATION"}</p><b>{portal === "member" ? "Member workspace" : "Cooperative operations"}</b></div><div className="top-actions"><button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">{dark ? <Sun/> : <Moon/>}</button><button className="icon-button" aria-label="Notifications"><Bell/></button><span className="role-chip">{role}</span></div></header>
      <main className="content">{children}</main>
    </div>
    <nav className="bottom-nav">{mobile.map(([id, label, Icon]) => <Link key={id} href={`/${portal}/${id}`} className={active === id ? "active" : ""}><Icon/><span>{label.replace("My ", "")}</span></Link>)}<button onClick={() => setMobileMenu(true)}><Menu/><span>More</span></button></nav>
    {mobileMenu && <button className="scrim" aria-label="Close menu" onClick={() => setMobileMenu(false)}/>} 
  </div>;
}
