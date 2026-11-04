import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import alteraLogo from "../../assets/altera-logo.jpeg";

export default function AuthLayout({ title, subtitle, alternateText, alternateLabel, alternateTo, children }) {
  return (
    <main className="min-h-[100dvh] overflow-x-hidden bg-white font-sans lg:flex lg:h-[100dvh] lg:min-h-0 lg:items-center lg:justify-center lg:overflow-hidden lg:bg-[#f4f6fb] lg:px-8 lg:py-6">
      <section className="grid min-h-[100dvh] w-full bg-white lg:h-[calc(100dvh-3rem)] lg:min-h-0 lg:max-w-[80rem] lg:grid-cols-[0.95fr_1.05fr] lg:overflow-hidden lg:rounded-[2rem] lg:border lg:border-slate-200/80 lg:shadow-[0_28px_80px_rgba(45,55,92,.14)]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#3853dc] via-[#4865f5] to-[#5e78fa] px-14 py-12 text-white lg:flex lg:flex-col">
          <div
            className="absolute -right-20 -top-24 h-64 w-64 rounded-full border-[2.75rem] border-white/10"
            aria-hidden="true"
          />
          <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-white/[0.04]" aria-hidden="true" />

          <Link to="/" className="relative z-10 flex items-center gap-3 text-sm font-semibold text-white">
            <img
              className="h-14 w-14 rounded-xl border border-white/15 object-cover shadow-lg shadow-slate-950/10"
              src={alteraLogo}
              alt="Altera Institute"
            />
            <span>Altera Tasks</span>
          </Link>

          <div className="relative z-10 my-auto max-w-md py-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-medium text-white/90">
              <Sparkles size={13} />
              Designed for focused weeks
            </span>
            <h2 className="mt-7 max-w-sm text-[2.55rem] font-semibold leading-[1.12] tracking-[-0.045em] text-white">
              A better week starts with a clearer plan.
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
              Organize tasks, protect your focus, and see meaningful progress every day.
            </p>
            <ul className="mt-7 space-y-3 text-xs text-white/85">
              {[
                "Plan tasks around your real calendar",
                "Track every week at a glance",
                "Keep your workspace private",
              ].map((item) => (
                <li className="flex items-center gap-2.5" key={item}>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-emerald-200/70 text-emerald-200">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-[11px] text-white/60">
            Simple enough for today. Structured enough for every week.
          </p>
        </aside>

        <section className="relative flex min-h-[100dvh] flex-col bg-white lg:h-full lg:min-h-0 lg:overflow-hidden">
          <header className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-5 sm:px-10 lg:absolute lg:inset-x-0 lg:z-10 lg:border-0 lg:bg-transparent lg:px-12 lg:py-9">
            <Link to="/" className="flex items-center gap-3 text-sm font-semibold text-slate-950 lg:hidden">
              <img
                className="h-11 w-11 shrink-0 rounded-xl object-contain shadow-lg shadow-slate-900/10"
                src={alteraLogo}
                alt="Altera Institute"
              />
              <span>Altera Tasks</span>
            </Link>
            <span className="hidden lg:block" />
            <Link to="/" className="icon-button border border-slate-200 bg-white" aria-label="Back to home">
              <ArrowLeft size={18} />
            </Link>
          </header>

          <div className="flex flex-1 items-start px-5 sm:px-10 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:px-16 xl:px-20">
            <div className="mx-auto w-full max-w-md pb-10 pt-8 sm:pt-10 lg:my-auto lg:pb-12 lg:pt-24">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-600">
                Your workspace
              </span>
              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-[1.85rem]">
                {title}
              </h1>
              <p className="mb-8 mt-2.5 text-sm leading-6 text-slate-500">{subtitle}</p>
              {children}
              <p className="mt-7 text-center text-sm text-slate-500">
                {alternateText}{" "}
                <Link className="font-medium text-brand-600 transition hover:text-brand-700" to={alternateTo}>
                  {alternateLabel}
                </Link>
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
