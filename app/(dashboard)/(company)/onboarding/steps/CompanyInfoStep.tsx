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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

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
});

type FormValues = z.infer<typeof formSchema>;

export const CompanyInfoStep = () => {
  const { formData, updateFormData, saveProgress } = useOnboarding();

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
      });
    }
  }, [formData, form]);

  const onSubmit = async (values: FormValues) => {
    updateFormData(values);
    await saveProgress(values, true);
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
                    <Input placeholder="Straße" {...field} />
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
                    <Input placeholder="Hausnummer" {...field} />
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
                    <Input placeholder="PLZ" {...field} />
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
                    <Input placeholder="Stadt" {...field} />
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
        </div>
      </Form>
    </StepLayout>
  );
};
