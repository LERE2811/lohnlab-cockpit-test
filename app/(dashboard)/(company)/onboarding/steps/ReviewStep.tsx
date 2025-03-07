"use client";

import { useOnboarding } from "../context/onboarding-context";
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
import {
  CollectiveAgreementTypes,
  GivveCardDesignTypes,
  GivveIndustryCategories,
  PayrollProcessing,
} from "@/shared/model";
import { DocumentViewer } from "@/components/DocumentViewer";
import { ImagePreview } from "@/components/ImagePreview";

// Helper function to get human-readable industry category names
const getIndustryCategoryText = (category: string): string => {
  switch (category) {
    case GivveIndustryCategories.AGRICULTURE_FORESTRY_FISHING:
      return "Land- und Forstwirtschaft, Fischerei";
    case GivveIndustryCategories.MANUFACTURING:
      return "Verarbeitendes Gewerbe";
    case GivveIndustryCategories.ENERGY_SUPPLY:
      return "Energieversorgung";
    case GivveIndustryCategories.WATER_WASTE_MANAGEMENT:
      return "Wasserversorgung; Abwasser- und Abfallentsorgung";
    case GivveIndustryCategories.MINING_QUARRYING:
      return "Bergbau und Gewinnung von Steinen und Erden";
    case GivveIndustryCategories.CONSTRUCTION:
      return "Baugewerbe";
    case GivveIndustryCategories.TRADE_VEHICLE_REPAIR:
      return "Handel; Instandhaltung und Reparatur von Kraftfahrzeugen";
    case GivveIndustryCategories.REAL_ESTATE:
      return "Grundstücks- und Wohnungswesen";
    case GivveIndustryCategories.TRANSPORTATION_STORAGE:
      return "Verkehr und Lagerei";
    case GivveIndustryCategories.HOSPITALITY:
      return "Gastgewerbe";
    case GivveIndustryCategories.INFORMATION_COMMUNICATION:
      return "Information und Kommunikation";
    case GivveIndustryCategories.FINANCIAL_INSURANCE:
      return "Erbringung von Finanz- und Versicherungsdienstleistungen";
    case GivveIndustryCategories.OTHER_BUSINESS_SERVICES:
      return "Erbringung von sonstigen wirtschaftlichen Dienstleistungen";
    case GivveIndustryCategories.PROFESSIONAL_SCIENTIFIC_TECHNICAL:
      return "Erbringung von freiberuflichen, wissenschaftlichen und technischen Dienstleistungen";
    case GivveIndustryCategories.PUBLIC_ADMINISTRATION:
      return "Öffentliche Verwaltung, Verteidigung, Sozialversicherung";
    case GivveIndustryCategories.EDUCATION:
      return "Erziehung und Unterricht";
    case GivveIndustryCategories.PRIVATE_HOUSEHOLDS:
      return "Private Haushalte mit Hauspersonal";
    case GivveIndustryCategories.HEALTH_SOCIAL_SERVICES:
      return "Gesundheits- und Sozialwesen";
    case GivveIndustryCategories.ARTS_ENTERTAINMENT:
      return "Kunst, Unterhaltung und Erholung";
    case GivveIndustryCategories.OTHER_SERVICES:
      return "Erbringung von sonstigen Dienstleistungen";
    case GivveIndustryCategories.EXTRATERRITORIAL_ORGANIZATIONS:
      return "Exterritoriale Organisationen und Körperschaften";
    default:
      return category;
  }
};

export const ReviewStep = () => {
  const { formData, completeOnboarding } = useOnboarding();
  const { subsidiary } = useCompany();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("de-DE");
    } catch (e) {
      return dateString;
    }
  };

  const getPayrollProcessingText = (value: string) => {
    switch (value) {
      case PayrollProcessing.INTERNAL:
        return "Intern (durch eigene Mitarbeiter)";
      case PayrollProcessing.EXTERNAL:
        return "Extern (durch Steuerberater oder Dienstleister)";
      default:
        return "Nicht angegeben";
    }
  };

  const getCollectiveAgreementTypeText = (value: string) => {
    switch (value) {
      case CollectiveAgreementTypes.COMPANY_AGREEMENT:
        return "Haustarifvertrag";
      case CollectiveAgreementTypes.INDUSTRY_AGREEMENT:
        return "Flächentarifvertrag";
      default:
        return "Nicht angegeben";
    }
  };

  const getGivveCardDesignTypeText = (value: string) => {
    switch (value) {
      case GivveCardDesignTypes.STANDARD_CARD:
        return "Standardkarte";
      case GivveCardDesignTypes.LOGO_CARD:
        return "Logokarte";
      case GivveCardDesignTypes.DESIGN_CARD:
        return "Designkarte";
      default:
        return "Nicht angegeben";
    }
  };

  return (
    <StepLayout
      title="Überprüfung & Abschluss"
      description="Bitte überprüfen Sie alle eingegebenen Informationen und schließen Sie das Onboarding ab."
      onComplete={completeOnboarding}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Unternehmensinformationen</CardTitle>
            <CardDescription>
              Grundlegende Informationen zu Ihrer Gesellschaft
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
              <dt className="text-sm font-medium text-muted-foreground">
                Name
              </dt>
              <dd className="text-sm">{subsidiary?.name}</dd>

              <dt className="text-sm font-medium text-muted-foreground">
                Rechtsform
              </dt>
              <dd className="text-sm">{subsidiary?.legal_form}</dd>

              <dt className="text-sm font-medium text-muted-foreground">
                Steuernummer
              </dt>
              <dd className="text-sm">
                {formData.tax_number || "Nicht angegeben"}
              </dd>

              <dt className="text-sm font-medium text-muted-foreground">
                Adresse
              </dt>
              <dd className="text-sm">
                {formData.street} {formData.house_number},{" "}
                {formData.postal_code} {formData.city}
              </dd>

              <dt className="text-sm font-medium text-muted-foreground">
                Handelsregister
              </dt>
              <dd className="text-sm">{formData.commercial_register}</dd>

              <dt className="text-sm font-medium text-muted-foreground">
                Handelsregisternummer
              </dt>
              <dd className="text-sm">{formData.commercial_register_number}</dd>
            </dl>
          </CardContent>
        </Card>

        {formData.managing_directors &&
          formData.managing_directors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Geschäftsführer</CardTitle>
                <CardDescription>
                  Informationen zu den Geschäftsführern
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.managing_directors.map(
                    (director: any, index: number) => (
                      <div key={index} className="space-y-2">
                        {index > 0 && <Separator className="my-4" />}
                        <h4 className="font-medium">
                          Geschäftsführer {index + 1}
                        </h4>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                          <dt className="text-sm font-medium text-muted-foreground">
                            Name
                          </dt>
                          <dd className="text-sm">
                            {director.firstname} {director.lastname}
                          </dd>

                          <dt className="text-sm font-medium text-muted-foreground">
                            E-Mail
                          </dt>
                          <dd className="text-sm">
                            {director.email || "Nicht angegeben"}
                          </dd>

                          <dt className="text-sm font-medium text-muted-foreground">
                            Telefon
                          </dt>
                          <dd className="text-sm">
                            {director.phone || "Nicht angegeben"}
                          </dd>
                        </dl>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        <Card>
          <CardHeader>
            <CardTitle>Lohnabrechnung</CardTitle>
            <CardDescription>
              Informationen zur Lohnabrechnung und den Ansprechpartnern
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="mb-4 grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
              <dt className="text-sm font-medium text-muted-foreground">
                Art der Lohnabrechnung
              </dt>
              <dd className="text-sm">
                {getPayrollProcessingText(formData.payroll_processing)}
              </dd>

              {formData.payroll_processing === PayrollProcessing.INTERNAL &&
                formData.payroll_system && (
                  <>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Lohnabrechnungssystem
                    </dt>
                    <dd className="text-sm">{formData.payroll_system}</dd>
                  </>
                )}
            </dl>

            {formData.payroll_contacts &&
              formData.payroll_contacts.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium">
                    {formData.payroll_processing === PayrollProcessing.INTERNAL
                      ? "Ansprechpartner für die Lohnabrechnung"
                      : "Externe Ansprechpartner für die Lohnabrechnung"}
                  </h4>
                  <div className="space-y-4">
                    {formData.payroll_contacts.map(
                      (contact: any, index: number) => (
                        <div key={index} className="space-y-2">
                          {index > 0 && <Separator className="my-4" />}
                          <h5 className="text-sm font-medium">
                            Ansprechpartner {index + 1}
                          </h5>
                          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                            {formData.payroll_processing ===
                              PayrollProcessing.EXTERNAL &&
                              contact.company_name && (
                                <>
                                  <dt className="text-sm font-medium text-muted-foreground">
                                    Unternehmen / Kanzlei
                                  </dt>
                                  <dd className="text-sm">
                                    {contact.company_name}
                                  </dd>
                                </>
                              )}

                            <dt className="text-sm font-medium text-muted-foreground">
                              Name
                            </dt>
                            <dd className="text-sm">
                              {contact.firstname} {contact.lastname}
                            </dd>

                            <dt className="text-sm font-medium text-muted-foreground">
                              E-Mail
                            </dt>
                            <dd className="text-sm">{contact.email}</dd>

                            <dt className="text-sm font-medium text-muted-foreground">
                              Telefon
                            </dt>
                            <dd className="text-sm">
                              {contact.phone || "Nicht angegeben"}
                            </dd>
                          </dl>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Betriebsrat & Tarifbindung</CardTitle>
            <CardDescription>
              Informationen zu Betriebsrat und Tarifbindung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
              <dt className="text-sm font-medium text-muted-foreground">
                Betriebsrat vorhanden
              </dt>
              <dd className="text-sm">
                {formData.has_works_council ? "Ja" : "Nein"}
              </dd>

              <dt className="text-sm font-medium text-muted-foreground">
                Tarifbindung
              </dt>
              <dd className="text-sm">
                {formData.has_collective_agreement ? "Ja" : "Nein"}
              </dd>

              {formData.has_collective_agreement &&
                formData.collective_agreement_type && (
                  <>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Art der Tarifbindung
                    </dt>
                    <dd className="text-sm">
                      {getCollectiveAgreementTypeText(
                        formData.collective_agreement_type,
                      )}
                    </dd>
                  </>
                )}

              {formData.has_collective_agreement &&
                formData.collective_agreement_document_url && (
                  <>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Link zum Tarifvertrag
                    </dt>
                    <dd className="text-sm">
                      <a
                        href={formData.collective_agreement_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline"
                      >
                        {formData.collective_agreement_document_url}
                      </a>
                    </dd>
                  </>
                )}
            </dl>

            {formData.has_collective_agreement &&
              formData.collective_agreement_document_url &&
              formData.file_metadata?.collective_agreement_document && (
                <div className="mt-6">
                  <h4 className="mb-2 text-sm font-medium">
                    Hochgeladener Tarifvertrag
                  </h4>
                  <DocumentViewer
                    filePath={formData.collective_agreement_document_url}
                    fileName={
                      formData.file_metadata.collective_agreement_document
                        .fileName
                    }
                  />
                </div>
              )}
          </CardContent>
        </Card>

        {formData.has_givve_card && (
          <Card>
            <CardHeader>
              <CardTitle>Givve Card</CardTitle>
              <CardDescription>Informationen zur Givve Card</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  Givve Card
                </dt>
                <dd className="text-sm">Ja</dd>

                <dt className="text-sm font-medium text-muted-foreground">
                  Rechtsform für Givve
                </dt>
                <dd className="text-sm">
                  {formData.givve_legal_form || "Nicht angegeben"}
                </dd>

                <dt className="text-sm font-medium text-muted-foreground">
                  Kartendesign
                </dt>
                <dd className="text-sm">
                  {getGivveCardDesignTypeText(formData.givve_card_design_type)}
                </dd>

                {formData.givve_card_design_type ===
                  GivveCardDesignTypes.LOGO_CARD &&
                  formData.givve_company_logo_url &&
                  formData.file_metadata?.givve_company_logo && (
                    <>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Unternehmenslogo
                      </dt>
                      <dd className="text-sm">
                        <div className="mt-2">
                          <ImagePreview
                            filePath={formData.givve_company_logo_url}
                            fileName={
                              formData.file_metadata.givve_company_logo.fileName
                            }
                            maxHeight={200}
                            showFileName={true}
                          />
                        </div>
                      </dd>
                    </>
                  )}

                {formData.givve_card_design_type ===
                  GivveCardDesignTypes.DESIGN_CARD &&
                  formData.givve_card_design_url &&
                  formData.file_metadata?.givve_card_design && (
                    <>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Kartendesign
                      </dt>
                      <dd className="text-sm">
                        <div className="mt-2">
                          <ImagePreview
                            filePath={formData.givve_card_design_url}
                            fileName={
                              formData.file_metadata.givve_card_design.fileName
                            }
                            maxHeight={200}
                            showFileName={true}
                          />
                        </div>
                      </dd>
                    </>
                  )}

                <dt className="text-sm font-medium text-muted-foreground">
                  Zweite Zeile auf der Karte
                </dt>
                <dd className="text-sm">
                  {formData.givve_card_second_line || "Nicht angegeben"}
                </dd>

                <dt className="text-sm font-medium text-muted-foreground">
                  Aufladedatum
                </dt>
                <dd className="text-sm">
                  {formData.givve_loading_date
                    ? `${formData.givve_loading_date}. des Monats`
                    : "Nicht angegeben"}
                </dd>

                <dt className="text-sm font-medium text-muted-foreground">
                  Branchenkategorie
                </dt>
                <dd className="text-sm">
                  {formData.givve_industry_category
                    ? getIndustryCategoryText(formData.givve_industry_category)
                    : "Nicht angegeben"}
                </dd>
              </dl>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Hauptniederlassung</CardTitle>
            <CardDescription>
              Informationen zur Hauptniederlassung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
              {formData.headquarters_name && (
                <>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Bezeichnung
                  </dt>
                  <dd className="text-sm">{formData.headquarters_name}</dd>
                </>
              )}

              <dt className="text-sm font-medium text-muted-foreground">
                Adresse
              </dt>
              <dd className="text-sm">
                {formData.headquarters_street}{" "}
                {formData.headquarters_house_number},
                {formData.headquarters_postal_code} {formData.headquarters_city}
              </dd>

              <dt className="text-sm font-medium text-muted-foreground">
                Bundesland
              </dt>
              <dd className="text-sm">{formData.headquarters_state}</dd>

              <dt className="text-sm font-medium text-muted-foreground">
                Kantine
              </dt>
              <dd className="text-sm">
                {formData.has_canteen ? "Ja" : "Nein"}
              </dd>

              <dt className="text-sm font-medium text-muted-foreground">
                E-Ladesäulen
              </dt>
              <dd className="text-sm">
                {formData.has_ev_charging ? "Ja" : "Nein"}
              </dd>
            </dl>
          </CardContent>
        </Card>

        {formData.beneficial_owners &&
          formData.beneficial_owners.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Wirtschaftlich Berechtigte</CardTitle>
                <CardDescription>
                  Informationen zu den wirtschaftlich Berechtigten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.beneficial_owners.map(
                    (owner: any, index: number) => (
                      <div key={index} className="space-y-2">
                        {index > 0 && <Separator className="my-4" />}
                        <h4 className="font-medium">
                          Wirtschaftlich Berechtigter {index + 1}
                        </h4>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                          <dt className="text-sm font-medium text-muted-foreground">
                            Name
                          </dt>
                          <dd className="text-sm">
                            {owner.firstname} {owner.lastname}
                          </dd>

                          <dt className="text-sm font-medium text-muted-foreground">
                            Geburtsdatum
                          </dt>
                          <dd className="text-sm">
                            {formatDate(owner.birth_date)}
                          </dd>

                          <dt className="text-sm font-medium text-muted-foreground">
                            Nationalität
                          </dt>
                          <dd className="text-sm">{owner.nationality}</dd>

                          <dt className="text-sm font-medium text-muted-foreground">
                            Beteiligungshöhe
                          </dt>
                          <dd className="text-sm">
                            {owner.ownership_percentage === "more_than_25"
                              ? "Mehr als 25%"
                              : "Weniger als 25%"}
                          </dd>

                          <dt className="text-sm font-medium text-muted-foreground">
                            Öffentliches Amt
                          </dt>
                          <dd className="text-sm">
                            {owner.has_public_office ? "Ja" : "Nein"}
                          </dd>

                          {owner.has_public_office &&
                            owner.public_office_description && (
                              <>
                                <dt className="text-sm font-medium text-muted-foreground">
                                  Beschreibung des Amts
                                </dt>
                                <dd className="text-sm">
                                  {owner.public_office_description}
                                </dd>
                              </>
                            )}
                        </dl>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          )}
      </div>
    </StepLayout>
  );
};
