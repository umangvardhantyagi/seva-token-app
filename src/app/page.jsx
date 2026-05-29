"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { getLocalSession, getUsers } from "@/lib/authService";
import { getDashboardStats } from "@/lib/directoryService";
import { isAdminUser } from "@/lib/permissionService";

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState(null);

  const [stats, setStats] = useState({
    totalSadhaks: 0,
    activeSadhaks: 0,
    totalSevas: 0,
    totalAccessAreas: 0,
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = isAdminUser(currentUser);

  const activeTeamLeaders = useMemo(() => {
    return users.filter((user) => user.role === "team_leader" && user.active)
      .length;
  }, [users]);

  const viewOnlyUsers = useMemo(() => {
    return users.filter((user) => user.role === "view_only" && user.active)
      .length;
  }, [users]);

  useEffect(() => {
    const session = getLocalSession();
    setCurrentUser(session);
    loadDashboard(session);
  }, []);

  async function loadDashboard(session) {
    setLoading(true);

    try {
      const dashboardStats = await getDashboardStats();

      setStats({
        totalSadhaks: dashboardStats.totalSadhaks || 0,
        activeSadhaks:
          dashboardStats.activeSadhaks ||
          dashboardStats.activeSadhak ||
          dashboardStats.totalActiveSadhaks ||
          0,
        totalSevas: dashboardStats.totalSevas || 0,
        totalAccessAreas: dashboardStats.totalAccessAreas || 0,
      });

      if (isAdminUser(session)) {
        const userData = await getUsers();
        setUsers(userData);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell title="Dashboard" subtitle="Directory Overview">
      <div className="space-y-4">
        <section className="overflow-hidden rounded-[32px] border border-[#d9e0ee] bg-white shadow-[0_18px_45px_rgba(16,42,86,0.10)]">
          <div className="bg-gradient-to-br from-[#102a56] via-[#173b70] to-[#07152c] p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/65">
                  Current User
                </p>

                <h2 className="mt-2 text-2xl font-black leading-tight">
                  {currentUser?.name || "User"}
                </h2>

                <p className="mt-2 text-sm font-semibold text-white/75">
                  {formatRole(currentUser?.role)}
                </p>
              </div>

              <div className="rounded-2xl bg-white/12 px-4 py-3 text-center backdrop-blur">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/65">
                  Status
                </p>

                <p className="mt-1 text-sm font-black text-green-200">
                  Active
                </p>
              </div>
            </div>
          </div>

          <div className="p-5">
            <p className="text-sm font-bold leading-6 text-[#697386]">
              Keli Kunj Sadhak identity, seva and access management system.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="rounded-[28px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-[#102a56]">
            Loading dashboard...
          </div>
        ) : (
          <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
                Summary
              </p>

              <h2 className="mt-1 text-xl font-black text-[#172033]">
                Directory Status
              </h2>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatCard
                label="Sadhaks"
                value={stats.totalSadhaks}
                note="Total profiles"
              />

              <StatCard
                label="Active"
                value={stats.activeSadhaks}
                note="Active profiles"
              />

              <StatCard
                label="Sevas"
                value={stats.totalSevas}
                note="Seva categories"
              />

              <StatCard
                label="Access"
                value={stats.totalAccessAreas}
                note="Access areas"
              />

              {isAdmin && (
                <>
                  <StatCard
                    label="Leaders"
                    value={activeTeamLeaders}
                    note="Team leaders"
                  />

                  <StatCard
                    label="View Only"
                    value={viewOnlyUsers}
                    note="Checking users"
                  />
                </>
              )}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-[24px] border border-[#d9e0ee] bg-[#f8fafc] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#697386]">
        {label}
      </p>

      <h3 className="mt-3 text-3xl font-black leading-none text-[#102a56]">
        {value ?? 0}
      </h3>

      <p className="mt-2 text-xs font-bold text-[#697386]">{note}</p>
    </div>
  );
}

function formatRole(role) {
  if (role === "admin") return "Admin";
  if (role === "team_leader") return "Team Leader";
  return "View Only";
}