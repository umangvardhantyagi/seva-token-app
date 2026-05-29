"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getSadhakProfileByQrToken } from "@/lib/directoryService";

export default function ScanProfilePage() {
  const params = useParams();
  const qrToken = params?.qrToken;

  const [sadhak, setSadhak] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [qrToken]);

  async function loadProfile() {
    if (!qrToken) return;

    setLoading(true);

    try {
      const data = await getSadhakProfileByQrToken(qrToken);
      setSadhak(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="QR Verify" subtitle="Sadhak Identity">
      {loading ? (
        <div className="rounded-[28px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-[#102a56]">
          Verifying profile...
        </div>
      ) : !sadhak ? (
        <div className="rounded-[28px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-red-700">
          Invalid QR or sadhak profile not found.
        </div>
      ) : (
        <div className="space-y-4">
          <section className="overflow-hidden rounded-[34px] border border-[#d9e0ee] bg-white shadow-[0_18px_50px_rgba(16,42,86,0.12)]">
            <div className="bg-gradient-to-br from-[#102a56] via-[#15396f] to-[#07152c] px-5 py-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/65">
                    Keli Kunj
                  </p>

                  <h1 className="mt-2 text-2xl font-black leading-tight">
                    Verified Sadhak
                  </h1>
                </div>

                <span
                  className={`rounded-full px-3 py-2 text-[11px] font-black ${
                    sadhak.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {sadhak.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="p-5">
              <div className="flex flex-col items-center text-center">
                <div className="h-40 w-40 overflow-hidden rounded-[32px] border-4 border-white bg-[#eef3fb] shadow-[0_18px_40px_rgba(16,42,86,0.18)] ring-1 ring-[#d9e0ee]">
                  {sadhak.photoUrl ? (
                    <img
                      src={sadhak.photoUrl}
                      alt={sadhak.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl font-black text-[#102a56]">
                      {sadhak.name?.charAt(0) || "S"}
                    </div>
                  )}
                </div>

                <h2 className="mt-4 text-3xl font-black leading-tight text-[#172033]">
                  {sadhak.name}
                </h2>

                <div className="mt-3 rounded-2xl bg-[#102a56] px-5 py-3 text-lg font-black tracking-wide text-white">
                  {sadhak.sadhakCode}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3">
                <InfoCard label="Mobile" value={sadhak.mobile} />
                <InfoCard label="Address" value={sadhak.address} />
                <InfoCard label="Comment" value={sadhak.notes} />
              </div>
            </div>
          </section>

          <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
                  Seva
                </p>

                <h2 className="mt-1 text-xl font-black text-[#172033]">
                  Assigned Seva
                </h2>
              </div>

              <span className="rounded-full bg-[#eef3fb] px-3 py-2 text-xs font-black text-[#102a56]">
                {sadhak.sevas.length}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {sadhak.sevas.length === 0 ? (
                <p className="rounded-2xl bg-[#f8fafc] p-4 text-sm font-bold text-[#697386]">
                  No seva assigned.
                </p>
              ) : (
                sadhak.sevas.map((seva) => (
                  <span
                    key={seva.id}
                    className="rounded-full bg-[#eef3fb] px-4 py-2 text-xs font-black text-[#102a56]"
                  >
                    {seva.name}
                  </span>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
                  Access
                </p>

                <h2 className="mt-1 text-xl font-black text-[#172033]">
                  Allowed Areas
                </h2>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-2 text-xs font-black text-green-700">
                {sadhak.accessAreas.length}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {sadhak.accessAreas.length === 0 ? (
                <p className="rounded-2xl bg-[#f8fafc] p-4 text-sm font-bold text-[#697386]">
                  No access area assigned.
                </p>
              ) : (
                sadhak.accessAreas.map((area) => (
                  <span
                    key={area.id}
                    className="rounded-full bg-green-50 px-4 py-2 text-xs font-black text-green-700"
                  >
                    {area.name}
                  </span>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
              Verification Status
            </p>

            <div
              className={`mt-4 rounded-2xl px-4 py-4 text-center text-sm font-black ${
                sadhak.active
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {sadhak.active
                ? "This Sadhak profile is active and verified."
                : "This Sadhak profile is currently inactive."}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}

function InfoCard({ label, value }) {
  if (!value) return null;

  return (
    <div className="rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] p-4 text-left">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#697386]">
        {label}
      </p>

      <p className="mt-1 text-sm font-black leading-6 text-[#172033]">
        {value}
      </p>
    </div>
  );
}