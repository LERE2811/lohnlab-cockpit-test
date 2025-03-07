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
import { PayrollProcessing, PayrollSystems } from "@/shared/model";
import { Separator } from "@/components/ui/separator";

const contactSchema = z.object({
  firstname: z.string().min(1, "Vorname ist erforderlich"),
  lastname: z.string().min(1, "Nachname ist erforderlich"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  phone: z.string().optional().or(z.literal("")),
  company_name: z.string().optional().or(z.literal("")),
});

const formSchema = z.object({
  payroll_processing: z.enum([
    PayrollProcessing.INTERNAL,
    PayrollProcessing.EXTERNAL,
  ]),
  payroll_system: z
    .enum([
      PayrollSystems.DATEV,
      PayrollSystems.LEXWARE,
      PayrollSystems.SAGE,
      PayrollSystems.LOHN_AG,
      PayrollSystems.ADDISON,
      PayrollSystems.OTHER,
    ])
    .optional()
    .nullable(),
  payroll_contacts: z
    .array(contactSchema)
    .min(1, "Mindestens ein Ansprechpartner ist erforderlich"),
});

type ContactValues = z.infer<typeof contactSchema>;
type FormValues = z.infer<typeof formSchema>;

export const PayrollProcessingStep = () => {
  const { formData, updateFormData, saveProgress } = useOnboarding();
  const [contacts, setContacts] = useState<ContactValues[]>([
    { firstname: "", lastname: "", email: "", phone: "", company_name: "" },
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payroll_processing: PayrollProcessing.EXTERNAL,
      payroll_system: null,
      payroll_contacts: contacts,
    },
  });

  // Watch the payroll_processing field to conditionally show payroll_system
  const payrollProcessing = form.watch("payroll_processing");

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      // Initialize contacts with existing data or default
      const existingContacts =
        formData.payroll_contacts && formData.payroll_contacts.length > 0
          ? formData.payroll_contacts
          : [
              {
                firstname: "",
                lastname: "",
                email: "",
                phone: "",
                company_name: "",
              },
            ];

      setContacts(existingContacts);

      form.reset({
        payroll_processing:
          formData.payroll_processing || PayrollProcessing.EXTERNAL,
        payroll_system: formData.payroll_system || null,
        payroll_contacts: existingContacts,
      });
    }
  }, [formData, form]);

  const addContact = () => {
    setContacts([
      ...contacts,
      { firstname: "", lastname: "", email: "", phone: "", company_name: "" },
    ]);
    const currentContacts = form.getValues().payroll_contacts || [];
    form.setValue("payroll_contacts", [
      ...currentContacts,
      { firstname: "", lastname: "", email: "", phone: "", company_name: "" },
    ]);
  };

  const removeContact = (index: number) => {
    if (contacts.length > 1) {
      const newContacts = [...contacts];
      newContacts.splice(index, 1);
      setContacts(newContacts);
      form.setValue("payroll_contacts", newContacts);
    }
  };

  const onSubmit = async (values: FormValues) => {
    updateFormData(values);
    await saveProgress(values, true);
  };

  return (
    <StepLayout
      title="Lohnabrechnung"
      description="Bitte geben Sie Informationen zur Lohnabrechnung und den zuständigen Ansprechpartnern an."
      onSave={form.handleSubmit(onSubmit)}
      disableNext={!form.formState.isValid}
    >
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="payroll_processing"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Wie wird die Lohnabrechnung durchgeführt?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={PayrollProcessing.INTERNAL} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Intern (durch eigene Mitarbeiter)
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={PayrollProcessing.EXTERNAL} />
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

          {payrollProcessing === PayrollProcessing.INTERNAL && (
            <FormField
              control={form.control}
              name="payroll_system"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Welches Lohnabrechnungssystem verwenden Sie?
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Bitte wählen Sie ein System" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PayrollSystems.DATEV}>
                        DATEV
                      </SelectItem>
                      <SelectItem value={PayrollSystems.LEXWARE}>
                        Lexware
                      </SelectItem>
                      <SelectItem value={PayrollSystems.SAGE}>Sage</SelectItem>
                      <SelectItem value={PayrollSystems.LOHN_AG}>
                        Lohn AG
                      </SelectItem>
                      <SelectItem value={PayrollSystems.ADDISON}>
                        Addison
                      </SelectItem>
                      <SelectItem value={PayrollSystems.OTHER}>
                        Sonstiges
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Diese Information hilft uns bei der Integration mit Ihrem
                    System.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Separator className="my-4" />

          <div>
            <h3 className="mb-4 text-lg font-medium">
              {payrollProcessing === PayrollProcessing.INTERNAL
                ? "Ansprechpartner für die Lohnabrechnung"
                : "Externe Ansprechpartner für die Lohnabrechnung"}
            </h3>

            <div className="space-y-6">
              {contacts.map((_, index) => (
                <div key={index} className="space-y-4 rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-medium">
                      Ansprechpartner {index + 1}
                    </h4>
                    {contacts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(index)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Entfernen
                      </Button>
                    )}
                  </div>

                  {payrollProcessing === PayrollProcessing.EXTERNAL && (
                    <FormField
                      control={form.control}
                      name={`payroll_contacts.${index}.company_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unternehmen / Kanzlei</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Name des externen Unternehmens"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name={`payroll_contacts.${index}.firstname`}
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
                      name={`payroll_contacts.${index}.lastname`}
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
                      name={`payroll_contacts.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail</FormLabel>
                          <FormControl>
                            <Input placeholder="E-Mail" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`payroll_contacts.${index}.phone`}
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
                onClick={addContact}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Weiteren Ansprechpartner hinzufügen
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </StepLayout>
  );
};
