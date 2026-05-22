import AuthGate from "./AuthGate";
import BottomNav from "./BottomNav";

export default function AppShell({ children, title, subtitle }) {
  return (
    <AuthGate>
      <main className="min-h-screen bg-[#f4eadf] text-[#2f241d]">
        <div className="mx-auto min-h-screen max-w-md px-4 pb-8 pt-4">
          <header className="mb-4 overflow-hidden rounded-[34px] border border-[#e7d5c1] bg-[#fffaf3] shadow-[0_18px_45px_rgba(77,50,31,0.10)]">
            <div className="relative bg-gradient-to-br from-[#8b5e3c] via-[#74462d] to-[#4f2f20] px-5 py-6 text-white">
              <div className="absolute right-[-45px] top-[-45px] h-32 w-32 rounded-full bg-white/10" />
              <div className="absolute bottom-[-55px] left-[-35px] h-28 w-28 rounded-full bg-white/10" />

              <div className="relative flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/65">
                    Seva Management
                  </p>

                  <h1 className="mt-2 text-[31px] font-black leading-tight tracking-tight">
                    {title}
                  </h1>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/20 bg-white/15 text-sm font-black shadow-inner backdrop-blur">
                  सेवा
                </div>
              </div>

              {subtitle && (
                <p className="relative mt-3 max-w-[310px] text-sm font-medium leading-6 text-white/78">
                  {subtitle}
                </p>
              )}
            </div>
          </header>

          <BottomNav />

          <section className="mt-4">{children}</section>
        </div>
      </main>
    </AuthGate>
  );
}