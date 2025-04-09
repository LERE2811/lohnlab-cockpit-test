"use client";

import {
  GivveOnboardingProvider,
  GivveOnboardingStep,
  useGivveOnboarding,
} from "./(components)/context/givve-onboarding-context";
import { StepSidebar } from "@/app/(dashboard)/(company)/givee-onboarding/(components)/components/StepSidebar";
import { CardTypeStep } from "./(components)/steps/CardTypeStep";
import { RequiredDocumentsStep } from "./(components)/steps/RequiredDocumentsStep";
import { OrderFormsStep } from "./(components)/steps/OrderFormsStep";
import { SignedFormsStep } from "./(components)/steps/SignedFormsStep";
import { CompletedStep } from "./(components)/steps/CompletedStep";
import { useCompany } from "@/context/company-context";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase/client";

// Component to render the current step
const CurrentStep = () => {
  const { currentStep } = useGivveOnboarding();

  switch (currentStep) {
    case GivveOnboardingStep.CARD_TYPE:
      return <CardTypeStep />;
    case GivveOnboardingStep.REQUIRED_DOCUMENTS:
      return <RequiredDocumentsStep />;
    case GivveOnboardingStep.ORDER_FORMS:
      return <OrderFormsStep />;
    case GivveOnboardingStep.SIGNED_FORMS:
      return <SignedFormsStep />;
    case GivveOnboardingStep.COMPLETED:
      return <CompletedStep />;
    default:
      return (
        <div className="rounded-lg bg-muted p-6">
          <h3 className="mb-2 text-lg font-medium">
            Schritt wird implementiert
          </h3>
          <p className="text-muted-foreground">
            Dieser Schritt wird derzeit implementiert. Bitte versuchen Sie es
            später erneut.
          </p>
        </div>
      );
  }
};

// Wrapper component that checks if a subsidiary is selected and has givve card enabled
const GivveOnboardingWrapper = () => {
  const { subsidiary, isLoading: isCompanyLoading } = useCompany();
  const router = useRouter();
  const [isProgressLoading, setIsProgressLoading] = useState(true);

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

        if (progressData?.completed) {
          router.push("/givee-onboarding/status");
          return;
        }
      } catch (error) {
        console.error("Error checking onboarding status:", error);
      } finally {
        setIsProgressLoading(false);
      }
    };

    if (subsidiary) {
      checkOnboardingStatus();
    }
  }, [subsidiary, router]);

  if (isCompanyLoading || isProgressLoading) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!subsidiary || !subsidiary.has_givve_card) {
    return null; // Will redirect in the useEffect
  }

  return (
    <GivveOnboardingProvider>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-2xl font-bold">
          givve® Card Onboarding: {subsidiary.name}
        </h1>

        <div className="flex flex-col gap-6 md:flex-row">
          <StepSidebar />
          <div className="flex-1">
            <CurrentStep />
          </div>
        </div>
      </div>
    </GivveOnboardingProvider>
  );
};

const GivveOnboardingPage = () => {
  return <GivveOnboardingWrapper />;
};

export default GivveOnboardingPage;
