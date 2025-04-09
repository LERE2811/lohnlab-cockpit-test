"use client";

import { StepLayout } from "./StepLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileWarning } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatusStepProps {
  title: string;
  description: string;
  icon: LucideIcon;
  statusText: string;
  details: string;
  nextActionText?: string;
}

export const StatusStep = ({
  title,
  description,
  icon: Icon,
  statusText,
  details,
  nextActionText,
}: StatusStepProps) => {
  return (
    <StepLayout
      title={title}
      description={description}
      disableNext={true}
      disablePrev={true}
    >
      <div className="space-y-6">
        <Alert
          variant="default"
          className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
        >
          <FileWarning className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            Dies ist ein Platzhalter. Die vollständige Funktionalität folgt in
            weiteren Updates.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Icon className="mr-2 h-5 w-5 text-primary" />
              {statusText}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-relaxed text-foreground">
              <p className="mb-4">{details}</p>
              {nextActionText && (
                <div className="mt-4 rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">Nächster Schritt:</p>
                  <p className="text-sm text-muted-foreground">
                    {nextActionText}
                  </p>
                </div>
              )}
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </StepLayout>
  );
};
