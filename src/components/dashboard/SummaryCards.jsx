import { CheckCircle2, ListTodo, TimerReset } from "lucide-react";

export default function SummaryCards({ summary }) {
  const open = summary?.openTasks || 0;
  const completed = summary?.completedTasks || 0;
  const total = summary?.totalTasks || 0;
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm sm:p-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <ListTodo size={18} />
        </span>
        <p className="mt-4 text-xl font-semibold leading-none text-slate-950 sm:text-2xl">{total}</p>
        <p className="mt-2 text-[9px] font-medium text-slate-400 sm:text-[11px]">Total tasks</p>
      </div>
      <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3.5 sm:p-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <TimerReset size={18} />
        </span>
        <p className="mt-4 text-xl font-semibold leading-none text-slate-950 sm:text-2xl">{open}</p>
        <p className="mt-2 text-[9px] font-medium text-slate-500 sm:text-[11px]">In progress</p>
      </div>
      <div className="rounded-2xl border border-brand-100 bg-brand-50/80 p-3.5 sm:p-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
          <CheckCircle2 size={18} />
        </span>
        <p className="mt-4 text-xl font-semibold leading-none text-slate-950 sm:text-2xl">{completed}</p>
        <p className="mt-2 text-[9px] font-medium text-slate-500 sm:text-[11px]">Completed</p>
      </div>
    </div>
  );
}
