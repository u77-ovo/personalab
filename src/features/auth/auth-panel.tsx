"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function AuthPanel({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const supabase = createBrowserSupabaseClient();
    if (!enabled || !supabase) {
      setMessage({ tone: "error", text: "真实登录尚未配置，请先继续使用本地 Demo。" });
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const next = searchParams.get("next");
        router.replace(next?.startsWith("/") ? next : "/workspace");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) throw error;
        setMessage({
          tone: "success",
          text: data.session ? "账号已创建，正在进入工作台。" : "注册邮件已发送，请打开邮箱完成确认。",
        });
        if (data.session) {
          router.replace("/workspace");
          router.refresh();
        }
      }
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "登录失败，请稍后再试。" });
    } finally {
      setBusy(false);
    }
  }

  if (!enabled) {
    return <div className="rounded-[28px] border border-(--line) bg-white p-6 shadow-[0_24px_70px_rgba(26,40,72,.10)] sm:p-8">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-(--primary-soft) text-(--primary)"><KeyRound className="h-5 w-5" /></div>
      <h2 className="mt-5 text-2xl font-bold tracking-[-.03em]">真实登录尚未启用</h2>
      <p className="mt-3 text-sm leading-6 text-[#667085]">当前仍是安全的本地 Demo：数据只保存在这个浏览器，不会上传访谈资料，也不会调用真实 AI。</p>
      <div className="mt-5 rounded-2xl border border-[#d9e0f4] bg-[#f4f6ff] p-4 text-sm leading-6 text-[#4f5f91]">
        创建 Supabase 项目后，把项目 URL 与 publishable key 放入本机 <code className="rounded bg-white px-1.5 py-0.5 text-xs">.env.local</code>，再切换到 Real 模式。
      </div>
      <Link href="/workspace" className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--navy) px-4 text-sm font-semibold text-white">继续使用本地 Demo</Link>
      <Link href="/" className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-(--line) text-sm font-semibold"><ArrowLeft className="h-4 w-4" />返回首页</Link>
    </div>;
  }

  return <div className="rounded-[28px] border border-(--line) bg-white p-6 shadow-[0_24px_70px_rgba(26,40,72,.10)] sm:p-8">
    <div className="flex rounded-xl bg-[#eef2f8] p-1" role="tablist" aria-label="登录方式">
      {(["signin", "signup"] as const).map((item) => <button key={item} type="button" role="tab" aria-selected={mode === item} onClick={() => { setMode(item); setMessage(null); }} className={`min-h-10 flex-1 rounded-lg text-sm font-semibold transition ${mode === item ? "bg-white text-(--navy) shadow-sm" : "text-[#667085]"}`}>{item === "signin" ? "登录" : "创建账号"}</button>)}
    </div>
    <h2 className="mt-6 text-2xl font-bold tracking-[-.03em]">{mode === "signin" ? "欢迎回来" : "创建研究工作区"}</h2>
    <p className="mt-2 text-sm text-[#667085]">{mode === "signin" ? "登录后访问你的研究项目与证据链。" : "注册后，项目将由数据库权限规则隔离。"}</p>
    <form className="mt-6 space-y-4" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-semibold"><span className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#7c879b]" />邮箱</span><input className="field" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" required /></label>
      <label className="grid gap-2 text-sm font-semibold"><span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#7c879b]" />密码</span><input className="field" type="password" minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="至少 8 位" required /></label>
      {message && <div role="status" className={`rounded-xl p-3 text-sm leading-6 ${message.tone === "success" ? "bg-(--mirror-soft) text-(--mirror)" : "bg-(--risk-soft) text-(--risk)"}`}>{message.tone === "success" && <CheckCircle2 className="mr-2 inline h-4 w-4" />}{message.text}</div>}
      <Button className="w-full" tone="dark" busy={busy} type="submit">{mode === "signin" ? "登录并进入工作台" : "创建账号"}</Button>
    </form>
    <Link href="/" className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 text-sm font-semibold text-[#667085]"><ArrowLeft className="h-4 w-4" />返回首页</Link>
  </div>;
}
