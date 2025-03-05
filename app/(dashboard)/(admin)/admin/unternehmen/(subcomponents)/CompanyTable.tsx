"use client";
import { Company } from "@/shared/model";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/helper";
import { Ansprechpartner } from "@/shared/model";
import {
  ArrowDown,
  ArrowUp,
  MoreHorizontal,
  Search,
  X,
  FileText,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { DetailsDialog } from "./DetailsDialog";
import { supabase } from "@/utils/supabase/client";
import { EditCompanyDialog } from "./EditCompanyDialog";
import { DeleteCompanyDialog } from "./DeleteCompanyDialog";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

type SortField = "name" | "vertriebspartner" | "ansprechpartner" | "created_at";
type SortDirection = "asc" | "desc";

export const CompanyTable = ({
  companies,
  ansprechpartnerData,
}: {
  companies: Company[] | null;
  ansprechpartnerData: Ansprechpartner[] | null;
}) => {
  const router = useRouter();
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [subsidiaries, setSubsidiaries] = useState<any[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(
    companies || [],
  );
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Get ansprechpartner name for a company
  const getAnsprechpartnerName = (companyId: string): string => {
    const ansprechpartner = ansprechpartnerData?.find(
      (a) => a.company_id === companyId,
    );
    if (!ansprechpartner) return "";
    return `${ansprechpartner.firstname || ""} ${ansprechpartner.lastname || ""}`.trim();
  };

  // Update filtered and sorted companies when search term, sort field, sort direction, or companies change
  useEffect(() => {
    if (!companies) {
      setFilteredCompanies([]);
      return;
    }

    let result = [...companies];

    // First filter
    if (searchTerm.trim()) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        (company) =>
          company.name?.toLowerCase().includes(lowerCaseSearch) ||
          company.vertriebspartner?.toLowerCase().includes(lowerCaseSearch) ||
          getAnsprechpartnerName(company.id)
            .toLowerCase()
            .includes(lowerCaseSearch),
      );
    }

    // Then sort
    result.sort((a, b) => {
      let valueA: string | Date;
      let valueB: string | Date;

      // Get values based on sort field
      switch (sortField) {
        case "name":
          valueA = a.name || "";
          valueB = b.name || "";
          break;
        case "vertriebspartner":
          valueA = a.vertriebspartner || "";
          valueB = b.vertriebspartner || "";
          break;
        case "ansprechpartner":
          valueA = getAnsprechpartnerName(a.id);
          valueB = getAnsprechpartnerName(b.id);
          break;
        case "created_at":
          valueA = a.created_at ? new Date(a.created_at) : new Date(0);
          valueB = b.created_at ? new Date(b.created_at) : new Date(0);
          // For dates, we compare directly
          if (sortDirection === "asc") {
            return valueA.getTime() - valueB.getTime();
          } else {
            return valueB.getTime() - valueA.getTime();
          }
        default:
          valueA = a.name || "";
          valueB = b.name || "";
      }

      // For strings, we use localeCompare
      if (typeof valueA === "string" && typeof valueB === "string") {
        if (sortDirection === "asc") {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      }

      return 0;
    });

    setFilteredCompanies(result);
  }, [
    searchTerm,
    sortField,
    sortDirection,
    companies,
    ansprechpartnerData,
    refreshKey,
  ]);

  const handleDetailsClick = async (company: Company) => {
    setSelectedCompany(company);
    // Fetch subsidiaries for the selected company
    const { data: subsidiariesData } = await supabase
      .from("subsidiaries")
      .select("*")
      .eq("company_id", company.id);
    setSubsidiaries(subsidiariesData);
    setIsDetailsOpen(true);
  };

  const handleCompanyUpdated = () => {
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

  if (!companies || companies.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        <p>Noch keine Unternehmen vorhanden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Suche nach Unternehmen, Vertriebspartner oder Ansprechpartner..."
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
          {filteredCompanies.length}{" "}
          {filteredCompanies.length === 1 ? "Unternehmen" : "Unternehmen"}{" "}
          gefunden
        </div>
      )}

      {filteredCompanies.length === 0 ? (
        <div className="flex h-40 w-full items-center justify-center rounded-md border border-dashed">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-sm text-muted-foreground">
              Keine Unternehmen gefunden
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
                onClick={() => handleSort("name")}
              >
                Name {renderSortIndicator("name")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("vertriebspartner")}
              >
                Vertriebspartner {renderSortIndicator("vertriebspartner")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("ansprechpartner")}
              >
                Ansprechpartner {renderSortIndicator("ansprechpartner")}
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                Erstellt am {renderSortIndicator("created_at")}
              </TableHead>
              <TableHead className="w-[50px]">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.map((company) => (
              <TableRow key={`${company.id}-${refreshKey}`}>
                <TableCell>{company.name}</TableCell>
                <TableCell>{company.vertriebspartner}</TableCell>
                <TableCell>
                  {
                    ansprechpartnerData?.find(
                      (ansprechpartner) =>
                        ansprechpartner.company_id === company.id,
                    )?.firstname
                  }{" "}
                  {
                    ansprechpartnerData?.find(
                      (ansprechpartner) =>
                        ansprechpartner.company_id === company.id,
                    )?.lastname
                  }
                </TableCell>
                <TableCell>{formatDate(company.created_at)}</TableCell>
                <TableCell>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2">
                      <div className="flex flex-col space-y-1">
                        <EditCompanyDialog
                          company={company}
                          ansprechpartner={
                            ansprechpartnerData?.find(
                              (a) => a.company_id === company.id,
                            ) || null
                          }
                          onCompanyUpdated={handleCompanyUpdated}
                        />
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleDetailsClick(company)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Details
                        </Button>
                        <DeleteCompanyDialog
                          company={company}
                          onCompanyDeleted={handleCompanyUpdated}
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

      <DetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        company={selectedCompany}
        ansprechpartner={
          selectedCompany
            ? ansprechpartnerData?.find(
                (a) => a.company_id === selectedCompany.id,
              ) || null
            : null
        }
        subsidiaries={subsidiaries}
      />
    </div>
  );
};
