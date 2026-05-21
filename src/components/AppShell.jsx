import AuthGate from "./AuthGate";
import BottomNav from "./BottomNav";

export default function AppShell({ children, title, subtitle }) {
  return (
    <AuthGate>
      <main className="min-h-screen bg-[#f5efe6] text-[#2f241d]">
        <div className="mx-auto min-h-screen max-w-md px-4 pb-8 pt-4">
          <header className="mb-4 rounded-[28px] border border-[#eadfce] bg-[#fffaf3] px-5 py-5 shadow-[0_12px_35px_rgba(90,64,43,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-[28px] font-black tracking-tight text-[#2f241d]">
                  {title}
                </h1>

                {subtitle && (
                  <p className="mt-2 text-sm leading-6 text-[#715b48]">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eadfce] bg-[#f7eadb] text-sm font-black text-[#7b4f32]">
                सेवा
              </div>
            </div>
          </header>

          <BottomNav />

          <section className="mt-4">{children}</section>
        </div>
      </main>
    </AuthGate>
  );
}