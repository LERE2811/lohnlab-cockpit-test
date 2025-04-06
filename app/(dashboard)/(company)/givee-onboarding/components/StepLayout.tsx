"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGivveOnboarding } from "../context/givve-onboarding-context";
import { ArrowLeft, ArrowRight, Save, Loader2, Info } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StepLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave?: () => Promise<void>;
  disableNext?: boolean;
  disablePrev?: boolean;
  isProcessing?: boolean;
  customActions?: React.ReactNode;
  saveButtonText?: string;
  saveButtonIcon?: React.ReactNode;
  status?: string;
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
  saveButtonText,
  saveButtonIcon,
  status,
}: StepLayoutProps) => {
  const { prevStep, nextStep, isSaving } = useGivveOnboarding();
  const [localProcessing, setLocalProcessing] = useState(false);

  const processing = isProcessing || isSaving || localProcessing;

  // Handle save and next
  const handleSaveAndNext = async () => {
    if (onSave) {
      setLocalProcessing(true);
      try {
        await onSave();
        // No need to call nextStep() here as saveProgress in the context should do it
      } catch (error) {
        console.error("Error saving step:", error);
      } finally {
        setLocalProcessing(false);
      }
    } else {
      // If no onSave method is provided, just move to the next step
      nextStep();
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {status && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="ml-2 flex items-center gap-1"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>{status}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Status wird vom Administrator aktualisiert</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
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

            <Button
              variant="default"
              size="sm"
              disabled={disableNext || processing}
              onClick={handleSaveAndNext}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {onSave ? "Speichern..." : "Weiter..."}
                </>
              ) : (
                <>
                  {onSave ? (
                    <>
                      {saveButtonIcon || <Save className="mr-2 h-4 w-4" />}
                      {saveButtonText || "Speichern & Weiter"}
                    </>
                  ) : (
                    <>
                      Weiter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
