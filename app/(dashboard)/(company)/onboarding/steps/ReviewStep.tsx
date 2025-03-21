"use client";

import { useOnboarding, OnboardingStep } from "../context/onboarding-context";
import { StepLayout } from "../components/StepLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCompany } from "@/context/company-context";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export const ReviewStep = () => {
  const {
    formData,
    completeOnboarding,
    isStepCompleted,
    areAllStepsCompleted,
  } = useOnboarding();
  const { subsidiary } = useCompany();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [hasMissingInfo, setHasMissingInfo] = useState(false);
  const [missingInfoDetails, setMissingInfoDetails] = useState<string[]>([]);

  // Check for missing information
  useEffect(() => {
    const allCompleted = areAllStepsCompleted();

    if (!allCompleted) {
      const missingItems: string[] = [];

      if (!isStepCompleted(OnboardingStep.GESELLSCHAFT)) {
        missingItems.push("Gesellschaft: Grundlegende Informationen fehlen.");
      }

      if (!isStepCompleted(OnboardingStep.STANDORTE)) {
        missingItems.push(
          "Standorte: Informationen zu mindestens einem Standort fehlen.",
        );
      }

      if (!isStepCompleted(OnboardingStep.LOHNABRECHNUNG)) {
        missingItems.push(
          "Lohnabrechnung: Informationen zur Lohnabrechnung fehlen.",
        );
      }

      if (!isStepCompleted(OnboardingStep.BUCHHALTUNG)) {
        missingItems.push("Buchhaltung: Informationen zur Buchhaltung fehlen.");
      }

      if (!isStepCompleted(OnboardingStep.ANSPRECHPARTNER)) {
        missingItems.push(
          "Ansprechpartner: Mindestens ein Ansprechpartner fehlt.",
        );
      }

      if (!isStepCompleted(OnboardingStep.GIVVE_CARD)) {
        missingItems.push("givve® Card: Entscheidung zur givve® Card fehlt.");
      }

      setHasMissingInfo(true);
      setMissingInfoDetails(missingItems);
    } else {
      setHasMissingInfo(false);
      setMissingInfoDetails([]);
    }
  }, [formData, isStepCompleted, areAllStepsCompleted]);

  const getPayrollProcessingText = (value: string) => {
    switch (value) {
      case "intern":
        return "Intern (durch eigene Mitarbeiter)";
      case "extern":
        return "Extern (durch Steuerberater oder Dienstleister)";
      default:
        return value;
    }
  };

  const getCollectiveAgreementTypeText = (value: string) => {
    switch (value) {
      case "haustarifvertrag":
        return "Haustarifvertrag";
      case "flächentarifvertrag":
        return "Flächentarifvertrag";
      default:
        return value;
    }
  };

  const handleSubmit = async () => {
    // Check if all required information is available
    if (hasMissingInfo) {
      toast({
        title: "Fehlende Informationen",
        description:
          "Bitte vervollständigen Sie alle erforderlichen Informationen, bevor Sie das Onboarding abschließen.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOnboarding();
      toast({
        title: "Onboarding abgeschlossen",
        description: "Vielen Dank für die Teilnahme am Onboarding.",
      });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Fehler",
        description:
          "Beim Abschließen des Onboardings ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StepLayout
      title="Überprüfung & Abschluss"
      description="Bitte überprüfen Sie die eingegebenen Informationen und schließen Sie das Onboarding ab."
      onSave={handleSubmit}
      saveButtonText="Onboarding abschließen"
      saveButtonIcon={<CheckCircle2 className="mr-2 h-4 w-4" />}
      isSaving={isSubmitting}
    >
      <div className="space-y-6">
        {/* Gesellschaft */}
        <Card>
          <CardHeader>
            <CardTitle>Gesellschaft</CardTitle>
            <CardDescription>
              Grundlegende Informationen zur Gesellschaft
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Betriebsrat
              </h4>
              <p>{formData.has_works_council ? "Ja" : "Nein"}</p>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Tarifbindung
              </h4>
              <p>{formData.has_collective_agreement ? "Ja" : "Nein"}</p>
              {formData.has_collective_agreement &&
                formData.collective_agreement_type && (
                  <p className="mt-1 text-sm">
                    Art:{" "}
                    {getCollectiveAgreementTypeText(
                      formData.collective_agreement_type,
                    )}
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Standorte */}
        {formData.locations && formData.locations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Standorte</CardTitle>
              <CardDescription>Informationen zu den Standorten</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.locations.map((location: any, index: number) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium">
                    {location.is_headquarters
                      ? "Hauptniederlassung"
                      : `Niederlassung ${index + 1}`}
                    {location.name ? `: ${location.name}` : ""}
                  </h4>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Adresse:</p>
                      <p>
                        {location.street} {location.house_number}
                        <br />
                        {location.postal_code} {location.city}
                        <br />
                        {location.state}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Zusätzliche Informationen:
                      </p>
                      <p>
                        Kantine/Catering: {location.has_canteen ? "Ja" : "Nein"}
                        <br />
                        E-Ladesäulen:{" "}
                        {location.has_charging_stations ? "Ja" : "Nein"}
                      </p>
                    </div>
                  </div>
                  {index < formData.locations.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Lohnabrechnung */}
        <Card>
          <CardHeader>
            <CardTitle>Lohnabrechnung</CardTitle>
            <CardDescription>Informationen zur Lohnabrechnung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Art der Lohnabrechnung
              </h4>
              <p>
                {formData.payroll_processing_type
                  ? getPayrollProcessingText(formData.payroll_processing_type)
                  : formData.payroll_processing
                    ? getPayrollProcessingText(formData.payroll_processing)
                    : "Nicht angegeben"}
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Lohnabrechnungssystem
              </h4>
              <p>
                {formData.payroll_system
                  ? formData.payroll_system === "sonstige"
                    ? formData.custom_payroll_system || "Sonstiges System"
                    : formData.payroll_system
                  : "Nicht angegeben"}
              </p>
            </div>

            {formData.wants_import_file && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Monatliche Importdatei
                  </h4>
                  <p>Ja, wird benötigt</p>
                  {formData.import_date_type && (
                    <p className="mt-1 text-sm">
                      Lieferzeitpunkt:{" "}
                      {formData.import_date_type === "standard"
                        ? "Standarddatum (10. des Monats)"
                        : formData.custom_import_date || "Individuelles Datum"}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Buchhaltung */}
        <Card>
          <CardHeader>
            <CardTitle>Buchhaltung</CardTitle>
            <CardDescription>Informationen zur Buchhaltung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Zahlungsmethode
                </h4>
                <p>
                  {formData.payment_method === "sepa"
                    ? "Bankeinzug (SEPA)"
                    : formData.payment_method === "invoice"
                      ? "Auf Rechnung"
                      : "Nicht angegeben"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Rechnungsstellung
                </h4>
                <p>
                  {formData.invoice_type === "company"
                    ? "Eine Rechnung für die gesamte Gesellschaft"
                    : formData.invoice_type === "location"
                      ? "Separate Rechnung pro Standort"
                      : "Nicht angegeben"}
                </p>
              </div>
            </div>

            {formData.billing_info && formData.billing_info.length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">
                    Rechnungsinformationen
                  </h4>

                  {formData.billing_info.map((info: any, index: number) => (
                    <div key={index} className="rounded-lg border p-3">
                      <h5 className="mb-2 font-medium">
                        {formData.invoice_type === "location" &&
                        info.location_name
                          ? `Standort: ${info.location_name}`
                          : "Rechnungsinformationen"}
                      </h5>
                      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {formData.payment_method === "sepa" && (
                          <>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                IBAN:
                              </p>
                              <p>{info.iban || "Nicht angegeben"}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Kontoinhaber:
                              </p>
                              <p>{info.account_holder || "Nicht angegeben"}</p>
                            </div>
                          </>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground">
                            E-Mail für Rechnungen:
                          </p>
                          <p>{info.billing_email || "Nicht angegeben"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Telefon für Rückfragen:
                          </p>
                          <p>{info.phone || "Nicht angegeben"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ansprechpartner */}
        {formData.contacts && formData.contacts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Ansprechpartner</CardTitle>
              <CardDescription>
                Informationen zu den Ansprechpartnern
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.contacts.map((contact: any, index: number) => (
                <div key={index} className="space-y-2">
                  <h4 className="font-medium">
                    {contact.first_name || contact.firstname}{" "}
                    {contact.last_name || contact.lastname}
                    {contact.company_name && ` (${contact.company_name})`}
                  </h4>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Kontaktdaten:
                      </p>
                      <p>
                        E-Mail: {contact.email}
                        <br />
                        {contact.phone && `Telefon: ${contact.phone}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Kategorien:
                      </p>
                      {contact.categories && contact.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {contact.categories.map((cat: string, i: number) => (
                            <Badge key={i} variant="outline">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      ) : contact.category ? (
                        <Badge variant="outline">{contact.category}</Badge>
                      ) : (
                        <p>Keine Kategorien angegeben</p>
                      )}
                      <p className="mt-1 text-sm">
                        Zugang zum Cockpit:{" "}
                        {contact.has_cockpit_access ? (
                          <>
                            <span className="font-medium text-green-600">
                              Ja
                            </span>
                            <span className="ml-1 text-xs text-muted-foreground">
                              (Wird beim Abschluss des Onboardings eingeladen)
                            </span>
                          </>
                        ) : (
                          "Nein"
                        )}
                      </p>
                    </div>
                  </div>
                  {index < formData.contacts.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* givve Card */}
        <Card>
          <CardHeader>
            <CardTitle>givve® Card</CardTitle>
            <CardDescription>Informationen zur givve® Card</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              {formData.has_givve_card
                ? "Die givve® Card wird genutzt. Nach Abschluss des Onboardings wird ein separater Prozess für die Einrichtung gestartet."
                : "Die givve® Card wird nicht genutzt."}
            </p>
          </CardContent>
        </Card>

        <div
          className={`rounded-lg border ${hasMissingInfo ? "border-red-200 bg-red-50" : "bg-muted/30"} p-4`}
        >
          <div className="flex items-start space-x-3">
            {hasMissingInfo ? (
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-500" />
            )}
            <div>
              <h3 className="font-medium">
                {hasMissingInfo
                  ? "Fehlende Informationen"
                  : "Bereit zum Abschluss"}
              </h3>
              {hasMissingInfo ? (
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">
                    Bevor Sie das Onboarding abschließen können, müssen Sie noch
                    folgende Informationen ergänzen:
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-red-600">
                    {missingInfoDetails.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sie haben alle erforderlichen Informationen eingegeben.
                  Klicken Sie auf &quot;Onboarding abschließen&quot;, um den
                  Prozess abzuschließen.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Debug toggle button (only in development) */}
        {process.env.NODE_ENV === "development" && (
          <Button
            variant="outline"
            onClick={() => setShowDebug(!showDebug)}
            className="w-full"
          >
            {showDebug
              ? "Debug Information ausblenden"
              : "Debug Information anzeigen"}
          </Button>
        )}

        {/* Debug Information */}
        {showDebug && (
          <Card className="border-dashed border-yellow-500">
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
              <CardDescription>Technische Details zum Formular</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-96 overflow-auto rounded bg-slate-900 p-4 text-xs text-white">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </StepLayout>
  );
};
