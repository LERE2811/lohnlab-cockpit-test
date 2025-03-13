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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, UserPlus, X } from "lucide-react";

const contactSchema = z.object({
  first_name: z.string().min(1, "Bitte geben Sie einen Vornamen ein"),
  last_name: z.string().min(1, "Bitte geben Sie einen Nachnamen ein"),
  email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein"),
  phone: z.string().optional(),
  categories: z
    .array(z.string())
    .min(1, "Bitte wählen Sie mindestens eine Kategorie"),
  company_name: z.string().optional(), // For external service providers
  has_cockpit_access: z.boolean().default(false),
});

const formSchema = z.object({
  contacts: z
    .array(contactSchema)
    .min(1, "Mindestens ein Ansprechpartner ist erforderlich"),
});

type ContactValues = z.infer<typeof contactSchema>;
type FormValues = z.infer<typeof formSchema>;

export const AnsprechpartnerStep = () => {
  const { formData, updateFormData, saveProgress, nextStep } = useOnboarding();
  const [contacts, setContacts] = useState<ContactValues[]>([
    {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      categories: [],
      company_name: "",
      has_cockpit_access: false,
    },
  ]);

  // Get categories based on form data
  const getCategories = () => {
    const categories = [
      { value: "buchhaltung", label: "Buchhaltung" },
      { value: "lohnabrechnung", label: "Lohnabrechnung" },
      { value: "personalwesen", label: "Personalwesen" },
    ];

    // Add locations as categories if they exist
    if (formData && formData.locations && formData.locations.length > 0) {
      formData.locations.forEach((location: any, index: number) => {
        categories.push({
          value: `location_${index}`,
          label: `Niederlassung: ${location.name || `Standort ${index + 1}`}`,
        });
      });
    }

    return categories;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contacts: contacts,
    },
  });

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      form.reset({
        contacts: formData.contacts || [],
      });
      setContacts(formData.contacts || []);
    }
  }, [formData, form]);

  const onSubmit = async (values: FormValues) => {
    updateFormData(values);
    await saveProgress(values);
    nextStep();
  };

  const addContact = () => {
    const newContact: ContactValues = {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      categories: [],
      company_name: "",
      has_cockpit_access: false,
    };

    const updatedContacts = [...contacts, newContact];
    setContacts(updatedContacts);
    form.setValue("contacts", updatedContacts);
  };

  const removeContact = (index: number) => {
    if (contacts.length <= 1) return; // Don't remove the last contact

    const updatedContacts = contacts.filter((_, i) => i !== index);
    setContacts(updatedContacts);
    form.setValue("contacts", updatedContacts);
  };

  const updateContact = (
    index: number,
    field: keyof ContactValues,
    value: any,
  ) => {
    const updatedContacts = [...contacts];
    updatedContacts[index] = {
      ...updatedContacts[index],
      [field]: value,
    };
    setContacts(updatedContacts);
    form.setValue("contacts", updatedContacts);
  };

  const toggleCategory = (index: number, categoryValue: string) => {
    const updatedContacts = [...contacts];
    const currentCategories = [...updatedContacts[index].categories];

    if (currentCategories.includes(categoryValue)) {
      // Remove category if already selected
      const updatedCategories = currentCategories.filter(
        (cat) => cat !== categoryValue,
      );
      updatedContacts[index].categories = updatedCategories;
    } else {
      // Add category if not already selected
      updatedContacts[index].categories = [...currentCategories, categoryValue];
    }

    setContacts(updatedContacts);
    form.setValue("contacts", updatedContacts);
  };

  // Check if external payroll processing is selected
  const isExternalPayroll =
    formData && formData.payroll_processing_type === "extern";

  return (
    <StepLayout
      title="Ansprechpartner"
      description="Bitte geben Sie Informationen zu den Ansprechpartnern der Gesellschaft an."
      onSave={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <div className="space-y-6">
          {contacts.map((contact, index) => (
            <Card key={index} className="mb-6">
              <CardHeader>
                <CardTitle>
                  {contact.first_name || contact.last_name
                    ? `${contact.first_name} ${contact.last_name}`
                    : `Ansprechpartner ${index + 1}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormLabel htmlFor={`contact-${index}-first-name`}>
                      Vorname *
                    </FormLabel>
                    <Input
                      id={`contact-${index}-first-name`}
                      placeholder="z.B. Max"
                      value={contact.first_name}
                      onChange={(e) =>
                        updateContact(index, "first_name", e.target.value)
                      }
                    />
                    {form.formState.errors.contacts?.[index]?.first_name && (
                      <p className="text-sm text-destructive">
                        {
                          form.formState.errors.contacts[index]?.first_name
                            ?.message
                        }
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <FormLabel htmlFor={`contact-${index}-last-name`}>
                      Nachname *
                    </FormLabel>
                    <Input
                      id={`contact-${index}-last-name`}
                      placeholder="z.B. Mustermann"
                      value={contact.last_name}
                      onChange={(e) =>
                        updateContact(index, "last_name", e.target.value)
                      }
                    />
                    {form.formState.errors.contacts?.[index]?.last_name && (
                      <p className="text-sm text-destructive">
                        {
                          form.formState.errors.contacts[index]?.last_name
                            ?.message
                        }
                      </p>
                    )}
                  </div>
                </div>

                {isExternalPayroll && (
                  <div className="space-y-2">
                    <FormLabel htmlFor={`contact-${index}-company`}>
                      Externes Unternehmen
                    </FormLabel>
                    <Input
                      id={`contact-${index}-company`}
                      placeholder="z.B. Steuerberatung Müller GmbH"
                      value={contact.company_name || ""}
                      onChange={(e) =>
                        updateContact(index, "company_name", e.target.value)
                      }
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormLabel htmlFor={`contact-${index}-email`}>
                      E-Mail *
                    </FormLabel>
                    <Input
                      id={`contact-${index}-email`}
                      type="email"
                      placeholder="z.B. max.mustermann@example.com"
                      value={contact.email}
                      onChange={(e) =>
                        updateContact(index, "email", e.target.value)
                      }
                    />
                    {form.formState.errors.contacts?.[index]?.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.contacts[index]?.email?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <FormLabel htmlFor={`contact-${index}-phone`}>
                      Telefon (optional)
                    </FormLabel>
                    <Input
                      id={`contact-${index}-phone`}
                      placeholder="z.B. +49 123 456789"
                      value={contact.phone || ""}
                      onChange={(e) =>
                        updateContact(index, "phone", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel htmlFor={`contact-${index}-categories`}>
                    Kategorien *
                  </FormLabel>
                  <div className="space-y-3">
                    {contact.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {contact.categories.map((categoryValue) => {
                          const category = getCategories().find(
                            (c) => c.value === categoryValue,
                          );
                          return (
                            <Badge
                              key={categoryValue}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {category?.label || categoryValue}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() =>
                                  toggleCategory(index, categoryValue)
                                }
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {getCategories().map((category) => {
                        const isSelected = contact.categories.includes(
                          category.value,
                        );
                        return (
                          <Button
                            key={category.value}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              toggleCategory(index, category.value)
                            }
                            className={`rounded-full ${isSelected ? "opacity-70" : ""}`}
                          >
                            {category.label}
                          </Button>
                        );
                      })}
                    </div>

                    {contact.categories.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Bitte wählen Sie mindestens eine Kategorie aus
                      </p>
                    )}
                  </div>
                  {form.formState.errors.contacts?.[index]?.categories && (
                    <p className="text-sm text-destructive">
                      {
                        form.formState.errors.contacts[index]?.categories
                          ?.message
                      }
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Zugang zum Cockpit
                    </FormLabel>
                    <FormDescription>
                      Soll dieser Ansprechpartner Zugang zum Cockpit erhalten?
                    </FormDescription>
                  </div>
                  <Switch
                    checked={contact.has_cockpit_access}
                    onCheckedChange={(checked) =>
                      updateContact(index, "has_cockpit_access", checked)
                    }
                  />
                </div>

                {contact.has_cockpit_access && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      Nach Abschluss des Onboardings wird eine Einladung an die
                      angegebene E-Mail-Adresse gesendet.
                    </p>
                  </div>
                )}
              </CardContent>
              {contacts.length > 1 && (
                <CardFooter className="justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeContact(index)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Ansprechpartner entfernen
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addContact}
            className="w-full"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Weiteren Ansprechpartner hinzufügen
          </Button>
        </div>
      </Form>
    </StepLayout>
  );
};
