export default function Loader({ fullScreen = false, label = "Loading" }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-sm text-slate-500 ${fullScreen ? "min-h-screen bg-slate-50" : "py-12"}`}
      role="status"
    >
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      <span>{label}</span>
    </div>
  );
}
