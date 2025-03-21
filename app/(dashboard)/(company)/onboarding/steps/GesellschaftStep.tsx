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
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";
import { useCompany } from "@/context/company-context";

const formSchema = z.object({
  has_works_council: z.boolean(),
  has_collective_agreement: z.boolean(),
  collective_agreement_type: z.string().optional(),
  collective_agreement_file_url: z.string().optional(),
  collective_agreement_file_path: z.string().optional(),
  collective_agreement_file_name: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const GesellschaftStep = () => {
  const { formData, updateFormData, saveProgress, nextStep } = useOnboarding();
  const { subsidiary } = useCompany();
  const { toast } = useToast();
  const [isFormValid, setIsFormValid] = useState(false);
  const [fileMetadata, setFileMetadata] = useState<{
    url?: string;
    path?: string;
    name?: string;
    type?: string;
    size?: number;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      has_works_council: false,
      has_collective_agreement: false,
      collective_agreement_type: "",
      collective_agreement_file_url: "",
      collective_agreement_file_path: "",
      collective_agreement_file_name: "",
    },
  });

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      form.reset({
        has_works_council: formData.has_works_council || false,
        has_collective_agreement: formData.has_collective_agreement || false,
        collective_agreement_type: formData.collective_agreement_type || "",
        collective_agreement_file_url:
          formData.collective_agreement_file_url || "",
        collective_agreement_file_path:
          formData.collective_agreement_file_path || "",
        collective_agreement_file_name:
          formData.collective_agreement_file_name || "",
      });

      // Set file metadata if it exists
      if (formData.collective_agreement_file_url) {
        setFileMetadata({
          url: formData.collective_agreement_file_url,
          path: formData.collective_agreement_file_path,
          name: formData.collective_agreement_file_name,
          type: formData.collective_agreement_file_type,
          size: formData.collective_agreement_file_size,
        });
      }
    }
  }, [formData, form]);

  // Add this after form initialization
  useEffect(() => {
    const subscription = form.watch((value) => {
      validateForm(value);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, form]);

  // Add this validation function
  const validateForm = (values: Partial<FormValues>) => {
    const currentValues = values || form.getValues();

    // Basic required field validation
    let valid =
      currentValues.has_works_council !== undefined &&
      currentValues.has_collective_agreement !== undefined;

    // Additional validation for collective agreement
    if (currentValues.has_collective_agreement) {
      valid =
        valid &&
        !!currentValues.collective_agreement_type &&
        currentValues.collective_agreement_type.trim() !== "";
    }

    setIsFormValid(valid);
  };

  // Add this function to get specific validation messages
  const getValidationMessage = () => {
    const values = form.getValues();

    if (values.has_works_council === undefined) {
      return "Bitte geben Sie an, ob ein Betriebsrat existiert.";
    }

    if (values.has_collective_agreement === undefined) {
      return "Bitte geben Sie an, ob ein Tarifvertrag existiert.";
    }

    if (
      values.has_collective_agreement &&
      (!values.collective_agreement_type ||
        values.collective_agreement_type.trim() === "")
    ) {
      return "Bitte geben Sie die Art des Tarifvertrags an.";
    }

    return "Bitte füllen Sie alle erforderlichen Felder aus.";
  };

  const onSubmit = async (values: FormValues) => {
    // Combine existing file metadata with form values
    const updatedValues = {
      ...values,
      // If we have new file metadata, include that
      ...(fileMetadata
        ? {
            collective_agreement_file_url: fileMetadata.url,
            collective_agreement_file_path: fileMetadata.path,
            collective_agreement_file_name: fileMetadata.name,
            collective_agreement_file_type: fileMetadata.type,
            collective_agreement_file_size: fileMetadata.size,
          }
        : {}),
    };

    // Update form data in context
    updateFormData(updatedValues);
    await saveProgress(updatedValues);

    // Move to the next step
    nextStep();
  };

  const handleFileUploadComplete = (fileData: {
    signedUrl: string;
    filePath: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }) => {
    // Store the file metadata
    setFileMetadata({
      url: fileData.signedUrl,
      path: fileData.filePath,
      name: fileData.fileName,
      type: fileData.fileType,
      size: fileData.fileSize,
    });

    // Update the form values
    form.setValue("collective_agreement_file_url", fileData.signedUrl);
    form.setValue("collective_agreement_file_path", fileData.filePath);
    form.setValue("collective_agreement_file_name", fileData.fileName);
  };

  const handleRemoveFile = () => {
    // Clear file metadata
    setFileMetadata(null);

    // Clear form values
    form.setValue("collective_agreement_file_url", "");
    form.setValue("collective_agreement_file_path", "");
    form.setValue("collective_agreement_file_name", "");
  };

  return (
    <StepLayout
      title="Gesellschaft"
      description="Bitte geben Sie grundlegende Informationen zur Gesellschaft an."
      onSave={form.handleSubmit(onSubmit)}
      disableNext={!isFormValid}
      validationMessage={getValidationMessage()}
    >
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="has_works_council"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Betriebsrat</FormLabel>
                  <FormDescription>
                    Hat die Gesellschaft einen Betriebsrat?
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

          {form.watch("has_works_council") && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <h3 className="mb-2 text-sm font-medium">Hinweis</h3>
              <p className="text-sm text-muted-foreground">
                Bitte beachten Sie, dass bei Vorhandensein eines Betriebsrats
                bestimmte Maßnahmen der Mitbestimmung unterliegen können. Wir
                werden bei relevanten Themen darauf hinweisen.
              </p>
            </div>
          )}

          <FormField
            control={form.control}
            name="has_collective_agreement"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Tarifbindung</FormLabel>
                  <FormDescription>
                    Unterliegt die Gesellschaft einer Tarifbindung?
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

          {form.watch("has_collective_agreement") && (
            <div className="space-y-4 rounded-lg border p-4">
              <FormField
                control={form.control}
                name="collective_agreement_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Art des Tarifvertrags</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Bitte wählen Sie die Art des Tarifvertrags" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="haustarifvertrag">
                          Haustarifvertrag
                        </SelectItem>
                        <SelectItem value="flächentarifvertrag">
                          Flächentarifvertrag
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="collective_agreement_file">
                  Tarifvertrag hochladen
                </Label>
                <div className="mt-1">
                  {subsidiary ? (
                    <FileUpload
                      folder="collective_agreements"
                      subsidiaryId={subsidiary.id}
                      onUploadComplete={handleFileUploadComplete}
                      onRemove={handleRemoveFile}
                      existingFileUrl={fileMetadata?.url}
                      existingFilePath={fileMetadata?.path}
                      existingFileName={fileMetadata?.name}
                      acceptedFileTypes=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      maxSizeMB={10}
                      label="Tarifvertrag hochladen"
                    />
                  ) : (
                    <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                      Bitte wählen Sie zuerst eine Gesellschaft aus.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Form>
    </StepLayout>
  );
};
