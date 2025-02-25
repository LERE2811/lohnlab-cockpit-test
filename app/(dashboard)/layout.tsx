"use client";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/user-context";
import { CompanyProvider } from "@/context/company-context";
import { ThemeProvider } from "@/components/ThemeProvider";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <UserProvider>
      <CompanyProvider>
        <ThemeProvider>
          <SidebarProvider>
            <div className="flex h-screen">
              <DashboardSidebar />
            </div>
            <SidebarInset className="flex flex-col">
              <DashboardHeader />
              <main className="flex-1 overflow-y-auto p-6 pt-16">
                {children}
              </main>
              <Toaster />
            </SidebarInset>
          </SidebarProvider>
        </ThemeProvider>
      </CompanyProvider>
    </UserProvider>
  );
}
