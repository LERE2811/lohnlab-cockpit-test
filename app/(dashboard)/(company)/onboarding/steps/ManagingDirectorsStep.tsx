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
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const directorSchema = z.object({
  firstname: z.string().min(1, "Vorname ist erforderlich"),
  lastname: z.string().min(1, "Nachname ist erforderlich"),
  email: z
    .string()
    .email("Ungültige E-Mail-Adresse")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

const formSchema = z.object({
  managing_directors: z
    .array(directorSchema)
    .min(1, "Mindestens ein Geschäftsführer ist erforderlich"),
});

type DirectorValues = z.infer<typeof directorSchema>;
type FormValues = z.infer<typeof formSchema>;

export const ManagingDirectorsStep = () => {
  const { formData, updateFormData, saveProgress } = useOnboarding();
  const [directors, setDirectors] = useState<DirectorValues[]>([
    { firstname: "", lastname: "", email: "", phone: "" },
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      managing_directors: directors,
    },
  });

  // Load existing data into the form
  useEffect(() => {
    if (
      formData &&
      formData.managing_directors &&
      formData.managing_directors.length > 0
    ) {
      setDirectors(formData.managing_directors);
      form.reset({
        managing_directors: formData.managing_directors,
      });
    }
  }, [formData, form]);

  const addDirector = () => {
    setDirectors([
      ...directors,
      { firstname: "", lastname: "", email: "", phone: "" },
    ]);
    const currentDirectors = form.getValues().managing_directors || [];
    form.setValue("managing_directors", [
      ...currentDirectors,
      { firstname: "", lastname: "", email: "", phone: "" },
    ]);
  };

  const removeDirector = (index: number) => {
    if (directors.length > 1) {
      const newDirectors = [...directors];
      newDirectors.splice(index, 1);
      setDirectors(newDirectors);
      form.setValue("managing_directors", newDirectors);
    }
  };

  const onSubmit = async (values: FormValues) => {
    updateFormData(values);
    await saveProgress(values, true);
  };

  return (
    <StepLayout
      title="Geschäftsführer"
      description="Bitte geben Sie die Informationen zu den Geschäftsführern Ihrer Gesellschaft ein."
      onSave={form.handleSubmit(onSubmit)}
      disableNext={!form.formState.isValid}
    >
      <Form {...form}>
        <div className="space-y-6">
          {directors.map((_, index) => (
            <div key={index} className="space-y-4 rounded-md border p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Geschäftsführer {index + 1}
                </h3>
                {directors.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDirector(index)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Entfernen
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name={`managing_directors.${index}.firstname`}
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
                  name={`managing_directors.${index}.lastname`}
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
                  name={`managing_directors.${index}.email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-Mail (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="E-Mail" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`managing_directors.${index}.phone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Telefon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addDirector}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Weiteren Geschäftsführer hinzufügen
          </Button>
        </div>
      </Form>
    </StepLayout>
  );
};
