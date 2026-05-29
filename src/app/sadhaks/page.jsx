"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { getSadhaks, getSevas } from "@/lib/directoryService";
import { getLocalSession } from "@/lib/authService";

export default function SadhaksPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [sadhaks, setSadhaks] = useState([]);
  const [sevas, setSevas] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [sevaId, setSevaId] = useState("");

  const [loading, setLoading] = useState(true);

  const canAdd =
    currentUser?.role === "admin" ||
    currentUser?.role === "team_leader" ||
    currentUser?.loginId === "admin";

  const selectedSevaName = useMemo(() => {
    if (!sevaId) return "All Seva";

    const seva = sevas.find((item) => item.id === sevaId);
    return seva?.name || "Selected Seva";
  }, [sevaId, sevas]);

  useEffect(() => {
    const session = getLocalSession();
    setCurrentUser(session);

    loadInitial();
  }, []);

  async function loadInitial() {
    setLoading(true);

    try {
      const [sadhakData, sevaData] = await Promise.all([
        getSadhaks({ searchText: "", sevaId: "" }),
        getSevas({ searchText: "" }),
      ]);

      setSadhaks(sadhakData);
      setSevas(sevaData);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSadhaks(nextSearch = searchText, nextSevaId = sevaId) {
    setLoading(true);

    try {
      const data = await getSadhaks({
        searchText: nextSearch,
        sevaId: nextSevaId,
      });

      setSadhaks(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(value) {
    setSearchText(value);
    loadSadhaks(value, sevaId);
  }

  function handleSevaChange(value) {
    setSevaId(value);
    loadSadhaks(searchText, value);
  }

  function clearFilters() {
    setSearchText("");
    setSevaId("");
    loadSadhaks("", "");
  }

  return (
    <AppShell title="Sadhaks" subtitle="Search & Verify">
      <div className="space-y-4">
        <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
                Directory
              </p>

              <h2 className="mt-1 text-2xl font-black text-[#172033]">
                Sadhak Search
              </h2>

              <p className="mt-1 text-xs font-bold text-[#697386]">
                Search by ID, name, mobile or seva.
              </p>
            </div>

            {canAdd && (
              <Link
                href="/sadhaks/new"
                className="rounded-2xl bg-[#102a56] px-4 py-3 text-sm font-black text-white shadow-[0_10px_24px_rgba(16,42,86,0.22)]"
              >
                Add
              </Link>
            )}
          </div>

          <input
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search ID, name or mobile"
            className="mt-4 w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-bold text-[#172033] outline-none placeholder:text-[#697386] focus:border-[#102a56]"
          />

          <select
            value={sevaId}
            onChange={(e) => handleSevaChange(e.target.value)}
            className="mt-3 w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-bold text-[#172033] outline-none focus:border-[#102a56]"
          >
            <option value="">All Seva</option>

            {sevas.map((seva) => (
              <option key={seva.id} value={seva.id}>
                {seva.name}
              </option>
            ))}
          </select>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#eef3fb] px-4 py-3">
            <div>
              <p className="text-xs font-black text-[#102a56]">
                {sadhaks.length} profile found
              </p>

              <p className="mt-1 text-[11px] font-bold text-[#697386]">
                {selectedSevaName}
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl bg-white px-3 py-2 text-xs font-black text-[#102a56]"
            >
              Clear
            </button>
          </div>
        </section>

        <section className="space-y-3">
          {loading ? (
            <div className="rounded-[26px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-[#102a56]">
              Loading sadhaks...
            </div>
          ) : sadhaks.length === 0 ? (
            <div className="rounded-[26px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-[#102a56]">
              No sadhak found.
            </div>
          ) : (
            sadhaks.map((sadhak) => (
              <Link
                key={sadhak.id}
                href={`/sadhaks/${sadhak.id}`}
                className="block rounded-[30px] border border-[#d9e0ee] bg-white p-4 shadow-[0_12px_30px_rgba(16,42,86,0.07)] transition hover:border-[#102a56] active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[24px] border border-[#d9e0ee] bg-[#eef3fb]">
                    {sadhak.photoUrl ? (
                      <img
                        src={sadhak.photoUrl}
                        alt={sadhak.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-black text-[#102a56]">
                        {sadhak.name?.charAt(0) || "S"}
                      </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 bg-black/55 px-2 py-1 text-center text-[10px] font-black text-white">
                      View
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-black text-[#172033]">
                          {sadhak.name}
                        </h3>

                        <p className="mt-1 text-xs font-black text-[#102a56]">
                          ID: {sadhak.sadhakCode}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-black ${
                          sadhak.active
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {sadhak.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <SmallInfo label="Mobile" value={sadhak.mobile} />
                      <SmallInfo label="Address" value={sadhak.address} />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </AppShell>
  );
}

function SmallInfo({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f8fafc] px-3 py-2">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#697386]">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-black text-[#172033]">
        {value || "-"}
      </p>
    </div>
  );
}