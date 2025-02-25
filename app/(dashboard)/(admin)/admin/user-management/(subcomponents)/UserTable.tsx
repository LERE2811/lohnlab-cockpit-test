"use client";

import { Company, CompanyUser, UserProfile } from "@/shared/model";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const UserTable = ({
  users,
  company_users,
  companies,
}: {
  users: UserProfile[];
  company_users: CompanyUser[];
  companies: Company[];
}) => {
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"edit" | "delete" | null>(null);

  const handleEditUser = async (userId: string) => {
    setLoadingUserId(userId);
    setActionType("edit");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Noch nicht implementiert",
        description:
          "Die Bearbeitung von Benutzern ist noch nicht implementiert.",
        className: "border-yellow-500",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten.",
        className: "border-red-500",
      });
    } finally {
      setLoadingUserId(null);
      setActionType(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setLoadingUserId(userId);
    setActionType("delete");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Noch nicht implementiert",
        description: "Das Löschen von Benutzern ist noch nicht implementiert.",
        className: "border-yellow-500",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten.",
        className: "border-red-500",
      });
    } finally {
      setLoadingUserId(null);
      setActionType(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vorname</TableHead>
          <TableHead>Nachname</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rolle</TableHead>
          <TableHead>Unternehmen</TableHead>
          <TableHead className="text-right">Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.firstname}</TableCell>
            <TableCell>{user.lastname}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>{user.role}</TableCell>
            <TableCell>
              {user.role === "Admin"
                ? "Admin (Kein Unternehmen)"
                : company_users
                    .filter((company) => company.user_id === user.id)
                    .map(
                      (company) =>
                        companies.find((c) => c.id === company.company_id)
                          ?.name,
                    )[0] || "Keine Unternehmen"}
            </TableCell>
            <TableCell className="text-right">
              <Popover>
                <PopoverTrigger className="inline-flex h-8 w-8 items-center justify-center gap-2 whitespace-nowrap rounded-md p-0 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2">
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleEditUser(user.id)}
                      disabled={loadingUserId === user.id}
                    >
                      {loadingUserId === user.id && actionType === "edit" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Lädt...
                        </>
                      ) : (
                        "Bearbeiten"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:bg-red-100 hover:text-red-600"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={loadingUserId === user.id}
                    >
                      {loadingUserId === user.id && actionType === "delete" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Lädt...
                        </>
                      ) : (
                        "Löschen"
                      )}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
