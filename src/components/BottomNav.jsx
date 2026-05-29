"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getLocalSession } from "@/lib/authService";

const baseLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/sevas", label: "Seva" },
  { href: "/sadhaks", label: "Sadhaks" },
  { href: "/profile", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [links, setLinks] = useState(baseLinks);

  useEffect(() => {
    const session = getLocalSession();

    if (session?.loginId === "admin" || session?.role === "admin") {
      setLinks([...baseLinks, { href: "/admin", label: "Admin" }]);
    } else {
      setLinks(baseLinks);
    }
  }, [pathname]);

  return (
    <nav className="rounded-[28px] border border-[#d9e0ee] bg-white/95 p-2 shadow-[0_12px_32px_rgba(16,42,86,0.08)] backdrop-blur">
      <div className="grid grid-cols-2 gap-2">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-2 py-3 text-center text-[13px] font-black transition active:scale-[0.98] ${
                active
                  ? "bg-[#102a56] text-white shadow-[0_10px_22px_rgba(16,42,86,0.28)]"
                  : "bg-[#eef3fb] text-[#102a56] hover:bg-[#e1e9f5]"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}