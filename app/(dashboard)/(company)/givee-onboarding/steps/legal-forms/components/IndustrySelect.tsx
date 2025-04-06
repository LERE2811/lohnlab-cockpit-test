import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Industry categories based on German economic sectors classification
export const INDUSTRY_CATEGORIES = [
  "Land- und Forstwirtschaft, Fischerei",
  "Bergbau und Gewinnung von Steinen und Erden",
  "Verarbeitendes Gewerbe",
  "Energieversorgung",
  "Wasserversorgung; Abwasser- und Abfallentsorgung und Beseitigung von Umweltverschmutzungen",
  "Baugewerbe",
  "Handel; Instandhaltung und Reparatur von Kraftfahrzeugen",
  "Verkehr und Lagerei",
  "Gastgewerbe",
  "Information und Kommunikation",
  "Erbringung von Finanz- und Versicherungsdienstleistungen",
  "Grundstücks- und Wohnungswesen",
  "Erbringung von freiberuflichen, wissenschaftlichen und technischen Dienstleistungen",
  "Erbringung von sonstigen wirtschaftlichen Dienstleistungen",
  "Öffentliche Verwaltung, Verteidigung; Sozialversicherung",
  "Erziehung und Unterricht",
  "Gesundheits- und Sozialwesen",
  "Kunst, Unterhaltung und Erholung",
  "Erbringung von sonstigen Dienstleistungen",
  "Private Haushalte mit Hauspersonal; Herstellung von Waren und Erbringung von Dienstleistungen durch private Haushalte für den Eigenbedarf ohne ausgeprägten Schwerpunkt",
  "Exterritoriale Organisationen und Körperschaften",
] as const;

export type IndustryCategory = (typeof INDUSTRY_CATEGORIES)[number];

interface IndustrySelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export const IndustrySelect = ({
  value,
  onChange,
  label = "Branchenzuordnung",
  required = true,
  className = "space-y-2",
}: IndustrySelectProps) => {
  return (
    <div className={className}>
      <Label htmlFor="industry-select">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="industry-select" className="w-full">
          <SelectValue placeholder="Bitte wählen Sie eine Branche" />
        </SelectTrigger>
        <SelectContent>
          {INDUSTRY_CATEGORIES.map((industry) => (
            <SelectItem key={industry} value={industry}>
              {industry}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
