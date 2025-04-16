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
    isListed?: boolean;
    stockExchange?: string;
    otherStockExchange?: string;
    employeeCount?: string;
    hasPep?: boolean;
    pepDetails?: string;
    mainOfficeAddress?: string;
    representatives?: string[];
    beneficialOwners?: Array<{
      Vorname?: string;
      Nachname?: string;
      Geburtsdatum?: string;
      Staatsbürgerschaft?: string;
    }>;
    representativeEmail?: string;
  },
  documentType: string,
): Record<string, string> {
  // Create the full address string
  const fullAddress = `${data.street || ""} ${data.houseNumber || ""}, ${data.postalCode || ""} ${data.city || ""}`;
  const contactFullName = `${data.contactFirstName || ""} ${data.contactLastName || ""}`;

  // Add mainOfficeAddress to field values directly
  const mainOfficeAddress = data.mainOfficeAddress || fullAddress;

  // Log mapping for debugging
  console.log("Mapping address for Dokumentationsbogen:", {
    mainOfficeAddress,
    fullAddress,
    doubleSpaceKey: "Anschrift des Sitzes  der Hauptniederlassung",
  });

  // Function to ensure double space field is handled correctly
  const addAddressField = (obj: Record<string, string>) => {
    // Add double-space field explicitly
    obj["Anschrift des Sitzes  der Hauptniederlassung"] = mainOfficeAddress;
    // Also add mainOfficeAddress as a direct field
    obj.mainOfficeAddress = mainOfficeAddress;
    return obj;
  };

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
    "Name des Unternehmens": data.subsidiaryName || "",
    "Firma des Unternehmens": data.companyName || "",
    Firmenname: data.companyName || "",

    // Address information
    Anschrift: mainOfficeAddress,
    mainOfficeAddress: mainOfficeAddress, // Add this explicitly for the DokumentationsbogenFiller
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
        Nein: data.hasPep === false ? "Yes" : "Off",
        "Ja folgende Person folgendes Amt":
          data.hasPep === true ? "Yes" : "Off",
        "Person, Amt": data.pepDetails || "",

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

      return addAddressField(result);

    case "GmbH":
    case "UG":
      // Industry category fields for GmbH/UG
      const gmbhIndustryFields = {
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

      // Map industry category from data to checkbox field name for GmbH/UG
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
          (gmbhIndustryFields as Record<string, string>)[fieldName] = "Yes";
        }
      }

      // Debug logging for representatives
      console.log("Mapping representatives data:", data.representatives);

      // Store all representative fields to be added to the return object
      const representativeFields: Record<string, string> = {};

      // Map representatives to their exact field names
      if (data.representatives && Array.isArray(data.representatives)) {
        const exactFieldNames = [
          "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu",
          "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu_2",
          "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu_3",
          "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu_4",
        ];

        // Map each representative to its corresponding field
        for (
          let i = 0;
          i < Math.min(exactFieldNames.length, data.representatives.length);
          i++
        ) {
          if (data.representatives[i]) {
            representativeFields[exactFieldNames[i]] = data.representatives[i];
            console.log(
              `Mapping representative ${i + 1} to field: ${exactFieldNames[i]}`,
            );
          }
        }
      }

      // Add fallback for first representative field if no representatives were provided
      if (
        !representativeFields[
          "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu"
        ]
      ) {
        representativeFields[
          "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu"
        ] = contactFullName;
        console.log(
          "Using contact name as fallback for first representative:",
          contactFullName,
        );
      }

      // Format today's date for signature for GmbH/UG
      const gmbhFormattedDate = today.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const gmbhFields = {
        // Company Information
        "Name des Unternehmens": data.subsidiaryName || data.companyName || "",
        Rechtsform: data.legalForm || "",
        Registernummer: data.registrationNumber || "",

        // Add all representative fields
        ...representativeFields,

        // Contact information
        "EMail Adressen": data.representativeEmail || data.contactEmail || "",

        // Industry categories
        ...gmbhIndustryFields,

        // Economic Beneficiaries section
        "Die aufgeführten Personen halten unmittelbar oder …r mehr als 25 der Kapital oder Stimmrechtsanteile":
          "Off",
        "Es existiert keine natürliche Person die mehr als …al oder Stimmrechtsanteilen hält Die aufgeführten":
          "Yes",

        // Representative info (first row)
        VornameRow1: data.contactFirstName || "",
        NachnameRow1: data.contactLastName || "",
        GeburtsdatumRow1: data.birthDate || "",
        StaatsbürgerschaftRow1: data.nationality || "",

        // PEP Status
        Nein: data.hasPep === false ? "Yes" : "Off",
        "Ja folgende Person folgendes Amt":
          data.hasPep === true ? "Yes" : "Off",
        "Person, Amt": data.pepDetails || "",

        // Purpose of business relationship
        "Bereitstellung eines Sachbezugs für voraussichtlich": "Yes",
        Mitarbeiter: data.employeeCount || "1",
        "Andere Bitte angeben": "Off",
        Andere: "",

        // Purpose options (default all to Yes for flexibility)
        "bis zu 50 EUR pro Monat nach  8 Abs 2 Satz 11 EStG steuerfreier Sachbezug":
          "Yes",
        "bis zu 60 EUR je persönlichen Anlass nach R 196 Abs 1 LStR Aufmerksamkeiten":
          "Yes",
        "bis zu 10000 EUR pro Jahr nach  37b EStG pauschalversteurter Sachbezug":
          "Yes",

        // Beneficial owners (wirtschaftlich Berechtigten) - up to 5 rows
        ...(data.beneficialOwners && data.beneficialOwners[0]
          ? {
              VornameRow1: data.beneficialOwners[0].Vorname || "",
              NachnameRow1: data.beneficialOwners[0].Nachname || "",
              GeburtsdatumRow1: data.beneficialOwners[0].Geburtsdatum || "",
              StaatsbürgerschaftRow1:
                data.beneficialOwners[0].Staatsbürgerschaft || "",
            }
          : {}),

        ...(data.beneficialOwners && data.beneficialOwners[1]
          ? {
              VornameRow2: data.beneficialOwners[1].Vorname || "",
              NachnameRow2: data.beneficialOwners[1].Nachname || "",
              GeburtsdatumRow2: data.beneficialOwners[1].Geburtsdatum || "",
              StaatsbürgerschaftRow2:
                data.beneficialOwners[1].Staatsbürgerschaft || "",
            }
          : {}),

        ...(data.beneficialOwners && data.beneficialOwners[2]
          ? {
              VornameRow3: data.beneficialOwners[2].Vorname || "",
              NachnameRow3: data.beneficialOwners[2].Nachname || "",
              GeburtsdatumRow3: data.beneficialOwners[2].Geburtsdatum || "",
              StaatsbürgerschaftRow3:
                data.beneficialOwners[2].Staatsbürgerschaft || "",
            }
          : {}),

        ...(data.beneficialOwners && data.beneficialOwners[3]
          ? {
              VornameRow4: data.beneficialOwners[3].Vorname || "",
              NachnameRow4: data.beneficialOwners[3].Nachname || "",
              GeburtsdatumRow4: data.beneficialOwners[3].Geburtsdatum || "",
              StaatsbürgerschaftRow4:
                data.beneficialOwners[3].Staatsbürgerschaft || "",
            }
          : {}),

        ...(data.beneficialOwners && data.beneficialOwners[4]
          ? {
              VornameRow5: data.beneficialOwners[4].Vorname || "",
              NachnameRow5: data.beneficialOwners[4].Nachname || "",
              GeburtsdatumRow5: data.beneficialOwners[4].Geburtsdatum || "",
              StaatsbürgerschaftRow5:
                data.beneficialOwners[4].Staatsbürgerschaft || "",
            }
          : {}),

        // Signature
        "Ort, Datum, Unterschrift": `${data.city || ""}, ${gmbhFormattedDate}`,
      };

      return addAddressField(gmbhFields);

    case "AG":
      return {
        // Company information
        "Name des Unternehmens": data.companyName || "",
        "Anschrift des Sitzes  der Hauptniederlassung": `${data.street || ""} ${data.houseNumber || ""}`,
        "Anschrift des Sitzes  der Hauptniederlassung_2": `${data.postalCode || ""} ${data.city || ""}`,
        Rechtsform: "AG",
        Registernummer: data.registrationNumber || "",
        // Representatives information (if available)
        "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu":
          data.contactFirstName && data.contactLastName
            ? `${data.contactFirstName} ${data.contactLastName}`
            : "",
        "EMail Adressen": data.contactEmail || "",
        // Stock exchange listing status
        "Die Aktiengesellschaft ist an einem organisierten …nne von 2 Abs 11 WpHG in einem Mitgliedstaat der":
          data.isListed === true ? "Yes" : "Off",
        "Die Aktiengesellschaft ist nicht an einem organisierten Markt im Sinne von 2 Abs 11 WpHG notiert":
          data.isListed === false ? "Yes" : "Off",
        // Stock exchange selection (if listed)
        "Frankfurter Wertpapierbörse":
          data.stockExchange === "dax" ? "Yes" : "Off",
        "Börse Stuttgart":
          data.stockExchange === "börse stuttgart" ? "Yes" : "Off",
        "Hamburger Börse":
          data.stockExchange === "hamburger börse" ? "Yes" : "Off",
        undefined: data.stockExchange === "other" ? "Yes" : "Off", // Strange PDF field name for "Other"
        "Andere bitte angeben": data.otherStockExchange || "",
        // Business relationship
        "Bereitstellung eines Sachbezugs für voraussichtlich": "Yes",
        Mitarbeiter: data.employeeCount || "1",
        // Purpose options (default all to Yes for flexibility)
        "bis zu 50 EUR pro Monat nach  8 Abs 2 Satz 11 EStG steuerfreier Sachbezug":
          "Yes",
        "bis zu 4 mal 60 EUR pro Jahr nach R 196 Abs 1 LStR Aufmerksamkeiten":
          "Yes",
        "bis zu 10000 EUR pro Jahr nach  37b EStG pauschalversteurter Sachbezug":
          "Yes",
        // PEP status
        Nein: data.hasPep === false ? "Yes" : "Off",
        "Ja folgende Person folgendes Amt":
          data.hasPep === true ? "Yes" : "Off",
        "Person, Amt": data.pepDetails || "",
        // Signature
        "Ort, Datum, Unterschrift": `${data.city || ""}, ${new Date().toLocaleDateString(
          "de-DE",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          },
        )}`,
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

/**
 * Global helper function to analyze PDF fields from the browser console
 * Can be called directly from Chrome console
 */
declare global {
  interface Window {
    analyzePdfFields: (
      pdfUrl: string,
    ) => Promise<{ name: string; type: string }[] | undefined>;
  }
}

// Make the analyze function available globally for use in Chrome console
if (typeof window !== "undefined") {
  window.analyzePdfFields = async (pdfUrl: string) => {
    try {
      console.log(`Analyzing PDF fields for: ${pdfUrl}`);
      const fields = await analyzePdfForm(pdfUrl);
      console.table(fields);
      return fields;
    } catch (error) {
      console.error("Error analyzing PDF:", error);
    }
  };
}

export default {
  loadPdfFromUrl,
  extractPdfFieldNames,
  analyzePdfForm,
  fillPdfForm,
  savePdfAsBlob,
  downloadPdf,
  mapCompanyDataToBestellformular,
  mapCompanyDataToDokumentationsbogen,
};
