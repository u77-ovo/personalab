import type { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight, CircleAlert, LoaderCircle } from "lucide-react";

export function cn(...values: Array<string | false | null | undefined>) { return values.filter(Boolean).join(" "); }

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "dark" | "quiet" | "spark" | "mirror" | "proof"; busy?: boolean };
export function Button({ className, tone = "primary", busy, children, disabled, ...props }: ButtonProps) {
  const tones = { primary: "bg-(--primary) text-white hover:bg-(--primary-strong)", dark: "bg-(--navy) text-white hover:bg-[#253154]", quiet: "border border-(--line) bg-white hover:border-[#aeb9cc] hover:bg-[#fafbfe]", spark: "bg-(--spark) text-white hover:bg-[#a9541f]", mirror: "bg-(--mirror) text-white hover:bg-[#0f665c]", proof: "bg-(--proof) text-white hover:bg-[#96375e]" };
  return <button className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45", tones[tone], className)} disabled={disabled || busy} {...props}>{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : children}</button>;
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "spark" | "mirror" | "proof" | "ai" | "risk" }) {
  const tones = { neutral: "bg-[#eef1f6] text-[#5f6a7f]", spark: "bg-(--spark-soft) text-(--spark)", mirror: "bg-(--mirror-soft) text-(--mirror)", proof: "bg-(--proof-soft) text-(--proof)", ai: "bg-[#f0edfa] text-[#6a52ad]", risk: "bg-(--risk-soft) text-(--risk)" };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold", tones[tone])}>{children}</span>;
}

export function PageHeader({ title, description, lab, children }: { title: string; description: string; lab?: "spark" | "mirror" | "proof"; children?: ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex items-center gap-2">{lab && <span className={cn("h-2.5 w-2.5 rounded-full", lab === "spark" ? "bg-(--spark)" : lab === "mirror" ? "bg-(--mirror)" : "bg-(--proof)")} />}<span className="text-xs font-bold uppercase tracking-[.16em] text-[#7c879b]">PersonaLab 2.0</span></div><h1 className="mt-3 text-3xl font-bold tracking-[-.04em] text-(--navy) sm:text-[40px]">{title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-[#657086]">{description}</p></div>{children}</div>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) { return <section className={cn("rounded-2xl border border-(--line) bg-white p-5", className)}>{children}</section>; }
export function Field({ label, note, children }: { label: string; note?: string; children: ReactNode }) { return <label className="grid gap-2 text-sm font-semibold"><span>{label}{note && <span className="ml-2 text-xs font-normal text-[#7d8799]">{note}</span>}</span>{children}</label>; }
export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-[#bcc6d7] bg-[#fafbfe] p-8 text-center"><div><CircleAlert className="mx-auto h-7 w-7 text-[#8b96aa]" /><h3 className="mt-3 font-bold">{title}</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#768195]">{description}</p></div></div>; }
export function NextLinkHint({ children }: { children: ReactNode }) { return <span className="inline-flex items-center gap-1 text-sm font-semibold">{children}<ArrowRight className="h-4 w-4" /></span>; }
