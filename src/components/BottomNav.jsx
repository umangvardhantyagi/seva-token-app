"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getLocalSession } from "@/lib/authService";

const baseLinks = [
  { href: "/", label: "Home" },
  { href: "/assign", label: "Assign" },
  { href: "/check", label: "Check" },
  { href: "/today", label: "Today" },
  { href: "/profile", label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [links, setLinks] = useState(baseLinks);

  useEffect(() => {
    const session = getLocalSession();

    if (session?.loginId === "admin") {
      setLinks([...baseLinks, { href: "/admin", label: "Admin" }]);
    } else {
      setLinks(baseLinks);
    }
  }, [pathname]);

  return (
    <nav className="rounded-[28px] border border-[#e6d5c3] bg-[#fffaf3]/95 p-2 shadow-[0_12px_32px_rgba(77,50,31,0.08)] backdrop-blur">
      <div className="grid grid-cols-3 gap-2">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-2 py-3 text-center text-[13px] font-black transition active:scale-[0.98] ${
                active
                  ? "bg-[#7b4f32] text-white shadow-[0_10px_22px_rgba(123,79,50,0.26)]"
                  : "bg-[#f7ecdf] text-[#6d5543] hover:bg-[#f1dfcd]"
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