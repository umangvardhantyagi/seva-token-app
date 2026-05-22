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
      className={`w-full rounded-2xl bg-gradient-to-br from-[#8a5d3c] to-[#633b27] px-5 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(123,79,50,0.25)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
}