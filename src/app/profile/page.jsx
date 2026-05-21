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
    <AppShell
      title="Profile"
      subtitle="View login details and logout from this device."
    >
      <div className="rounded-[30px] border border-[#eadfce] bg-[#fffaf3] p-5 shadow-[0_12px_35px_rgba(90,64,43,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#a88a6d]">
          Logged In User
        </p>

        <h2 className="mt-3 text-3xl font-black text-[#2f241d]">
          {session?.name || "Open Access"}
        </h2>

        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-[#f8f0e7] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a88a6d]">
              Login ID
            </p>
            <p className="mt-1 text-lg font-black text-[#7b4f32]">
              {session?.loginId || "No login required"}
            </p>
          </div>
        </div>

        {session ? (
          <button
            onClick={handleLogout}
            className="mt-5 w-full rounded-2xl bg-[#7b4f32] px-5 py-4 text-base font-black text-white shadow-md"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="mt-5 w-full rounded-2xl bg-[#7b4f32] px-5 py-4 text-base font-black text-white shadow-md"
          >
            Go to Login
          </button>
        )}
      </div>
    </AppShell>
  );
}