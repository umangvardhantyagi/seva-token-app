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

    if (!session?.loginId) {
      router.replace("/login");
      return;
    }

    setChecking(false);
  }, [pathname, router]);

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
        <div className="rounded-[28px] border border-[#eadfce] bg-[#ffffff] p-5 text-sm font-black text-[#7b4f32] shadow-sm">
          Loading...
        </div>
      </main>
    );
  }

  return children;
}