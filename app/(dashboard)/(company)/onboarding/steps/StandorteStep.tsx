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
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

const bundeslaender = [
  { value: "baden-wuerttemberg", label: "Baden-Württemberg" },
  { value: "bayern", label: "Bayern" },
  { value: "berlin", label: "Berlin" },
  { value: "brandenburg", label: "Brandenburg" },
  { value: "bremen", label: "Bremen" },
  { value: "hamburg", label: "Hamburg" },
  { value: "hessen", label: "Hessen" },
  { value: "mecklenburg-vorpommern", label: "Mecklenburg-Vorpommern" },
  { value: "niedersachsen", label: "Niedersachsen" },
  { value: "nordrhein-westfalen", label: "Nordrhein-Westfalen" },
  { value: "rheinland-pfalz", label: "Rheinland-Pfalz" },
  { value: "saarland", label: "Saarland" },
  { value: "sachsen", label: "Sachsen" },
  { value: "sachsen-anhalt", label: "Sachsen-Anhalt" },
  { value: "schleswig-holstein", label: "Schleswig-Holstein" },
  { value: "thueringen", label: "Thüringen" },
];

const locationSchema = z.object({
  name: z.string().min(1, "Bitte geben Sie eine Bezeichnung ein"),
  street: z.string().min(1, "Bitte geben Sie eine Straße ein"),
  house_number: z.string().min(1, "Bitte geben Sie eine Hausnummer ein"),
  postal_code: z
    .string()
    .min(5, "Bitte geben Sie eine gültige Postleitzahl ein"),
  city: z.string().min(1, "Bitte geben Sie einen Ort ein"),
  state: z.string().min(1, "Bitte wählen Sie ein Bundesland"),
  has_canteen: z.boolean().default(false),
  has_charging_stations: z.boolean().default(false),
  is_headquarters: z.boolean().default(false),
});

const formSchema = z.object({
  locations: z
    .array(locationSchema)
    .min(1, "Mindestens ein Standort ist erforderlich"),
});

type LocationValues = z.infer<typeof locationSchema>;
type FormValues = z.infer<typeof formSchema>;

export const StandorteStep = () => {
  const { formData, updateFormData, saveProgress, nextStep } = useOnboarding();
  const [locations, setLocations] = useState<LocationValues[]>([
    {
      name: "",
      street: "",
      house_number: "",
      postal_code: "",
      city: "",
      state: "",
      has_canteen: false,
      has_charging_stations: false,
      is_headquarters: true, // First location is always headquarters
    },
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locations: locations,
    },
  });

  // Load existing data into the form
  useEffect(() => {
    if (formData && formData.locations && formData.locations.length > 0) {
      // Ensure boolean values are properly set in each location
      const normalizedLocations = formData.locations.map((location: any) => ({
        ...location,
        has_canteen: location.has_canteen === true,
        has_charging_stations: location.has_charging_stations === true,
        is_headquarters: location.is_headquarters === true,
      }));

      setLocations(normalizedLocations);
      form.reset({
        locations: normalizedLocations,
      });
    }
  }, [formData, form]);

  const onSubmit = async (values: FormValues) => {
    updateFormData(values);
    await saveProgress(values);
    nextStep();
  };

  const addLocation = () => {
    const newLocation: LocationValues = {
      name: "",
      street: "",
      house_number: "",
      postal_code: "",
      city: "",
      state: "",
      has_canteen: false,
      has_charging_stations: false,
      is_headquarters: false,
    };

    const updatedLocations = [...locations, newLocation];
    setLocations(updatedLocations);
    form.setValue("locations", updatedLocations);
  };

  const removeLocation = (index: number) => {
    if (locations.length <= 1) return; // Don't remove the last location
    if (locations[index].is_headquarters) return; // Don't remove headquarters

    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
    form.setValue("locations", updatedLocations);
  };

  const updateLocation = (
    index: number,
    field: keyof LocationValues,
    value: any,
  ) => {
    const updatedLocations = [...locations];
    updatedLocations[index] = {
      ...updatedLocations[index],
      [field]: value,
    };
    setLocations(updatedLocations);
    form.setValue("locations", updatedLocations);
  };

  return (
    <StepLayout
      title="Standorte"
      description="Bitte geben Sie Informationen zu den Standorten der Gesellschaft an."
      onSave={form.handleSubmit(onSubmit)}
    >
      <Form {...form}>
        <div className="space-y-6">
          {locations.map((location, index) => (
            <Card key={index} className="mb-6">
              <CardHeader>
                <CardTitle>
                  {location.is_headquarters
                    ? "Hauptniederlassung"
                    : `Niederlassung ${index + 1}`}
                </CardTitle>
                <CardDescription>
                  {location.is_headquarters
                    ? "Dies ist die Hauptniederlassung"
                    : "Zusätzlicher Standort der Gesellschaft"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <FormLabel htmlFor={`location-${index}-name`}>
                      Bezeichnung des Standorts
                    </FormLabel>
                    <Input
                      id={`location-${index}-name`}
                      placeholder="z.B. Hauptsitz München"
                      value={location.name}
                      onChange={(e) =>
                        updateLocation(index, "name", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <FormLabel htmlFor={`location-${index}-street`}>
                      Straße
                    </FormLabel>
                    <Input
                      id={`location-${index}-street`}
                      placeholder="z.B. Hauptstraße"
                      value={location.street}
                      onChange={(e) =>
                        updateLocation(index, "street", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel htmlFor={`location-${index}-house-number`}>
                      Hausnummer
                    </FormLabel>
                    <Input
                      id={`location-${index}-house-number`}
                      placeholder="z.B. 1"
                      value={location.house_number}
                      onChange={(e) =>
                        updateLocation(index, "house_number", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <FormLabel htmlFor={`location-${index}-postal-code`}>
                      Postleitzahl
                    </FormLabel>
                    <Input
                      id={`location-${index}-postal-code`}
                      placeholder="z.B. 80331"
                      value={location.postal_code}
                      onChange={(e) =>
                        updateLocation(index, "postal_code", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel htmlFor={`location-${index}-city`}>
                      Ort
                    </FormLabel>
                    <Input
                      id={`location-${index}-city`}
                      placeholder="z.B. München"
                      value={location.city}
                      onChange={(e) =>
                        updateLocation(index, "city", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <FormLabel htmlFor={`location-${index}-state`}>
                      Bundesland
                    </FormLabel>
                    <Select
                      value={location.state}
                      onValueChange={(value) =>
                        updateLocation(index, "state", value)
                      }
                    >
                      <SelectTrigger id={`location-${index}-state`}>
                        <SelectValue placeholder="Bundesland auswählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {bundeslaender.map((bundesland) => (
                          <SelectItem
                            key={bundesland.value}
                            value={bundesland.value}
                          >
                            {bundesland.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="text-sm font-medium">
                    Zusätzliche Informationen
                  </h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel className="text-sm font-normal">
                        Hat die Niederlassung eine Kantine oder ein Catering?
                      </FormLabel>
                    </div>
                    <Switch
                      checked={location.has_canteen}
                      onCheckedChange={(checked) =>
                        updateLocation(index, "has_canteen", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel className="text-sm font-normal">
                        Gibt es E-Ladesäulen für Elektrofahrzeuge an diesem
                        Standort?
                      </FormLabel>
                    </div>
                    <Switch
                      checked={location.has_charging_stations}
                      onCheckedChange={(checked) =>
                        updateLocation(index, "has_charging_stations", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
              {!location.is_headquarters && (
                <CardFooter className="justify-end">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeLocation(index)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Niederlassung entfernen
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addLocation}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Weitere Niederlassung hinzufügen
          </Button>
        </div>
      </Form>
    </StepLayout>
  );
};
