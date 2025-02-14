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
import { MoreHorizontal } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { DetailsDialog } from "./DetailsDialog";
import { supabase } from "@/utils/supabase/client";

export const CompanyTable = ({
  companies,
  ansprechpartnerData,
}: {
  companies: Company[] | null;
  ansprechpartnerData: Ansprechpartner[] | null;
}) => {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [subsidiaries, setSubsidiaries] = useState<any[] | null>(null);

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

  if (!companies || companies.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        <p>Noch keine Unternehmen vorhanden.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Vertriebspartner</TableHead>
            <TableHead>Ansprechpartner</TableHead>
            <TableHead>Erstellt am</TableHead>
            <TableHead className="w-[50px]">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
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
                      <Button variant="ghost" className="w-full justify-start">
                        Bearbeiten
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleDetailsClick(company)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:bg-red-100 hover:text-red-600"
                      >
                        Löschen
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
    </>
  );
};
