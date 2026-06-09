"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText,
  FolderKanban,
  LayoutDashboard,
  Network,
  WandSparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard
  },
  {
    href: "/projects",
    label: "Projects",
    icon: FolderKanban
  },
  {
    href: "/memory",
    label: "Memory",
    icon: BookOpenText
  },
  {
    href: "/skills",
    label: "Skills",
    icon: WandSparkles
  }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-border bg-background/95 md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
      <div className="flex h-full flex-col">
        <Link href="/" className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Network className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-base font-semibold">AgentDock</span>
            <span className="block text-xs text-muted-foreground">Project brain</span>
          </span>
        </Link>

        <nav className="flex gap-2 overflow-x-auto px-3 pb-4 md:flex-col md:overflow-visible">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-w-fit items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                  isActive && "bg-secondary text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden p-5 md:block">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium">AgentDock MVP</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Local project context for coding agents. No auth, backend, or CLI yet.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
