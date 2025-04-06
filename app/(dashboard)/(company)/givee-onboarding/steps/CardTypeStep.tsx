"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGivveOnboarding,
  GivveCardType,
} from "../context/givve-onboarding-context";
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
import { CreditCard, Upload, Info, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CreditCardPreview } from "@/components/ui/CreditCardPreview";
import { supabase } from "@/utils/supabase/client";
import { useCompany } from "@/context/company-context";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  cardType: z.enum([
    GivveCardType.STANDARD,
    GivveCardType.LOGO,
    GivveCardType.DESIGN,
  ]),
  departmentName: z.string().min(1, "Name ist erforderlich"),
  logoFile: z.string().optional(),
  designFile: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export const CardTypeStep = () => {
  const { formData, updateFormData, saveProgress } = useGivveOnboarding();
  const { subsidiary } = useCompany();
  const { toast } = useToast();
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [designFileName, setDesignFileName] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [designFile, setDesignFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardType: GivveCardType.STANDARD,
      departmentName: "",
      logoFile: "",
      designFile: "",
    },
  });

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      form.reset({
        cardType: formData.cardType || GivveCardType.STANDARD,
        departmentName: formData.departmentName || "",
        logoFile: formData.logoFile || "",
        designFile: formData.designFile || "",
      });

      if (formData.logoFile) {
        setLogoFileName(formData.logoFile.split("/").pop() || null);
      }

      if (formData.designFile) {
        setDesignFileName(formData.designFile.split("/").pop() || null);
      }
    }
  }, [formData, form]);

  const uploadFile = async (
    file: File,
    type: "logo" | "design",
  ): Promise<string | null> => {
    if (!file || !subsidiary) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${subsidiary.id}/card_design/${type}/${fileName}`;

      const { error } = await supabase.storage
        .from("givve_documents")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      return filePath;
    } catch (error) {
      console.error(`Error uploading ${type} file:`, error);
      toast({
        title: "Fehler",
        description: `Fehler beim Hochladen der ${type === "logo" ? "Logo" : "Design"}-Datei.`,
        variant: "destructive",
      });
      return null;
    }
  };

  const onSubmit = async (values: FormValues) => {
    // Validate if logo/design files are required based on card type
    if (
      values.cardType === GivveCardType.LOGO &&
      !values.logoFile &&
      !logoFile
    ) {
      form.setError("logoFile", {
        type: "manual",
        message: "Bitte laden Sie Ihr Firmenlogo hoch.",
      });
      return;
    }

    if (
      values.cardType === GivveCardType.DESIGN &&
      !values.designFile &&
      !designFile
    ) {
      form.setError("designFile", {
        type: "manual",
        message: "Bitte laden Sie Ihr Kartendesign hoch.",
      });
      return;
    }

    // If we have new files to upload, do it now
    if (logoFile && values.cardType === GivveCardType.LOGO) {
      setIsUploading("logo");
      const logoPath = await uploadFile(logoFile, "logo");
      if (logoPath) {
        values.logoFile = logoPath;
      }
      setIsUploading(null);
    }

    if (designFile && values.cardType === GivveCardType.DESIGN) {
      setIsUploading("design");
      const designPath = await uploadFile(designFile, "design");
      if (designPath) {
        values.designFile = designPath;
      }
      setIsUploading(null);
    }

    // Update form data and save to database
    updateFormData(values);

    // Save to database (simulated) and proceed to next step
    try {
      await saveProgress(values);
    } catch (error) {
      console.error("Error saving card type step:", error);
    }
  };

  // Handle file uploads
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      setLogoFile(file);
    }
  };

  const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesignFileName(file.name);
      setDesignFile(file);
    }
  };

  // Card type details
  const cardOptions = [
    {
      type: GivveCardType.STANDARD,
      title: "Standard Card",
      price: "10,50€ pro Karte",
      onboardingFee: "50€ Onboarding Gebühr",
      description: "Die Standard givve® Card ohne individuelles Design",
    },
    {
      type: GivveCardType.LOGO,
      title: "Logo Card",
      price: "15,50€ pro Karte",
      onboardingFee: "150€ Onboarding Gebühr",
      description: "Die givve® Card mit Ihrem Firmenlogo",
    },
    {
      type: GivveCardType.DESIGN,
      title: "Design Card",
      price: "18,50€ pro Karte",
      onboardingFee: "300€ Onboarding Gebühr",
      description: "Die givve® Card mit vollständig individuellem Design",
    },
  ];

  const cardType = form.watch("cardType");
  const departmentName = form.watch("departmentName");

  return (
    <StepLayout
      title="Kartentyp auswählen"
      description="Wählen Sie die Art der givve Card, die Sie für Ihre Mitarbeiter bestellen möchten."
      onSave={form.handleSubmit(onSubmit)}
      disableNext={isUploading !== null}
      isProcessing={isUploading !== null}
      status={formData.status}
    >
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="cardType"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-base font-medium">
                  Kartentyp
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-1 gap-4 md:grid-cols-3"
                  >
                    {cardOptions.map((option) => (
                      <FormItem key={option.type}>
                        <FormControl>
                          <Card
                            className={`cursor-pointer transition-colors ${
                              field.value === option.type
                                ? "border-primary"
                                : "hover:border-muted-foreground/25"
                            }`}
                            onClick={() => field.onChange(option.type)}
                          >
                            <CardHeader className="pb-2">
                              <CardTitle className="flex items-center text-base">
                                <CreditCard className="mr-2 h-4 w-4 text-primary" />
                                {option.title}
                              </CardTitle>
                              <CardDescription>
                                {option.price}
                                <br />
                                {option.onboardingFee}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-sm text-muted-foreground">
                                {option.description}
                              </div>
                            </CardContent>
                            <div className="hidden">
                              <RadioGroupItem value={option.type} />
                            </div>
                          </Card>
                        </FormControl>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Card Preview */}
          <div className="my-8">
            <h3 className="mb-3 font-medium">Kartenvorschau</h3>
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <CreditCardPreview
                type={cardType as "standard" | "logo" | "design"}
                holderName="Max Mustermann"
                secondLine={departmentName || "Firmenname/Abteilung"}
                uploadedLogo={logoFile}
                className="w-full max-w-md"
              />
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">So wird Ihre Karte aussehen:</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Format: 85,6 × 54,0 mm (ISO/IEC 7810 ID-1)</li>
                  <li>Mastercard® Zahlungsfunktion</li>
                  <li>NFC-fähig für kontaktlose Zahlungen</li>
                  <li>Haltbarkeit: ca. 3-5 Jahre</li>
                </ul>
                <p className="mt-2 text-xs">
                  Die finale Karte kann von der Vorschau leicht abweichen.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start space-x-3">
              <Info className="mt-0.5 h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-medium">Hinweis zu Gebühren</h3>
                <p className="text-sm text-muted-foreground">
                  Weitere Kosten: Pro Ladevorgang fallen 2,50% des Ladebetrags
                  an, mindestens jedoch 2,79€.
                </p>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="departmentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschriftung 2. Zeile</FormLabel>
                <FormDescription>
                  z.B. Firmenname oder Abteilung
                </FormDescription>
                <FormControl>
                  <Input {...field} placeholder="Firmenname/Abteilung" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("cardType") === GivveCardType.LOGO && (
            <FormField
              control={form.control}
              name="logoFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo Upload</FormLabel>
                  <FormDescription>
                    Bitte laden Sie Ihr Firmenlogo im PNG oder JPEG Format hoch.
                  </FormDescription>
                  <div className="mb-4 rounded-lg border bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                    <div className="flex items-start gap-3">
                      <Info className="mt-0.5 h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-300">
                          Design-Richtlinien
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Bitte beachten Sie die Design-Richtlinien für die
                          korrekte Erstellung Ihrer Karte.
                        </p>
                        <Button
                          variant="link"
                          className="mt-1 h-auto p-0 text-sm text-blue-600 dark:text-blue-300"
                          onClick={() =>
                            window.open(
                              "/assets/Givve-Design-Guidline.pdf",
                              "_blank",
                            )
                          }
                        >
                          Design-Richtlinien öffnen
                        </Button>
                      </div>
                    </div>
                  </div>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("logo-upload")?.click()
                        }
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Logo hochladen
                      </Button>
                      <input
                        type="file"
                        id="logo-upload"
                        className="hidden"
                        accept=".png,.jpg,.jpeg"
                        onChange={handleLogoUpload}
                      />
                      {logoFileName && (
                        <div className="text-sm text-muted-foreground">
                          {logoFileName}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {form.watch("cardType") === GivveCardType.DESIGN && (
            <FormField
              control={form.control}
              name="designFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Design Upload</FormLabel>
                  <FormDescription>
                    Bitte laden Sie Ihr Kartendesign im PNG oder JPEG Format
                    hoch.
                  </FormDescription>
                  <div className="mb-4 rounded-lg border bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                    <div className="flex items-start gap-3">
                      <Info className="mt-0.5 h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-300">
                          Design-Richtlinien
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          Bitte beachten Sie die Design-Richtlinien für die
                          korrekte Erstellung Ihrer Karte.
                        </p>
                        <Button
                          variant="link"
                          className="mt-1 h-auto p-0 text-sm text-blue-600 dark:text-blue-300"
                          onClick={() =>
                            window.open(
                              "/assets/Givve-Design-Guidline.pdf",
                              "_blank",
                            )
                          }
                        >
                          Design-Richtlinien öffnen
                        </Button>
                      </div>
                    </div>
                  </div>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("design-upload")?.click()
                        }
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Design hochladen
                      </Button>
                      <input
                        type="file"
                        id="design-upload"
                        className="hidden"
                        accept=".png,.jpg,.jpeg"
                        onChange={handleDesignUpload}
                      />
                      {designFileName && (
                        <div className="text-sm text-muted-foreground">
                          {designFileName}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
      </Form>
    </StepLayout>
  );
};
