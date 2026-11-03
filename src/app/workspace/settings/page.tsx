"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, KeyRound, RotateCcw, ShieldCheck } from "lucide-react";
import { Button, Card, PageHeader } from "@/components/ui";
import { useWorkspaceStore } from "@/features/shared/use-workspace-store";

type RuntimeStatus = {
  mode: "demo" | "real";
  ready: boolean;
  authConfigured: boolean;
  databaseConfigured: boolean;
  storageConfigured: boolean;
  rlsVerified: boolean;
  dataReady: boolean;
  openaiConfigured: boolean;
  deploymentConfigured: boolean;
  problems: string[];
  warnings: string[];
};

const emptyStatus: RuntimeStatus = {
  mode: "demo",
  ready: true,
  authConfigured: false,
  databaseConfigured: false,
  storageConfigured: false,
  rlsVerified: false,
  dataReady: false,
  openaiConfigured: false,
  deploymentConfigured: false,
  problems: [],
  warnings: [],
};

export default function SettingsPage() {
  const { reset } = useWorkspaceStore();
  const [runtime, setRuntime] = useState<RuntimeStatus>(emptyStatus);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/runtime/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: RuntimeStatus) => { if (active) setRuntime(data); })
      .catch(() => { if (active) setRuntime({ ...emptyStatus, ready: false, problems: ["无法读取运行状态"] }); })
      .finally(() => { if (active) setLoaded(true); });
    return () => { active = false; };
  }, []);

  const integrations = [
    { name: "Supabase Auth", ready: runtime.authConfigured, detail: "账号登录与会话" },
    { name: "Database 连接", ready: runtime.databaseConfigured, detail: "仅代表 URL 与公开 Key 已填写" },
    { name: "RLS 隔离验证", ready: runtime.rlsVerified, detail: "双账号测试通过后才可确认" },
    { name: "Private Storage", ready: runtime.storageConfigured, detail: "私有 bucket 与路径策略已验证" },
    { name: "OpenAI API", ready: runtime.openaiConfigured, detail: "结构化分析" },
    { name: "线上部署", ready: runtime.deploymentConfigured, detail: "Preview / Production" },
  ];

  return <>
    <PageHeader title="设置" description="查看当前运行模式、数据边界与真实服务接入状态。" />
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-(--mirror)" /><h2 className="font-bold">运行模式</h2></div>
        <div className={`mt-5 rounded-xl p-4 ${runtime.mode === "real" ? "bg-(--primary-soft)" : "bg-(--mirror-soft)"}`}>
          <strong className={`text-sm ${runtime.mode === "real" ? "text-(--primary)" : "text-(--mirror)"}`}>{loaded ? runtime.mode === "real" ? "Real · 云端账号与数据库" : "Demo · 本地浏览器持久化" : "正在检查配置…"}</strong>
          <p className="mt-2 text-xs leading-5 text-[#52746e]">{runtime.mode === "real" ? "真实模式会要求登录，数据库仍需成功应用迁移与权限测试后才可存放研究资料。" : "所有生成内容均为可重现 Fixture，不代表已执行联网检索或真实 AI 调用。"}</p>
        </div>
        {runtime.problems.length > 0 && <div className="mt-3 rounded-xl bg-(--risk-soft) p-4 text-xs leading-5 text-(--risk)"><CircleAlert className="mr-2 inline h-4 w-4" />{runtime.problems.join("；")}</div>}
        {runtime.warnings.length > 0 && <div className="mt-3 rounded-xl bg-[#fff6e8] p-4 text-xs leading-5 text-[#8a5b16]"><CircleAlert className="mr-2 inline h-4 w-4" />{runtime.warnings.join("；")}</div>}
      </Card>

      <Card>
        <h2 className="font-bold">本地数据</h2>
        <p className="mt-3 text-sm leading-6 text-[#687388]">清空会删除当前浏览器中的 Idea、Project、Issue、Evidence 和 Action。不会删除开发手册或源码。</p>
        <Button tone="quiet" className="mt-5" onClick={() => { if (window.confirm("确认清空当前浏览器中的 PersonaLab Demo 数据吗？")) reset(); }}><RotateCcw className="h-4 w-4" />重置 Demo 数据</Button>
      </Card>

      <Card className="lg:col-span-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">真实模式接入状态</h2><p className="mt-1 text-xs text-[#7a8498]">这里只显示是否配置，不会返回或展示任何密钥。</p></div><Link href="/login" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-(--line) bg-white px-4 text-sm font-semibold"><KeyRound className="h-4 w-4" />打开登录入口</Link></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{integrations.map((item) => <div key={item.name} className="rounded-xl border border-(--line) p-4"><div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold">{item.name}</p>{item.ready ? <CheckCircle2 className="h-4 w-4 shrink-0 text-(--mirror)" /> : <CircleAlert className="h-4 w-4 shrink-0 text-[#9a671e]" />}</div><p className={`mt-2 text-xs font-bold ${item.ready ? "text-(--mirror)" : "text-[#9a671e]"}`}>{item.ready ? "已确认" : "未确认"}</p><p className="mt-2 text-[11px] leading-5 text-[#7a8498]">{item.detail}</p></div>)}</div>
        <div className="mt-5 rounded-xl border border-[#d9e0f4] bg-[#f7f8fd] p-4 text-xs leading-6 text-[#59657a]">切换 Real 模式前，需要先在本机根目录创建 <code className="rounded bg-white px-1.5 py-0.5">.env.local</code>。不要把密钥发到聊天、截图或提交到 Git。</div>
      </Card>
    </div>
  </>;
}
