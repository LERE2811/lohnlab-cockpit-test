import { PDFDocument } from "pdf-lib";

/**
 * Loads a PDF file from a URL and returns it as a PDFDocument
 */
export async function loadPdfFromUrl(url: string): Promise<PDFDocument> {
  try {
    const response = await fetch(url);
    const pdfBytes = await response.arrayBuffer();
    return await PDFDocument.load(pdfBytes);
  } catch (error) {
    console.error("Error loading PDF:", error);
    throw new Error("Failed to load PDF document");
  }
}

/**
 * Extracts and returns all form field names from a PDF
 * @param pdfDoc The PDF document to extract fields from
 * @returns Array of field names and their types
 */
export function extractPdfFieldNames(
  pdfDoc: PDFDocument,
): { name: string; type: string }[] {
  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();

    return fields.map((field) => {
      let type = "unknown";

      if (field.constructor.name.includes("PDFTextField")) {
        type = "text";
      } else if (field.constructor.name.includes("PDFCheckBox")) {
        type = "checkbox";
      } else if (field.constructor.name.includes("PDFRadioGroup")) {
        type = "radio";
      } else if (field.constructor.name.includes("PDFDropdown")) {
        type = "dropdown";
      } else if (field.constructor.name.includes("PDFOptionList")) {
        type = "option";
      } else if (field.constructor.name.includes("PDFButton")) {
        type = "button";
      } else if (field.constructor.name.includes("PDFSignature")) {
        type = "signature";
      }

      return {
        name: field.getName(),
        type,
      };
    });
  } catch (error) {
    console.error("Error extracting PDF field names:", error);
    return [];
  }
}

/**
 * Creates a JSON representation of all form fields in a PDF
 */
export async function analyzePdfForm(
  url: string,
): Promise<{ name: string; type: string }[]> {
  try {
    const pdfDoc = await loadPdfFromUrl(url);
    return extractPdfFieldNames(pdfDoc);
  } catch (error) {
    console.error("Error analyzing PDF form:", error);
    return [];
  }
}

/**
 * Fills a PDF form with provided field values
 * @param pdfDoc The PDF document to fill
 * @param fieldValues Object containing field names and values to fill
 * @returns The filled PDF document
 */
export async function fillPdfForm(
  pdfDoc: PDFDocument,
  fieldValues: Record<string, string>,
): Promise<PDFDocument> {
  try {
    const form = pdfDoc.getForm();

    // Get all form fields with their types
    const fields = extractPdfFieldNames(pdfDoc);
    const fieldMap = new Map(fields.map((field) => [field.name, field.type]));

    // Fill in each field if it exists
    for (const [key, value] of Object.entries(fieldValues)) {
      if (fieldMap.has(key)) {
        const fieldType = fieldMap.get(key);

        try {
          if (fieldType === "text") {
            // Handle text fields
            const field = form.getTextField(key);
            field.setText(value);
          } else if (fieldType === "checkbox") {
            // Handle checkbox fields
            const field = form.getCheckBox(key);
            if (
              value.toLowerCase() === "yes" ||
              value === "true" ||
              value === "1"
            ) {
              field.check();
            } else {
              field.uncheck();
            }
          } else if (fieldType === "radio") {
            // Handle radio button groups
            const field = form.getRadioGroup(key);
            field.select(value);
          } else if (fieldType === "dropdown" || fieldType === "option") {
            // Handle dropdown and option lists
            const field = form.getDropdown(key);
            field.select(value);
          }
          // Other field types like signature or button are not typically filled programmatically
        } catch (fieldError) {
          console.warn(
            `Error filling field "${key}" of type "${fieldType}":`,
            fieldError,
          );
        }
      }
    }

    // Flatten the form to prevent further editing if needed
    // form.flatten();

    return pdfDoc;
  } catch (error) {
    console.error("Error filling PDF form:", error);
    throw new Error("Failed to fill PDF form");
  }
}

/**
 * Saves a PDFDocument as a blob and returns a download URL
 */
export async function savePdfAsBlob(
  pdfDoc: PDFDocument,
  filename: string,
): Promise<{ url: string; blob: Blob }> {
  try {
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    return { url, blob };
  } catch (error) {
    console.error("Error saving PDF:", error);
    throw new Error("Failed to save PDF document");
  }
}

/**
 * Downloads a PDF document with the given filename
 */
export function downloadPdf(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

/**
 * Utility function to map company/subsidiary data to Bestellformular fields
 */
export function mapCompanyDataToBestellformular(data: {
  companyName?: string;
  subsidiaryName?: string;
  street?: string;
  houseNumber?: string;
  postalCode?: string;
  city?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactPhone?: string;
  cardType?: string;
  departmentName?: string;
  legalForm?: string;
  registrationNumber?: string;
}): Record<string, string> {
  // Using the exact field names from the PDF
  const result: Record<string, string> = {
    // Company details
    Firma: data.companyName || "",
    "Straße Nr": `${data.street || ""} ${data.houseNumber || ""}`,
    "PLZ Ort": `${data.postalCode || ""} ${data.city || ""}`,
    PLZ: data.postalCode || "", // Separate PLZ field

    // Contact information
    EMail: data.contactEmail || "",
    "Vorname Ansprechpartner": data.contactFirstName || "",
    "Nachname Ansprechpartner": data.contactLastName || "",
    "Vorname Nachname Ansprechpartner": `${data.contactFirstName || ""} ${data.contactLastName || ""}`,

    // Legal information
    Rechtsform: data.legalForm || "",
    Registernummer: data.registrationNumber || "",

    // Second line or department name
    Text2: data.departmentName || "",
    Text3: "", // Optional field that might be used
  };

  // Handle card type selection (checkboxes)
  // Ensure all checkboxes are explicitly set to avoid pre-checked values
  result["givve StandardCard"] = "Off";
  result["givve LogoCard"] = "Off";
  result["givve DesignCard"] = "Off";

  if (data.cardType === "standard") {
    result["givve StandardCard"] = "Yes";
  } else if (data.cardType === "logo") {
    result["givve LogoCard"] = "Yes";
  } else if (data.cardType === "design") {
    result["givve DesignCard"] = "Yes";
  }

  // Auto-fill today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  result["Datum"] = formattedDate;

  return result;
}

/**
 * Utility function to map company/subsidiary data to Dokumentationsbogen fields
 */
export function mapCompanyDataToDokumentationsbogen(
  data: {
    companyName?: string;
    subsidiaryName?: string;
    legalForm?: string;
    registrationNumber?: string;
    registrationOffice?: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    contactFirstName?: string;
    contactLastName?: string;
    contactEmail?: string;
    contactPhone?: string;
    contactPosition?: string;
    industryCategory?: string;
    birthDate?: string;
    birthPlace?: string;
    nationality?: string;
  },
  documentType: string,
): Record<string, string> {
  // Create the full address string
  const fullAddress = `${data.street || ""} ${data.houseNumber || ""}, ${data.postalCode || ""} ${data.city || ""}`;
  const contactFullName = `${data.contactFirstName || ""} ${data.contactLastName || ""}`;

  // Format today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Base mapping for common fields that might appear in different document types
  // These will be selectively included based on document type
  const commonFields: Record<string, string> = {
    // Company information
    Firma: data.companyName || "",
    "Name des Unternehmens": data.companyName || "",
    "Firma des Unternehmens": data.companyName || "",
    Firmenname: data.companyName || "",

    // Address information
    Anschrift: fullAddress,
    "Straße und Hausnummer": `${data.street || ""} ${data.houseNumber || ""}`,
    "Postleitzahl und Ort": `${data.postalCode || ""} ${data.city || ""}`,

    // Registration information
    Registergericht: data.registrationOffice || "",
    Handelsregisternummer: data.registrationNumber || "",
    Registernummer: data.registrationNumber || "",

    // Contact information
    "Name des Ansprechpartners": contactFullName,
    "Vorname Ansprechpartner": data.contactFirstName || "",
    "Nachname Ansprechpartner": data.contactLastName || "",
    "Funktion des Ansprechpartners": data.contactPosition || "",
    "E-Mail des Ansprechpartners": data.contactEmail || "",
    "Telefonnummer des Ansprechpartners": data.contactPhone || "",

    // Date field
    Datum: formattedDate,
  };

  // Select relevant fields based on document type
  switch (documentType) {
    case "EINZELUNTERNEHMEN":
    case "FREIBERUFLER":
    case "E.K.":
      // Handle Dokumentationsbogen Natürliche Person
      const industryFields = {
        "Land und Forstwirtschaft Fischerei": "Off",
        "Bergbau und Gewinnung von Steinen und Erden": "Off",
        "Verarbeitendes Gewerbe": "Off",
        Energieversorgung: "Off",
        "Wasserversorgung Abwasser und Abfallentsorgung": "Off",
        Baugewerbe: "Off",
        "Handel Instandhaltung und Reparatur von": "Off",
        "Verkehr und Lagerei": "Off",
        Gastgewerbe: "Off",
        "Information und Kommunikation": "Off",
        "Erbringung von Finanz und Versicherungs": "Off",
        "Grundstücks und Wohnungswesen": "Off",
        "Erbringung von freiberuflichen wissenschaftlichen": "Off",
        "Erbringung von sonstigen wirtschaftlichen": "Off",
        "Öffentliche Verwaltung Verteidigung": "Off",
        "Erziehung und Unterricht": "Off",
        "Gesundheits und Sozialwesen": "Off",
        "Kunst Unterhaltung und Erholung": "Off",
        "Erbringung von sonstigen Dienstleistungen": "Off",
        "Private Haushalte mit Hauspersonal Herstellung": "Off",
        "Exterritoriale Organisationen und Körperschaften": "Off",
      };

      // Map industry category from data to checkbox field name
      if (data.industryCategory) {
        // Create mapping between industry categories and field names
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

        // Find the matching field name and set it to "Yes"
        const fieldName = industryMapping[data.industryCategory];
        if (fieldName) {
          // Type assertion to handle the indexing
          (industryFields as Record<string, string>)[fieldName] = "Yes";
        }
      }

      const result: Record<string, string> = {
        // Default all checkboxes to "Off"
        "Der Vertragspartner führt ein Einzelunternehmen": "Off",
        "Der Vertragspartner führt einen freien Beruf aus": "Off",
        "Der Vertragspartner ist ein eingetragener Kaufmann eK": "Off",
        // Select the appropriate checkbox based on legal form
        ...(documentType === "EINZELUNTERNEHMEN" && {
          "Der Vertragspartner führt ein Einzelunternehmen": "Yes",
        }),
        ...(documentType === "FREIBERUFLER" && {
          "Der Vertragspartner führt einen freien Beruf aus": "Yes",
        }),
        ...(documentType === "E.K." && {
          "Der Vertragspartner ist ein eingetragener Kaufmann eK": "Yes",
        }),

        // Personal information
        "Vornamen und Nachname": contactFullName,
        // Birthdate information - use provided data
        Geburtsdatum: data.birthDate || "",
        Geburtsort: data.birthPlace || "",
        Staatsangehörigkeit: data.nationality || "",
        // Contact details
        Wohnanschrift: fullAddress,
        "EMail Adresse": data.contactEmail || "",
        "Registernummer nur bei eK":
          documentType === "E.K." ? data.registrationNumber || "" : "",

        // Apply industry fields
        ...industryFields,

        // PEP (Politically Exposed Person) - default to No
        Nein: "Yes",
        "Ja folgende Person folgendes Amt": "Off",
        "Person, Amt": "",

        // Purpose of business relationship
        "Bereitstellung eines Sachbezugs für voraussichtlich": "Yes",
        Mitarbeiter: "1", // Default to 1 employee if not specified

        // Set all usage purposes to "Yes" by default (Mehrauswahl möglich)
        "bis zu 50 EUR pro Monat nach  8 Abs 2 Satz 11 EStG steuerfreier Sachbezug":
          "Yes",
        "bis zu 60 EUR je persönlichen Anlass nach R 196 Abs 1 LStR Aufmerksamkeiten":
          "Yes",
        "bis zu 10000 EUR pro Jahr nach  37b EStG pauschalversteurter Sachbezug":
          "Yes",
        "Andere Bitte angeben": "Off",
        Andere: "",

        // Signature field
        "Ort, Datum, Unterschrift": `${data.city || ""}, ${formattedDate}`,
      };

      return result;

    case "GmbH":
    case "UG":
      return {
        // Fields specific to GmbH/UG form
        "Name des Unternehmens": commonFields["Name des Unternehmens"],
        Rechtsform: data.legalForm || "",
        Handelsregisternummer: commonFields["Handelsregisternummer"],
        Registergericht: commonFields["Registergericht"],
        Anschrift: commonFields["Anschrift"],
        "Name des Ansprechpartners": commonFields["Name des Ansprechpartners"],
        "Funktion des Ansprechpartners":
          commonFields["Funktion des Ansprechpartners"],
        "E-Mail des Ansprechpartners":
          commonFields["E-Mail des Ansprechpartners"],
        "Telefonnummer des Ansprechpartners":
          commonFields["Telefonnummer des Ansprechpartners"],
        Datum: commonFields["Datum"],
      };

    case "AG":
      return {
        // Fields specific to AG form
        "Name des Unternehmens": commonFields["Name des Unternehmens"],
        Rechtsform: data.legalForm || "",
        Handelsregisternummer: commonFields["Handelsregisternummer"],
        Registergericht: commonFields["Registergericht"],
        Anschrift: commonFields["Anschrift"],
        "Name des Ansprechpartners": commonFields["Name des Ansprechpartners"],
        "Funktion des Ansprechpartners":
          commonFields["Funktion des Ansprechpartners"],
        "E-Mail des Ansprechpartners":
          commonFields["E-Mail des Ansprechpartners"],
        "Telefonnummer des Ansprechpartners":
          commonFields["Telefonnummer des Ansprechpartners"],
        Datum: commonFields["Datum"],
      };

    case "GbR":
      return {
        // Fields specific to GbR form
        "Name der GbR": data.companyName || "",
        "Anschrift der GbR": commonFields["Anschrift"],
        "Name des Ansprechpartners": commonFields["Name des Ansprechpartners"],
        "Funktion des Ansprechpartners":
          commonFields["Funktion des Ansprechpartners"],
        "E-Mail des Ansprechpartners":
          commonFields["E-Mail des Ansprechpartners"],
        "Telefonnummer des Ansprechpartners":
          commonFields["Telefonnummer des Ansprechpartners"],
        Datum: commonFields["Datum"],
      };

    case "KG_OHG":
      return {
        // Fields specific to KG/OHG form
        "Name des Unternehmens": commonFields["Name des Unternehmens"],
        Rechtsform: data.legalForm || "",
        Handelsregisternummer: commonFields["Handelsregisternummer"],
        Registergericht: commonFields["Registergericht"],
        Anschrift: commonFields["Anschrift"],
        "Name des Ansprechpartners": commonFields["Name des Ansprechpartners"],
        "Funktion des Ansprechpartners":
          commonFields["Funktion des Ansprechpartners"],
        "E-Mail des Ansprechpartners":
          commonFields["E-Mail des Ansprechpartners"],
        "Telefonnummer des Ansprechpartners":
          commonFields["Telefonnummer des Ansprechpartners"],
        Datum: commonFields["Datum"],
      };

    // Default case for any other document type
    default:
      return {
        // General fields that should work for most forms
        "Name des Unternehmens": commonFields["Name des Unternehmens"],
        Rechtsform: data.legalForm || "",
        Registernummer: commonFields["Registernummer"],
        Registergericht: commonFields["Registergericht"],
        Anschrift: commonFields["Anschrift"],
        "Name des Ansprechpartners": commonFields["Name des Ansprechpartners"],
        "Funktion des Ansprechpartners":
          commonFields["Funktion des Ansprechpartners"],
        "E-Mail des Ansprechpartners":
          commonFields["E-Mail des Ansprechpartners"],
        "Telefonnummer des Ansprechpartners":
          commonFields["Telefonnummer des Ansprechpartners"],
        Datum: commonFields["Datum"],
      };
  }
}
