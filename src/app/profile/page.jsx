"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getLocalSession, logoutUser } from "@/lib/authService";

export default function ProfilePage() {
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(getLocalSession());
  }, []);

  function handleLogout() {
    logoutUser();
    router.replace("/login");
  }

  return (
    <AppShell title="Profile" subtitle="Manage current login session.">
      <div className="rounded-[32px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_16px_45px_rgba(90,64,43,0.10)]">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a88a6d]">
          Logged In
        </p>

        <h2 className="mt-2 text-3xl font-black text-[#2f241d]">
          {session?.name || "User"}
        </h2>

        <div className="mt-5 rounded-2xl border border-[#eadfce] bg-[#f8f0e7] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a88a6d]">
            Login ID
          </p>

          <p className="mt-1 text-xl font-black text-[#7b4f32]">
            {session?.loginId || "Not available"}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="mt-5 w-full rounded-2xl bg-[#7b4f32] px-5 py-4 text-base font-black text-white shadow-[0_12px_28px_rgba(123,79,50,0.22)]"
        >
          Logout
        </button>
      </div>
    </AppShell>
  );
}