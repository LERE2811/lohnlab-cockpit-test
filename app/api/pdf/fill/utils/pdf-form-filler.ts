import { PDFDocument } from "pdf-lib";

export interface PdfFormData {
  [key: string]: string;
}

export class PdfFormFiller {
  private pdfDoc: PDFDocument;
  private isDebugMode: boolean;
  private templatePath?: string;

  constructor(
    pdfDoc: PDFDocument,
    isDebugMode: boolean,
    templatePath?: string,
  ) {
    this.pdfDoc = pdfDoc;
    this.isDebugMode = isDebugMode;
    this.templatePath = templatePath;
  }

  async fillForm(fieldValues: PdfFormData): Promise<void> {
    try {
      const form = this.pdfDoc.getForm();
      const fields = form.getFields();
      const isVercelEnvironment = process.env.VERCEL === "1";

      // Map fields to their types
      const fieldMap = new Map();

      for (const field of fields) {
        const fieldName = field.getName();
        fieldMap.set(fieldName, this.determineFieldType(field, fieldName));
      }

      // Count for statistics
      let filledFields = 0;
      let skippedFields = 0;
      let errorFields = 0;

      // Fill in each field if it exists
      for (const [key, value] of Object.entries(fieldValues)) {
        try {
          if (fieldMap.has(key)) {
            const fieldType = fieldMap.get(key);
            filledFields += (await this.fillField(form, key, value, fieldType))
              ? 1
              : 0;
          } else {
            skippedFields++;
          }
        } catch (individualFieldError: any) {
          console.error(
            `Unexpected error processing field ${key}:`,
            individualFieldError.message || individualFieldError,
          );
          errorFields++;
        }
      }

      if (filledFields === 0) {
        throw new Error("No fields filled with primary method");
      }
    } catch (error: any) {
      console.error("Error in fillForm function:", error.message || error);
      throw error;
    }
  }

  private determineFieldType(field: any, fieldName: string): string {
    const isVercelEnvironment = process.env.VERCEL === "1";

    if (isVercelEnvironment) {
      // In Vercel, determine type by field name and behaviors
      const isDokumentationsbogen =
        fieldName.toLowerCase().includes("dokument") ||
        (this.templatePath?.toLowerCase().includes("dokumentationsbogen") ??
          false);

      if (this.isCheckboxField(fieldName, isDokumentationsbogen) ?? false) {
        return "checkbox";
      } else if (this.isDropdownField(fieldName)) {
        return "dropdown";
      } else {
        return "text";
      }
    } else {
      // Standard environment - use constructor name
      if (field.constructor.name.includes("PDFTextField")) {
        return "text";
      } else if (field.constructor.name.includes("PDFCheckBox")) {
        return "checkbox";
      } else if (field.constructor.name.includes("PDFRadioGroup")) {
        return "radio";
      } else if (field.constructor.name.includes("PDFDropdown")) {
        return "dropdown";
      } else if (field.constructor.name.includes("PDFOptionList")) {
        return "option";
      }
      return "unknown";
    }
  }

  private isCheckboxField(
    fieldName: string,
    isDokumentationsbogen: boolean,
  ): boolean {
    const commonCheckboxPatterns = [
      "check",
      "givve StandardCard",
      "givve LogoCard",
      "givve DesignCard",
      "ja",
      "nein",
      "yes",
      "no",
      "option",
    ];

    const dokumentationsbogenCheckboxes = [
      "Land und Forstwirtschaft",
      "Bergbau",
      "Verarbeitendes Gewerbe",
      "Energieversorgung",
      "Wasserversorgung",
      "Baugewerbe",
      "Handel",
      "Verkehr",
      "Gastgewerbe",
      "Information",
      "Erbringung von Finanz",
      "Grundstücks",
      "Erbringung von freiberuflichen",
      "Erbringung von sonstigen",
      "Öffentliche Verwaltung",
      "Erziehung",
      "Gesundheits",
      "Kunst",
      "Private Haushalte",
      "Exterritoriale",
      "Der Vertragspartner führt",
      "Bereitstellung eines Sachbezugs",
      "bis zu 50 EUR pro Monat",
      "bis zu 60 EUR je persönlichen",
      "Andere Bitte angeben",
    ];

    const lowerFieldName = fieldName.toLowerCase();
    return (
      commonCheckboxPatterns.some((pattern) =>
        lowerFieldName.includes(pattern.toLowerCase()),
      ) ||
      (isDokumentationsbogen &&
        dokumentationsbogenCheckboxes.some((pattern) =>
          fieldName.includes(pattern),
        ))
    );
  }

  private isDropdownField(fieldName: string): boolean {
    return (
      fieldName.toLowerCase().includes("dropdown") ||
      fieldName.toLowerCase().includes("auswahl") ||
      fieldName.toLowerCase().includes("liste")
    );
  }

  private async fillField(
    form: any,
    key: string,
    value: string,
    fieldType: string,
  ): Promise<boolean> {
    try {
      switch (fieldType) {
        case "text":
          const textField = form.getTextField(key);
          textField.setText(value);
          return true;

        case "checkbox":
          const checkBox = form.getCheckBox(key);
          if (
            value.toLowerCase() === "yes" ||
            value === "true" ||
            value === "1"
          ) {
            checkBox.check();
          } else {
            checkBox.uncheck();
          }
          return true;

        case "radio":
          const radioGroup = form.getRadioGroup(key);
          radioGroup.select(value);
          return true;

        case "dropdown":
        case "option":
          const dropdown = form.getDropdown(key);
          dropdown.select(value);
          return true;

        default:
          return false;
      }
    } catch (error) {
      console.warn(
        `Error filling field "${key}" of type "${fieldType}":`,
        error,
      );
      return false;
    }
  }

  getPdfDoc(): PDFDocument {
    return this.pdfDoc;
  }
}
