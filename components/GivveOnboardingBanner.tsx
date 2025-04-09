"use client";

import { useRouter } from "next/navigation";
import { useCompany } from "@/context/company-context";
import { Button } from "@/components/ui/button";
import { CreditCard, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

export const GivveOnboardingBanner = () => {
  const { subsidiary } = useCompany();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!subsidiary) return;

      try {
        const { data: progressData, error } = await supabase
          .from("givve_onboarding_progress")
          .select("completed")
          .eq("subsidiary_id", subsidiary.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching givve onboarding progress:", error);
          return;
        }

        setIsCompleted(!!progressData?.completed);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      }
    };

    if (subsidiary) {
      checkOnboardingStatus();
    }
  }, [subsidiary]);

  // Don't show the banner if there's no subsidiary, if givve card is not enabled, if banner is dismissed, or if onboarding is completed
  if (!subsidiary || !subsidiary.has_givve_card || dismissed || isCompleted) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-lg border border-green-200 bg-green-50 px-4 py-4 shadow-sm dark:border-green-800 dark:bg-green-950/30">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6 rounded-full p-0 text-green-500 opacity-70 hover:bg-green-100 hover:opacity-100 dark:text-green-300 dark:hover:bg-green-900/50"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>

        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-800">
            <CreditCard className="h-5 w-5 text-green-600 dark:text-green-300" />
          </div>

          <div className="flex-1">
            <h5 className="mb-1 text-base font-medium text-green-800 dark:text-green-200">
              givve® Card für {subsidiary.name}
            </h5>
            <p className="text-sm text-green-600 dark:text-green-300">
              Sie haben die givve® Card für {subsidiary.name} aktiviert. Führen
              Sie den Onboarding-Prozess durch, um Ihre givve® Cards zu
              bestellen.
            </p>
          </div>

          <div className="flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="border-green-500 bg-white text-green-600 hover:bg-green-50 dark:border-green-400 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900/50"
              onClick={() => router.push(`/givee-onboarding`)}
            >
              Zum givve® Onboarding
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
