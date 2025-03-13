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
import { useEffect, useState, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// IBAN validation regex
const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

const formSchema = z.object({
  payment_method: z.enum(["sepa", "invoice"]),
  invoice_type: z.enum(["company", "location"]),
  billing_info: z.array(
    z.object({
      location_id: z.string().optional(),
      location_name: z.string().optional(),
      iban: z
        .string()
        .regex(ibanRegex, "Bitte geben Sie eine gültige IBAN ein")
        .optional()
        .or(z.literal("")),
      account_holder: z
        .string()
        .min(1, "Bitte geben Sie den Kontoinhaber ein")
        .optional(),
      billing_email: z
        .string()
        .email("Bitte geben Sie eine gültige E-Mail-Adresse ein")
        .min(1, "Bitte geben Sie eine E-Mail-Adresse ein"),
      phone: z.string().optional(),
    }),
  ),
});

type BillingInfo = {
  location_id?: string;
  location_name?: string;
  iban?: string;
  account_holder?: string;
  billing_email: string;
  phone?: string;
};

type FormValues = z.infer<typeof formSchema>;

// Generate a unique ID for locations if needed
const generateLocationId = () => {
  return `loc_${Math.random().toString(36).substring(2, 15)}`;
};

// Ensure each location has an ID
const ensureLocationIds = (locations: any[]) => {
  return locations.map((location: any) => {
    if (!location.id) {
      return { ...location, id: generateLocationId() };
    }
    return location;
  });
};

export const BuchhaltungStep = () => {
  const { formData, updateFormData, saveProgress, nextStep } = useOnboarding();
  const [billingInfos, setBillingInfos] = useState<BillingInfo[]>([
    {
      billing_email: "",
    },
  ]);
  const [hasMultipleLocations, setHasMultipleLocations] = useState(false);

  // Use a ref to prevent infinite loops
  const isUpdating = useRef(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_method: "sepa",
      invoice_type: "company",
      billing_info: billingInfos,
    },
  });

  // Check if we have multiple locations
  useEffect(() => {
    if (formData && formData.locations && Array.isArray(formData.locations)) {
      setHasMultipleLocations(formData.locations.length > 1);
    }
  }, [formData]);

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      // Set payment method and invoice type with defaults
      const paymentMethod = formData.payment_method || "sepa";
      let invoiceType = formData.invoice_type || "company";

      // Set billing info with proper validation
      let billingInfo = formData.billing_info || [{ billing_email: "" }];

      // Ensure billing_info is an array
      if (!Array.isArray(billingInfo)) {
        billingInfo = [{ billing_email: "" }];
      }

      // Make sure we have locations with IDs
      let locationsWithIds = [];
      if (formData.locations && Array.isArray(formData.locations)) {
        locationsWithIds = ensureLocationIds(formData.locations);

        // Update locations with IDs in form data if needed
        if (
          JSON.stringify(locationsWithIds) !==
          JSON.stringify(formData.locations)
        ) {
          updateFormData({ locations: locationsWithIds });
        }
      }

      // If only one location, force the invoice type to "company"
      if (locationsWithIds.length <= 1 && invoiceType === "location") {
        invoiceType = "company";
      }

      // If we have locations but no billing info, create billing info for each location
      if (
        invoiceType === "location" &&
        locationsWithIds.length > 0 &&
        (billingInfo.length === 0 ||
          (billingInfo.length === 1 && !billingInfo[0].location_id))
      ) {
        // Create billing info for each location
        billingInfo = locationsWithIds.map((location: any) => ({
          location_id: location.id || generateLocationId(),
          location_name: location.name || "",
          iban: "",
          account_holder: "",
          billing_email: "",
          phone: "",
        }));
      }

      // Set state
      setBillingInfos(billingInfo);

      // This will NOT trigger the watch function
      form.reset({
        payment_method: paymentMethod,
        invoice_type: invoiceType,
        billing_info: billingInfo,
      });
    }
  }, [formData, form, updateFormData]);

  // Update billing info when invoice type changes
  const handleInvoiceTypeChange = (value: "company" | "location") => {
    // Skip if we're already updating
    if (isUpdating.current) return;

    // Set flag to prevent recursion
    isUpdating.current = true;

    try {
      // Keep track of the invoice type change for normalization
      const previousInvoiceType = formData.invoice_type;

      // Special handling for switching from company to location
      if (value === "location" && previousInvoiceType === "company") {
        // Create fresh billing info for each location
        if (
          formData.locations &&
          Array.isArray(formData.locations) &&
          formData.locations.length > 0
        ) {
          // Get a template from existing billing info
          const templateInfo = billingInfos[0] || { billing_email: "" };

          // Create a fresh billing info for each location
          const newBillingInfos = formData.locations.map((location: any) => ({
            location_id: location.id || generateLocationId(),
            location_name: location.name || "",
            iban: templateInfo.iban || "",
            account_holder: templateInfo.account_holder || "",
            billing_email: templateInfo.billing_email || "",
            phone: templateInfo.phone || "",
          }));

          // Update state
          setBillingInfos(newBillingInfos);

          // Update form
          form.setValue("billing_info", newBillingInfos, {
            shouldValidate: false,
          });

          // Update form data with change history
          updateFormData({
            invoice_type: value,
            billing_info: newBillingInfos,
            _history: { invoice_type: previousInvoiceType },
          });

          // Early return since we've handled everything
          return;
        }
      } else if (value === "company" && previousInvoiceType === "location") {
        // If switching to company, only keep the first billing info without location ID
        const newBillingInfos = [
          {
            ...billingInfos[0],
            location_id: undefined,
            location_name: undefined,
          },
        ];

        // Update state
        setBillingInfos(newBillingInfos);

        // Update form
        form.setValue("billing_info", newBillingInfos, {
          shouldValidate: false,
        });

        // Update form data with change history
        updateFormData({
          invoice_type: value,
          billing_info: newBillingInfos,
          _history: { invoice_type: previousInvoiceType },
        });

        // Early return since we've handled everything
        return;
      }

      // Standard handling for less complex cases
      if (value === "company" && billingInfos.length > 1) {
        // If switching to company, only keep the first billing info
        const newBillingInfos = [
          {
            ...billingInfos[0],
            location_id: undefined,
            location_name: undefined,
          },
        ];

        // Update state first
        setBillingInfos(newBillingInfos);

        // Then update form
        form.setValue("billing_info", newBillingInfos, {
          shouldValidate: false,
        });

        // Update form data
        updateFormData({
          invoice_type: value,
          billing_info: newBillingInfos,
        });
      } else if (
        value === "location" &&
        formData.locations &&
        Array.isArray(formData.locations) &&
        formData.locations.length > 0
      ) {
        // Ensure locations have IDs
        const locationsWithIds = ensureLocationIds(formData.locations);

        // Check if we need to create location-specific billing info
        const needsLocationUpdate =
          billingInfos.length !== locationsWithIds.length ||
          !billingInfos.some((info) => info.location_id);

        if (needsLocationUpdate) {
          // Create billing info for each location
          const newBillingInfos = locationsWithIds.map((location: any) => {
            // Try to find existing billing info for this location
            const existingInfo = billingInfos.find(
              (info) => info.location_id === location.id,
            );

            // Use first entry as template if needed
            const templateInfo = existingInfo || billingInfos[0] || {};

            return {
              location_id: location.id,
              location_name: location.name || "",
              iban: existingInfo?.iban || templateInfo.iban || "",
              account_holder:
                existingInfo?.account_holder ||
                templateInfo.account_holder ||
                "",
              billing_email:
                existingInfo?.billing_email || templateInfo.billing_email || "",
              phone: existingInfo?.phone || templateInfo.phone || "",
            };
          });

          // Update state first
          setBillingInfos(newBillingInfos);

          // Then update form
          form.setValue("billing_info", newBillingInfos, {
            shouldValidate: false,
          });

          // Update form data
          updateFormData({
            invoice_type: value,
            billing_info: newBillingInfos,
          });
        }
      }
    } finally {
      // Clear updating flag
      isUpdating.current = false;
    }
  };

  const onSubmit = async (values: FormValues) => {
    // Make sure we're not trying to use location-specific billing with only one location
    if (values.invoice_type === "location" && !hasMultipleLocations) {
      values.invoice_type = "company";
    }

    // Prepare billing info based on invoice type
    let finalBillingInfo = [];

    if (values.invoice_type === "location") {
      // For location billing, ensure each entry has a location ID
      finalBillingInfo = values.billing_info.map((info, index) => {
        if (
          !info.location_id &&
          formData.locations &&
          formData.locations[index]
        ) {
          const location = formData.locations[index];
          return {
            ...info,
            location_id: location.id || generateLocationId(),
            location_name: location.name || "",
          };
        }
        return info;
      });
    } else {
      // For company billing, use single entry without location ID
      finalBillingInfo = [
        {
          ...values.billing_info[0],
          location_id: undefined,
          location_name: undefined,
        },
      ];
    }

    try {
      // DIRECT REPLACEMENT APPROACH:
      // 1. Create a completely new form data object without any billing info
      const formDataWithoutBilling = { ...formData };
      delete formDataWithoutBilling.billing_info;

      // 2. Create a clean update with only our new billing info
      const cleanUpdate = {
        ...formDataWithoutBilling,
        payment_method: values.payment_method,
        invoice_type: values.invoice_type,
        billing_info: JSON.parse(JSON.stringify(finalBillingInfo)), // Deep copy to prevent reference issues
      };

      // 3. Update the context with the complete replacement
      updateFormData(cleanUpdate);

      // 4. Save the complete replacement to the database
      await saveProgress(cleanUpdate);

      // Now move to the next step
      nextStep();
    } catch (error) {
      console.error("Error saving form data:", error);
      alert(
        "Es gab ein Problem beim Speichern der Daten. Bitte versuchen Sie es erneut.",
      );
    }
  };

  const updateBillingInfo = (
    index: number,
    field: keyof BillingInfo,
    value: string,
  ) => {
    // Skip if we're already updating
    if (isUpdating.current) return;

    // Set flag to prevent recursion
    isUpdating.current = true;

    try {
      // Make a deep copy of the current billing infos
      const updatedBillingInfos = [...billingInfos];

      // Update the specific field
      updatedBillingInfos[index] = {
        ...updatedBillingInfos[index],
        [field]: value,
      };

      // First update the local state
      setBillingInfos(updatedBillingInfos);

      // Then update the form value
      form.setValue("billing_info", updatedBillingInfos, {
        shouldValidate: false,
      });
    } finally {
      // Clear updating flag
      isUpdating.current = false;
    }
  };

  return (
    <StepLayout
      title="Buchhaltung"
      description="Bitte geben Sie Informationen zur Buchhaltung und Rechnungsstellung an."
      onSave={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Zahlungsmethode</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="sepa" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Bankeinzug (SEPA)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="invoice" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Auf Rechnung
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
            name="invoice_type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Rechnungsstellung</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value as string);
                      handleInvoiceTypeChange(value as "company" | "location");
                    }}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="company" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Eine Rechnung für die gesamte Gesellschaft
                      </FormLabel>
                    </FormItem>
                    <FormItem
                      className={`flex items-center space-x-3 space-y-0 ${!hasMultipleLocations ? "opacity-50" : ""}`}
                    >
                      <FormControl>
                        <RadioGroupItem
                          value="location"
                          disabled={!hasMultipleLocations}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Separate Rechnung pro Standort
                        {!hasMultipleLocations && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (Benötigt mehrere Standorte)
                          </span>
                        )}
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Rechnungsinformationen</h3>

            {billingInfos.map((billingInfo, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>
                    {form.watch("invoice_type") === "location" &&
                    billingInfo.location_name
                      ? `Standort: ${billingInfo.location_name}`
                      : "Rechnungsinformationen"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.watch("payment_method") === "sepa" && (
                    <>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <FormLabel htmlFor={`billing-${index}-iban`}>
                            IBAN *
                          </FormLabel>
                          <Input
                            id={`billing-${index}-iban`}
                            placeholder="z.B. DE12345678901234567890"
                            value={billingInfo.iban || ""}
                            onChange={(e) =>
                              updateBillingInfo(index, "iban", e.target.value)
                            }
                          />
                          {form.formState.errors.billing_info?.[index]
                            ?.iban && (
                            <p className="text-sm text-destructive">
                              {
                                form.formState.errors.billing_info[index]?.iban
                                  ?.message
                              }
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <FormLabel
                            htmlFor={`billing-${index}-account-holder`}
                          >
                            Kontoinhaber *
                          </FormLabel>
                          <Input
                            id={`billing-${index}-account-holder`}
                            placeholder="z.B. Max Mustermann GmbH"
                            value={billingInfo.account_holder || ""}
                            onChange={(e) =>
                              updateBillingInfo(
                                index,
                                "account_holder",
                                e.target.value,
                              )
                            }
                          />
                          {form.formState.errors.billing_info?.[index]
                            ?.account_holder && (
                            <p className="text-sm text-destructive">
                              {
                                form.formState.errors.billing_info[index]
                                  ?.account_holder?.message
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <FormLabel htmlFor={`billing-${index}-email`}>
                        E-Mail für Rechnungen *
                      </FormLabel>
                      <Input
                        id={`billing-${index}-email`}
                        type="email"
                        placeholder="z.B. rechnung@example.com"
                        value={billingInfo.billing_email || ""}
                        onChange={(e) =>
                          updateBillingInfo(
                            index,
                            "billing_email",
                            e.target.value,
                          )
                        }
                      />
                      {form.formState.errors.billing_info?.[index]
                        ?.billing_email && (
                        <p className="text-sm text-destructive">
                          {
                            form.formState.errors.billing_info[index]
                              ?.billing_email?.message
                          }
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <FormLabel htmlFor={`billing-${index}-phone`}>
                        Telefon für Rückfragen (optional)
                      </FormLabel>
                      <Input
                        id={`billing-${index}-phone`}
                        placeholder="z.B. +49 123 456789"
                        value={billingInfo.phone || ""}
                        onChange={(e) =>
                          updateBillingInfo(index, "phone", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Form>
    </StepLayout>
  );
};
