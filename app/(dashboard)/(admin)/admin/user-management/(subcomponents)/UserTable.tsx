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
import { ArrowDown, ArrowUp, MoreHorizontal, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import EditUserDialog from "./EditUserDialog";
import DeleteUserDialog from "./DeleteUserDialog";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

type SortField = "firstname" | "lastname" | "email" | "role" | "company";
type SortDirection = "asc" | "desc";

const UserTable = ({
  users,
  company_users,
  companies,
}: {
  users: UserProfile[];
  company_users: CompanyUser[];
  companies: Company[];
}) => {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>(users);
  const [sortField, setSortField] = useState<SortField>("lastname");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Get company name for a user
  const getCompanyName = (userId: string): string => {
    const companyUser = company_users.find((cu) => cu.user_id === userId);
    if (!companyUser) return "";

    const company = companies.find((c) => c.id === companyUser.company_id);
    return company?.name || "";
  };

  // Update filtered and sorted users when search term, sort field, sort direction, or users change
  useEffect(() => {
    let result = [...users];

    // First filter
    if (searchTerm.trim()) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.firstname?.toLowerCase().includes(lowerCaseSearch) ||
          user.lastname?.toLowerCase().includes(lowerCaseSearch) ||
          user.email?.toLowerCase().includes(lowerCaseSearch) ||
          user.role?.toLowerCase().includes(lowerCaseSearch) ||
          // Search in company name
          company_users
            .filter((cu) => cu.user_id === user.id)
            .some((cu) => {
              const companyName = companies.find(
                (c) => c.id === cu.company_id,
              )?.name;
              return companyName?.toLowerCase().includes(lowerCaseSearch);
            }),
      );
    }

    // Then sort
    result.sort((a, b) => {
      let valueA: string;
      let valueB: string;

      // Get values based on sort field
      switch (sortField) {
        case "firstname":
          valueA = a.firstname || "";
          valueB = b.firstname || "";
          break;
        case "lastname":
          valueA = a.lastname || "";
          valueB = b.lastname || "";
          break;
        case "email":
          valueA = a.email || "";
          valueB = b.email || "";
          break;
        case "role":
          valueA = a.role || "";
          valueB = b.role || "";
          break;
        case "company":
          valueA = getCompanyName(a.id);
          valueB = getCompanyName(b.id);
          break;
        default:
          valueA = a.lastname || "";
          valueB = b.lastname || "";
      }

      // Compare values based on sort direction
      if (sortDirection === "asc") {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });

    setFilteredUsers(result);
  }, [searchTerm, sortField, sortDirection, users, company_users, companies]);

  const handleUserUpdated = () => {
    setRefreshKey((prev) => prev + 1);
    router.refresh();
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Render sort indicator
  const renderSortIndicator = (field: SortField) => {
    if (field !== sortField) return null;

    return sortDirection === "asc" ? (
      <ArrowUp className="ml-1 inline h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 inline h-4 w-4" />
    );
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Suche nach Name, E-Mail, Rolle oder Unternehmen..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            onClick={() => setSearchTerm("")}
            aria-label="Suche zurücksetzen"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          {filteredUsers.length}{" "}
          {filteredUsers.length === 1 ? "Benutzer" : "Benutzer"} gefunden
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-sm text-muted-foreground">
              Keine Benutzer gefunden
            </p>
            {searchTerm && (
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                onClick={() => setSearchTerm("")}
              >
                Suche zurücksetzen
              </Button>
            )}
          </div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("firstname")}
              >
                Vorname {renderSortIndicator("firstname")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("lastname")}
              >
                Nachname {renderSortIndicator("lastname")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email {renderSortIndicator("email")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("role")}
              >
                Rolle {renderSortIndicator("role")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("company")}
              >
                Unternehmen {renderSortIndicator("company")}
              </TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={`${user.id}-${refreshKey}`}>
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
                        <EditUserDialog
                          user={user}
                          companies={companies}
                          companyUsers={company_users}
                          onUserUpdated={handleUserUpdated}
                        />
                        <DeleteUserDialog
                          user={user}
                          onUserDeleted={handleUserUpdated}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default UserTable;
