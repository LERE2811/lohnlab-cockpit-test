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
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  has_works_council: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export const WorksCouncilStep = () => {
  const { formData, updateFormData, saveProgress } = useOnboarding();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      has_works_council: false,
    },
  });

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      form.reset({
        has_works_council: formData.has_works_council || false,
      });
    }
  }, [formData, form]);

  const onSubmit = async (values: FormValues) => {
    updateFormData(values);
    await saveProgress(values, true);
  };

  return (
    <StepLayout
      title="Betriebsrat"
      description="Bitte geben Sie an, ob Ihre Gesellschaft einen Betriebsrat hat."
      onSave={form.handleSubmit(onSubmit)}
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
                    Hat Ihre Gesellschaft einen Betriebsrat?
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
                werden Sie bei relevanten Themen darauf hinweisen.
              </p>
            </div>
          )}
        </div>
      </Form>
    </StepLayout>
  );
};
