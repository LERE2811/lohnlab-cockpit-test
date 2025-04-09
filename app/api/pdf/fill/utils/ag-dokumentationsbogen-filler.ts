import { PDFDocument } from "pdf-lib";
import { PdfFormFiller, PdfFormData } from "./pdf-form-filler";

export class AGDokumentationsbogenFiller extends PdfFormFiller {
  // Text fields from the AG Dokumentationsbogen
  private static readonly TEXT_FIELDS = [
    "Name des Unternehmens",
    "Anschrift des Sitzes der Hauptniederlassung",
    "Anschrift des Sitzes der Hauptniederlassung_2",
    "Rechtsform",
    "Registernummer",
    "Namen aller gesetzlichen Vertreter Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu",
    "Namen aller gesetzlichen Vertreter Mitglieder des…ertretungsorgans Prokuristen gehören nicht dazu_2",
    "Namen aller gesetzlichen Vertreter Mitglieder des…ertretungsorgans Prokuristen gehören nicht dazu_3",
    "Namen aller gesetzlichen Vertreter Mitglieder des…ertretungsorgans Prokuristen gehören nicht dazu_4",
    "Andere bitte angeben",
    "EMail Adressen",
    "VornameRow1",
    "NachnameRow1",
    "GeburtsdatumRow1",
    "StaatsbürgerschaftRow1",
    "VornameRow2",
    "NachnameRow2",
    "GeburtsdatumRow2",
    "StaatsbürgerschaftRow2",
    "VornameRow3",
    "NachnameRow3",
    "GeburtsdatumRow3",
    "StaatsbürgerschaftRow3",
    "VornameRow4",
    "NachnameRow4",
    "GeburtsdatumRow4",
    "StaatsbürgerschaftRow4",
    "VornameRow5",
    "NachnameRow5",
    "GeburtsdatumRow5",
    "StaatsbürgerschaftRow5",
    "Mitarbeiter",
    "Person, Amt",
    "Andere",
    "Ort, Datum, Unterschrift",
  ];

  // Checkbox fields from the AG Dokumentationsbogen
  private static readonly CHECKBOX_FIELDS = [
    "Die Aktiengesellschaft ist nicht an einem organisierten Markt im Sinne von 2 Abs 11 WpHG notiert",
    "Die Aktiengesellschaft ist an einem organisierten …nne von 2 Abs 11 WpHG in einem Mitgliedstaat der",
    "Frankfurter Wertpapierbörse",
    "Börse Stuttgart",
    "Hamburger Börse",
    "undefined", // This strange field name appears in the PDF
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
    "Bearbeitung notwendig da die Aktiengesellschaft nicht an einem organisierten Markt im Sinne von 2",
    "Keine Bearbeitung notwendig da die Aktiengesellschaft an einem organisierten Markt im Sinne von 2",
    "Die aufgeführten Personen halten unmittelbar oder …r mehr als 25 der Kapital oder Stimmrechtsanteile",
    "Es existiert keine natürliche Person die mehr als …al oder Stimmrechtsanteilen hält Die aufgeführten",
    "Keine Bearbeitung notwendig da die Aktiengesellschaft an einem organisierten Mark im Sinne von",
    "Nein",
    "Ja folgende Person folgendes Amt",
    "Bereitstellung eines Sachbezugs für voraussichtlich",
    "bis zu 50 EUR pro Monat nach 8 Abs 2 Satz 11 EStG steuerfreier Sachbezug",
    "bis zu 4 mal 60 EUR pro Jahr nach R 196 Abs 1 LStR Aufmerksamkeiten",
    "bis zu 10000 EUR pro Jahr nach 37b EStG pauschalversteurter Sachbezug",
    "Andere Bitte angeben",
  ];

  private readonly debugMode: boolean;

  constructor(
    pdfDoc: PDFDocument,
    isDebugMode: boolean,
    templatePath?: string,
  ) {
    super(pdfDoc, isDebugMode, templatePath);
    this.debugMode = isDebugMode;
  }

  async fillForm(fieldValues: PdfFormData): Promise<void> {
    try {
      const form = this.getPdfDoc().getForm();
      let filledFieldsCount = 0;

      // Fill text fields
      for (const fieldName of AGDokumentationsbogenFiller.TEXT_FIELDS) {
        if (fieldValues[fieldName]) {
          try {
            const field = form.getTextField(fieldName);
            field.setText(fieldValues[fieldName]);
            filledFieldsCount++;

            if (this.debugMode) {
              console.log(
                `Successfully filled text field: ${fieldName} with value: ${fieldValues[fieldName]}`,
              );
            }
          } catch (e) {
            if (this.debugMode) {
              console.warn(`Failed to set text field ${fieldName}:`, e);
            }
          }
        }
      }

      // Fill checkbox fields
      for (const fieldName of AGDokumentationsbogenFiller.CHECKBOX_FIELDS) {
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

            if (this.debugMode) {
              console.log(
                `Successfully filled checkbox field: ${fieldName} with value: ${isYesValue ? "checked" : "unchecked"}`,
              );
            }
          } catch (e) {
            if (this.debugMode) {
              console.warn(`Failed to set checkbox ${fieldName}:`, e);
            }
          }
        }
      }

      // Handle special AG form cases
      await this.handleAGSpecialCases(form, fieldValues);

      if (filledFieldsCount === 0) {
        throw new Error("Could not fill any fields in AG Dokumentationsbogen");
      }

      if (this.debugMode) {
        console.log(
          `Filled ${filledFieldsCount} fields in AG Dokumentationsbogen`,
        );
      }
    } catch (error: any) {
      console.error(
        "Error in AG Dokumentationsbogen filling:",
        error.message || error,
      );
      throw new Error(
        `AG Dokumentationsbogen filling failed: ${error.message || error}`,
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

  private async handleAGSpecialCases(
    form: any,
    fieldValues: PdfFormData,
  ): Promise<void> {
    // Handle stock exchange listing status
    if (fieldValues.isListed !== undefined) {
      try {
        const isListedValue = this.isYesValue(String(fieldValues.isListed));
        if (isListedValue) {
          // AG is listed
          const listedField = form.getCheckBox(
            "Die Aktiengesellschaft ist an einem organisierten …nne von 2 Abs 11 WpHG in einem Mitgliedstaat der",
          );
          listedField.check();

          // Mark the "No processing needed" checkbox
          const noProcessingField = form.getCheckBox(
            "Keine Bearbeitung notwendig da die Aktiengesellschaft an einem organisierten Markt im Sinne von 2",
          );
          noProcessingField.check();

          // Handle specific stock exchange selection
          if (fieldValues.stockExchange) {
            switch (fieldValues.stockExchange.toLowerCase()) {
              case "dax":
              case "mdax":
              case "sdax":
              case "tecdax":
              case "frankfurter wertpapierbörse":
                form.getCheckBox("Frankfurter Wertpapierbörse").check();
                break;
              case "börse stuttgart":
                form.getCheckBox("Börse Stuttgart").check();
                break;
              case "hamburger börse":
                form.getCheckBox("Hamburger Börse").check();
                break;
              case "other":
              default:
                if (fieldValues.otherStockExchange) {
                  form.getCheckBox("undefined").check(); // The "Other" checkbox has an undefined name
                  form
                    .getTextField("Andere bitte angeben")
                    .setText(fieldValues.otherStockExchange);
                }
                break;
            }
          }
        } else {
          // AG is not listed
          const notListedField = form.getCheckBox(
            "Die Aktiengesellschaft ist nicht an einem organisierten Markt im Sinne von 2 Abs 11 WpHG notiert",
          );
          notListedField.check();

          // Mark the "Processing needed" checkbox
          const processingField = form.getCheckBox(
            "Bearbeitung notwendig da die Aktiengesellschaft nicht an einem organisierten Markt im Sinne von 2",
          );
          processingField.check();
        }
      } catch (e) {
        if (this.debugMode) {
          console.warn("Failed to set AG listing status:", e);
        }
      }
    }

    // Handle industry selection
    if (fieldValues.industry) {
      try {
        // Map between user-friendly industry names and PDF field names
        const industryMapping: Record<string, string> = {
          "Land- und Forstwirtschaft, Fischerei":
            "Land und Forstwirtschaft Fischerei",
          "Bergbau und Gewinnung von Steinen und Erden":
            "Bergbau und Gewinnung von Steinen und Erden",
          "Verarbeitendes Gewerbe": "Verarbeitendes Gewerbe",
          Energieversorgung: "Energieversorgung",
          "Wasserversorgung; Abwasser- und Abfallentsorgung":
            "Wasserversorgung Abwasser und Abfallentsorgung",
          Baugewerbe: "Baugewerbe",
          "Handel; Instandhaltung und Reparatur von Kraftfahrzeugen":
            "Handel Instandhaltung und Reparatur von",
          "Verkehr und Lagerei": "Verkehr und Lagerei",
          Gastgewerbe: "Gastgewerbe",
          "Information und Kommunikation": "Information und Kommunikation",
          "Erbringung von Finanz- und Versicherungsdienstleistungen":
            "Erbringung von Finanz und Versicherungs",
          "Grundstücks- und Wohnungswesen": "Grundstücks und Wohnungswesen",
          "Erbringung von freiberuflichen, wissenschaftlichen und technischen Dienstleistungen":
            "Erbringung von freiberuflichen wissenschaftlichen",
          "Erbringung von sonstigen wirtschaftlichen Dienstleistungen":
            "Erbringung von sonstigen wirtschaftlichen",
          "Öffentliche Verwaltung, Verteidigung; Sozialversicherung":
            "Öffentliche Verwaltung Verteidigung",
          "Erziehung und Unterricht": "Erziehung und Unterricht",
          "Gesundheits- und Sozialwesen": "Gesundheits und Sozialwesen",
          "Kunst, Unterhaltung und Erholung": "Kunst Unterhaltung und Erholung",
          "Erbringung von sonstigen Dienstleistungen":
            "Erbringung von sonstigen Dienstleistungen",
          "Private Haushalte mit Hauspersonal":
            "Private Haushalte mit Hauspersonal Herstellung",
          "Exterritoriale Organisationen und Körperschaften":
            "Exterritoriale Organisationen und Körperschaften",
        };

        const fieldName = industryMapping[fieldValues.industry];
        if (fieldName) {
          form.getCheckBox(fieldName).check();
        }
      } catch (e) {
        if (this.debugMode) {
          console.warn("Failed to set industry:", e);
        }
      }
    }

    // Handle PEP status
    if (fieldValues.hasPep !== undefined) {
      try {
        if (fieldValues.hasPep) {
          form.getCheckBox("Ja folgende Person folgendes Amt").check();
          form.getCheckBox("Nein").uncheck();
          if (fieldValues.pepDetails) {
            form.getTextField("Person, Amt").setText(fieldValues.pepDetails);
          }
        } else {
          form.getCheckBox("Nein").check();
          form.getCheckBox("Ja folgende Person folgendes Amt").uncheck();
        }
      } catch (e) {
        if (this.debugMode) {
          console.warn("Failed to set PEP status:", e);
        }
      }
    }
  }
}
