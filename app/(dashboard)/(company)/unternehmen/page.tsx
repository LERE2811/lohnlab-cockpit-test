"use client";

import { useEffect, useState } from "react";
import { useCompany } from "@/context/company-context";
import { supabase } from "@/utils/supabase/client";
import { OnboardingProgress, Subsidiary } from "@/shared/model";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileDown, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { getSignedUrl } from "@/utils/file-upload";
import { OnboardingFileMetadata } from "@/utils/file-upload";
import { CollectiveAgreementTypes, GivveCardDesignTypes } from "@/shared/model";

const UnternehmenPage = () => {
  const { subsidiary } = useCompany();
  const [loading, setLoading] = useState(true);
  const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});
  const [documents, setDocuments] = useState<
    {
      name: string;
      description: string;
      filePath: string | null;
      fileName: string | null;
      fileType: string | null;
      downloadUrl: string | null;
    }[]
  >([]);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!subsidiary) return;

      setLoading(true);
      try {
        // Fetch the onboarding progress data
        const { data, error } = await supabase
          .from("onboarding_progress")
          .select("*")
          .eq("subsidiary_id", subsidiary.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error fetching onboarding data:", error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const progressData = data[0];
          const formData = progressData.form_data || {};
          setOnboardingData(formData);

          // Process documents
          const docsToProcess = [];

          // Commercial Register Document
          if (
            formData.commercial_register_file_url &&
            formData.file_metadata?.commercial_register_document
          ) {
            docsToProcess.push({
              name: "Handelsregisterauszug",
              description: "Handelsregisterauszug für " + subsidiary.name,
              filePath: formData.commercial_register_file_url,
              fileName:
                formData.file_metadata.commercial_register_document.fileName,
              fileType:
                formData.file_metadata.commercial_register_document.fileType,
              downloadUrl: null,
            });
          }

          // Collective Agreement Document
          if (
            formData.collective_agreement_document_url &&
            formData.file_metadata?.collective_agreement_document
          ) {
            docsToProcess.push({
              name: "Tarifvertrag",
              description:
                formData.collective_agreement_type ===
                CollectiveAgreementTypes.COMPANY_AGREEMENT
                  ? "Haustarifvertrag"
                  : "Flächentarifvertrag",
              filePath: formData.collective_agreement_document_url,
              fileName:
                formData.file_metadata.collective_agreement_document.fileName,
              fileType:
                formData.file_metadata.collective_agreement_document.fileType,
              downloadUrl: null,
            });
          }

          // Givve Company Logo
          if (
            formData.givve_company_logo_url &&
            formData.file_metadata?.givve_company_logo
          ) {
            docsToProcess.push({
              name: "Unternehmenslogo für Givve Card",
              description: "Logo für die Givve Card",
              filePath: formData.givve_company_logo_url,
              fileName: formData.file_metadata.givve_company_logo.fileName,
              fileType: formData.file_metadata.givve_company_logo.fileType,
              downloadUrl: null,
            });
          }

          // Givve Card Design
          if (
            formData.givve_card_design_url &&
            formData.file_metadata?.givve_card_design
          ) {
            docsToProcess.push({
              name: "Kartendesign für Givve Card",
              description: "Individuelles Design für die Givve Card",
              filePath: formData.givve_card_design_url,
              fileName: formData.file_metadata.givve_card_design.fileName,
              fileType: formData.file_metadata.givve_card_design.fileType,
              downloadUrl: null,
            });
          }

          // Generate signed URLs for all documents
          const docsWithUrls = await Promise.all(
            docsToProcess.map(async (doc) => {
              if (doc.filePath) {
                const signedUrl = await getSignedUrl(doc.filePath, 3600); // 1 hour expiry
                return { ...doc, downloadUrl: signedUrl };
              }
              return doc;
            }),
          );

          setDocuments(docsWithUrls);
        }
      } catch (error) {
        console.error("Error in fetchOnboardingData:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, [subsidiary]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground">
          Lade Unternehmensdaten...
        </p>
      </div>
    );
  }

  if (!subsidiary) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="text-lg font-medium text-muted-foreground">
          Keine Gesellschaft ausgewählt.
        </p>
      </div>
    );
  }

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <FileText className="h-5 w-5" />;
    if (fileType.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="container mx-auto space-y-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{subsidiary.name}</h1>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Unternehmensinformationen</TabsTrigger>
          <TabsTrigger value="people">Personen</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Grundinformationen</CardTitle>
              <CardDescription>
                Grundlegende Informationen zu der Gesellschaft
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  Name
                </dt>
                <dd className="text-sm">{subsidiary.name}</dd>

                <dt className="text-sm font-medium text-muted-foreground">
                  Rechtsform
                </dt>
                <dd className="text-sm">{subsidiary.legal_form}</dd>

                <dt className="text-sm font-medium text-muted-foreground">
                  Steuernummer
                </dt>
                <dd className="text-sm">
                  {onboardingData.tax_number || "Nicht angegeben"}
                </dd>

                <dt className="text-sm font-medium text-muted-foreground">
                  Adresse
                </dt>
                <dd className="text-sm">
                  {onboardingData.street} {onboardingData.house_number},{" "}
                  {onboardingData.postal_code} {onboardingData.city}
                </dd>

                <dt className="text-sm font-medium text-muted-foreground">
                  Handelsregister
                </dt>
                <dd className="text-sm">
                  {onboardingData.commercial_register}
                </dd>

                <dt className="text-sm font-medium text-muted-foreground">
                  Handelsregisternummer
                </dt>
                <dd className="text-sm">
                  {onboardingData.commercial_register_number}
                </dd>
              </dl>
            </CardContent>
          </Card>

          {onboardingData.has_collective_agreement && (
            <Card>
              <CardHeader>
                <CardTitle>Tarifbindung</CardTitle>
                <CardDescription>
                  Informationen zur Tarifbindung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                  <dt className="text-sm font-medium text-muted-foreground">
                    Tarifbindung
                  </dt>
                  <dd className="text-sm">Ja</dd>

                  {onboardingData.collective_agreement_type && (
                    <>
                      <dt className="text-sm font-medium text-muted-foreground">
                        Art der Tarifbindung
                      </dt>
                      <dd className="text-sm">
                        {onboardingData.collective_agreement_type ===
                        CollectiveAgreementTypes.COMPANY_AGREEMENT
                          ? "Haustarifvertrag"
                          : "Flächentarifvertrag"}
                      </dd>
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>
          )}

          {onboardingData.has_givve_card && (
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
                    {onboardingData.givve_legal_form || "Nicht angegeben"}
                  </dd>

                  <dt className="text-sm font-medium text-muted-foreground">
                    Kartendesign
                  </dt>
                  <dd className="text-sm">
                    {onboardingData.givve_card_design_type ===
                    GivveCardDesignTypes.STANDARD_CARD
                      ? "Standardkarte"
                      : onboardingData.givve_card_design_type ===
                          GivveCardDesignTypes.LOGO_CARD
                        ? "Logokarte"
                        : "Designkarte"}
                  </dd>

                  <dt className="text-sm font-medium text-muted-foreground">
                    Zweite Zeile auf der Karte
                  </dt>
                  <dd className="text-sm">
                    {onboardingData.givve_card_second_line || "Nicht angegeben"}
                  </dd>

                  <dt className="text-sm font-medium text-muted-foreground">
                    Aufladedatum
                  </dt>
                  <dd className="text-sm">
                    {onboardingData.givve_loading_date
                      ? `${onboardingData.givve_loading_date}. des Monats`
                      : "Nicht angegeben"}
                  </dd>
                </dl>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="people" className="space-y-6">
          {onboardingData.managing_directors &&
            onboardingData.managing_directors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Geschäftsführer</CardTitle>
                  <CardDescription>
                    Informationen zu den Geschäftsführern
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {onboardingData.managing_directors.map(
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

          {onboardingData.payroll_contacts &&
            onboardingData.payroll_contacts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ansprechpartner für die Lohnabrechnung</CardTitle>
                  <CardDescription>
                    Informationen zu den Ansprechpartnern für die Lohnabrechnung
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {onboardingData.payroll_contacts.map(
                      (contact: any, index: number) => (
                        <div key={index} className="space-y-2">
                          {index > 0 && <Separator className="my-4" />}
                          <h4 className="font-medium">
                            Ansprechpartner {index + 1}
                          </h4>
                          <dl className="grid grid-cols-1 gap-x-4 gap-y-2 md:grid-cols-2">
                            {contact.company_name && (
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
                </CardContent>
              </Card>
            )}

          {onboardingData.beneficial_owners &&
            onboardingData.beneficial_owners.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Wirtschaftlich Berechtigte</CardTitle>
                  <CardDescription>
                    Informationen zu den wirtschaftlich Berechtigten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {onboardingData.beneficial_owners.map(
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
                              {new Date(owner.birth_date).toLocaleDateString(
                                "de-DE",
                              )}
                            </dd>

                            <dt className="text-sm font-medium text-muted-foreground">
                              Nationalität
                            </dt>
                            <dd className="text-sm">{owner.nationality}</dd>

                            <dt className="text-sm font-medium text-muted-foreground">
                              Anteil
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

                            {owner.has_public_office && (
                              <>
                                <dt className="text-sm font-medium text-muted-foreground">
                                  Beschreibung des öffentlichen Amts
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
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dokumente</CardTitle>
              <CardDescription>
                Alle hochgeladenen Dokumente für die Gesellschaft
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p>Keine Dokumente vorhanden.</p>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(doc.fileType)}
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {doc.fileName}
                          </p>
                        </div>
                      </div>
                      {doc.downloadUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={doc.downloadUrl}
                            download={doc.fileName || undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FileDown className="mr-2 h-4 w-4" />
                            Herunterladen
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnternehmenPage;
