"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGivveOnboarding } from "../context/givve-onboarding-context";
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";

interface StepLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave?: () => void;
  disableNext?: boolean;
  disablePrev?: boolean;
  isProcessing?: boolean;
  customActions?: React.ReactNode;
}

export const StepLayout = ({
  title,
  description,
  children,
  onSave,
  disableNext = false,
  disablePrev = false,
  isProcessing = false,
  customActions,
}: StepLayoutProps) => {
  const { prevStep, nextStep, isSaving } = useGivveOnboarding();

  const processing = isProcessing || isSaving;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-card px-6 py-4">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="bg-white px-6 py-6 dark:bg-background">{children}</div>

        <div className="flex items-center justify-between border-t border-border bg-muted/20 px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={prevStep}
            disabled={disablePrev || processing}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>

          <div className="flex items-center space-x-2">
            {customActions}

            {onSave && (
              <Button
                variant="default"
                size="sm"
                disabled={processing}
                onClick={onSave}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Speichern & Weiter
                  </>
                )}
              </Button>
            )}

            {!onSave && (
              <Button
                variant="default"
                size="sm"
                onClick={nextStep}
                disabled={disableNext || processing}
              >
                Weiter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
