"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/utils/supabase/client";
import { Vertriebspartner } from "@/shared/model";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
type FormStep = 1 | 2;

interface Subsidiary {
  name: string;
  legal_form: string;
}

interface CompanyFormData {
  name: string;
  vertriebspartner: keyof typeof Vertriebspartner;
  subsidiaries: Subsidiary[];
}

const LEGAL_FORMS = [
  "GmbH",
  "AG",
  "UG",
  "GbR",
  "KG",
  "OHG",
  "GmbH & Co. KG",
  "juristische Person",
  "KdöR",
  "PartG",
  "PartG mbB",
  "e.V.",
  "eG",
  "Freiberufler",
  "Einzelunternehmen",
];

export const CreateCompanyDialog = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<FormStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    vertriebspartner: "" as keyof typeof Vertriebspartner,
    subsidiaries: [{ name: "", legal_form: "" }],
  });
  const router = useRouter();

  const validateStep = (currentStep: FormStep): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.name || !formData.vertriebspartner) {
          toast({
            title: "Fehler",
            description: "Bitte füllen Sie alle Pflichtfelder aus.",
            className: "border-red-500",
          });
          return false;
        }
        break;
      case 2:
        if (
          !formData.subsidiaries.length ||
          formData.subsidiaries.some(
            (subsidiary) => !subsidiary.name || !subsidiary.legal_form,
          )
        ) {
          toast({
            title: "Fehler",
            description:
              "Bitte fügen Sie mindestens eine Gesellschaft mit allen Pflichtfeldern hinzu.",
            className: "border-red-500",
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      setIsLoading(true);

      // Insert company
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .insert([
          {
            name: formData.name,
            vertriebspartner: Vertriebspartner[formData.vertriebspartner],
          },
        ])
        .select()
        .single();

      if (companyError) throw companyError;

      // Insert subsidiaries
      const subsidiaryPromises = formData.subsidiaries.map((subsidiary) =>
        supabase
          .from("subsidiaries")
          .insert([
            {
              company_id: companyData.id,
              name: subsidiary.name,
              legal_form: subsidiary.legal_form,
            },
          ])
          .select()
          .single(),
      );

      const subsidiaryResults = await Promise.all(subsidiaryPromises);
      const subsidiaryErrors = subsidiaryResults.filter(
        (result) => result.error,
      );
      if (subsidiaryErrors.length > 0) throw subsidiaryErrors[0].error;

      toast({
        title: "✅ Erfolg",
        description: "Unternehmen erfolgreich erstellt!",
        variant: "default",
        className: "border-green-500",
      });
      setOpen(false);
      // Reset form
      setStep(1);
      setFormData({
        name: "",
        vertriebspartner: "" as keyof typeof Vertriebspartner,
        subsidiaries: [{ name: "", legal_form: "" }],
      });
      router.refresh();
    } catch (error) {
      console.error("Error creating company:", error);
      toast({
        title: "Fehler",
        description: "Fehler beim Erstellen des Unternehmens.",
        className: "border-red-500",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(step)) {
      // When moving from step 1 to step 2, auto-fill the subsidiary name with the company name
      if (step === 1) {
        setFormData((prev) => ({
          ...prev,
          subsidiaries: prev.subsidiaries.map((sub, index) =>
            index === 0 ? { ...sub, name: prev.name } : sub,
          ),
        }));
      }
      setStep((prev) => (prev < 2 ? ((prev + 1) as FormStep) : prev));
    }
  };

  const prevStep = () =>
    setStep((prev) => (prev > 1 ? ((prev - 1) as FormStep) : prev));

  const addSubsidiary = () => {
    setFormData((prev) => ({
      ...prev,
      subsidiaries: [...prev.subsidiaries, { name: "", legal_form: "" }],
    }));
  };

  const removeSubsidiary = (index: number) => {
    if (formData.subsidiaries.length > 1) {
      setFormData((prev) => ({
        ...prev,
        subsidiaries: prev.subsidiaries.filter((_, i) => i !== index),
      }));
    }
  };

  const updateSubsidiary = (
    index: number,
    field: keyof Subsidiary,
    value: string,
  ) => {
    setFormData((prev) => {
      const updatedSubsidiaries = [...prev.subsidiaries];
      updatedSubsidiaries[index] = {
        ...updatedSubsidiaries[index],
        [field]: value,
      };
      return { ...prev, subsidiaries: updatedSubsidiaries };
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neues Unternehmen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Neues Unternehmen anlegen</DialogTitle>
          <DialogDescription>
            Erstellen Sie ein neues Unternehmen und fügen Sie Gesellschaften
            hinzu.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center">
          <div className="flex space-x-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              1
            </div>
            <div
              className={`h-0.5 w-10 self-center ${
                step >= 2 ? "bg-primary" : "bg-muted"
              }`}
            ></div>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              2
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Unternehmensname*</Label>
              <Input
                id="company-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Name des Unternehmens"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vertriebspartner">Vertriebspartner*</Label>
              <Select
                value={formData.vertriebspartner}
                onValueChange={(value: keyof typeof Vertriebspartner) =>
                  setFormData((prev) => ({ ...prev, vertriebspartner: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie einen Vertriebspartner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOHNLAB">
                    {Vertriebspartner.LOHNLAB}
                  </SelectItem>
                  <SelectItem value="LOHNKONZEPTE">
                    {Vertriebspartner.LOHNKONZEPTE}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              {formData.subsidiaries.map((subsidiary, index) => (
                <div key={index} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Gesellschaft {index + 1}</h4>
                    {formData.subsidiaries.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSubsidiary(index)}
                      >
                        Entfernen
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Name der Gesellschaft*</Label>
                    <Input
                      value={subsidiary.name}
                      onChange={(e) =>
                        updateSubsidiary(index, "name", e.target.value)
                      }
                      placeholder="Name der Gesellschaft"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gesellschaftsform*</Label>
                    <Select
                      value={subsidiary.legal_form}
                      onValueChange={(value) =>
                        updateSubsidiary(index, "legal_form", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wählen Sie eine Gesellschaftsform" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEGAL_FORMS.map((form) => (
                          <SelectItem key={form} value={form}>
                            {form}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addSubsidiary}
                className="w-full"
              >
                + Weitere Gesellschaft hinzufügen
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={isLoading}
            >
              Zurück
            </Button>
          )}
          {step < 2 ? (
            <Button type="button" onClick={nextStep} disabled={isLoading}>
              Weiter
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-primary"
            >
              {isLoading ? "Wird erstellt..." : "Erstellen"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
