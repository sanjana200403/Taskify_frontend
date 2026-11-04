import { ChevronDown } from "lucide-react";
import { formatWeekRange } from "../../utils/date.js";

export default function WeeklyCard({ summary, expanded, onClick, children }) {
  const progress = summary.totalTasks ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0;
  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white transition-all ${expanded ? "border-brand-200 shadow-[0_12px_30px_rgba(72,101,245,.10)]" : "border-slate-100 hover:-translate-y-0.5 hover:border-slate-200 hover:shadow-card"}`}
    >
      <button type="button" className="w-full p-4 text-left sm:p-5" onClick={onClick} aria-expanded={expanded}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-tight text-slate-900">
              {formatWeekRange(summary.weekStart, summary.weekEnd)}
            </p>
            <p className="mt-1.5 text-[10px] text-slate-400">
              {summary.totalTasks} {summary.totalTasks === 1 ? "task" : "tasks"} scheduled
            </p>
          </div>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition ${expanded ? "rotate-180 bg-brand-50 text-brand-600" : ""}`}
          >
            <ChevronDown size={16} />
          </span>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="w-9 text-right text-[11px] font-medium text-slate-500">{progress}%</span>
        </div>
        <div className="mt-3.5 flex gap-5 text-[10px]">
          <span className="text-slate-500">
            <strong className="mr-1 text-slate-900">{summary.openTasks}</strong>Open
          </span>
          <span className="text-slate-500">
            <strong className="mr-1 text-brand-600">{summary.completedTasks}</strong>Done
          </span>
        </div>
      </button>
      {expanded && children && <div className="border-t border-slate-100 px-3 pb-3 sm:px-4">{children}</div>}
    </article>
  );
}
