"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, FileText, FlaskConical, Home, Menu, Quote, ScanSearch, Settings, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/components/ui";

const nav: Array<{ href: string; label: string; icon: LucideIcon; hint?: string; tone?: "spark" | "mirror" | "proof" }> = [
  { href: "/workspace", label: "Dashboard", icon: Home },
  { href: "/workspace/spark", label: "SparkLab", hint: "机会探索", icon: Sparkles, tone: "spark" },
  { href: "/workspace/mirror", label: "MirrorLab", hint: "体验预检", icon: ScanSearch, tone: "mirror" },
  { href: "/workspace/proof", label: "ProofLab", hint: "证据与迭代", icon: Quote, tone: "proof" },
  { href: "/workspace/reports", label: "Reports", icon: FileText },
  { href: "/workspace/settings", label: "Settings", icon: Settings },
];

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className="min-h-screen bg-(--background) text-(--foreground)"><div className="mx-auto flex min-h-screen max-w-[1680px]">
    <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 flex-col border-r border-(--line) bg-[#eef2f8] px-4 py-5 lg:flex">
      <Link href="/" className="flex items-center gap-3 px-2"><span className="grid h-10 w-10 place-items-center rounded-xl bg-(--primary) text-white"><FlaskConical className="h-5 w-5" /></span><span><strong className="block text-lg tracking-[-.03em]">PersonaLab</strong><span className="text-[9px] font-bold uppercase tracking-[.2em] text-[#7c879a]">Research OS</span></span></Link>
      <div className="mt-7 rounded-2xl border border-(--line) bg-white p-3"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#7c879a]">当前工作区</span><BarChart3 className="h-4 w-4 text-[#8792a6]" /></div><p className="mt-2 truncate text-sm font-bold">本地 Demo Workspace</p><p className="mt-1 text-[11px] text-[#7a8497]">自动保存到当前浏览器</p></div>
      <nav className="mt-6 space-y-1" aria-label="主导航">{nav.map(item=>{ const active = item.href === "/workspace" ? pathname === item.href : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm transition", active ? "bg-white font-bold text-(--navy)" : "text-[#5e697d] hover:bg-white/70")}><span className={cn("grid h-8 w-8 place-items-center rounded-lg", active ? item.tone === "spark" ? "bg-(--spark-soft) text-(--spark)" : item.tone === "mirror" ? "bg-(--mirror-soft) text-(--mirror)" : item.tone === "proof" ? "bg-(--proof-soft) text-(--proof)" : "bg-(--primary-soft) text-(--primary)" : "bg-white text-[#7f899c]")}><item.icon className="h-4 w-4" /></span><span><span className="block">{item.label}</span>{"hint" in item && <span className="block text-[10px] font-normal text-[#8b95a7]">{item.hint}</span>}</span></Link>})}</nav>
      <div className="mt-auto rounded-2xl bg-(--navy) p-4 text-white"><div className="flex items-center gap-2 text-xs font-bold"><FlaskConical className="h-4 w-4 text-[#a7b7ff]" />Demo 模式</div><p className="mt-2 text-[11px] leading-5 text-[#bec8da]">不会调用真实 AI、联网检索或上传私人数据。</p></div>
    </aside>
    <div className="min-w-0 flex-1"><header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-(--line) bg-[#f8f9fc]/95 px-4 backdrop-blur md:px-7"><Link href="/" className="flex items-center gap-2 lg:hidden"><span className="grid h-9 w-9 place-items-center rounded-xl bg-(--primary) text-white"><Menu className="h-4 w-4" /></span><strong>PersonaLab</strong></Link><div className="hidden items-center gap-2 text-xs text-[#7a8497] lg:flex"><span>Workspace</span><span>/</span><span className="font-semibold text-(--foreground)">{nav.find(item => item.href === "/workspace" ? pathname === item.href : pathname.startsWith(item.href))?.label ?? "Dashboard"}</span></div><span className="rounded-full border border-[#d6ddec] bg-white px-3 py-1.5 text-xs font-semibold text-[#59657a]"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-(--mirror)" />本地 Demo</span></header>
      <nav className="sticky top-16 z-30 grid grid-cols-6 gap-1 border-b border-(--line) bg-[#f8f9fc] p-2 lg:hidden" aria-label="移动端主导航">{nav.map(item=>{ const active = item.href === "/workspace" ? pathname === item.href : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={cn("grid min-h-11 place-items-center rounded-lg text-[10px] font-semibold", active ? "bg-(--primary) text-white" : "text-[#687388]")}><item.icon className="h-4 w-4"/><span>{item.label.replace("Lab","")}</span></Link>})}</nav>
      <main className="mx-auto max-w-[1380px] px-4 py-7 md:px-7 md:py-9">{children}</main>
    </div>
  </div></div>;
}
