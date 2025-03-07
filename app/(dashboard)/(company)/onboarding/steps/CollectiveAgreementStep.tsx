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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { CollectiveAgreementTypes } from "@/shared/model";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";
import {
  OnboardingFileMetadata,
  FileMetadata,
  updateFileMetadata,
} from "@/utils/file-upload";
import { DocumentViewer } from "@/components/DocumentViewer";

const formSchema = z.object({
  has_collective_agreement: z.boolean(),
  collective_agreement_type: z
    .enum([
      CollectiveAgreementTypes.COMPANY_AGREEMENT,
      CollectiveAgreementTypes.INDUSTRY_AGREEMENT,
    ])
    .optional()
    .nullable(),
  collective_agreement_document_url: z.string().optional().nullable(),
  file_metadata: z.record(z.any()).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export const CollectiveAgreementStep = () => {
  const { formData, updateFormData, saveProgress } = useOnboarding();
  const { subsidiary } = useCompany();
  const [fileMetadata, setFileMetadata] = useState<OnboardingFileMetadata>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      has_collective_agreement: false,
      collective_agreement_type: null,
      collective_agreement_document_url: null,
      file_metadata: null,
    },
  });

  // Watch the has_collective_agreement field to conditionally show other fields
  const hasCollectiveAgreement = form.watch("has_collective_agreement");

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      form.reset({
        has_collective_agreement: formData.has_collective_agreement || false,
        collective_agreement_type: formData.collective_agreement_type || null,
        collective_agreement_document_url:
          formData.collective_agreement_document_url || null,
        file_metadata: formData.file_metadata || null,
      });

      // Initialize file metadata if it exists
      if (formData.file_metadata) {
        setFileMetadata(formData.file_metadata as OnboardingFileMetadata);
      }
    }
  }, [formData, form]);

  const onSubmit = async (values: FormValues) => {
    // If has_collective_agreement is false, reset the other fields
    if (!values.has_collective_agreement) {
      values.collective_agreement_type = null;
      values.collective_agreement_document_url = null;
      values.file_metadata = null;
    } else {
      // Include file metadata in the form data
      values.file_metadata = fileMetadata;
    }

    updateFormData(values);
    await saveProgress(values, true);
  };

  const handleFileUploadComplete = (fileData: {
    signedUrl: string;
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) => {
    // Update the form with the file path - store in collective_agreement_document_url
    form.setValue("collective_agreement_document_url", fileData.filePath);

    // Update file metadata
    const updatedMetadata = updateFileMetadata(
      fileMetadata,
      "collective_agreement_document",
      fileData,
    );

    setFileMetadata(updatedMetadata);

    // Also update the form's file_metadata field
    form.setValue("file_metadata", updatedMetadata);
  };

  const handleFileRemove = () => {
    // Clear the file path
    form.setValue("collective_agreement_document_url", null);

    // Remove from file metadata
    const updatedMetadata = { ...fileMetadata };
    delete updatedMetadata.collective_agreement_document;

    setFileMetadata(updatedMetadata);

    // Update the form's file_metadata field
    form.setValue("file_metadata", updatedMetadata);
  };

  return (
    <StepLayout
      title="Tarifbindung"
      description="Bitte geben Sie an, ob Ihre Gesellschaft tarifgebunden ist."
      onSave={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="has_collective_agreement"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Tarifbindung</FormLabel>
                  <FormDescription>
                    Ist Ihre Gesellschaft tarifgebunden?
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

          {hasCollectiveAgreement && (
            <>
              <FormField
                control={form.control}
                name="collective_agreement_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Art der Tarifbindung</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value={CollectiveAgreementTypes.COMPANY_AGREEMENT}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Haustarifvertrag
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value={
                                CollectiveAgreementTypes.INDUSTRY_AGREEMENT
                              }
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Flächentarifvertrag
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collective_agreement_document_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifvertrag hochladen (optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {field.value &&
                        fileMetadata.collective_agreement_document ? (
                          <div className="space-y-4">
                            <DocumentViewer
                              filePath={field.value}
                              fileName={
                                fileMetadata.collective_agreement_document
                                  .fileName
                              }
                            />
                            <div>
                              <FileUpload
                                folder="collective_agreements"
                                subsidiaryId={subsidiary?.id || ""}
                                onUploadComplete={handleFileUploadComplete}
                                onRemove={handleFileRemove}
                                existingFileUrl={
                                  fileMetadata.collective_agreement_document
                                    ?.signedUrl
                                }
                                existingFilePath={
                                  fileMetadata.collective_agreement_document
                                    ?.filePath
                                }
                                existingFileName={
                                  fileMetadata.collective_agreement_document
                                    ?.fileName
                                }
                                acceptedFileTypes="application/pdf"
                                maxSizeMB={20}
                                label="Tarifvertrag ersetzen"
                              />
                            </div>
                          </div>
                        ) : (
                          <FileUpload
                            folder="collective_agreements"
                            subsidiaryId={subsidiary?.id || ""}
                            onUploadComplete={handleFileUploadComplete}
                            onRemove={handleFileRemove}
                            existingFileUrl={
                              fileMetadata.collective_agreement_document
                                ?.signedUrl
                            }
                            existingFilePath={
                              fileMetadata.collective_agreement_document
                                ?.filePath
                            }
                            existingFileName={
                              fileMetadata.collective_agreement_document
                                ?.fileName
                            }
                            acceptedFileTypes="application/pdf"
                            maxSizeMB={20}
                            label="Tarifvertrag hochladen"
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Laden Sie hier Ihren Tarifvertrag als PDF-Dokument hoch.
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
