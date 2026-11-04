export default function Button({ children, variant = "primary", loading = false, className = "", disabled, ...props }) {
  const variants = {
    primary: "bg-brand-600 text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700",
    secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />}
      {children}
    </button>
  );
}
