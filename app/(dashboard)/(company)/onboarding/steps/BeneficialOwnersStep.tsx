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
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

const ownerSchema = z.object({
  firstname: z.string().min(1, "Vorname ist erforderlich"),
  lastname: z.string().min(1, "Nachname ist erforderlich"),
  birth_date: z.string().min(1, "Geburtsdatum ist erforderlich"),
  nationality: z.string().min(1, "Nationalität ist erforderlich"),
  ownership_percentage: z.enum(["more_than_25", "less_than_25"]),
  has_public_office: z.boolean().default(false),
  public_office_description: z.string().optional().nullable(),
});

const formSchema = z.object({
  beneficial_owners: z
    .array(ownerSchema)
    .min(1, "Mindestens ein wirtschaftlich Berechtigter ist erforderlich"),
});

type OwnerValues = z.infer<typeof ownerSchema>;
type FormValues = z.infer<typeof formSchema>;

export const BeneficialOwnersStep = () => {
  const { formData, updateFormData, saveProgress } = useOnboarding();
  const [owners, setOwners] = useState<OwnerValues[]>([
    {
      firstname: "",
      lastname: "",
      birth_date: "",
      nationality: "deutsch",
      ownership_percentage: "more_than_25",
      has_public_office: false,
      public_office_description: null,
    },
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficial_owners: owners,
    },
  });

  // Load existing data into the form
  useEffect(() => {
    if (
      formData &&
      formData.beneficial_owners &&
      formData.beneficial_owners.length > 0
    ) {
      setOwners(formData.beneficial_owners);
      form.reset({
        beneficial_owners: formData.beneficial_owners,
      });
    }
  }, [formData, form]);

  const addOwner = () => {
    setOwners([
      ...owners,
      {
        firstname: "",
        lastname: "",
        birth_date: "",
        nationality: "deutsch",
        ownership_percentage: "more_than_25",
        has_public_office: false,
        public_office_description: null,
      },
    ]);
    const currentOwners = form.getValues().beneficial_owners || [];
    form.setValue("beneficial_owners", [
      ...currentOwners,
      {
        firstname: "",
        lastname: "",
        birth_date: "",
        nationality: "deutsch",
        ownership_percentage: "more_than_25",
        has_public_office: false,
        public_office_description: null,
      },
    ]);
  };

  const removeOwner = (index: number) => {
    if (owners.length > 1) {
      const newOwners = [...owners];
      newOwners.splice(index, 1);
      setOwners(newOwners);
      form.setValue("beneficial_owners", newOwners);
    }
  };

  const onSubmit = async (values: FormValues) => {
    updateFormData(values);
    await saveProgress(values, true);
  };

  return (
    <StepLayout
      title="Wirtschaftlich Berechtigte"
      description="Bitte geben Sie Informationen zu den wirtschaftlich Berechtigten Ihrer Gesellschaft an."
      onSave={form.handleSubmit(onSubmit)}
      disableNext={!form.formState.isValid}
    >
      <Form {...form}>
        <div className="space-y-6">
          {owners.map((_, index) => (
            <div key={index} className="space-y-4 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Wirtschaftlich Berechtigter {index + 1}
                </h3>
                {owners.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOwner(index)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Entfernen
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`beneficial_owners.${index}.firstname`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vorname</FormLabel>
                      <FormControl>
                        <Input placeholder="Vorname" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`beneficial_owners.${index}.lastname`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nachname</FormLabel>
                      <FormControl>
                        <Input placeholder="Nachname" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`beneficial_owners.${index}.birth_date`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geburtsdatum</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          placeholder="TT.MM.JJJJ"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`beneficial_owners.${index}.nationality`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nationalität</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. deutsch" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`beneficial_owners.${index}.ownership_percentage`}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Beteiligungshöhe</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="more_than_25" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Mehr als 25%
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="less_than_25" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Weniger als 25%
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
                name={`beneficial_owners.${index}.has_public_office`}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Öffentliches Amt
                      </FormLabel>
                      <FormDescription>
                        Bekleidet die Person ein öffentliches Amt?
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

              {form.watch(`beneficial_owners.${index}.has_public_office`) && (
                <FormField
                  control={form.control}
                  name={`beneficial_owners.${index}.public_office_description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beschreibung des öffentlichen Amts</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="z.B. Bürgermeister, Abgeordneter"
                          {...field}
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addOwner}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Weiteren wirtschaftlich Berechtigten hinzufügen
          </Button>
        </div>
      </Form>
    </StepLayout>
  );
};
