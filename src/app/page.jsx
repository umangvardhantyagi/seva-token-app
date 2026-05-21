import Link from "next/link";
import AppShell from "@/components/AppShell";

export default function HomePage() {
  return (
    <AppShell title="Seva Token App">
      <div className="space-y-4">
        <div className="rounded-[30px] bg-gradient-to-br from-[#8a5d3c] to-[#5f3b27] p-6 text-white shadow-[0_18px_45px_rgba(95,59,39,0.22)]">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
            Quick Action
          </p>

          <h2 className="mt-3 text-3xl font-black leading-tight">
            Assign a new seva token
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/82">
            Add name, select seva, capture photo and generate token number in a
            few seconds.
          </p>

          <Link
            href="/assign"
            className="mt-5 block rounded-2xl bg-white px-5 py-4 text-center text-base font-black text-[#5f3b27] shadow-sm"
          >
            Assign Token
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/check"
            className="rounded-[26px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_12px_30px_rgba(90,64,43,0.07)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a88a6d]">
              Verify
            </p>

            <h3 className="mt-3 text-xl font-black text-[#2f241d]">
              Check Token
            </h3>

            <p className="mt-2 text-sm leading-5 text-[#715b48]">
              Search by token number, name or seva.
            </p>
          </Link>

          <Link
            href="/today"
            className="rounded-[26px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_12px_30px_rgba(90,64,43,0.07)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a88a6d]">
              Records
            </p>

            <h3 className="mt-3 text-xl font-black text-[#2f241d]">Today</h3>

            <p className="mt-2 text-sm leading-5 text-[#715b48]">
              View all tokens created today.
            </p>
          </Link>
        </div>

        <div className="rounded-[28px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_12px_30px_rgba(90,64,43,0.06)]">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a88a6d]">
            Active Seva Options
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              "Yamuna Ji Seva",
              "Ekantik Seva",
              "24×7 Seva",
              "Satsang Seva",
              "Seva Bhawan",
              "Others",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-[#f8f0e7] px-3 py-3 text-sm font-black text-[#6d5543]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}