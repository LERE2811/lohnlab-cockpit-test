"use client";

import { StatusStep } from "../components/StatusStep";
import { UserCheck } from "lucide-react";

export const VideoIdentificationCompletedStep = () => {
  return (
    <StatusStep
      title="Videoidentifizierung abgeschlossen"
      description="Status der Videoidentifizierung"
      icon={UserCheck}
      statusText="Videoidentifizierung erfolgreich abgeschlossen"
      details="Ihre Videoidentifizierung wurde erfolgreich abgeschlossen. givve® wird nun Ihre Karten produzieren und Ihnen eine initiale Rechnung zusenden."
      nextActionText="Sie erhalten in Kürze eine E-Mail mit der initialen Rechnung für Ihre givve® Cards."
    />
  );
};
