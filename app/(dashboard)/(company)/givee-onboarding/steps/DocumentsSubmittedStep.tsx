"use client";

import { StatusStep } from "../components/StatusStep";
import { Send } from "lucide-react";

export const DocumentsSubmittedStep = () => {
  return (
    <StatusStep
      title="Unterlagen bei givve eingereicht"
      description="Status der Einreichung Ihrer Unterlagen"
      icon={Send}
      statusText="Unterlagen wurden an givve® weitergeleitet"
      details="Ihre unterschriebenen Dokumente wurden an givve® weitergeleitet. Die Prüfung Ihrer Unterlagen kann 1-3 Werktage in Anspruch nehmen."
      nextActionText="Sie erhalten in Kürze einen Link zur Videoidentifizierung per E-Mail. Bitte überprüfen Sie regelmäßig Ihren E-Mail-Eingang."
    />
  );
};
