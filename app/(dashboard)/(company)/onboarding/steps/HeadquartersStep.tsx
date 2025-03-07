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
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { GermanStates } from "@/shared/model";

const formSchema = z.object({
  headquarters_name: z.string().optional().nullable(),
  headquarters_street: z.string().min(1, "Straße ist erforderlich"),
  headquarters_house_number: z.string().min(1, "Hausnummer ist erforderlich"),
  headquarters_postal_code: z
    .string()
    .min(5, "Postleitzahl muss mindestens 5 Zeichen haben"),
  headquarters_city: z.string().min(1, "Stadt ist erforderlich"),
  headquarters_state: z.enum([
    GermanStates.BADEN_WUERTTEMBERG,
    GermanStates.BAYERN,
    GermanStates.BERLIN,
    GermanStates.BRANDENBURG,
    GermanStates.BREMEN,
    GermanStates.HAMBURG,
    GermanStates.HESSEN,
    GermanStates.MECKLENBURG_VORPOMMERN,
    GermanStates.NIEDERSACHSEN,
    GermanStates.NORDRHEIN_WESTFALEN,
    GermanStates.RHEINLAND_PFALZ,
    GermanStates.SAARLAND,
    GermanStates.SACHSEN,
    GermanStates.SACHSEN_ANHALT,
    GermanStates.SCHLESWIG_HOLSTEIN,
    GermanStates.THUERINGEN,
  ]),
  has_canteen: z.boolean().default(false),
  has_ev_charging: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export const HeadquartersStep = () => {
  const { formData, updateFormData, saveProgress } = useOnboarding();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      headquarters_name: "",
      headquarters_street: "",
      headquarters_house_number: "",
      headquarters_postal_code: "",
      headquarters_city: "",
      headquarters_state: GermanStates.BAYERN,
      has_canteen: false,
      has_ev_charging: false,
    },
  });

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      form.reset({
        headquarters_name: formData.headquarters_name || "",
        headquarters_street: formData.headquarters_street || "",
        headquarters_house_number: formData.headquarters_house_number || "",
        headquarters_postal_code: formData.headquarters_postal_code || "",
        headquarters_city: formData.headquarters_city || "",
        headquarters_state: formData.headquarters_state || GermanStates.BAYERN,
        has_canteen: formData.has_canteen || false,
        has_ev_charging: formData.has_ev_charging || false,
      });
    }
  }, [formData, form]);

  const onSubmit = async (values: FormValues) => {
    updateFormData(values);
    await saveProgress(values, true);
  };

  return (
    <StepLayout
      title="Hauptniederlassung"
      description="Bitte geben Sie Informationen zur Hauptniederlassung Ihrer Gesellschaft an."
      onSave={form.handleSubmit(onSubmit)}
      disableNext={!form.formState.isValid}
    >
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="headquarters_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Bezeichnung der Hauptniederlassung (optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="z.B. Zentrale, Hauptsitz"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Falls Ihre Hauptniederlassung eine spezielle Bezeichnung hat.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="headquarters_street"
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
              name="headquarters_house_number"
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
              name="headquarters_postal_code"
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
              name="headquarters_city"
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
            name="headquarters_state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bundesland</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Bitte wählen Sie ein Bundesland" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={GermanStates.BADEN_WUERTTEMBERG}>
                      Baden-Württemberg
                    </SelectItem>
                    <SelectItem value={GermanStates.BAYERN}>Bayern</SelectItem>
                    <SelectItem value={GermanStates.BERLIN}>Berlin</SelectItem>
                    <SelectItem value={GermanStates.BRANDENBURG}>
                      Brandenburg
                    </SelectItem>
                    <SelectItem value={GermanStates.BREMEN}>Bremen</SelectItem>
                    <SelectItem value={GermanStates.HAMBURG}>
                      Hamburg
                    </SelectItem>
                    <SelectItem value={GermanStates.HESSEN}>Hessen</SelectItem>
                    <SelectItem value={GermanStates.MECKLENBURG_VORPOMMERN}>
                      Mecklenburg-Vorpommern
                    </SelectItem>
                    <SelectItem value={GermanStates.NIEDERSACHSEN}>
                      Niedersachsen
                    </SelectItem>
                    <SelectItem value={GermanStates.NORDRHEIN_WESTFALEN}>
                      Nordrhein-Westfalen
                    </SelectItem>
                    <SelectItem value={GermanStates.RHEINLAND_PFALZ}>
                      Rheinland-Pfalz
                    </SelectItem>
                    <SelectItem value={GermanStates.SAARLAND}>
                      Saarland
                    </SelectItem>
                    <SelectItem value={GermanStates.SACHSEN}>
                      Sachsen
                    </SelectItem>
                    <SelectItem value={GermanStates.SACHSEN_ANHALT}>
                      Sachsen-Anhalt
                    </SelectItem>
                    <SelectItem value={GermanStates.SCHLESWIG_HOLSTEIN}>
                      Schleswig-Holstein
                    </SelectItem>
                    <SelectItem value={GermanStates.THUERINGEN}>
                      Thüringen
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Zusätzliche Informationen</h3>

            <FormField
              control={form.control}
              name="has_canteen"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Kantine</FormLabel>
                    <FormDescription>
                      Hat Ihre Hauptniederlassung eine Kantine?
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

            <FormField
              control={form.control}
              name="has_ev_charging"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">E-Ladesäulen</FormLabel>
                    <FormDescription>
                      Gibt es E-Ladesäulen für Elektrofahrzeuge?
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
          </div>
        </div>
      </Form>
    </StepLayout>
  );
};
