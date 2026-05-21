"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/assign", label: "Assign" },
  { href: "/check", label: "Check" },
  { href: "/today", label: "Today" },
  { href: "/profile", label: "Profile" },
  { href: "/admin", label: "Admin" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="rounded-[24px] border border-[#eadfce] bg-[#fffaf3] p-2 shadow-[0_10px_28px_rgba(90,64,43,0.06)]">
      <div className="grid grid-cols-3 gap-2">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-2xl px-2 py-3 text-center text-[13px] font-black transition ${
                active
                  ? "bg-[#7b4f32] text-white shadow-md"
                  : "bg-[#f8f0e7] text-[#6d5543]"
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