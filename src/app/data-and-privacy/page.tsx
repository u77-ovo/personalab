import Link from "next/link";
import { ArrowLeft, Database, HardDrive, LockKeyhole, ShieldCheck, TriangleAlert } from "lucide-react";

const sections = [
  {
    icon: HardDrive,
    title: "Demo 模式",
    description: "Idea、Project、Issue、Evidence 和报告只保存在当前浏览器的 LocalStorage。PersonaLab 服务器和开发者不会收到这些内容；清理浏览器数据后可能无法恢复。",
  },
  {
    icon: Database,
    title: "Real 模式",
    description: "账号和结构化研究数据计划保存在 Supabase；原型截图与附件计划保存在私有 Storage。GitHub 只保存源码，Vercel 运行网站，不作为研究资料数据库。",
  },
  {
    icon: LockKeyhole,
    title: "访问边界",
    description: "云端数据必须通过登录身份与行级权限校验。上线前会用两个测试账号验证互相不可读取项目、访谈原文和文件。",
  },
] as const;

export default function DataAndPrivacyPage() {
  return <main className="min-h-screen bg-[#f6f8fc] px-5 py-10 sm:py-16">
    <div className="mx-auto max-w-4xl">
      <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#657086]"><ArrowLeft className="h-4 w-4" />返回 PersonaLab</Link>
      <div className="mt-8 rounded-[30px] bg-(--navy) p-7 text-white sm:p-11">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold"><ShieldCheck className="h-4 w-4" />数据边界说明 · 开发阶段</div>
        <h1 className="mt-6 text-4xl font-bold tracking-[-.045em] sm:text-5xl">你的研究资料<br />应该被清楚地对待。</h1>
        <p className="mt-5 max-w-2xl leading-8 text-[#c5cee0]">本页说明 PersonaLab 当前与计划中的数据存储方式。它不是最终法律版隐私政策；公开招募真实用户前仍需补充运营主体、联系方式、保留期限和用户权利。</p>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">{sections.map((section) => <section key={section.title} className="rounded-2xl border border-(--line) bg-white p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-(--primary-soft) text-(--primary)"><section.icon className="h-5 w-5" /></span><h2 className="mt-4 font-bold">{section.title}</h2><p className="mt-2 text-sm leading-6 text-[#657086]">{section.description}</p></section>)}</div>

      <section className="mt-6 rounded-2xl border border-[#ecd9b8] bg-[#fff8ec] p-5 sm:p-6">
        <div className="flex items-center gap-2 font-bold text-[#845817]"><TriangleAlert className="h-5 w-5" />公开测试前的限制</div>
        <p className="mt-3 text-sm leading-7 text-[#735f40]">在云端迁移、双账号隔离、数据删除与导出流程全部验证前，请不要上传可识别真实参与者身份的访谈、医疗信息、联系方式或其他敏感资料。研究文本应先匿名化，并取得符合研究用途的知情同意。</p>
      </section>

      <section className="mt-6 rounded-2xl border border-(--line) bg-white p-5 sm:p-6">
        <h2 className="font-bold">正式发布前还要补充</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#657086] sm:grid-cols-2"><li>• 数据保留期限与彻底删除方式</li><li>• 用户导出自己数据的方式</li><li>• 运营主体与联系邮箱</li><li>• Supabase 项目区域与跨境说明</li><li>• AI 服务接收哪些字段</li><li>• 安全事件和权限异常处理流程</li></ul>
      </section>
    </div>
  </main>;
}
