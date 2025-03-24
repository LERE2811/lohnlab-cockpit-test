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
import { CreditCard, Upload, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [designFileName, setDesignFileName] = useState<string | null>(null);

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

  const onSubmit = async (values: FormValues) => {
    // Update form data in context
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
      // For now, just store the file name
      // In a real implementation, we would upload to Supabase storage
      setLogoFileName(file.name);
      form.setValue("logoFile", file.name);
    }
  };

  const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, just store the file name
      // In a real implementation, we would upload to Supabase storage
      setDesignFileName(file.name);
      form.setValue("designFile", file.name);
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

  return (
    <StepLayout
      title="Art der givve® Card auswählen"
      description="Wählen Sie die passende givve® Card für Ihr Unternehmen"
      onSave={form.handleSubmit(onSubmit)}
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
