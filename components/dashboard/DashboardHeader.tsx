"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export function DashboardHeader() {
  const router = useRouter();
  // TODO: Replace with actual user data from your auth context/store
  const user = {
    name: "Max Mustermann",
    role: "Administrator",
    email: "max@example.com",
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="position fixed left-0 right-0 top-0 border-b bg-background">
      <div className="flex h-14 w-full items-center justify-end gap-4 px-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="relative flex h-8 items-center gap-2 px-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.role}
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
                <Link href="/dashboard/settings">
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
