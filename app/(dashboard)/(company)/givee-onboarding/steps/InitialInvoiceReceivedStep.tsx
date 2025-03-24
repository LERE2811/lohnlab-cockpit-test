"use client";

import { StatusStep } from "../components/StatusStep";
import { Receipt } from "lucide-react";

export const InitialInvoiceReceivedStep = () => {
  return (
    <StatusStep
      title="Initiale Rechnung erhalten"
      description="Status der Rechnung"
      icon={Receipt}
      statusText="Initiale Rechnung wurde zugestellt"
      details="Die initiale Rechnung für Ihre givve® Cards wurde an Ihre E-Mail-Adresse gesendet. Bitte überweisen Sie den Rechnungsbetrag innerhalb der angegebenen Zahlungsfrist."
      nextActionText="Nach Zahlungseingang werden Ihre Karten produziert und versendet."
    />
  );
};
