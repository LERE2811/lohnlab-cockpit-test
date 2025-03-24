"use client";

import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/ui/logo";
import {
  LayoutDashboard,
  Users,
  Settings,
  Building2,
  Plus,
  LogOut,
  AlertCircle,
  X,
  ChevronDown,
  Building,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import { useCompany } from "@/context/company-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Roles } from "@/shared/model";
import { useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { GivveOnboardingBanner } from "@/components/GivveOnboardingBanner";

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

export function OnboardingBanner() {
  const router = useRouter();
  const { company, subsidiary, isLoading } = useCompany();
  const [dismissed, setDismissed] = useState(false);

  // Don't show the banner if data is still loading or onboarding is completed or dismissed
  if (
    isLoading ||
    !subsidiary ||
    subsidiary.onboarding_completed ||
    dismissed
  ) {
    return null;
  }

  // Calculate progress percentage based on the current step
  const totalSteps = 9; // Total number of onboarding steps
  const currentStep = subsidiary.onboarding_step || 1;
  const progressPercentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full border-b border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
      <div className="container mx-auto px-4 py-3">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-6 w-6 rounded-full p-0 text-blue-500 opacity-70 hover:bg-blue-100 hover:opacity-100 dark:text-blue-300 dark:hover:bg-blue-900/50"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>

          <div className="flex flex-col space-y-3 pr-8 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-800">
              <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </div>

            <div className="flex-1">
              <h5 className="mb-1 text-base font-medium text-blue-800 dark:text-blue-200">
                Onboarding für {subsidiary.name} nicht abgeschlossen
              </h5>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                Sie haben das Onboarding für {subsidiary.name} begonnen, aber
                noch nicht abgeschlossen. Aktueller Fortschritt:{" "}
                {progressPercentage}%
              </p>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-800">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500 dark:bg-blue-400"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="border-blue-500 bg-white text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900/50"
                onClick={() => router.push(`/onboarding`)}
              >
                Onboarding fortsetzen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
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
  );
}

export function DashboardHeader() {
  const router = useRouter();
  const { user } = useUser();
  const {
    company,
    subsidiary,
    availableCompanies,
    availableSubsidiaries,
    setSelectedCompany,
    setSelectedSubsidiary,
    isLoading,
  } = useCompany();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Don't show header for users without a role or during loading
  if (!user || isLoading) {
    return null;
  }

  // Only show company switcher for admin and kundenbetreuer
  const showCompanySwitcher =
    user.role === Roles.ADMIN || user.role === Roles.KUNDENBETREUER;

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 w-full items-center justify-end gap-4 px-6">
        <div className="flex items-center gap-4">
          {/* Company Switcher */}
          {showCompanySwitcher && availableCompanies.length > 0 && (
            <>
              <Select
                value={company?.id}
                onValueChange={async (value) => {
                  const selectedCompany = availableCompanies.find(
                    (c) => c.id === value,
                  );
                  if (selectedCompany) {
                    await setSelectedCompany(selectedCompany);
                  }
                }}
              >
                <SelectTrigger className="w-auto min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 shrink-0" />
                    <div className="flex flex-col items-start">
                      <SelectValue placeholder="Unternehmen auswählen" />
                      <span className="text-xs text-muted-foreground">
                        Unternehmen
                      </span>
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {availableCompanies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Separator orientation="vertical" className="h-8" />
            </>
          )}

          {/* Subsidiary Switcher */}
          {company && availableSubsidiaries.length > 1 && (
            <>
              <Select
                value={subsidiary?.id}
                onValueChange={(value) => {
                  const selectedSubsidiary = availableSubsidiaries.find(
                    (s) => s.id === value,
                  );
                  if (selectedSubsidiary) {
                    setSelectedSubsidiary(selectedSubsidiary);
                  }
                }}
              >
                <SelectTrigger className="w-auto min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 shrink-0" />
                    <div className="flex flex-col items-start">
                      <SelectValue placeholder="Gesellschaft auswählen" />
                      <span className="text-xs text-muted-foreground">
                        Gesellschaft
                      </span>
                    </div>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {availableSubsidiaries.map((subsidiary) => (
                    <SelectItem key={subsidiary.id} value={subsidiary.id}>
                      {subsidiary.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {/* Display single subsidiary name without dropdown */}
          {company && availableSubsidiaries.length === 1 && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 shrink-0" />
              <div className="flex flex-col items-start">
                <span className="font-medium">
                  {availableSubsidiaries[0].name}
                </span>
                <span className="text-xs text-muted-foreground">
                  Gesellschaft
                </span>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex h-8 items-center gap-2 px-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.firstname} />
                <AvatarFallback>
                  {user?.firstname
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                  {user?.lastname
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">
                  {user?.firstname} {user?.lastname}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user?.role}
                </span>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="end">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                  Einstellungen
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-red-600 hover:bg-red-100 hover:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

export function DashboardNavigation({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen">
        <DashboardSidebar />
      </div>
      <SidebarInset className="flex flex-col">
        <OnboardingBanner />
        <GivveOnboardingBanner />
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
