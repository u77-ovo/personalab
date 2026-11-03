import { FlaskConical, ShieldCheck } from "lucide-react";
import { connection } from "next/server";
import { AuthPanel } from "@/features/auth/auth-panel";
import { inspectRuntimeConfig } from "@/server/config";

export const instant = false;

export default async function LoginPage() {
  await connection();
  const runtime = inspectRuntimeConfig();
  return <main className="min-h-screen bg-[#f6f8fc] px-5 py-10 sm:py-16">
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_440px] lg:items-center">
      <section>
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-(--primary) text-white"><FlaskConical className="h-5 w-5" /></span><div><strong className="block text-xl tracking-[-.03em]">PersonaLab</strong><span className="text-[10px] font-bold uppercase tracking-[.2em] text-[#7c879b]">Research OS</span></div></div>
        <div className="mt-12 inline-flex items-center gap-2 rounded-full border border-[#d8def2] bg-white px-3 py-2 text-xs font-semibold text-(--primary)"><ShieldCheck className="h-4 w-4" />研究资料按账号隔离</div>
        <h1 className="mt-6 text-4xl font-bold leading-tight tracking-[-.045em] text-(--navy) sm:text-5xl">从待验证假设，<br />走向可回溯证据。</h1>
        <p className="mt-5 max-w-xl text-base leading-8 text-[#657086]">Real 模式将使用 Supabase 登录与行级权限保护研究项目；Demo 模式仍可在本机独立体验完整工作流。</p>
        <ul className="mt-7 space-y-3 text-sm text-[#536078]"><li>• AI 推测与真人证据明确分区</li><li>• 引用保留原文、位置和参与者编号</li><li>• 项目数据仅对所属账号开放</li></ul>
      </section>
      <AuthPanel enabled={runtime.mode === "real" && runtime.authConfigured} />
    </div>
  </main>;
}
