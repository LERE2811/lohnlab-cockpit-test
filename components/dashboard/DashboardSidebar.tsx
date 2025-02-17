"use client";

import { cn } from "@/lib/utils";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Logo } from "@/components/ui/logo";
import {
  LayoutDashboard,
  Users,
  Settings,
  Building2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/user-context";

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Mitarbeiter",
    href: "/mitarbeiter",
    icon: Users,
  },
  {
    title: "Unternehmen",
    href: "/unternehmen",
    icon: Building2,
  },
  {
    title: "Optimierung",
    href: "/optimierung",
    icon: Plus,
  },
  {
    title: "Benutzerverwaltung",
    href: "/users",
    icon: Users,
  },
];

const sidebarAdminItems: SidebarItem[] = [
  {
    title: "Unternehmen",
    href: "/admin/unternehmen",
    icon: Building2,
  },
  {
    title: "Benutzerverwaltung",
    href: "/admin/user-management",
    icon: Users,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="bg-card">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-start px-4">
            <Link href="/dashboard">
              <Logo />
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-4">
            <nav className="grid gap-1 px-2">
              {sidebarItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
          {user?.role === "Admin" && (
            <div className="flex flex-col gap-2 border-t p-3 text-sm">
              <h3 className="text-sm font-medium">Admin</h3>
              {sidebarAdminItems.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          )}
          <div className="flex flex-col gap-2 border-t p-3 text-sm">
            <Link href="https://www.lohnlab.de/dsgvo">Datenschutz</Link>
            <Link href="https://www.lohnlab.de/impressum">Impressum</Link>
          </div>
        </div>
      </Sidebar>
    </SidebarProvider>
  );
}
