"use client";

import { useOnboarding } from "@/context/onboarding-context";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function ReviewStep() {
  const { formData } = useOnboarding();

  // Validierungsfunktionen für jeden Schritt
  const validateCompanyInfo = () => {
    const { name, tax_number } = formData.companyInfo;
    return !!name && !!tax_number;
  };

  const validateAddress = () => {
    const { street, house_number, postal_code, city } = formData.address;
    return !!street && !!house_number && !!postal_code && !!city;
  };

  const validateCommercialRegister = () => {
    const { commercial_register, commercial_register_number } =
      formData.commercialRegister;
    return !!commercial_register && !!commercial_register_number;
  };

  const validateManagingDirectors = () => {
    return (
      formData.managingDirectors.length > 0 &&
      formData.managingDirectors.every(
        (director) => !!director.firstname && !!director.lastname,
      )
    );
  };

  const validatePayrollInfo = () => {
    const { payroll_processing, payroll_system, payroll_contacts } =
      formData.payrollInfo;

    const hasValidContacts =
      payroll_contacts.length > 0 &&
      payroll_contacts.every(
        (contact) =>
          !!contact.firstname && !!contact.lastname && !!contact.email,
      );

    return !!payroll_processing && !!payroll_system && hasValidContacts;
  };

  // Prüfe, ob alle Schritte vollständig sind
  const allStepsComplete = () => {
    return (
      validateCompanyInfo() &&
      validateAddress() &&
      validateCommercialRegister() &&
      validateManagingDirectors() &&
      validatePayrollInfo()
    );
  };

  // Formatierungsfunktionen für die Anzeige
  const formatPayrollProcessing = (processing: string | undefined) => {
    switch (processing) {
      case "Intern":
        return "Intern";
      case "Extern":
        return "Extern";
      default:
        return "Nicht angegeben";
    }
  };

  const formatPayrollSystem = (system: string) => {
    switch (system) {
      case "DATEV":
      case "Lexware":
      case "Sage":
      case "Lohn AG":
      case "Addison":
        return system;
      case "Andere":
        return "Andere";
      default:
        return "Nicht angegeben";
    }
  };

  // Generiere eine Liste der fehlenden Felder
  const getMissingFields = () => {
    const missingFields = [];

    if (!validateCompanyInfo()) {
      missingFields.push("Unternehmensinformationen");
    }
    if (!validateAddress()) {
      missingFields.push("Adresse");
    }
    if (!validateCommercialRegister()) {
      missingFields.push("Handelsregister");
    }
    if (!validateManagingDirectors()) {
      missingFields.push("Geschäftsführer");
    }
    if (!validatePayrollInfo()) {
      missingFields.push("Lohnabrechnung");
    }

    return missingFields;
  };

  const missingFields = getMissingFields();

  return (
    <div className="space-y-6">
      <p className="text-lg">
        Bitte überprüfen Sie alle eingegebenen Informationen, bevor Sie das
        Onboarding abschließen.
      </p>

      {/* Zusammenfassung des Validierungsstatus */}
      {missingFields.length > 0 && (
        <div className="rounded-md bg-amber-50 p-4 text-amber-700">
          <div className="flex">
            <AlertCircle className="mr-2 h-5 w-5" />
            <div>
              <p className="font-medium">
                Folgende Abschnitte sind unvollständig:
              </p>
              <ul className="mt-2 list-inside list-disc">
                {missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Unternehmensinformationen */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-4 font-medium">Unternehmensinformationen</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Firmenname</p>
            <p>{formData.companyInfo.name || "Nicht angegeben"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Steuernummer</p>
            <p>{formData.companyInfo.tax_number || "Nicht angegeben"}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center">
          {validateCompanyInfo() ? (
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
          )}
          <span
            className={
              validateCompanyInfo() ? "text-green-500" : "text-red-500"
            }
          >
            {validateCompanyInfo() ? "Vollständig" : "Unvollständig"}
          </span>
        </div>
      </div>

      {/* Adresse */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-4 font-medium">Adresse</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Straße</p>
            <p>{formData.address.street || "Nicht angegeben"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Hausnummer</p>
            <p>{formData.address.house_number || "Nicht angegeben"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">PLZ</p>
            <p>{formData.address.postal_code || "Nicht angegeben"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ort</p>
            <p>{formData.address.city || "Nicht angegeben"}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center">
          {validateAddress() ? (
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
          )}
          <span
            className={validateAddress() ? "text-green-500" : "text-red-500"}
          >
            {validateAddress() ? "Vollständig" : "Unvollständig"}
          </span>
        </div>
      </div>

      {/* Handelsregister */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-4 font-medium">Handelsregister</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Handelsregister</p>
            <p>
              {formData.commercialRegister.commercial_register ||
                "Nicht angegeben"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Handelsregisternummer
            </p>
            <p>
              {formData.commercialRegister.commercial_register_number ||
                "Nicht angegeben"}
            </p>
          </div>
        </div>
        <div className="mt-2 flex items-center">
          {validateCommercialRegister() ? (
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
          )}
          <span
            className={
              validateCommercialRegister() ? "text-green-500" : "text-red-500"
            }
          >
            {validateCommercialRegister() ? "Vollständig" : "Unvollständig"}
          </span>
        </div>
      </div>

      {/* Geschäftsführer */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-4 font-medium">Geschäftsführer</h4>
        {formData.managingDirectors.length > 0 ? (
          <div className="space-y-4">
            {formData.managingDirectors.map((director, index) => (
              <div key={director.id} className="rounded-lg border p-3">
                <h6 className="mb-2 font-medium">
                  Geschäftsführer {index + 1}
                </h6>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vorname</p>
                    <p>{director.firstname}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Nachname
                    </p>
                    <p>{director.lastname}</p>
                  </div>
                  {director.email && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        E-Mail
                      </p>
                      <p>{director.email}</p>
                    </div>
                  )}
                  {director.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Telefon
                      </p>
                      <p>{director.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Keine Geschäftsführer angegeben
          </p>
        )}
        <div className="mt-2 flex items-center">
          {validateManagingDirectors() ? (
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
          )}
          <span
            className={
              validateManagingDirectors() ? "text-green-500" : "text-red-500"
            }
          >
            {validateManagingDirectors() ? "Vollständig" : "Unvollständig"}
          </span>
        </div>
      </div>

      {/* Lohnabrechnung */}
      <div className="rounded-lg border p-4">
        <h4 className="mb-4 font-medium">Lohnabrechnung</h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Lohnabrechnung durchgeführt
            </p>
            <p>
              {formatPayrollProcessing(formData.payrollInfo.payroll_processing)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Lohnabrechnungssystem
            </p>
            <p>
              {formatPayrollSystem(formData.payrollInfo.payroll_system || "")}
            </p>
          </div>
        </div>

        <h5 className="mb-2 mt-4 font-medium">
          Ansprechpartner für Lohnabrechnung
        </h5>
        {formData.payrollInfo.payroll_contacts.length > 0 ? (
          <div className="space-y-4">
            {formData.payrollInfo.payroll_contacts.map((contact, index) => (
              <div key={contact.id} className="rounded-lg border p-3">
                <h6 className="mb-2 font-medium">
                  Ansprechpartner {index + 1}
                </h6>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vorname</p>
                    <p>{contact.firstname}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Nachname
                    </p>
                    <p>{contact.lastname}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">E-Mail</p>
                    <p>{contact.email}</p>
                  </div>
                  {contact.phone && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Telefon
                      </p>
                      <p>{contact.phone}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Keine Ansprechpartner angegeben
          </p>
        )}
        <div className="mt-2 flex items-center">
          {validatePayrollInfo() ? (
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="mr-2 h-5 w-5 text-red-500" />
          )}
          <span
            className={
              validatePayrollInfo() ? "text-green-500" : "text-red-500"
            }
          >
            {validatePayrollInfo() ? "Vollständig" : "Unvollständig"}
          </span>
        </div>
      </div>
    </div>
  );
}
