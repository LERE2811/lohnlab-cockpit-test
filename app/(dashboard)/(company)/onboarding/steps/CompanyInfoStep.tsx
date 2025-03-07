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
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";
import {
  OnboardingFileMetadata,
  FileMetadata,
  updateFileMetadata,
  removeFileMetadata,
} from "@/utils/file-upload";
import { DocumentViewer } from "@/components/DocumentViewer";

const formSchema = z.object({
  tax_number: z.string().min(1, "Steuernummer ist erforderlich"),
  street: z.string().min(1, "Straße ist erforderlich"),
  house_number: z.string().min(1, "Hausnummer ist erforderlich"),
  postal_code: z
    .string()
    .min(5, "Postleitzahl muss mindestens 5 Zeichen haben"),
  city: z.string().min(1, "Stadt ist erforderlich"),
  commercial_register: z.string().min(1, "Handelsregister ist erforderlich"),
  commercial_register_number: z
    .string()
    .min(1, "Handelsregisternummer ist erforderlich"),
  commercial_register_file_url: z.string().optional().nullable(),
  file_metadata: z.record(z.any()).optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export const CompanyInfoStep = () => {
  const { formData, updateFormData, saveProgress } = useOnboarding();
  const { subsidiary } = useCompany();
  const [fileMetadata, setFileMetadata] = useState<OnboardingFileMetadata>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tax_number: "",
      street: "",
      house_number: "",
      postal_code: "",
      city: "",
      commercial_register: "",
      commercial_register_number: "",
      commercial_register_file_url: null,
      file_metadata: null,
    },
  });

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      form.reset({
        tax_number: formData.tax_number || "",
        street: formData.street || "",
        house_number: formData.house_number || "",
        postal_code: formData.postal_code || "",
        city: formData.city || "",
        commercial_register: formData.commercial_register || "",
        commercial_register_number: formData.commercial_register_number || "",
        commercial_register_file_url:
          formData.commercial_register_file_url || null,
        file_metadata: formData.file_metadata || null,
      });

      // Initialize file metadata if it exists
      if (formData.file_metadata) {
        setFileMetadata(formData.file_metadata as OnboardingFileMetadata);
      }
    }
  }, [formData, form]);

  const onSubmit = async (values: FormValues) => {
    // Include file metadata in the form data
    values.file_metadata = fileMetadata;

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
    // Update the form with the file path
    form.setValue("commercial_register_file_url", fileData.filePath);

    // Update file metadata
    const updatedMetadata = updateFileMetadata(
      fileMetadata,
      "commercial_register_document",
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
      commercial_register_file_url: fileData.filePath,
      file_metadata: updatedMetadata,
    });

    // Save to database
    saveProgress(
      {
        ...currentValues,
        commercial_register_file_url: fileData.filePath,
        file_metadata: updatedMetadata,
      },
      false,
    );
  };

  const handleFileRemove = () => {
    // Clear the file path
    form.setValue("commercial_register_file_url", null);

    // Remove from file metadata
    const updatedMetadata = removeFileMetadata(
      fileMetadata,
      "commercial_register_document",
    );

    setFileMetadata(updatedMetadata);

    // Update the form's file_metadata field
    form.setValue("file_metadata", updatedMetadata);

    // Get the current form values
    const currentValues = form.getValues();

    // Save the progress with the updated form values
    updateFormData({
      ...currentValues,
      commercial_register_file_url: null,
      file_metadata: updatedMetadata,
    });

    // Save to database
    saveProgress(
      {
        ...currentValues,
        commercial_register_file_url: null,
        file_metadata: updatedMetadata,
      },
      false,
    );
  };

  return (
    <StepLayout
      title="Unternehmensinformationen"
      description="Bitte geben Sie die grundlegenden Informationen zu Ihrer Gesellschaft ein."
      onSave={form.handleSubmit(onSubmit)}
      disableNext={!form.formState.isValid}
    >
      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="tax_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Steuernummer</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. 123/456/78901" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Straße</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Musterstraße" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="house_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hausnummer</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. 123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postleitzahl</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. 12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stadt</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Musterstadt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="commercial_register"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Handelsregister</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. Amtsgericht München" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commercial_register_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Handelsregisternummer</FormLabel>
                <FormControl>
                  <Input placeholder="z.B. HRB 123456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commercial_register_file_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Handelsregisterauszug hochladen (optional)
                </FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {field.value &&
                    fileMetadata.commercial_register_document ? (
                      <div className="space-y-4">
                        <div className="mb-2">
                          <h4 className="mb-2 text-sm font-medium">
                            Vorschau des Handelsregisterauszugs
                          </h4>
                          <DocumentViewer
                            filePath={field.value}
                            fileName={
                              fileMetadata.commercial_register_document.fileName
                            }
                          />
                        </div>
                        <div>
                          <FileUpload
                            folder="commercial_register"
                            subsidiaryId={subsidiary?.id || ""}
                            onUploadComplete={handleFileUploadComplete}
                            onRemove={handleFileRemove}
                            existingFileUrl={
                              fileMetadata.commercial_register_document
                                ?.signedUrl
                            }
                            existingFilePath={
                              fileMetadata.commercial_register_document
                                ?.filePath
                            }
                            existingFileName={
                              fileMetadata.commercial_register_document
                                ?.fileName
                            }
                            acceptedFileTypes="application/pdf"
                            maxSizeMB={20}
                            label="Handelsregisterauszug ersetzen"
                          />
                        </div>
                      </div>
                    ) : (
                      <FileUpload
                        folder="commercial_register"
                        subsidiaryId={subsidiary?.id || ""}
                        onUploadComplete={handleFileUploadComplete}
                        onRemove={handleFileRemove}
                        existingFileUrl={
                          fileMetadata.commercial_register_document?.signedUrl
                        }
                        existingFilePath={
                          fileMetadata.commercial_register_document?.filePath
                        }
                        existingFileName={
                          fileMetadata.commercial_register_document?.fileName
                        }
                        acceptedFileTypes="application/pdf"
                        maxSizeMB={20}
                        label="Handelsregisterauszug hochladen"
                      />
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Laden Sie hier Ihren Handelsregisterauszug als PDF-Dokument
                  hoch.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Form>
    </StepLayout>
  );
};
