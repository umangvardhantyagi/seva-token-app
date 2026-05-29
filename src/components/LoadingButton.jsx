export default function LoadingButton({
  loading,
  children,
  loadingText = "Please wait...",
  className = "",
  ...props
}) {
  return (
    <button
      disabled={loading}
      className={`w-full rounded-2xl bg-[#102a56] px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(16,42,86,0.25)] transition hover:bg-[#0b1d3d] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
}