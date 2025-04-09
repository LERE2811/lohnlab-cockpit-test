"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle } from "lucide-react";

export function TransparenzregisterInfoDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle className="h-5 w-5 text-blue-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transparenzregister - Information</DialogTitle>
          <DialogDescription>
            Wichtige Informationen zum Transparenzregister
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Das Transparenzregister ist ein amtliches Register, in dem
            Informationen über die wirtschaftlich Berechtigten von juristischen
            Personen des Privatrechts und eingetragenen Personengesellschaften
            erfasst werden.
          </p>

          <h3 className="text-sm font-medium">
            Was ist ein Transparenzregisterauszug?
          </h3>
          <p className="text-sm text-muted-foreground">
            Ein Transparenzregisterauszug ist ein offizielles Dokument, das
            Auskunft über die wirtschaftlich Berechtigten eines Unternehmens
            gibt. Wirtschaftlich Berechtigte sind natürliche Personen, die
            unmittelbar oder mittelbar mehr als 25% der Kapitalanteile oder
            Stimmrechte kontrollieren oder auf vergleichbare Weise Kontrolle
            ausüben.
          </p>

          <h3 className="text-sm font-medium">
            Wie erhalte ich einen Transparenzregisterauszug?
          </h3>
          <p className="text-sm text-muted-foreground">
            Sie können einen Transparenzregisterauszug online über das Portal
            des Bundesanzeiger Verlags beantragen:{" "}
            <a
              href="https://www.transparenzregister.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              www.transparenzregister.de
            </a>
          </p>

          <h3 className="text-sm font-medium">
            Warum wird dieser Auszug benötigt?
          </h3>
          <p className="text-sm text-muted-foreground">
            Nach dem Geldwäschegesetz (GwG) sind wir verpflichtet, die
            wirtschaftlich Berechtigten unserer Geschäftspartner zu
            identifizieren. Der Transparenzregisterauszug ist ein wichtiges
            Dokument, um dieser Pflicht nachzukommen und Geldwäsche zu
            verhindern.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
