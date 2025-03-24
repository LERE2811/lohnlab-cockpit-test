"use client";

import { StatusStep } from "../components/StatusStep";
import { CircleDollarSign } from "lucide-react";

export const InitialInvoicePaidStep = () => {
  return (
    <StatusStep
      title="Initiale Rechnung bezahlt"
      description="Status der Zahlung"
      icon={CircleDollarSign}
      statusText="Zahlung eingegangen, Karten in Produktion"
      details="Ihre Zahlung ist bei givve® eingegangen. Ihre Karten befinden sich nun in der Produktion und werden in den nächsten 7-10 Werktagen an Ihre Adresse versendet."
      nextActionText="Sie erhalten eine Benachrichtigung, sobald Ihre Karten versendet wurden."
    />
  );
};
