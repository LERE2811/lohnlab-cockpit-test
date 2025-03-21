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
import { CreditCard, Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  has_givve_card: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export const GivveCardStep = () => {
  const { formData, updateFormData, saveProgress, nextStep } = useOnboarding();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      has_givve_card: false,
    },
  });

  // Load existing data into the form
  useEffect(() => {
    if (formData) {
      form.reset({
        has_givve_card: formData.has_givve_card || false,
      });
    }
  }, [formData, form]);

  const onSubmit = async (values: FormValues) => {
    // Ensure has_givve_card is explicitly a boolean value
    const updatedValues = {
      has_givve_card: values.has_givve_card === true,
    };

    console.log("GivveCardStep saving value:", updatedValues.has_givve_card);

    // Update form data in context immediately
    updateFormData(updatedValues);

    // Save to database and ensure we wait for it to complete
    try {
      await saveProgress(updatedValues);

      // Proceed to next step
      nextStep();
    } catch (error) {
      console.error("Error saving givve Card step:", error);
    }
  };

  return (
    <StepLayout
      title="givve® Card"
      description="Möchten Sie die givve® Card für Ihre Mitarbeiter nutzen?"
      onSave={form.handleSubmit(onSubmit)}
      disableNext={false}
    >
      <Form {...form}>
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="has_givve_card"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      console.log("Radio value changed to:", value);
                      const boolValue = value === "true";
                      console.log("Setting has_givve_card to:", boolValue);
                      field.onChange(boolValue);
                    }}
                    defaultValue={field.value ? "true" : "false"}
                    className="flex flex-col space-y-3"
                  >
                    <FormItem>
                      <Card
                        className={`cursor-pointer transition-colors ${field.value ? "border-primary" : "hover:border-muted-foreground/25"}`}
                        onClick={() => field.onChange(true)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center">
                            <CreditCard className="mr-2 h-5 w-5 text-primary" />
                            Ja, ich möchte die givve® Card nutzen
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>
                            Die givve® Card ist eine steuerfreie
                            Sachbezugskarte für Ihre Mitarbeiter. Nach Abschluss
                            des Onboardings werden wir einen separaten Prozess
                            für die Einrichtung der givve® Card starten.
                          </CardDescription>
                        </CardContent>
                      </Card>
                      <div className="hidden">
                        <FormControl>
                          <RadioGroupItem value="true" />
                        </FormControl>
                      </div>
                    </FormItem>

                    <FormItem>
                      <Card
                        className={`cursor-pointer transition-colors ${!field.value ? "border-primary" : "hover:border-muted-foreground/25"}`}
                        onClick={() => field.onChange(false)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle>
                            Nein, ich möchte die givve® Card nicht nutzen
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription>
                            Sie können die givve® Card jederzeit später
                            aktivieren.
                          </CardDescription>
                        </CardContent>
                      </Card>
                      <div className="hidden">
                        <FormControl>
                          <RadioGroupItem value="false" />
                        </FormControl>
                      </div>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("has_givve_card") && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start space-x-3">
                <Info className="mt-0.5 h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-medium">Hinweis zur givve® Card</h3>
                  <p className="text-sm text-muted-foreground">
                    Nach Abschluss des Onboardings werden wir einen separaten
                    Prozess für die Einrichtung der givve® Card starten. Sie
                    erhalten dann weitere Informationen per E-Mail.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Form>
    </StepLayout>
  );
};
