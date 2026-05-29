"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { getLocalSession, logoutUser } from "@/lib/authService";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const session = getLocalSession();
    setCurrentUser(session);
  }, []);

  function handleLogout() {
    logoutUser();
    router.replace("/login");
  }

  return (
    <AppShell title="Profile" subtitle="Current login and account access.">
      <div className="space-y-4">
        <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
            Account
          </p>

          <h2 className="mt-1 text-2xl font-black text-[#172033]">
            {currentUser?.name || "User"}
          </h2>

          <div className="mt-4 space-y-3">
            <Info label="Login ID" value={currentUser?.loginId} />
            <Info label="Role" value={currentUser?.role || "view_only"} />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 w-full rounded-2xl bg-red-50 px-4 py-4 text-sm font-black text-red-700"
          >
            Logout
          </button>
        </section>
      </div>
    </AppShell>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#f8fafc] p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#697386]">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#172033]">
        {value || "Not available"}
      </p>
    </div>
  );
}