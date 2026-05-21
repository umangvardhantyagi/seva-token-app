"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getLocalSession } from "@/lib/authService";

export default function AuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (pathname === "/login") {
      setChecking(false);
      return;
    }

    const session = getLocalSession();

    if (!session) {
      router.replace("/login");
      return;
    }

    setChecking(false);
  }, [pathname, router]);

  if (checking) {
    return (
      <main className="min-h-screen bg-[#f5efe6] px-4 py-6 text-[#2f241d]">
        <div className="mx-auto max-w-md rounded-[28px] border border-[#eadfce] bg-[#fffaf3] p-6 text-center shadow-[0_12px_35px_rgba(90,64,43,0.08)]">
          <p className="text-sm font-black text-[#7b4f32]">Opening app...</p>
        </div>
      </main>
    );
  }

  return children;
}