"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { deleteSadhak, getSadhakProfileById } from "@/lib/directoryService";
import { getLocalSession } from "@/lib/authService";
import { canManageSadhakProfile } from "@/lib/permissionService";

export default function SadhakProfilePage() {
  const router = useRouter();
  const params = useParams();
  const sadhakId = params?.id;

  const [sadhak, setSadhak] = useState(null);
  const [canManage, setCanManage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const profileUrl = useMemo(() => {
    if (typeof window === "undefined" || !sadhak?.qrToken) return "";
    return `${window.location.origin}/scan/${sadhak.qrToken}`;
  }, [sadhak]);

  const qrUrl = profileUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        profileUrl
      )}`
    : "";

  useEffect(() => {
    loadProfile();
  }, [sadhakId]);

  async function loadProfile() {
    if (!sadhakId) return;

    setLoading(true);

    try {
      const data = await getSadhakProfileById(sadhakId);
      setSadhak(data);

      const session = getLocalSession();
      const allowed = await canManageSadhakProfile(session, data);
      setCanManage(allowed);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!sadhak) return;

    const ok = window.confirm(
      `Delete sadhak profile "${sadhak.name}" permanently?`
    );

    if (!ok) return;

    setDeleting(true);

    try {
      await deleteSadhak(sadhak);
      alert("Sadhak deleted successfully");
      router.replace("/sadhaks");
    } catch (error) {
      alert(error.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppShell title="Sadhak ID" subtitle="Verification Card">
      {loading ? (
        <div className="rounded-[28px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-[#102a56]">
          Loading profile...
        </div>
      ) : !sadhak ? (
        <div className="rounded-[28px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-red-700">
          Sadhak profile not found.
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
                    Sadhak Identity Card
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

          <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 text-center shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
              QR Verification
            </p>

            <h2 className="mt-1 text-xl font-black text-[#172033]">
              Scan ID Card
            </h2>

            {qrUrl && (
              <div className="mt-5 inline-flex rounded-[28px] border border-[#d9e0ee] bg-[#f8fafc] p-4">
                <img src={qrUrl} alt="QR Code" className="h-56 w-56" />
              </div>
            )}

            <p className="mt-4 text-xs font-bold leading-6 text-[#697386]">
              This QR opens the verified sadhak profile.
            </p>
          </section>

          <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
              Record
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <InfoCard label="Created By" value={sadhak.createdByName} />
              <InfoCard label="Updated By" value={sadhak.updatedByName} />
            </div>
          </section>

          {canManage && (
            <section className="grid grid-cols-2 gap-3">
              <Link
                href={`/sadhaks/${sadhak.id}/edit`}
                className="rounded-2xl bg-[#102a56] px-4 py-4 text-center text-sm font-black text-white shadow-[0_10px_24px_rgba(16,42,86,0.22)]"
              >
                Edit Profile
              </Link>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-2xl bg-red-50 px-4 py-4 text-sm font-black text-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </section>
          )}
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