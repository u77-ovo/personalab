"use client";
import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDashed, FileText, LoaderCircle, Quote, ScanSearch, Sparkles } from "lucide-react";
import { Badge, Card, PageHeader } from "@/components/ui";
import { useWorkspaceStore } from "@/features/shared/use-workspace-store";

export default function DashboardPage() {
  const { state, ready } = useWorkspaceStore();
  const stages = [
    { name: "SparkLab", label: "定义机会", href: "/workspace/spark", icon: Sparkles, iconClass: "bg-(--spark-soft) text-(--spark)", done: Boolean(state.idea && state.blueprint), detail: state.idea ? `${state.idea.title} · ${state.assessments.length} 个评估版本` : "尚未创建 Idea" },
    { name: "MirrorLab", label: "预检原型", href: "/workspace/mirror", icon: ScanSearch, iconClass: "bg-(--mirror-soft) text-(--mirror)", done: state.issues.length > 0, detail: state.project ? `${state.project.version} · ${state.issues.length} 个待验证问题` : "尚未创建 Project" },
    { name: "ProofLab", label: "连接证据", href: "/workspace/proof", icon: Quote, iconClass: "bg-(--proof-soft) text-(--proof)", done: state.evidence.some(e => e.reviewStatus === "verified"), detail: `${state.evidence.length} 条证据 · ${state.actions.length} 个行动` },
  ];
  const completed = stages.filter(stage => stage.done).length;
  if (!ready) return <><PageHeader title="研究工作台" description="正在恢复保存在当前浏览器中的研究进度。"/><Card className="grid min-h-72 place-items-center"><div className="text-center"><LoaderCircle className="mx-auto h-7 w-7 animate-spin text-(--primary)"/><p className="mt-3 text-sm font-semibold">正在恢复本地工作区</p></div></Card></>;
  return <>
    <PageHeader title="研究工作台" description="从机会假设到真实证据，沿着一条可追溯的产品研究链路继续工作。"><Link href={state.idea ? "/workspace/mirror" : "/workspace/spark"} className="inline-flex h-11 items-center gap-2 rounded-xl bg-(--primary) px-4 text-sm font-semibold text-white">继续研究<ArrowRight className="h-4 w-4" /></Link></PageHeader>
    <div className="grid gap-5 xl:grid-cols-[1.5fr_.8fr]">
      <div className="space-y-5"><Card className="p-0"><div className="flex flex-col gap-5 border-b border-(--line) p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold text-[#778196]">主链路完成度</p><div className="mt-2 flex items-end gap-3"><strong className="text-4xl tracking-[-.04em]">{completed}/3</strong><span className="pb-1 text-sm text-[#6f7a8e]">个 Lab 已形成结果</span></div></div><div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-[#edf0f5]"><div className="h-full rounded-full bg-(--primary) transition-all" style={{width:`${completed/3*100}%`}} /></div></div>
        <div className="grid gap-0 md:grid-cols-3">{stages.map((stage,index)=><Link key={stage.name} href={stage.href} className="group border-b border-(--line) p-5 last:border-0 md:border-b-0 md:border-r md:last:border-r-0"><div className="flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${stage.iconClass}`}><stage.icon className="h-5 w-5" /></span>{stage.done ? <CheckCircle2 className="h-5 w-5 text-(--mirror)" /> : <CircleDashed className="h-5 w-5 text-[#a0a9b9]" />}</div><p className="mt-5 text-xs font-bold text-[#7b8598]">0{index+1} · {stage.label}</p><h2 className="mt-1 text-lg font-bold group-hover:text-(--primary)">{stage.name}</h2><p className="mt-2 text-xs leading-5 text-[#6d788c]">{stage.detail}</p></Link>)}</div>
      </Card>
      <Card><div className="flex items-center justify-between"><div><h2 className="font-bold">最近研究对象</h2><p className="mt-1 text-xs text-[#7a8498]">本地自动保存，刷新后可以继续。</p></div><Badge>{state.project?.round ?? "尚未开始"}</Badge></div>{state.project ? <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center"><div><h3 className="text-lg font-bold">{state.project.title}</h3><p className="mt-2 text-sm leading-6 text-[#687388]">{state.project.objective}</p><div className="mt-3 flex flex-wrap gap-2"><Badge tone="mirror">{state.project.version}</Badge>{state.issues.length>0 && <Badge tone="ai">{state.issues.length} 个 AI 待验证问题</Badge>}</div></div><Link href="/workspace/mirror" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-(--line) px-4 text-sm font-semibold">打开项目</Link></div> : <div className="mt-5 rounded-xl bg-[#f7f8fb] p-5 text-sm text-[#667187]">先在 SparkLab 定义想法，或直接去 MirrorLab 新建研究项目。</div>}</Card></div>
      <div className="space-y-5"><Card><div className="flex items-center gap-2"><FileText className="h-5 w-5 text-(--proof)"/><h2 className="font-bold">证据健康度</h2></div><div className="mt-5 space-y-4">{[["AI 待验证问题",state.issues.length],["已核对真实证据",state.evidence.filter(e=>e.reviewStatus==="verified").length],["已建立行动",state.actions.length]].map(([label,value])=><div key={String(label)} className="flex items-center justify-between"><span className="text-sm text-[#657086]">{label}</span><strong>{value}</strong></div>)}</div><div className="mt-5 rounded-xl bg-(--proof-soft) p-3 text-xs leading-5 text-[#7f3d5a]">只有通过原文范围核对的引用，才会显示为“已核对真实证据”。</div></Card>
      <Card><h2 className="font-bold">研究边界</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-[#667187]">{["Demo Fixture 不等于真实 AI 分析","模拟 Persona 不代表真实用户群体","静态截图不能证明点击成功率","当前数据仅保存在本机浏览器"].map(item=><li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--primary)"/>{item}</li>)}</ul></Card></div>
    </div>
  </>;
}
