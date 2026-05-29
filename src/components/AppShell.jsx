import AuthGate from "./AuthGate";
import BottomNav from "./BottomNav";

export default function AppShell({ children, title, subtitle }) {
  return (
    <AuthGate>
      <main className="min-h-screen bg-[#f8fafc] text-[#172033]">
        <div className="mx-auto min-h-screen max-w-md px-4 pb-8 pt-4">
          <header className="mb-4 overflow-hidden rounded-[32px] border border-[#d9e0ee] bg-white shadow-[0_18px_45px_rgba(16,42,86,0.10)]">
            <div className="bg-gradient-to-br from-[#102a56] via-[#16396f] to-[#0b1d3d] px-5 py-6 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/65">
                    Keli Kunj
                  </p>

                  <h1 className="mt-2 text-[30px] font-black leading-tight tracking-tight">
                    {title}
                  </h1>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/20 bg-white/12 text-xs font-black shadow-inner backdrop-blur">
                  ID
                </div>
              </div>

              {subtitle && (
                <p className="mt-3 max-w-[310px] text-sm font-medium leading-6 text-white/78">
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