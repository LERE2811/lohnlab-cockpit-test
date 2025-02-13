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

export const CompanyTable = ({
  companies,
}: {
  companies: Company[] | null;
}) => {
  if (!companies || companies.length === 0) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        <p>Noch keine Unternehmen vorhanden.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Vertriebspartner</TableHead>
          <TableHead>Erstellt am</TableHead>
          <TableHead>Aktionen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {companies.map((company) => (
          <TableRow key={company.id}>
            <TableCell>{company.name}</TableCell>
            <TableCell>{company.vertriebspartner}</TableCell>
            <TableCell>{company.created_at.toLocaleDateString()}</TableCell>
            <TableCell>
              <Button>Bearbeiten</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
