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

type FormStep = 1 | 2 | 3;

interface Subsidiary {
  name: string;
  legal_form: string;
}

interface Ansprechpartner {
  firstname: string;
  lastname: string;
  email: string;
}

interface CompanyFormData {
  name: string;
  vertriebspartner: keyof typeof Vertriebspartner;
  subsidiaries: Subsidiary[];
  ansprechpartner: Ansprechpartner;
}

const LEGAL_FORMS = ["GmbH", "AG", "UG", "GbR", "KG", "OHG", "GmbH & Co. KG"];

export const CreateCompanyDialog = () => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<FormStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState<CompanyFormData>({
    name: "",
    vertriebspartner: "" as keyof typeof Vertriebspartner,
    subsidiaries: [{ name: "", legal_form: "" }],
    ansprechpartner: {
      firstname: "",
      lastname: "",
      email: "",
    },
  });
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

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
      case 3:
        if (
          !formData.ansprechpartner.firstname ||
          !formData.ansprechpartner.lastname ||
          !formData.ansprechpartner.email ||
          !validateEmail(formData.ansprechpartner.email)
        ) {
          toast({
            title: "Fehler",
            description:
              formData.ansprechpartner.email &&
              !validateEmail(formData.ansprechpartner.email)
                ? "Bitte geben Sie eine gültige E-Mail-Adresse ein."
                : "Bitte füllen Sie alle Pflichtfelder aus.",
            className: "border-red-500",
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

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

      // Insert ansprechpartner
      const { error: ansprechpartnerError } = await supabase
        .from("ansprechpartner")
        .insert([
          {
            company_id: companyData.id,
            firstname: formData.ansprechpartner.firstname,
            lastname: formData.ansprechpartner.lastname,
            email: formData.ansprechpartner.email,
          },
        ]);

      if (ansprechpartnerError) throw ansprechpartnerError;

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
        ansprechpartner: {
          firstname: "",
          lastname: "",
          email: "",
        },
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
      setStep((prev) => (prev < 3 ? ((prev + 1) as FormStep) : prev));
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
    setFormData((prev) => ({
      ...prev,
      subsidiaries: prev.subsidiaries.map((subsidiary, i) =>
        i === index ? { ...subsidiary, [field]: value } : subsidiary,
      ),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Unternehmen erstellen</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Neues Unternehmen erstellen</DialogTitle>
          <DialogDescription>
            Schritt {step} von 3:{" "}
            {step === 1
              ? "Unternehmensdaten"
              : step === 2
                ? "Gesellschaften"
                : "Ansprechpartner"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name des Unternehmens*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Geben Sie den Namen des Unternehmens ein"
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
                  <SelectItem value="LOHNKONZEPT">
                    {Vertriebspartner.LOHNKONZEPT}
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

        {step === 3 && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstname">Vorname*</Label>
                <Input
                  id="firstname"
                  value={formData.ansprechpartner.firstname}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ansprechpartner: {
                        ...prev.ansprechpartner,
                        firstname: e.target.value,
                      },
                    }))
                  }
                  placeholder="Vorname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname">Nachname*</Label>
                <Input
                  id="lastname"
                  value={formData.ansprechpartner.lastname}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ansprechpartner: {
                        ...prev.ansprechpartner,
                        lastname: e.target.value,
                      },
                    }))
                  }
                  placeholder="Nachname"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail*</Label>
              <Input
                id="email"
                type="email"
                value={formData.ansprechpartner.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ansprechpartner: {
                      ...prev.ansprechpartner,
                      email: e.target.value,
                    },
                  }))
                }
                placeholder="E-Mail-Adresse"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          {step > 1 && (
            <Button variant="outline" onClick={prevStep} disabled={isLoading}>
              Zurück
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={nextStep} disabled={isLoading}>
              Weiter
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Erstellen..." : "Unternehmen erstellen"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
