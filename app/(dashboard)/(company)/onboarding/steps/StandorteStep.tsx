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

// PLZ-Bereiche nach Bundesland
const plzToBundesland: { [key: string]: string } = {
  "01": "sachsen",
  "02": "sachsen",
  "03": "brandenburg",
  "04": "sachsen",
  "06": "sachsen-anhalt",
  "07": "thueringen",
  "08": "sachsen",
  "09": "sachsen",
  "10": "berlin",
  "12": "berlin",
  "13": "berlin",
  "14": "brandenburg",
  "15": "brandenburg",
  "16": "brandenburg",
  "17": "mecklenburg-vorpommern",
  "18": "mecklenburg-vorpommern",
  "19": "mecklenburg-vorpommern",
  "20": "hamburg",
  "21": "hamburg",
  "22": "hamburg",
  "23": "schleswig-holstein",
  "24": "schleswig-holstein",
  "25": "schleswig-holstein",
  "26": "niedersachsen",
  "27": "niedersachsen",
  "28": "bremen",
  "29": "niedersachsen",
  "30": "niedersachsen",
  "31": "niedersachsen",
  "32": "nordrhein-westfalen",
  "33": "nordrhein-westfalen",
  "34": "hessen",
  "35": "hessen",
  "36": "thueringen",
  "37": "niedersachsen",
  "38": "niedersachsen",
  "39": "sachsen-anhalt",
  "40": "nordrhein-westfalen",
  "41": "nordrhein-westfalen",
  "42": "nordrhein-westfalen",
  "44": "nordrhein-westfalen",
  "45": "nordrhein-westfalen",
  "46": "nordrhein-westfalen",
  "47": "nordrhein-westfalen",
  "48": "nordrhein-westfalen",
  "49": "niedersachsen",
  "50": "nordrhein-westfalen",
  "51": "nordrhein-westfalen",
  "52": "nordrhein-westfalen",
  "53": "nordrhein-westfalen",
  "54": "rheinland-pfalz",
  "55": "rheinland-pfalz",
  "56": "rheinland-pfalz",
  "57": "nordrhein-westfalen",
  "58": "nordrhein-westfalen",
  "59": "nordrhein-westfalen",
  "60": "hessen",
  "61": "hessen",
  "63": "hessen",
  "64": "hessen",
  "65": "hessen",
  "66": "saarland",
  "67": "rheinland-pfalz",
  "68": "baden-wuerttemberg",
  "69": "baden-wuerttemberg",
  "70": "baden-wuerttemberg",
  "71": "baden-wuerttemberg",
  "72": "baden-wuerttemberg",
  "73": "baden-wuerttemberg",
  "74": "baden-wuerttemberg",
  "75": "baden-wuerttemberg",
  "76": "baden-wuerttemberg",
  "77": "baden-wuerttemberg",
  "78": "baden-wuerttemberg",
  "79": "baden-wuerttemberg",
  "80": "bayern",
  "81": "bayern",
  "82": "bayern",
  "83": "bayern",
  "84": "bayern",
  "85": "bayern",
  "86": "bayern",
  "87": "bayern",
  "88": "bayern",
  "89": "bayern",
  "90": "bayern",
  "91": "bayern",
  "92": "bayern",
  "93": "bayern",
  "94": "bayern",
  "95": "bayern",
  "96": "bayern",
  "97": "bayern",
  "98": "thueringen",
  "99": "thueringen",
};

// Function to get Bundesland from PLZ
const getBundeslandFromPLZ = (plz: string): string => {
  // Ensure the PLZ is a string and extract the first two digits
  const plzString = String(plz).trim();
  const plzPrefix = plzString.substring(0, 2);

  // Return the matching bundesland value or empty string if not found
  return plzToBundesland[plzPrefix] || "";
};

const locationSchema = z.object({
  name: z.string().optional(),
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
    // Set default names for locations without names
    const updatedLocations = values.locations.map((location, index) => {
      if (!location.name || location.name.trim() === "") {
        return {
          ...location,
          name: location.is_headquarters
            ? "Hauptniederlassung"
            : `Niederlassung ${index + 1}`,
        };
      }
      return location;
    });

    const updatedValues = {
      ...values,
      locations: updatedLocations,
    };

    updateFormData(updatedValues);
    await saveProgress(updatedValues);
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

  // Add helper function to combine street and house number
  const getCombinedStreetAddress = (
    street: string,
    houseNumber: string,
  ): string => {
    if (!street) return "";
    if (!houseNumber) return street;
    return `${street} ${houseNumber}`;
  };

  const updateLocation = (
    index: number,
    field: keyof LocationValues | "combinedStreet",
    value: any,
  ) => {
    const updatedLocations = [...locations];

    // Special handling for the combined street field
    if (field === "combinedStreet") {
      // Regex to extract house number (pattern: text followed by space and then numbers with optional letters)
      const match = value.match(/^(.*?)\s+(\d+\s*\w*)$/);

      if (match) {
        // If pattern is found, separate street and house number
        updatedLocations[index].street = match[1];
        updatedLocations[index].house_number = match[2];
      } else {
        // If no house number pattern is found, store everything in street
        updatedLocations[index].street = value;
        updatedLocations[index].house_number = "";
      }
    } else {
      // Regular field update
      updatedLocations[index] = {
        ...updatedLocations[index],
        [field]: value,
      };
    }

    // If the field is postal_code and it has at least 2 digits, set the state automatically
    if (field === "postal_code" && value.length >= 2) {
      const bundesland = getBundeslandFromPLZ(value);
      if (bundesland) {
        updatedLocations[index].state = bundesland;
      }
    }

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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                  <div className="space-y-2">
                    <FormLabel htmlFor={`location-${index}-combined-street`}>
                      Straße und Hausnummer
                    </FormLabel>
                    <Input
                      id={`location-${index}-combined-street`}
                      placeholder="z.B. Hauptstraße 1"
                      value={getCombinedStreetAddress(
                        location.street,
                        location.house_number,
                      )}
                      onChange={(e) =>
                        updateLocation(index, "combinedStreet", e.target.value)
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
                      placeholder="z.B. 80331 (Bundesland wird automatisch erkannt)"
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
