import { PDFDocument } from "pdf-lib";
import { PdfFormFiller, PdfFormData } from "./pdf-form-filler";

export class DokumentationsbogenFiller extends PdfFormFiller {
  private static readonly TEXT_FIELDS = [
    "Vornamen und Nachname",
    "Geburtsdatum",
    "Geburtsort",
    "Staatsangehörigkeit",
    "Wohnanschrift",
    "EMail Adresse",
    "Registernummer nur bei eK",
    "Person, Amt",
    "Mitarbeiter",
    "Andere",
    "Ort, Datum, Unterschrift",
  ];

  private static readonly STANDARD_CHECKBOXES = [
    "Nein",
    "Ja folgende Person folgendes Amt",
    "bis zu 10000 EUR pro Jahr nach  37b EStG pauschalversteurter Sachbezug",
  ];

  private static readonly SPECIAL_FIELDS = [
    // Legal form
    "Der Vertragspartner führt ein Einzelunternehmen",
    "Der Vertragspartner führt einen freien Beruf aus",
    "Der Vertragspartner ist ein eingetragener Kaufmann eK",
    // Business types
    "Land und Forstwirtschaft Fischerei",
    "Bergbau und Gewinnung von Steinen und Erden",
    "Verarbeitendes Gewerbe",
    "Energieversorgung",
    "Wasserversorgung Abwasser und Abfallentsorgung",
    "Baugewerbe",
    "Handel Instandhaltung und Reparatur von",
    "Verkehr und Lagerei",
    "Gastgewerbe",
    "Information und Kommunikation",
    "Erbringung von Finanz und Versicherungs",
    "Grundstücks und Wohnungswesen",
    "Erbringung von freiberuflichen wissenschaftlichen",
    "Erbringung von sonstigen wirtschaftlichen",
    "Öffentliche Verwaltung Verteidigung",
    "Erziehung und Unterricht",
    "Gesundheits und Sozialwesen",
    "Kunst Unterhaltung und Erholung",
    "Erbringung von sonstigen Dienstleistungen",
    "Private Haushalte mit Hauspersonal Herstellung",
    "Exterritoriale Organisationen und Körperschaften",
    // Purpose fields
    "Bereitstellung eines Sachbezugs für voraussichtlich",
    "bis zu 50 EUR pro Monat nach  8 Abs 2 Satz 11 EStG steuerfreier Sachbezug",
    "bis zu 60 EUR je persönlichen Anlass nach R 196 Abs 1 LStR Aufmerksamkeiten",
    "Andere Bitte angeben",
  ];

  constructor(
    pdfDoc: PDFDocument,
    isDebugMode: boolean,
    templatePath?: string,
  ) {
    super(pdfDoc, isDebugMode, templatePath);
  }

  async fillForm(fieldValues: PdfFormData): Promise<void> {
    try {
      const form = this.getPdfDoc().getForm();
      let filledFieldsCount = 0;

      // Fill text fields
      for (const fieldName of DokumentationsbogenFiller.TEXT_FIELDS) {
        if (fieldValues[fieldName]) {
          try {
            const field = form.getTextField(fieldName);
            field.setText(fieldValues[fieldName]);
            filledFieldsCount++;
          } catch (e) {
            console.warn(`Failed to set text field ${fieldName}:`, e);
          }
        }
      }

      // Fill standard checkboxes
      for (const fieldName of DokumentationsbogenFiller.STANDARD_CHECKBOXES) {
        if (fieldValues[fieldName]) {
          try {
            const field = form.getCheckBox(fieldName);
            const isYesValue = this.isYesValue(fieldValues[fieldName]);
            if (isYesValue) {
              field.check();
            } else {
              field.uncheck();
            }
            filledFieldsCount++;
          } catch (e) {
            console.warn(`Failed to set checkbox ${fieldName}:`, e);
          }
        }
      }

      // Handle special fields
      for (const fieldName of DokumentationsbogenFiller.SPECIAL_FIELDS) {
        if (fieldValues[fieldName]) {
          try {
            const field = form.getField(fieldName);
            const isYesValue = this.isYesValue(fieldValues[fieldName]);

            if (isYesValue) {
              filledFieldsCount += await this.tryMultipleFieldMethods(field);
            }
          } catch (e) {
            console.warn(`Failed to set special field ${fieldName}:`, e);
          }
        }
      }

      if (filledFieldsCount === 0) {
        throw new Error("Could not fill any fields in Dokumentationsbogen");
      }
    } catch (error: any) {
      console.error(
        "Error in fillDokumentationsbogen:",
        error.message || error,
      );
      throw new Error(
        `Dokumentationsbogen filling failed: ${error.message || error}`,
      );
    }
  }

  private isYesValue(value: string): boolean {
    return (
      value.toLowerCase() === "yes" ||
      value.toLowerCase() === "ja" ||
      value.toLowerCase() === "true" ||
      value === "1"
    );
  }

  private async tryMultipleFieldMethods(field: any): Promise<number> {
    try {
      // Method 1: Check as checkbox
      try {
        field.check();
        return 1;
      } catch (e) {
        // Not a checkbox, try next method
      }

      // Method 2: Set as text
      try {
        field.setText("Yes");
        return 1;
      } catch (e) {
        // Not a text field, try next method
      }

      // Method 3: setValue for button fields
      try {
        field.setValue("Yes");
        return 1;
      } catch (e) {
        // Not a button field, try next method
      }

      // Method 4: Select for radio groups
      try {
        field.select("Yes");
        return 1;
      } catch (e) {
        // Failed all methods
      }
    } catch (eMethod) {
      // General method error
    }
    return 0;
  }
}
