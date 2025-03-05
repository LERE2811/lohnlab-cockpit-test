"use client";

import { useOnboarding } from "@/context/onboarding-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PayrollContact } from "@/shared/model";
import { Plus, Trash2 } from "lucide-react";

export default function PayrollStep() {
  const { formData, updateFormData } = useOnboarding();
  const [payrollContacts, setPayrollContacts] = useState<PayrollContact[]>(
    formData.payrollInfo.payroll_contacts.length > 0
      ? formData.payrollInfo.payroll_contacts
      : [
          {
            id: crypto.randomUUID(),
            company_id: "",
            firstname: "",
            lastname: "",
            email: "",
            phone: "",
            created_at: new Date(),
          },
        ],
  );

  // Aktualisiere die Kontakte im Formular
  const updateContacts = (newContacts: PayrollContact[]) => {
    setPayrollContacts(newContacts);
    updateFormData("payrollInfo", { payroll_contacts: newContacts });
  };

  // Füge einen neuen Kontakt hinzu
  const addContact = () => {
    const newContacts = [
      ...payrollContacts,
      {
        id: crypto.randomUUID(),
        company_id: "",
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        created_at: new Date(),
      },
    ];
    updateContacts(newContacts);
  };

  // Entferne einen Kontakt
  const removeContact = (index: number) => {
    if (payrollContacts.length <= 1) return; // Mindestens ein Kontakt muss bleiben
    const newContacts = payrollContacts.filter((_, i) => i !== index);
    updateContacts(newContacts);
  };

  // Aktualisiere die Daten eines Kontakts
  const updateContact = (
    index: number,
    field: keyof PayrollContact,
    value: string,
  ) => {
    const newContacts = [...payrollContacts];
    newContacts[index] = {
      ...newContacts[index],
      [field]: value,
    };
    updateContacts(newContacts);
  };

  // Aktualisiere die Lohnabrechnung-Verarbeitung
  const handleProcessingChange = (value: string) => {
    updateFormData("payrollInfo", { payroll_processing: value });
  };

  // Aktualisiere das Lohnabrechnung-System
  const handleSystemChange = (value: string) => {
    updateFormData("payrollInfo", { payroll_system: value });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Lohnabrechnung</h3>
        <p className="text-sm text-gray-500">
          Bitte geben Sie an, wie die Lohnabrechnung in Ihrem Unternehmen
          durchgeführt wird.
        </p>
      </div>

      <div className="space-y-4">
        <Label htmlFor="payroll-processing">
          Wie wird die Lohnabrechnung durchgeführt?*
        </Label>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="internal"
              name="payroll-processing"
              value="internal"
              checked={formData.payrollInfo.payroll_processing === "internal"}
              onChange={() => handleProcessingChange("internal")}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="internal" className="cursor-pointer">
              Intern
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="external"
              name="payroll-processing"
              value="external"
              checked={formData.payrollInfo.payroll_processing === "external"}
              onChange={() => handleProcessingChange("external")}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="external" className="cursor-pointer">
              Extern (Steuerberater)
            </Label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="payroll-system">
          Welches Lohnabrechnungssystem wird verwendet?*
        </Label>
        <select
          id="payroll-system"
          value={formData.payrollInfo.payroll_system || ""}
          onChange={(e) => handleSystemChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          required
        >
          <option value="" disabled>
            Bitte wählen...
          </option>
          <option value="datev">DATEV</option>
          <option value="lexware">Lexware</option>
          <option value="sage">Sage</option>
          <option value="lohn_ag">Lohn AG</option>
          <option value="addison">Addison</option>
          <option value="other">Anderes System</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Ansprechpartner für Lohnabrechnung</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addContact}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Hinzufügen
          </Button>
        </div>

        {payrollContacts.map((contact, index) => (
          <div key={contact.id} className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
              <h5 className="font-medium">Ansprechpartner {index + 1}</h5>
              {payrollContacts.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContact(index)}
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
                  value={contact.firstname}
                  onChange={(e) =>
                    updateContact(index, "firstname", e.target.value)
                  }
                  placeholder="Vorname"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`lastname-${index}`}>Nachname*</Label>
                <Input
                  id={`lastname-${index}`}
                  value={contact.lastname}
                  onChange={(e) =>
                    updateContact(index, "lastname", e.target.value)
                  }
                  placeholder="Nachname"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`email-${index}`}>E-Mail*</Label>
                <Input
                  id={`email-${index}`}
                  type="email"
                  value={contact.email}
                  onChange={(e) =>
                    updateContact(index, "email", e.target.value)
                  }
                  placeholder="E-Mail-Adresse"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`phone-${index}`}>Telefon</Label>
                <Input
                  id={`phone-${index}`}
                  value={contact.phone || ""}
                  onChange={(e) =>
                    updateContact(index, "phone", e.target.value)
                  }
                  placeholder="Telefonnummer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
