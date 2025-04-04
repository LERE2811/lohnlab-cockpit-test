"use client";

import { StepLayout } from "../components/StepLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, FileWarning, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useGivveOnboarding } from "../context/givve-onboarding-context";
import { useCompany } from "@/context/company-context";
import { useState, useEffect } from "react";
import {
  GmbHForm,
  AGForm,
  OtherForm,
  GmbHCoKGForm,
  KgOhgForm,
  KdoerForm,
  GmbHUGForm,
  PartGForm,
  VereinGenossForm,
  EkForm,
  EinzelunternehmenForm,
  FreiberuflerForm,
  JuristischePersonForm,
  GbrForm,
} from "./legal-forms";

// Define the available legal forms
const LegalForm = {
  GMBH: "GmbH",
  UG: "UG",
  AG: "AG",
  EK: "e.K.",
  EINZELUNTERNEHMEN: "Einzelunternehmen",
  FREIBERUFLER: "Freiberufler",
  JURISTISCHE_PERSON: "juristische Person",
  OHG: "OHG",
  KG: "KG",
  GMBH_CO_KG: "GmbH & Co. KG",
  PARTG: "PartG",
  PARTG_MBB: "PartG mbB",
  VEREIN: "e.V.",
  GENOSSENSCHAFT: "eG",
  KDOER: "KdöR",
  GBR: "GbR",
  SONSTIGE: "Sonstige",
} as const;

export const RequiredDocumentsStep = () => {
  const { saveProgress, formData, updateFormData } = useGivveOnboarding();
  const { subsidiary } = useCompany();
  const [documentFormData, setDocumentFormData] = useState<any>({});

  // Get the legal form from the subsidiary
  const legalForm = subsidiary?.legal_form || "";

  useEffect(() => {
    // Initialize form data from the context
    setDocumentFormData(formData.documents || {});
  }, [formData]);

  const handleFieldsChange = (data: any) => {
    setDocumentFormData(data);
  };

  const handleContinue = async () => {
    // Save all the document form data to the onboarding context
    await saveProgress({
      requiresAdditionalDocuments: true,
      documents: documentFormData,
    });
  };

  // Get the appropriate legal form component
  const getLegalFormComponent = () => {
    // Normalize by removing whitespace and making uppercase for safer comparison
    const normalizedLegalForm = legalForm.replace(/\s+/g, "").toUpperCase();

    if (
      normalizedLegalForm.includes("GMBH") &&
      normalizedLegalForm.includes("KG")
    ) {
      return (
        <GmbHCoKGForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
        />
      );
    } else if (normalizedLegalForm === "GMBH" || normalizedLegalForm === "UG") {
      return (
        <GmbHUGForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
          legalForm={legalForm}
        />
      );
    } else if (
      normalizedLegalForm.includes("GMBH") &&
      !normalizedLegalForm.includes("KG")
    ) {
      return (
        <GmbHForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
        />
      );
    } else if (
      normalizedLegalForm.includes("AG") &&
      !normalizedLegalForm.includes("GMBH")
    ) {
      return (
        <AGForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
        />
      );
    } else if (normalizedLegalForm === "KG" || normalizedLegalForm === "OHG") {
      return (
        <KgOhgForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
          legalForm={legalForm}
        />
      );
    } else if (
      normalizedLegalForm === "KDÖR" ||
      normalizedLegalForm === "KDOER"
    ) {
      return (
        <KdoerForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
        />
      );
    } else if (normalizedLegalForm.includes("PARTG")) {
      return (
        <PartGForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
          legalForm={legalForm}
        />
      );
    } else if (normalizedLegalForm === "E.V." || normalizedLegalForm === "EG") {
      return (
        <VereinGenossForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
          legalForm={legalForm}
        />
      );
    } else if (normalizedLegalForm === "E.K.") {
      return (
        <EkForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
        />
      );
    } else if (normalizedLegalForm === "EINZELUNTERNEHMEN") {
      return (
        <EinzelunternehmenForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
        />
      );
    } else if (normalizedLegalForm === "FREIBERUFLER") {
      return (
        <FreiberuflerForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
        />
      );
    } else if (normalizedLegalForm === "JURISTISCHEPERSON") {
      return (
        <JuristischePersonForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
        />
      );
    } else if (normalizedLegalForm === "GBR") {
      return (
        <GbrForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
        />
      );
    } else {
      // For all other legal forms, use the OtherForm component
      return (
        <OtherForm
          onFieldsChange={handleFieldsChange}
          formData={documentFormData}
          legalForm={legalForm}
        />
      );
    }
  };

  return (
    <StepLayout
      title="Benötigte Unterlagen"
      description="Informationen zu den benötigten Unterlagen gemäß Geldwäschegesetz"
      onSave={handleContinue}
    >
      <div className="space-y-6">
        {/* GwG Information Card - Always shown at the top */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Shield className="mr-2 h-5 w-5 text-primary" />
              Information zum Geldwäschegesetz (GwG)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm leading-relaxed text-foreground">
              <p className="mb-4">
                Entsprechend den Sorgfaltspflichten nach dem Geldwäschegesetz
                (GwG) benötigen wir Unterlagen zur Identifizierung der
                wirtschaftlich Berechtigten. Diese Informationen sind gesetzlich
                vorgeschrieben und dienen der Prävention von Geldwäsche und
                Terrorismusfinanzierung.
              </p>
              <div className="mt-4 rounded-lg border bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">
                      Wichtiger Hinweis
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Wir sind gesetzlich verpflichtet, die Identität und
                      wirtschaftliche Berechtigung im Rahmen der givve® Card
                      Bestellung zu prüfen. Diese Maßnahmen dienen Ihrer
                      Sicherheit und dem Schutz vor Missbrauch.
                    </p>
                  </div>
                </div>
              </div>
            </CardDescription>
          </CardContent>
        </Card>

        {/* Legal Form Specific Documents Section */}
        {getLegalFormComponent()}
      </div>
    </StepLayout>
  );
};
