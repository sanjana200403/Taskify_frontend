import { getWeekDays } from "../../utils/date.js";

export default function WeekStrip({ weekStart }) {
  const today = new Date();
  const todayIso = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  const days = getWeekDays(weekStart);
  if (!days.length) return null;
  return (
    <div className="grid grid-cols-7 gap-1 rounded-2xl border border-slate-100 bg-slate-50/70 p-2 sm:gap-2 sm:p-3">
      {days.map((day) => {
        const active = day.iso === todayIso;
        return (
          <div
            key={day.iso}
            className={`flex flex-col items-center rounded-xl py-2.5 text-center transition sm:py-3 ${active ? "bg-brand-600 text-white shadow-lg shadow-brand-600/20" : "text-slate-400 hover:bg-white"}`}
          >
            <span className="text-[8px] font-medium uppercase sm:text-[9px]">{day.weekday}</span>
            <span className={`mt-1.5 text-xs font-semibold ${active ? "text-white" : "text-slate-700"}`}>
              {day.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}
