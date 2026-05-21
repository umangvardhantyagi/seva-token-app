import AuthGate from "./AuthGate";
import BottomNav from "./BottomNav";

export default function AppShell({ children, title, subtitle }) {
  return (
    <AuthGate>
      <main className="min-h-screen bg-[#f5efe6] text-[#2f241d]">
        <div className="mx-auto min-h-screen max-w-md px-4 pb-8 pt-4">
          <header className="mb-4 overflow-hidden rounded-[32px] border border-[#eadfce] bg-[#fffaf3] shadow-[0_18px_45px_rgba(90,64,43,0.10)]">
            <div className="bg-gradient-to-br from-[#8a5d3c] to-[#5f3b27] px-5 py-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/65">
                    Seva Management
                  </p>

                  <h1 className="mt-2 text-[30px] font-black leading-tight tracking-tight">
                    {title}
                  </h1>
                </div>

                <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-white/20 bg-white/12 px-3 py-3 text-sm font-black shadow-inner">
                  सेवा
                </div>
              </div>

              {subtitle && (
                <p className="mt-3 text-sm leading-6 text-white/78">
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