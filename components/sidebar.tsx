"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Filter, BarChart2, Settings, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Proposals", href: "/dashboard/proposals", icon: FileText },
  { name: "Filters", href: "/dashboard/filters", icon: Filter },
  { name: "Reports", href: "/dashboard/reports", icon: BarChart2 },
  { name: "Export", href: "/dashboard/export", icon: Download },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:block w-64 border-r bg-card h-[calc(100vh-4rem)] sticky top-16">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                  pathname === link.href
                    ? "bg-accent text-primary"
                    : "transparent"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
