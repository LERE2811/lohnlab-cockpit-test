"use client";

import { StatusStep } from "../components/StatusStep";
import { Video } from "lucide-react";

export const VideoIdentificationLinkStep = () => {
  return (
    <StatusStep
      title="Link zur Videoidentifizierung erhalten"
      description="Status der Videoidentifizierung"
      icon={Video}
      statusText="Link zur Videoidentifizierung wurde gesendet"
      details="Der Link zur Videoidentifizierung wurde an Ihre E-Mail-Adresse gesendet. Bitte führen Sie die Videoidentifizierung innerhalb der nächsten 7 Tage durch."
      nextActionText="Bitte klicken Sie auf den Link in der E-Mail und folgen Sie den Anweisungen zur Durchführung der Videoidentifizierung."
    />
  );
};
