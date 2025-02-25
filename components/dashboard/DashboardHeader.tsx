"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogOut, Settings, Building2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/user-context";
import { useCompany } from "@/context/company-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Roles } from "@/shared/model";

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

  // Don't show switchers for users without a role or during loading
  if (!user || isLoading) {
    return null;
  }

  // Only show company switcher for admin and kundenbetreuer
  const showCompanySwitcher =
    user.role === Roles.ADMIN || user.role === Roles.KUNDENBETREUER;

  return (
    <header className="position fixed left-0 right-0 top-0 border-b bg-background">
      <div className="flex h-14 w-full items-center justify-end gap-4 px-6">
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
                <SelectTrigger className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <SelectValue placeholder="Unternehmen auswählen" />
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
              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          {/* Subsidiary Switcher */}
          {company && availableSubsidiaries.length > 0 && (
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
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Gesellschaft auswählen" />
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
