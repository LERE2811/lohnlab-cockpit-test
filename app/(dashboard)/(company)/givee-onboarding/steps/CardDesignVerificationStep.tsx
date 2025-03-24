"use client";

import { StatusStep } from "../components/StatusStep";
import { CreditCard } from "lucide-react";

export const CardDesignVerificationStep = () => {
  return (
    <StatusStep
      title="Kartendesign zur Überprüfung"
      description="Status des Kartendesigns"
      icon={CreditCard}
      statusText="Kartendesign wurde zur Überprüfung eingereicht"
      details="Ihr Kartendesign wurde zur Überprüfung an givve® weitergeleitet. Die Prüfung kann 3-5 Werktage in Anspruch nehmen."
      nextActionText="Sobald Ihr Design geprüft wurde, werden Sie per E-Mail benachrichtigt."
    />
  );
};
