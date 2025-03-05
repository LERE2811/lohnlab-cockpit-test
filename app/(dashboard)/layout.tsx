"use client";

import { UserProvider } from "@/context/user-context";
import { CompanyProvider } from "@/context/company-context";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DashboardNavigation } from "@/components/dashboard/DashboardNavigation";
import { Toaster } from "@/components/ui/toaster";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <UserProvider>
      <CompanyProvider>
        <ThemeProvider>
          <DashboardNavigation>{children}</DashboardNavigation>
          <Toaster />
        </ThemeProvider>
      </CompanyProvider>
    </UserProvider>
  );
}
