"use client";

import {
  GivveOnboardingProvider,
  GivveOnboardingStep,
  useGivveOnboarding,
} from "./context/givve-onboarding-context";
import { StepSidebar } from "@/app/(dashboard)/(company)/givee-onboarding/components/StepSidebar";
import { CardTypeStep } from "./steps/CardTypeStep";
import { RequiredDocumentsStep } from "./steps/RequiredDocumentsStep";
import { OrderFormsStep } from "./steps/OrderFormsStep";
import { ReadyForSignatureStep } from "./steps/ReadyForSignatureStep";
import { SignedFormsStep } from "./steps/SignedFormsStep";
import { DocumentsSubmittedStep } from "./steps/DocumentsSubmittedStep";
import { VideoIdentificationLinkStep } from "./steps/VideoIdentificationLinkStep";
import { CardDesignVerificationStep } from "./steps/CardDesignVerificationStep";
import { VideoIdentificationCompletedStep } from "./steps/VideoIdentificationCompletedStep";
import { InitialInvoiceReceivedStep } from "./steps/InitialInvoiceReceivedStep";
import { InitialInvoicePaidStep } from "./steps/InitialInvoicePaidStep";
import { CompletedStep } from "./steps/CompletedStep";
import { useCompany } from "@/context/company-context";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
    case GivveOnboardingStep.READY_FOR_SIGNATURE:
      return <ReadyForSignatureStep />;
    case GivveOnboardingStep.SIGNED_FORMS:
      return <SignedFormsStep />;
    case GivveOnboardingStep.DOCUMENTS_SUBMITTED:
      return <DocumentsSubmittedStep />;
    case GivveOnboardingStep.VIDEO_IDENTIFICATION_LINK:
      return <VideoIdentificationLinkStep />;
    case GivveOnboardingStep.CARD_DESIGN_VERIFICATION:
      return <CardDesignVerificationStep />;
    case GivveOnboardingStep.VIDEO_IDENTIFICATION_COMPLETED:
      return <VideoIdentificationCompletedStep />;
    case GivveOnboardingStep.INITIAL_INVOICE_RECEIVED:
      return <InitialInvoiceReceivedStep />;
    case GivveOnboardingStep.INITIAL_INVOICE_PAID:
      return <InitialInvoicePaidStep />;
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

  // Redirect to dashboard if no subsidiary or givve card not enabled
  useEffect(() => {
    if (!isCompanyLoading && (!subsidiary || !subsidiary.has_givve_card)) {
      router.push("/dashboard");
    }
  }, [subsidiary, isCompanyLoading, router]);

  if (isCompanyLoading) {
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
