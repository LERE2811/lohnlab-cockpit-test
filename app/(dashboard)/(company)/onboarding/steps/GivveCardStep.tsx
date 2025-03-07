"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useOnboarding } from "../context/onboarding-context";
import { StepLayout } from "../components/StepLayout";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { GivveCardDesignTypes, GivveIndustryCategories } from "@/shared/model";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";
import {
  OnboardingFileMetadata,
  FileMetadata,
  updateFileMetadata,
  removeFileMetadata,
} from "@/utils/file-upload";
import { DocumentViewer } from "@/components/DocumentViewer";
import { ImagePreview } from "@/components/ImagePreview";

// Legal form options
const LEGAL_FORMS = [
  "GmbH",
  "AG",
  "UG",
  "GbR",
  "KG",
  "OHG",
  "GmbH & Co. KG",
  "juristische Person",
  "KdöR",
  "PartG",
  "PartG mbB",
  "e.V.",
  "eG",
  "natürliche Person",
] as const;

const formSchema = z.object({
  has_givve_card: z.boolean(),
  givve_legal_form: z.enum(LEGAL_FORMS).optional().nullable(),
  givve_card_design_type: z
    .enum([
      GivveCardDesignTypes.STANDARD_CARD,
      GivveCardDesignTypes.LOGO_CARD,
      GivveCardDesignTypes.DESIGN_CARD,
    ])
    .optional()
    .nullable(),
  givve_company_logo_url: z.string().optional().nullable(),
  givve_card_design_url: z.string().optional().nullable(),
  givve_standard_postal_code: z.string().optional().nullable(),
  givve_card_second_line: z
    .string()
    .max(21, "Maximal 21 Zeichen erlaubt")
    .optional()
    .nullable(),
  givve_loading_date: z.enum(["10", "15", "30"]).optional().nullable(),
  givve_industry_category: z
    .enum([
      GivveIndustryCategories.AGRICULTURE_FORESTRY_FISHING,
      GivveIndustryCategories.MANUFACTURING,
      GivveIndustryCategories.ENERGY_SUPPLY,
      GivveIndustryCategories.WATER_WASTE_MANAGEMENT,
      GivveIndustryCategories.MINING_QUARRYING,
      GivveIndustryCategories.CONSTRUCTION,
      GivveIndustryCategories.TRADE_VEHICLE_REPAIR,
      GivveIndustryCategories.REAL_ESTATE,
      GivveIndustryCategories.TRANSPORTATION_STORAGE,
      GivveIndustryCategories.HOSPITALITY,
      GivveIndustryCategories.INFORMATION_COMMUNICATION,
      GivveIndustryCategories.FINANCIAL_INSURANCE,
      GivveIndustryCategories.OTHER_BUSINESS_SERVICES,
      GivveIndustryCategories.PROFESSIONAL_SCIENTIFIC_TECHNICAL,
      GivveIndustryCategories.PUBLIC_ADMINISTRATION,
      GivveIndustryCategories.EDUCATION,
      GivveIndustryCategories.PRIVATE_HOUSEHOLDS,
      GivveIndustryCategories.HEALTH_SOCIAL_SERVICES,
      GivveIndustryCategories.ARTS_ENTERTAINMENT,
      GivveIndustryCategories.OTHER_SERVICES,
      GivveIndustryCategories.EXTRATERRITORIAL_ORGANIZATIONS,
    ])
    .optional()
    .nullable(),
  file_metadata: z.record(z.any()).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

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

export const GivveCardStep = () => {
  const { formData, updateFormData, saveProgress } = useOnboarding();
  const { subsidiary } = useCompany();
  const [fileMetadata, setFileMetadata] = useState<OnboardingFileMetadata>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      has_givve_card: false,
      givve_legal_form: null,
      givve_card_design_type: null,
      givve_company_logo_url: null,
      givve_card_design_url: null,
      givve_standard_postal_code: null,
      givve_card_second_line: null,
      givve_loading_date: null,
      givve_industry_category: null,
      file_metadata: null,
    },
  });

  // Watch the has_givve_card field to conditionally show other fields
  const hasGivveCard = form.watch("has_givve_card");
  const cardDesignType = form.watch("givve_card_design_type");

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      form.reset({
        has_givve_card: formData.has_givve_card || false,
        givve_legal_form: formData.givve_legal_form || null,
        givve_card_design_type: formData.givve_card_design_type || null,
        givve_company_logo_url: formData.givve_company_logo_url || null,
        givve_card_design_url: formData.givve_card_design_url || null,
        givve_standard_postal_code: formData.givve_standard_postal_code || null,
        givve_card_second_line: formData.givve_card_second_line || null,
        givve_loading_date: formData.givve_loading_date || null,
        givve_industry_category: formData.givve_industry_category || null,
        file_metadata: formData.file_metadata || null,
      });

      // Initialize file metadata if it exists
      if (formData.file_metadata) {
        setFileMetadata(formData.file_metadata as OnboardingFileMetadata);
      }
    }
  }, [formData, form]);

  // Watch for changes to the form values and save them
  useEffect(() => {
    // Skip the initial render
    const subscription = form.watch((value) => {
      // Only save if the form is dirty (has been changed)
      if (form.formState.isDirty) {
        // Get the current values
        const currentValues = form.getValues();

        // If has_givve_card is false, reset the other fields
        if (!currentValues.has_givve_card) {
          currentValues.givve_legal_form = null;
          currentValues.givve_card_design_type = null;
          currentValues.givve_company_logo_url = null;
          currentValues.givve_card_design_url = null;
          currentValues.givve_standard_postal_code = null;
          currentValues.givve_card_second_line = null;
          currentValues.givve_loading_date = null;
          currentValues.givve_industry_category = null;
          currentValues.file_metadata = null;
        } else {
          // Include file metadata in the form data
          currentValues.file_metadata = fileMetadata;
        }

        // Update the form data in the context
        updateFormData(currentValues);

        // Save to database (without showing a toast)
        saveProgress(currentValues, false);
      }
    });

    // Cleanup subscription on unmount
    return () => subscription.unsubscribe();
  }, [form, fileMetadata, updateFormData, saveProgress]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    // If has_givve_card is false, reset the other fields
    if (!values.has_givve_card) {
      values.givve_legal_form = null;
      values.givve_card_design_type = null;
      values.givve_company_logo_url = null;
      values.givve_card_design_url = null;
      values.givve_standard_postal_code = null;
      values.givve_card_second_line = null;
      values.givve_loading_date = null;
      values.givve_industry_category = null;
      values.file_metadata = null;
    } else {
      // Include file metadata in the form data
      values.file_metadata = fileMetadata;
    }

    updateFormData(values);
    await saveProgress(values, true);
  };

  const handleLogoUploadComplete = (fileData: {
    signedUrl: string;
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) => {
    // Update the form with the file path
    form.setValue("givve_company_logo_url", fileData.filePath);

    // Update file metadata
    const updatedMetadata = updateFileMetadata(
      fileMetadata,
      "givve_company_logo",
      fileData,
    );

    setFileMetadata(updatedMetadata);

    // Also update the form's file_metadata field
    form.setValue("file_metadata", updatedMetadata);

    // Get the current form values
    const currentValues = form.getValues();

    // Save the progress with the updated form values
    updateFormData({
      ...currentValues,
      givve_company_logo_url: fileData.filePath,
      file_metadata: updatedMetadata,
    });

    // Save to database
    saveProgress(
      {
        ...currentValues,
        givve_company_logo_url: fileData.filePath,
        file_metadata: updatedMetadata,
      },
      false,
    );
  };

  const handleLogoRemove = () => {
    // Clear the file path
    form.setValue("givve_company_logo_url", null);

    // Remove from file metadata
    const updatedMetadata = removeFileMetadata(
      fileMetadata,
      "givve_company_logo",
    );

    setFileMetadata(updatedMetadata);

    // Update the form's file_metadata field
    form.setValue("file_metadata", updatedMetadata);

    // Get the current form values
    const currentValues = form.getValues();

    // Save the progress with the updated form values
    updateFormData({
      ...currentValues,
      givve_company_logo_url: null,
      file_metadata: updatedMetadata,
    });

    // Save to database
    saveProgress(
      {
        ...currentValues,
        givve_company_logo_url: null,
        file_metadata: updatedMetadata,
      },
      false,
    );
  };

  const handleDesignUploadComplete = (fileData: {
    signedUrl: string;
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) => {
    // Update the form with the file path
    form.setValue("givve_card_design_url", fileData.filePath);

    // Update file metadata
    const updatedMetadata = updateFileMetadata(
      fileMetadata,
      "givve_card_design",
      fileData,
    );

    setFileMetadata(updatedMetadata);

    // Also update the form's file_metadata field
    form.setValue("file_metadata", updatedMetadata);

    // Get the current form values
    const currentValues = form.getValues();

    // Save the progress with the updated form values
    updateFormData({
      ...currentValues,
      givve_card_design_url: fileData.filePath,
      file_metadata: updatedMetadata,
    });

    // Save to database
    saveProgress(
      {
        ...currentValues,
        givve_card_design_url: fileData.filePath,
        file_metadata: updatedMetadata,
      },
      false,
    );
  };

  const handleDesignRemove = () => {
    // Clear the file path
    form.setValue("givve_card_design_url", null);

    // Remove from file metadata
    const updatedMetadata = removeFileMetadata(
      fileMetadata,
      "givve_card_design",
    );

    setFileMetadata(updatedMetadata);

    // Update the form's file_metadata field
    form.setValue("file_metadata", updatedMetadata);

    // Get the current form values
    const currentValues = form.getValues();

    // Save the progress with the updated form values
    updateFormData({
      ...currentValues,
      givve_card_design_url: null,
      file_metadata: updatedMetadata,
    });

    // Save to database
    saveProgress(
      {
        ...currentValues,
        givve_card_design_url: null,
        file_metadata: updatedMetadata,
      },
      false,
    );
  };

  return (
    <StepLayout
      title="Givve Card"
      description="Bitte geben Sie an, ob Ihre Gesellschaft die Givve Card nutzt oder nutzen möchte."
      onSave={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="has_givve_card"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Givve Card</FormLabel>
                  <FormDescription>
                    Nutzt Ihre Gesellschaft die Givve Card oder möchte sie
                    nutzen?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {hasGivveCard && (
            <>
              <FormField
                control={form.control}
                name="givve_legal_form"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rechtsform für Givve</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bitte wählen Sie eine Rechtsform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LEGAL_FORMS.map((form) => (
                            <SelectItem key={form} value={form}>
                              {form}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Bitte geben Sie die Rechtsform an, die auf der Givve Card
                      erscheinen soll.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="givve_card_design_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Kartendesign</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value={GivveCardDesignTypes.STANDARD_CARD}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Standardkarte
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value={GivveCardDesignTypes.LOGO_CARD}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Logokarte (mit Ihrem Unternehmenslogo)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value={GivveCardDesignTypes.DESIGN_CARD}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Designkarte (individuelles Design)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {cardDesignType === GivveCardDesignTypes.LOGO_CARD && (
                <FormField
                  control={form.control}
                  name="givve_company_logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unternehmenslogo</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value && fileMetadata.givve_company_logo ? (
                            <div className="space-y-4">
                              <div className="mb-2">
                                <h4 className="mb-2 text-sm font-medium">
                                  Vorschau des Logos
                                </h4>
                                <ImagePreview
                                  filePath={field.value}
                                  fileName={
                                    fileMetadata.givve_company_logo.fileName
                                  }
                                  maxHeight={250}
                                />
                              </div>
                              <div>
                                <FileUpload
                                  folder="givve_logos"
                                  subsidiaryId={subsidiary?.id || ""}
                                  onUploadComplete={handleLogoUploadComplete}
                                  onRemove={handleLogoRemove}
                                  existingFileUrl={
                                    fileMetadata.givve_company_logo?.signedUrl
                                  }
                                  existingFilePath={
                                    fileMetadata.givve_company_logo?.filePath
                                  }
                                  existingFileName={
                                    fileMetadata.givve_company_logo?.fileName
                                  }
                                  acceptedFileTypes="image/*"
                                  maxSizeMB={5}
                                  label="Logo ersetzen"
                                />
                              </div>
                            </div>
                          ) : (
                            <FileUpload
                              folder="givve_logos"
                              subsidiaryId={subsidiary?.id || ""}
                              onUploadComplete={handleLogoUploadComplete}
                              onRemove={handleLogoRemove}
                              existingFileUrl={
                                fileMetadata.givve_company_logo?.signedUrl
                              }
                              existingFilePath={
                                fileMetadata.givve_company_logo?.filePath
                              }
                              existingFileName={
                                fileMetadata.givve_company_logo?.fileName
                              }
                              acceptedFileTypes="image/*"
                              maxSizeMB={5}
                              label="Logo hochladen"
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Bitte laden Sie Ihr Unternehmenslogo hoch. Empfohlenes
                        Format: PNG oder JPG, max. 5MB.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {cardDesignType === GivveCardDesignTypes.DESIGN_CARD && (
                <FormField
                  control={form.control}
                  name="givve_card_design_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kartendesign</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {field.value && fileMetadata.givve_card_design ? (
                            <div className="space-y-4">
                              <div className="mb-2">
                                <h4 className="mb-2 text-sm font-medium">
                                  Vorschau des Kartendesigns
                                </h4>
                                <ImagePreview
                                  filePath={field.value}
                                  fileName={
                                    fileMetadata.givve_card_design.fileName
                                  }
                                  maxHeight={250}
                                />
                              </div>
                              <div>
                                <FileUpload
                                  folder="givve_designs"
                                  subsidiaryId={subsidiary?.id || ""}
                                  onUploadComplete={handleDesignUploadComplete}
                                  onRemove={handleDesignRemove}
                                  existingFileUrl={
                                    fileMetadata.givve_card_design?.signedUrl
                                  }
                                  existingFilePath={
                                    fileMetadata.givve_card_design?.filePath
                                  }
                                  existingFileName={
                                    fileMetadata.givve_card_design?.fileName
                                  }
                                  acceptedFileTypes="image/*"
                                  maxSizeMB={5}
                                  label="Design ersetzen"
                                />
                              </div>
                            </div>
                          ) : (
                            <FileUpload
                              folder="givve_designs"
                              subsidiaryId={subsidiary?.id || ""}
                              onUploadComplete={handleDesignUploadComplete}
                              onRemove={handleDesignRemove}
                              existingFileUrl={
                                fileMetadata.givve_card_design?.signedUrl
                              }
                              existingFilePath={
                                fileMetadata.givve_card_design?.filePath
                              }
                              existingFileName={
                                fileMetadata.givve_card_design?.fileName
                              }
                              acceptedFileTypes="image/*"
                              maxSizeMB={5}
                              label="Design hochladen"
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Bitte laden Sie Ihr gewünschtes Kartendesign hoch.
                        Empfohlenes Format: PNG oder JPG, max. 5MB.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="givve_card_second_line"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zweite Zeile auf der Karte</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. Mitarbeiterbenefits"
                        maxLength={21}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximal 21 Zeichen. Diese Zeile erscheint unter dem
                      Firmennamen auf der Karte.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="givve_loading_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aufladedatum</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Bitte wählen Sie ein Datum" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="10">10. des Monats</SelectItem>
                        <SelectItem value="15">15. des Monats</SelectItem>
                        <SelectItem value="30">30. des Monats</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      An diesem Tag werden die Karten monatlich aufgeladen.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="givve_industry_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branchenkategorie</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bitte wählen Sie eine Branche" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(GivveIndustryCategories).map(
                            (category) => (
                              <SelectItem key={category} value={category}>
                                {getIndustryCategoryText(category)}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Diese Information wird für statistische Zwecke verwendet.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>
      </Form>
    </StepLayout>
  );
};
