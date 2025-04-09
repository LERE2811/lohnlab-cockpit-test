"use client";

import { StepLayout } from "../components/StepLayout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileCheck,
  Download,
  CreditCard,
  Building2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGivveOnboarding } from "../context/givve-onboarding-context";
import { useCompany } from "@/context/company-context";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import {
  mapCompanyDataToBestellformular,
  mapCompanyDataToDokumentationsbogen,
} from "@/lib/pdf/formFiller";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";
import { GivveOnboardingStep } from "../context/givve-onboarding-context";

export const OrderFormsStep = () => {
  const {
    formData: onboardingData,
    updateFormData,
    nextStep,
  } = useGivveOnboarding();
  const { subsidiary, company } = useCompany();
  const { toast } = useToast();
  const [bestellFormularDownloaded, setBestellFormularDownloaded] =
    useState(false);
  const [dokumentationsbogenDownloaded, setDokumentationsbogenDownloaded] =
    useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  // Initialize form data from context
  useEffect(() => {
    if (onboardingData?.documents?.orderForms) {
      setBestellFormularDownloaded(
        onboardingData.documents.orderForms.bestellformularDownloaded || false,
      );
      setDokumentationsbogenDownloaded(
        onboardingData.documents.orderForms.dokumentationsbogenDownloaded ||
          false,
      );
    }
  }, [onboardingData]);

  // Get the legal form from the subsidiary
  const legalForm = subsidiary?.legal_form || "";

  // Normalize the legal form for consistent comparison
  const getNormalizedLegalForm = () => {
    return legalForm.replace(/\s+/g, "").toUpperCase();
  };

  // Get the document type for mapping data to form fields
  const getDocumentType = () => {
    const normalizedLegalForm = getNormalizedLegalForm();

    if (normalizedLegalForm === "GMBH") {
      return "GmbH";
    } else if (normalizedLegalForm === "UG") {
      return "UG";
    } else if (normalizedLegalForm.includes("AG")) {
      return "AG";
    } else if (normalizedLegalForm === "GBR") {
      return "GbR";
    } else if (normalizedLegalForm === "KG" || normalizedLegalForm === "OHG") {
      return "KG_OHG";
    } else {
      return normalizedLegalForm;
    }
  };

  // Get the name of the Dokumentationsbogen for display
  const getDokumentationsbogenName = () => {
    const normalizedLegalForm = getNormalizedLegalForm();
    console.log("normalizedLegalForm", normalizedLegalForm);

    if (normalizedLegalForm === "GMBH" || normalizedLegalForm === "UG") {
      console.log("Dokumentationsbogen GmbH/UG");
      return "Dokumentationsbogen GmbH/UG";
    } else if (
      normalizedLegalForm.includes("AG") &&
      !normalizedLegalForm.includes("GMBH")
    ) {
      return "Dokumentationsbogen AG";
    } else if (
      normalizedLegalForm.includes("GMBH") &&
      normalizedLegalForm.includes("KG")
    ) {
      return "Dokumentationsbogen GmbH & Co. KG";
    } else if (normalizedLegalForm === "KG" || normalizedLegalForm === "OHG") {
      return "Dokumentationsbogen KG/OHG";
    } else if (
      normalizedLegalForm === "KDÖR" ||
      normalizedLegalForm === "KDOER"
    ) {
      return "Dokumentationsbogen KdöR";
    } else if (normalizedLegalForm.includes("PARTG")) {
      return "Dokumentationsbogen PartG/PartG mbB";
    } else if (normalizedLegalForm === "E.V." || normalizedLegalForm === "EG") {
      return "Dokumentationsbogen Verein/Genossenschaft";
    } else if (normalizedLegalForm === "GBR") {
      return "Dokumentationsbogen GbR";
    } else if (
      normalizedLegalForm === "EINZELUNTERNEHMEN" ||
      normalizedLegalForm === "FREIBERUFLER" ||
      normalizedLegalForm === "E.K."
    ) {
      return "Dokumentationsbogen Natürliche Person";
    } else {
      return "Dokumentationsbogen Juristische Person";
    }
  };

  // Compile all company and subsidiary data for form filling
  const compileFormData = (subsidiaryData?: any, contactsData?: any[]) => {
    // Use the provided data or fall back to the context data
    const subData = subsidiaryData || subsidiary;

    // Debug log for onboardingData
    console.log("Onboarding data documents:", onboardingData.documents);

    // Find a contact to use (prioritize those with categories containing "payroll" if available)
    const contacts = contactsData || [];
    let selectedContact = contacts[0] || {}; // Default to first contact if available

    // Try to find a payroll contact if multiple contacts exist
    if (contacts.length > 1) {
      const payrollContact = contacts.find((contact) =>
        contact.categories?.some(
          (cat: string) =>
            cat.toLowerCase().includes("payroll") ||
            cat.toLowerCase().includes("lohn"),
        ),
      );

      if (payrollContact) {
        selectedContact = payrollContact;
      }
    }

    const formData = {
      companyName: company?.name || "",
      subsidiaryName: subData?.name || "",
      legalForm: subData?.legal_form || "",
      registrationNumber: subData?.commercial_register_number || "",
      registrationOffice: subData?.commercial_register || "",
      // Use headquarters fields for address information or data from documents if available
      street:
        onboardingData?.documents?.street || subData?.headquarters_street || "",
      houseNumber:
        onboardingData?.documents?.houseNumber ||
        subData?.headquarters_house_number ||
        "",
      postalCode:
        onboardingData?.documents?.postalCode ||
        subData?.headquarters_postal_code ||
        "",
      city: onboardingData?.documents?.city || subData?.headquarters_city || "",
      // Contact information - try to use data from documents first
      contactFirstName:
        onboardingData?.documents?.firstName || selectedContact.firstname || "",
      contactLastName:
        onboardingData?.documents?.lastName || selectedContact.lastname || "",
      contactEmail: selectedContact.email || "",
      contactPhone: selectedContact.phone || "",
      contactPosition: selectedContact.category || "Ansprechpartner",
      // Givve specific information
      cardType:
        onboardingData.cardType || subData?.givve_card_design_type || "",
      departmentName:
        onboardingData.departmentName || subData?.givve_card_second_line || "",
      // Industry category for document forms
      industryCategory:
        onboardingData?.documents?.industry ||
        subData?.givve_industry_category ||
        "",
      // Personal information for Dokumentationsbogen (from the onboardingData documents object)
      birthDate: onboardingData?.documents?.birthDate || "",
      birthPlace: onboardingData?.documents?.birthPlace || "",
      nationality: onboardingData?.documents?.nationality || "",
      // PEP (Politically Exposed Person) information
      hasPep: onboardingData?.documents?.hasPep || false,
      pepDetails: onboardingData?.documents?.pepDetails || "",
    };

    console.log("Compiled form data:", formData);
    return formData;
  };

  const handleDownload = async (
    formType: "bestellformular" | "dokumentationsbogen",
  ) => {
    if (!subsidiary) {
      toast({
        title: "Fehler",
        description: "Fehler beim Abrufen der Firmendaten.",
        variant: "destructive",
      });
      return;
    }

    setLoading(formType);

    try {
      // Fetch subsidiary data
      const { data: fullSubsidiaryData, error: subsidiaryError } =
        await supabase
          .from("subsidiaries")
          .select("*")
          .eq("id", subsidiary.id)
          .single();

      if (subsidiaryError) {
        console.error("Error fetching subsidiary data:", subsidiaryError);
        toast({
          title: "Fehler",
          description: "Fehler beim Abrufen der vollständigen Firmendaten.",
          variant: "destructive",
        });
        return;
      }

      // Fetch contacts separately from ansprechpartner table
      const { data: contactsData, error: contactsError } = await supabase
        .from("ansprechpartner")
        .select("*")
        .eq("company_id", company?.id || "");

      if (contactsError) {
        console.error("Error fetching contacts data:", contactsError);
      }

      let templatePath = "";

      if (formType === "bestellformular") {
        templatePath = "templates/Bestellformular.pdf";
      } else if (formType === "dokumentationsbogen") {
        // Use the appropriate Dokumentationsbogen based on legal form
        const docType = getDocumentType();
        switch (docType) {
          case "GmbH":
          case "UG":
            templatePath = "templates/Dokumentationsbogen_JP_GmbH_UG.pdf";
            break;
          case "GbR":
            templatePath = "templates/Dokumentationsbogen_GbR.pdf";
            break;
          case "AG":
            templatePath = "templates/Dokumentationsbogen_JP_AG.pdf";
            break;
          case "KG_OHG":
            templatePath = "templates/Dokumentationsbogen_JP_KG_OHG.pdf";
            break;
          case "KdöR":
            templatePath = "templates/Dokumentationsbogen_JP_KdöR.pdf";
            break;
          case "PartG":
          case "PartG mbB":
            templatePath =
              "templates/Dokumentationsbogen_JP_PartG__PartG_mbB.pdf";
            break;
          case "EINZELUNTERNEHMEN":
          case "FREIBERUFLER":
          case "E.K.":
            templatePath = "templates/Dokumentationsbogen_NP.pdf";
            break;
          case "E.V.":
          case "EG":
            templatePath = "templates/Dokumentationsbogen_JP_V_G.pdf";
            break;
          case "GmbH & Co. KG":
            templatePath =
              "templates/UPgivve_Dokumentationsbogen_JP_GmbH_CoKG.pdf";
            break;
          default:
            templatePath = "templates/Dokumentationsbogen_JP_allgemein.pdf";
        }
      }

      // Compile form data
      const formData = compileFormData(fullSubsidiaryData, contactsData || []);

      // Map the data based on form type
      let mappedData;
      if (formType === "bestellformular") {
        mappedData = mapCompanyDataToBestellformular(formData);
      } else if (formType === "dokumentationsbogen") {
        mappedData = mapCompanyDataToDokumentationsbogen(
          formData,
          getDocumentType(),
        );
      } else {
        throw new Error("Ungültiger Formulartyp");
      }

      // Use the server-side PDF filling API
      const response = await fetch("/api/pdf/fill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formType,
          templatePath,
          formData: mappedData,
          subsidiaryId: subsidiary.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error generating PDF");
      }

      const result = await response.json();

      // Open the filled PDF in a new tab
      window.open(result.downloadUrl, "_blank");

      // Update the download status
      if (formType === "bestellformular") {
        setBestellFormularDownloaded(true);
      } else if (formType === "dokumentationsbogen") {
        setDokumentationsbogenDownloaded(true);
      }

      // Calculate the updated download states after this action
      const willBestellformularBeDownloaded =
        formType === "bestellformular" || bestellFormularDownloaded;
      const willDokumentationsbogenBeDownloaded =
        formType === "dokumentationsbogen" || dokumentationsbogenDownloaded;

      // Prepare updated form data with file metadata
      const updatedOrderForms = {
        ...onboardingData.documents?.orderForms,
        [`${formType}Downloaded`]: true,
        [`${formType}FilePath`]: result.filePath,
        [`${formType}FileName`]: result.filename,
        [`${formType}DownloadedAt`]: new Date().toISOString(),
      };

      const updatedDocuments = {
        ...onboardingData.documents,
        orderForms: updatedOrderForms,
      };

      // Update local state to reflect the download
      updateFormData({
        documents: updatedDocuments,
      });

      try {
        // Update the givve_onboarding_progress record directly
        const { data: progressData } = await supabase
          .from("givve_onboarding_progress")
          .select("id, form_data")
          .eq("subsidiary_id", subsidiary.id)
          .maybeSingle();

        if (progressData?.id) {
          // Update existing record's form_data without changing the step
          const updatedFormData = {
            ...progressData.form_data,
            documents: updatedDocuments,
          };

          await supabase
            .from("givve_onboarding_progress")
            .update({
              form_data: updatedFormData,
              last_updated: new Date().toISOString(),
            })
            .eq("id", progressData.id);
        }

        // Update subsidiary table with forms downloaded status
        await supabase
          .from("subsidiaries")
          .update({
            givve_order_forms_downloaded: willBestellformularBeDownloaded,
            givve_documentation_forms_downloaded:
              willDokumentationsbogenBeDownloaded,
          })
          .eq("id", subsidiary.id);
      } catch (error) {
        console.error("Error silently updating download status:", error);
      }

      toast({
        title: "Erfolg",
        description: "Formular wurde heruntergeladen.",
      });
    } catch (error) {
      console.error("Error downloading form:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Herunterladen des Formulars.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleContinue = async () => {
    try {
      // Check if both forms are marked as downloaded
      if (!bestellFormularDownloaded || !dokumentationsbogenDownloaded) {
        toast({
          title: "Hinweis",
          description:
            "Bitte laden Sie beide Formulare herunter, um fortzufahren.",
          variant: "destructive",
        });
        return;
      }

      // Update form data with both forms downloaded
      const updatedOrderForms = {
        bestellformularDownloaded: true,
        dokumentationsbogenDownloaded: true,
      };

      const updatedDocuments = {
        ...onboardingData.documents,
        orderForms: updatedOrderForms,
      };

      // Update local state first
      updateFormData({
        documents: updatedDocuments,
      });

      try {
        // First, get the next step
        const nextStepValue = GivveOnboardingStep.ORDER_FORMS + 1;

        // Update the givve_onboarding_progress record directly
        const { data: progressData } = await supabase
          .from("givve_onboarding_progress")
          .select("id, form_data")
          .eq("subsidiary_id", subsidiary?.id || "")
          .maybeSingle();

        if (progressData?.id) {
          // Update existing record's form_data and manually set the next step
          const updatedFormData = {
            ...progressData.form_data,
            documents: updatedDocuments,
          };

          await supabase
            .from("givve_onboarding_progress")
            .update({
              form_data: updatedFormData,
              current_step: nextStepValue,
              last_updated: new Date().toISOString(),
            })
            .eq("id", progressData.id);
        }

        // Update subsidiary table with forms downloaded status and next step
        await supabase
          .from("subsidiaries")
          .update({
            givve_order_forms_downloaded: true,
            givve_documentation_forms_downloaded: true,
            givve_onboarding_step: nextStepValue,
          })
          .eq("id", subsidiary?.id || "");

        // Manually navigate to the next step
        nextStep();
      } catch (error) {
        console.error("Error updating progress:", error);
        toast({
          title: "Fehler",
          description: "Fehler beim Speichern des Fortschritts.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in handleContinue:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Speichern des Fortschritts.",
        variant: "destructive",
      });
    }
  };

  const renderFileIndicator = (
    formType: "bestellformular" | "dokumentationsbogen",
  ) => {
    const isDownloaded =
      formType === "bestellformular"
        ? bestellFormularDownloaded
        : dokumentationsbogenDownloaded;

    const formName =
      formType === "bestellformular"
        ? "Bestellformular"
        : "Dokumentationsbogen";

    const fileName =
      formType === "bestellformular"
        ? onboardingData.documents?.orderForms?.bestellformularFileName
        : onboardingData.documents?.orderForms?.dokumentationsbogenFileName;

    if (!isDownloaded || !fileName) {
      return null;
    }

    return (
      <div className="mt-2 flex items-center rounded-md border border-green-200 bg-green-50 p-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100">
          <FileCheck className="h-4 w-4 text-green-600" />
        </div>
        <div className="ml-2 flex-1">
          <p className="text-xs font-medium text-green-800">
            {formName} heruntergeladen
          </p>
          <p className="text-xs text-green-700">{fileName}</p>
        </div>
      </div>
    );
  };

  return (
    <StepLayout
      title="Bestellformulare"
      description="Laden Sie die erforderlichen Bestellformulare herunter und füllen Sie diese aus."
      onSave={handleContinue}
      saveButtonText="Weiter zur Unterschrift"
      disableNext={
        !bestellFormularDownloaded ||
        !dokumentationsbogenDownloaded ||
        loading !== null
      }
      status={onboardingData.status}
    >
      <div className="space-y-6">
        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Bitte laden Sie beide Formulare herunter. Die Formulare werden mit
            Ihren Daten vorausgefüllt, müssen aber ggf. ergänzt und
            unterschrieben werden.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CreditCard className="mr-2 h-5 w-5 text-primary" />
                Bestellformular für givve® Card
              </CardTitle>
              <CardDescription>
                Enthält Informationen zur Bestellung und Abrechnung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Das Bestellformular enthält alle notwendigen Informationen zur
                  Bestellung Ihrer givve® Cards:
                </p>
                <ul className="ml-2 list-inside list-disc space-y-1">
                  <li>Kundeninformationen</li>
                  <li>Karteninformationen</li>
                  <li>Lieferung und Abrechnung</li>
                  <li>SEPA-Lastschriftmandat</li>
                </ul>
              </div>
              {renderFileIndicator("bestellformular")}
            </CardContent>
            <Separator />
            <CardFooter className="pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleDownload("bestellformular")}
                disabled={loading !== null}
              >
                {loading === "bestellformular" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Dokument wird vorbereitet...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {bestellFormularDownloaded
                      ? "Formular erneut herunterladen"
                      : "Bestellformular herunterladen"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Building2 className="mr-2 h-5 w-5 text-primary" />
                {getDokumentationsbogenName()}
              </CardTitle>
              <CardDescription>
                Gem. deutschem Geldwäschegesetz erforderlich
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Der Dokumentationsbogen ist gesetzlich vorgeschrieben:</p>
                <ul className="ml-2 list-inside list-disc space-y-1">
                  <li>Erfassung des wirtschaftlich Berechtigten</li>
                  <li>Dokumentation der Eigentums- und Kontrollstruktur</li>
                  <li>PEP-Prüfung (Politisch exponierte Person)</li>
                  <li>Spezifisch für Ihre Rechtsform: {legalForm}</li>
                </ul>
              </div>
              {renderFileIndicator("dokumentationsbogen")}
            </CardContent>
            <Separator />
            <CardFooter className="pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleDownload("dokumentationsbogen")}
                disabled={loading !== null}
              >
                {loading === "dokumentationsbogen" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Dokument wird vorbereitet...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {dokumentationsbogenDownloaded
                      ? "Formular erneut herunterladen"
                      : "Dokumentationsbogen herunterladen"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {bestellFormularDownloaded && dokumentationsbogenDownloaded && (
          <Alert
            variant="default"
            className="border-green-200 bg-green-50 text-green-800"
          >
            <FileCheck className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Beide Formulare wurden heruntergeladen. Die Formulare sind mit
              Ihren Daten vorausgefüllt, bitte prüfen Sie diese, ergänzen Sie
              fehlende Angaben und unterschreiben Sie die Dokumente.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </StepLayout>
  );
};
