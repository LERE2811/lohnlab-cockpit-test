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
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { CollectiveAgreementTypes } from "@/shared/model";

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
});

type FormValues = z.infer<typeof formSchema>;

export const CollectiveAgreementStep = () => {
  const { formData, updateFormData, saveProgress } = useOnboarding();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      has_collective_agreement: false,
      collective_agreement_type: null,
      collective_agreement_document_url: null,
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
      });
    }
  }, [formData, form]);

  const onSubmit = async (values: FormValues) => {
    // If has_collective_agreement is false, reset the other fields
    if (!values.has_collective_agreement) {
      values.collective_agreement_type = null;
      values.collective_agreement_document_url = null;
    }

    updateFormData(values);
    await saveProgress(values, true);
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
                    <FormLabel>Link zum Tarifvertrag (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Falls vorhanden, können Sie hier einen Link zum
                      Tarifvertrag angeben.
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
