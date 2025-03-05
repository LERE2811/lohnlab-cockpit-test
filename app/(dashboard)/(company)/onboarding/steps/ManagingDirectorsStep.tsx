"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/context/onboarding-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { ManagingDirector } from "@/shared/model";
import { useCompany } from "@/context/company-context";

export default function ManagingDirectorsStep() {
  const { formData, updateFormData } = useOnboarding();
  const { company } = useCompany();
  const [directors, setDirectors] = useState<ManagingDirector[]>(
    formData.managingDirectors.length > 0
      ? formData.managingDirectors
      : [
          {
            id: crypto.randomUUID(),
            company_id: company?.id || "",
            firstname: "",
            lastname: "",
            email: "",
            phone: "",
            created_at: new Date(),
          },
        ],
  );

  // Aktualisiere die company_id, wenn sich das Unternehmen ändert
  useEffect(() => {
    if (company && directors.some((director) => !director.company_id)) {
      const updatedDirectors = directors.map((director) => ({
        ...director,
        company_id: director.company_id || company.id,
      }));
      setDirectors(updatedDirectors);
      updateFormData("managingDirectors", updatedDirectors);
    }
  }, [company, directors, updateFormData]);

  // Aktualisiere die Geschäftsführer im Formular
  const updateDirectors = (newDirectors: ManagingDirector[]) => {
    // Stelle sicher, dass alle Geschäftsführer eine company_id haben
    const directorsWithCompanyId = newDirectors.map((director) => ({
      ...director,
      company_id: director.company_id || company?.id || "",
    }));

    setDirectors(directorsWithCompanyId);
    updateFormData("managingDirectors", directorsWithCompanyId);
    // Die Daten werden beim Klicken auf "Weiter" oder "Speichern" im übergeordneten Komponenten gespeichert
  };

  // Füge einen neuen Geschäftsführer hinzu
  const addDirector = () => {
    const newDirectors = [
      ...directors,
      {
        id: crypto.randomUUID(),
        company_id: company?.id || "",
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        created_at: new Date(),
      },
    ];
    updateDirectors(newDirectors);
  };

  // Entferne einen Geschäftsführer
  const removeDirector = (index: number) => {
    if (directors.length <= 1) return; // Mindestens ein Geschäftsführer muss bleiben
    const newDirectors = directors.filter((_, i) => i !== index);
    updateDirectors(newDirectors);
  };

  // Aktualisiere die Daten eines Geschäftsführers
  const updateDirector = (
    index: number,
    field: keyof ManagingDirector,
    value: string,
  ) => {
    const newDirectors = [...directors];
    newDirectors[index] = {
      ...newDirectors[index],
      [field]: value,
    };
    updateDirectors(newDirectors);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Geschäftsführer</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addDirector}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Hinzufügen
        </Button>
      </div>

      {directors.map((director, index) => (
        <div key={director.id} className="rounded-lg border p-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-medium">Geschäftsführer {index + 1}</h4>
            {directors.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDirector(index)}
                className="text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span className="ml-1">Entfernen</span>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`firstname-${index}`}>Vorname*</Label>
              <Input
                id={`firstname-${index}`}
                value={director.firstname}
                onChange={(e) =>
                  updateDirector(index, "firstname", e.target.value)
                }
                placeholder="Vorname"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`lastname-${index}`}>Nachname*</Label>
              <Input
                id={`lastname-${index}`}
                value={director.lastname}
                onChange={(e) =>
                  updateDirector(index, "lastname", e.target.value)
                }
                placeholder="Nachname"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`email-${index}`}>E-Mail</Label>
              <Input
                id={`email-${index}`}
                type="email"
                value={director.email || ""}
                onChange={(e) => updateDirector(index, "email", e.target.value)}
                placeholder="E-Mail-Adresse"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`phone-${index}`}>Telefon</Label>
              <Input
                id={`phone-${index}`}
                value={director.phone || ""}
                onChange={(e) => updateDirector(index, "phone", e.target.value)}
                placeholder="Telefonnummer"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
