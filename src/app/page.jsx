import Link from "next/link";
import AppShell from "@/components/AppShell";

const sevaList = [
  "Yamuna Ji Seva",
  "Ekantik Seva",
  "24×7 Seva",
  "Satsang Seva",
  "Seva Bhawan",
  "Others",
];

export default function HomePage() {
  return (
    <AppShell title="Seva Token App" subtitle="Quickly assign and verify seva tokens.">
      <div className="space-y-5">
        <Link
          href="/assign"
          className="block overflow-hidden rounded-[34px] bg-gradient-to-br from-[#8a5d3c] to-[#563522] p-6 text-white shadow-[0_20px_50px_rgba(95,59,39,0.24)]"
        >
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/65">
            Primary Action
          </p>

          <h2 className="mt-3 text-[32px] font-black leading-[1.08]">
            Assign a new token
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/78">
            Add name, select seva, capture photo and generate token number.
          </p>

          <div className="mt-5 rounded-2xl bg-white px-5 py-4 text-center text-base font-black text-[#5f3b27]">
            Start Assignment
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/check"
            className="rounded-[28px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_14px_35px_rgba(90,64,43,0.08)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a88a6d]">
              Verify
            </p>

            <h3 className="mt-3 text-[21px] font-black leading-tight text-[#2f241d]">
              Check Token
            </h3>

            <p className="mt-2 text-sm leading-5 text-[#715b48]">
              Search token by number, name or seva.
            </p>
          </Link>

          <Link
            href="/today"
            className="rounded-[28px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_14px_35px_rgba(90,64,43,0.08)]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a88a6d]">
              Records
            </p>

            <h3 className="mt-3 text-[21px] font-black leading-tight text-[#2f241d]">
              Today
            </h3>

            <p className="mt-2 text-sm leading-5 text-[#715b48]">
              View tokens generated today.
            </p>
          </Link>
        </div>

        <div className="rounded-[32px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_14px_35px_rgba(90,64,43,0.07)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a88a6d]">
                Available
              </p>
              <h3 className="mt-1 text-2xl font-black text-[#2f241d]">
                Seva Options
              </h3>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {sevaList.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#eadfce] bg-[#f8f0e7] px-3 py-3 text-sm font-black text-[#6d5543]"
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