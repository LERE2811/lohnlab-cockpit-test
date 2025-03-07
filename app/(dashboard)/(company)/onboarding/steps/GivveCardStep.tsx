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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { GivveCardDesignTypes } from "@/shared/model";

const formSchema = z.object({
  has_givve_card: z.boolean(),
  givve_legal_form: z.string().optional().nullable(),
  givve_card_design_type: z
    .enum([
      GivveCardDesignTypes.STANDARD_CARD,
      GivveCardDesignTypes.LOGO_CARD,
      GivveCardDesignTypes.DESIGN_CARD,
    ])
    .optional()
    .nullable(),
  givve_company_logo_url: z.string().optional().nullable(),
  givve_card_design_url: z.string().optional().nullable(),
  givve_standard_postal_code: z.string().optional().nullable(),
  givve_card_second_line: z
    .string()
    .max(21, "Maximal 21 Zeichen erlaubt")
    .optional()
    .nullable(),
  givve_loading_date: z.enum(["10", "15", "30"]).optional().nullable(),
  givve_industry_category: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export const GivveCardStep = () => {
  const { formData, updateFormData, saveProgress } = useOnboarding();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      has_givve_card: false,
      givve_legal_form: null,
      givve_card_design_type: null,
      givve_company_logo_url: null,
      givve_card_design_url: null,
      givve_standard_postal_code: null,
      givve_card_second_line: null,
      givve_loading_date: null,
      givve_industry_category: null,
    },
  });

  // Watch the has_givve_card field to conditionally show other fields
  const hasGivveCard = form.watch("has_givve_card");
  const cardDesignType = form.watch("givve_card_design_type");

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      form.reset({
        has_givve_card: formData.has_givve_card || false,
        givve_legal_form: formData.givve_legal_form || null,
        givve_card_design_type: formData.givve_card_design_type || null,
        givve_company_logo_url: formData.givve_company_logo_url || null,
        givve_card_design_url: formData.givve_card_design_url || null,
        givve_standard_postal_code: formData.givve_standard_postal_code || null,
        givve_card_second_line: formData.givve_card_second_line || null,
        givve_loading_date: formData.givve_loading_date || null,
        givve_industry_category: formData.givve_industry_category || null,
      });
    }
  }, [formData, form]);

  const onSubmit = async (values: FormValues) => {
    // If has_givve_card is false, reset the other fields
    if (!values.has_givve_card) {
      values.givve_legal_form = null;
      values.givve_card_design_type = null;
      values.givve_company_logo_url = null;
      values.givve_card_design_url = null;
      values.givve_standard_postal_code = null;
      values.givve_card_second_line = null;
      values.givve_loading_date = null;
      values.givve_industry_category = null;
    }

    updateFormData(values);
    await saveProgress(values, true);
  };

  return (
    <StepLayout
      title="Givve Card"
      description="Bitte geben Sie an, ob Ihre Gesellschaft die Givve Card nutzt oder nutzen möchte."
      onSave={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="has_givve_card"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Givve Card</FormLabel>
                  <FormDescription>
                    Nutzt Ihre Gesellschaft die Givve Card oder möchte sie
                    nutzen?
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

          {hasGivveCard && (
            <>
              <FormField
                control={form.control}
                name="givve_legal_form"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rechtsform für Givve</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. GmbH"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Bitte geben Sie die Rechtsform an, die auf der Givve Card
                      erscheinen soll.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="givve_card_design_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Kartendesign</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value={GivveCardDesignTypes.STANDARD_CARD}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Standardkarte
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value={GivveCardDesignTypes.LOGO_CARD}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Logokarte (mit Ihrem Unternehmenslogo)
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem
                              value={GivveCardDesignTypes.DESIGN_CARD}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Designkarte (individuelles Design)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {cardDesignType === GivveCardDesignTypes.LOGO_CARD && (
                <FormField
                  control={form.control}
                  name="givve_company_logo_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Bitte geben Sie einen Link zu Ihrem Unternehmenslogo an.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {cardDesignType === GivveCardDesignTypes.DESIGN_CARD && (
                <FormField
                  control={form.control}
                  name="givve_card_design_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Design URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Bitte geben Sie einen Link zu Ihrem gewünschten
                        Kartendesign an.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="givve_card_second_line"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zweite Zeile auf der Karte</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. Mitarbeiterbenefits"
                        maxLength={21}
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximal 21 Zeichen. Diese Zeile erscheint unter dem
                      Firmennamen auf der Karte.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="givve_loading_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aufladedatum</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Bitte wählen Sie ein Datum" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="10">10. des Monats</SelectItem>
                        <SelectItem value="15">15. des Monats</SelectItem>
                        <SelectItem value="30">30. des Monats</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      An diesem Tag werden die Karten monatlich aufgeladen.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="givve_industry_category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branchenkategorie</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="z.B. IT, Handel, Dienstleistung"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Diese Information wird für statistische Zwecke verwendet.
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
