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
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Info } from "lucide-react";

const payrollSystems = [
  { value: "datev", label: "DATEV" },
  { value: "lexware", label: "Lexware" },
  { value: "sage", label: "Sage" },
  { value: "lohn_ag", label: "Lohn AG" },
  { value: "addison", label: "Addison" },
  { value: "eurodata", label: "Eurodata" },
  { value: "sonstige", label: "Sonstige" },
];

const formSchema = z.object({
  payroll_processing_type: z.enum(["intern", "extern"]),
  payroll_system: z
    .string()
    .min(1, "Bitte wählen Sie ein Lohnabrechnungssystem"),
  custom_payroll_system: z
    .string()
    .optional()
    .refine(
      (val) => {
        // If payroll_system is "sonstige", custom_payroll_system is required
        return true;
      },
      {
        message: "Bitte geben Sie den Namen des Systems ein",
      },
    ),
  wants_import_file: z.boolean().default(false),
  import_date_type: z.enum(["standard", "custom"]).default("standard"),
  custom_import_date: z
    .string()
    .optional()
    .refine(
      (val) => {
        // If import_date_type is "custom", custom_import_date is required
        return true;
      },
      {
        message: "Bitte geben Sie ein Datum oder eine Bedingung ein",
      },
    ),
});

type FormValues = z.infer<typeof formSchema>;

export const LohnabrechnungStep = () => {
  const { formData, updateFormData, saveProgress, nextStep } = useOnboarding();
  const [showCustomSystem, setShowCustomSystem] = useState(false);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payroll_processing_type: "intern",
      payroll_system: "",
      custom_payroll_system: "",
      wants_import_file: false,
      import_date_type: "standard",
      custom_import_date: "",
    },
    mode: "onChange", // Validate on change for immediate feedback
  });

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      // Handle the payroll_processing/payroll_processing_type mismatch
      const processingType =
        formData.payroll_processing_type ||
        formData.payroll_processing ||
        "intern";

      // Ensure boolean values are properly set
      const wantsImportFile = formData.wants_import_file === true;

      // Set default import_date_type if not present
      const importDateType = formData.import_date_type || "standard";

      form.reset({
        payroll_processing_type: processingType,
        payroll_system: formData.payroll_system || "",
        custom_payroll_system: formData.custom_payroll_system || "",
        wants_import_file: wantsImportFile,
        import_date_type: importDateType,
        custom_import_date: formData.custom_import_date || "",
      });

      // Set the custom system flag if needed
      if (formData.payroll_system === "sonstige") {
        setShowCustomSystem(true);
      }

      // Set the custom date flag if needed
      if (wantsImportFile && importDateType === "custom") {
        setShowCustomDate(true);
      }
    }
  }, [formData, form]);

  // Watch for changes to payroll_system to show/hide custom input
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "payroll_system") {
        setShowCustomSystem(value.payroll_system === "sonstige");
      }
      if (name === "wants_import_file") {
        // If wants_import_file is set to false, reset import_date_type to standard
        if (value.wants_import_file === false) {
          form.setValue("import_date_type", "standard");
          form.setValue("custom_import_date", "");
          setShowCustomDate(false);
        }
      }
      if (name === "import_date_type") {
        setShowCustomDate(value.import_date_type === "custom");
        // If switching back to standard, clear the custom date
        if (value.import_date_type === "standard") {
          form.setValue("custom_import_date", "");
        }
      }

      // Validate form on every change
      validateForm(value);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, form]);

  // Validate the form based on current values
  const validateForm = (values: Partial<FormValues>) => {
    const currentValues = values || form.getValues();

    // Basic required field validation
    let valid =
      !!currentValues.payroll_processing_type &&
      !!currentValues.payroll_system &&
      currentValues.payroll_system.trim() !== "";

    // Custom system validation
    if (currentValues.payroll_system === "sonstige") {
      valid =
        valid &&
        !!currentValues.custom_payroll_system &&
        currentValues.custom_payroll_system.trim() !== "";
    }

    // Custom date validation
    if (
      currentValues.wants_import_file &&
      currentValues.import_date_type === "custom"
    ) {
      valid =
        valid &&
        !!currentValues.custom_import_date &&
        currentValues.custom_import_date.trim() !== "";
    }

    setIsFormValid(valid);
  };

  const onSubmit = async (values: FormValues) => {
    // If "sonstige" is selected, use the custom system name
    if (values.payroll_system === "sonstige" && values.custom_payroll_system) {
      values.payroll_system = values.custom_payroll_system;
    }

    updateFormData(values);
    await saveProgress(values);

    // Use the context's nextStep method instead of router.push
    nextStep();
  };

  // Determine validation message based on form state
  const getValidationMessage = () => {
    const values = form.getValues();

    if (!values.payroll_processing_type) {
      return "Bitte wählen Sie aus, wie die Lohnabrechnung durchgeführt wird.";
    }

    if (!values.payroll_system || values.payroll_system.trim() === "") {
      return "Bitte wählen Sie ein Lohnabrechnungssystem aus.";
    }

    if (
      values.payroll_system === "sonstige" &&
      (!values.custom_payroll_system ||
        values.custom_payroll_system.trim() === "")
    ) {
      return "Bitte geben Sie den Namen des Lohnabrechnungssystems ein.";
    }

    if (
      values.wants_import_file &&
      values.import_date_type === "custom" &&
      (!values.custom_import_date || values.custom_import_date.trim() === "")
    ) {
      return "Bitte geben Sie ein Datum oder eine Bedingung für die Importdatei ein.";
    }

    return "Bitte füllen Sie alle erforderlichen Felder aus.";
  };

  return (
    <StepLayout
      title="Lohnabrechnung"
      description="Bitte geben Sie Informationen zur Lohnabrechnung der Gesellschaft an."
      onSave={form.handleSubmit(onSubmit)}
      disableNext={!isFormValid}
      validationMessage={getValidationMessage()}
    >
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="payroll_processing_type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Wie wird die Lohnabrechnung durchgeführt?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="intern" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Intern (durch eigene Mitarbeiter)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="extern" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Extern (durch Steuerberater oder Dienstleister)
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
            name="payroll_system"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Welches Lohnabrechnungssystem wird verwendet?
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setShowCustomSystem(value === "sonstige");
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Bitte wählen Sie ein Lohnabrechnungssystem" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {payrollSystems.map((system) => (
                      <SelectItem key={system.value} value={system.value}>
                        {system.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {showCustomSystem && (
            <FormField
              control={form.control}
              name="custom_payroll_system"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name des Lohnabrechnungssystems</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bitte geben Sie den Namen des Systems ein"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="wants_import_file"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Monatliche Importdatei für Lohnabrechnung
                  </FormLabel>
                  <FormDescription>
                    Wir können Ihnen monatlich eine Importdatei für Ihr
                    Lohnabrechnungssystem zur Verfügung stellen.
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

          {form.watch("wants_import_file") && (
            <>
              <FormField
                control={form.control}
                name="import_date_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Wann benötigen Sie die Importdatei?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="standard" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Standarddatum (10. des Monats)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="custom" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Individuelles Datum/Bedingung
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showCustomDate && (
                <FormField
                  control={form.control}
                  name="custom_import_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Individuelles Datum/Bedingung</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="z.B. '5. des Monats' oder 'Jeden ersten Montag im Monat'"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Geben Sie an, wann Sie die Importdatei benötigen. Dies
                        kann ein festes Datum oder eine Bedingung sein.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      Über die Importdatei
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                      <p>
                        Die Importdatei enthält alle relevanten Daten für die
                        Lohnabrechnung, die über das Cockpit erfasst wurden. Sie
                        können zwischen dem Standarddatum (10. des Monats) oder
                        einem individuellen Datum/einer individuellen Bedingung
                        wählen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </Form>
    </StepLayout>
  );
};
