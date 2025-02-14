import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Company, Subsidiary, Ansprechpartner } from "@/shared/model";
import { formatDate } from "@/utils/helper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
  ansprechpartner: Ansprechpartner | null;
  subsidiaries: Subsidiary[] | null;
}

export const DetailsDialog = ({
  open,
  onOpenChange,
  company,
  ansprechpartner,
  subsidiaries,
}: DetailsDialogProps) => {
  if (!company) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Unternehmensdetails</DialogTitle>
          <DialogDescription>Details für {company.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Unternehmensinformationen</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Name
                </p>
                <p>{company.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Vertriebspartner
                </p>
                <p>{company.vertriebspartner}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Erstellt am
                </p>
                <p>{formatDate(company.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Ansprechpartner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Ansprechpartner</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {ansprechpartner ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Name
                    </p>
                    <p>
                      {ansprechpartner.firstname} {ansprechpartner.lastname}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      E-Mail
                    </p>
                    <p>{ansprechpartner.email}</p>
                  </div>
                </>
              ) : (
                <p className="col-span-2 text-muted-foreground">
                  Kein Ansprechpartner vorhanden
                </p>
              )}
            </CardContent>
          </Card>

          {/* Subsidiaries Information */}
          <Card>
            <CardHeader>
              <CardTitle>Gesellschaften</CardTitle>
              <CardDescription>
                {subsidiaries?.length || 0} Gesellschaften gefunden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subsidiaries && subsidiaries.length > 0 ? (
                subsidiaries.map((subsidiary, index) => (
                  <div
                    key={subsidiary.id}
                    className="space-y-2 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Gesellschaft {index + 1}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Name
                        </p>
                        <p>{subsidiary.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Rechtsform
                        </p>
                        <p>{subsidiary.legal_form}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Erstellt am
                        </p>
                        <p>{formatDate(subsidiary.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  Keine Gesellschaften vorhanden
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
