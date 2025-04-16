import { PDFDocument } from "pdf-lib";
import { PdfFormFiller, PdfFormData } from "./pdf-form-filler";
import { PDFTextField, PDFField } from "pdf-lib";

export class DokumentationsbogenFiller extends PdfFormFiller {
  private static readonly TEXT_FIELDS = [
    "Name des Unternehmens",
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
    "Rechtsform",
    "Anschrift des Sitzes  der Hauptniederlassung",
    "Anschrift des Sitzes  der Hauptniederlassung_2",
    "Registernummer",
    "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu",
    "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu_2",
    "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu_3",
    "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu_4",
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
  ];

  private static readonly STANDARD_CHECKBOXES = [
    "Nein",
    "Ja folgende Person folgendes Amt",
    "bis zu 10000 EUR pro Jahr nach  37b EStG pauschalversteurter Sachbezug",
    "Die aufgeführten Personen halten unmittelbar oder …r mehr als 25 der Kapital oder Stimmrechtsanteile",
    "Es existiert keine natürliche Person die mehr als …al oder Stimmrechtsanteilen hält Die aufgeführten",
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
      console.log(
        "DokumentationsbogenFiller received values:",
        JSON.stringify(fieldValues, null, 2),
      );

      const form = this.getPdfDoc().getForm();
      let filledFieldsCount = 0;

      // Get all form fields
      const allFields = form.getFields();

      // Log field names and values for debugging
      console.log(
        "PDF Field names in document:",
        allFields.map((f) => f.getName()),
      );

      // CRITICAL FIX: Handle the address field with double space first
      const addressDoubleSpaceKey =
        "Anschrift des Sitzes  der Hauptniederlassung";

      // Find the best address value to use
      const addressValue =
        fieldValues[addressDoubleSpaceKey] ||
        fieldValues["Anschrift des Sitzes der Hauptniederlassung"] ||
        fieldValues.mainOfficeAddress;

      if (addressValue) {
        console.log(`Setting address field with value: "${addressValue}"`);

        try {
          // Get the field directly using the exact name with double space
          const addressField = form.getTextField(addressDoubleSpaceKey);
          addressField.setText(addressValue);
          console.log(
            `Successfully set address field: ${addressDoubleSpaceKey}`,
          );
          filledFieldsCount++;
        } catch (e) {
          console.warn(`Failed to set address field directly:`, e);

          // Fallback: find the field by searching all text fields
          try {
            const textFields = allFields.filter((f) =>
              f.constructor.name.includes("PDFTextField"),
            );

            // Find any field containing Hauptniederlassung
            const addressFields = textFields.filter((f) =>
              f.getName().includes("Hauptniederlassung"),
            );

            console.log(
              "Found address fields:",
              addressFields.map((f) => f.getName()),
            );

            if (addressFields.length > 0) {
              // Try to set each one
              for (const field of addressFields) {
                try {
                  console.log(`Attempting to set ${field.getName()}`);
                  (field as any).setText(addressValue);
                  console.log(
                    `Successfully set fallback address field: ${field.getName()}`,
                  );
                  filledFieldsCount++;
                } catch (fieldError) {
                  console.warn(
                    `Failed to set field ${field.getName()}:`,
                    fieldError,
                  );
                }
              }
            }
          } catch (fallbackError) {
            console.warn("All address field fallbacks failed:", fallbackError);
          }
        }
      }

      // First attempt exact matches for TEXT_FIELDS
      for (const fieldName of DokumentationsbogenFiller.TEXT_FIELDS) {
        if (fieldValues[fieldName]) {
          try {
            const field = form.getTextField(fieldName);
            field.setText(fieldValues[fieldName]);
            filledFieldsCount++;
          } catch (e) {
            console.warn(
              `Failed to set text field ${fieldName} with exact match:`,
              e,
            );

            // Try fuzzy matching if exact match fails
            try {
              // Normalize field name for fuzzy matching (remove extra spaces, lowercase)
              const normalizedFieldName = fieldName
                .replace(/\s+/g, " ")
                .trim()
                .toLowerCase();

              // Find fields with similar names
              const fuzzyMatches = allFields.filter((field) => {
                if (!field.constructor.name.includes("PDFTextField"))
                  return false;
                const currentName = field
                  .getName()
                  .replace(/\s+/g, " ")
                  .trim()
                  .toLowerCase();
                return (
                  currentName.includes(normalizedFieldName) ||
                  normalizedFieldName.includes(currentName)
                );
              });

              if (fuzzyMatches.length > 0) {
                // Use the first match
                const matchedField = fuzzyMatches[0];
                console.log(
                  `Found fuzzy match for ${fieldName}: ${matchedField.getName()}`,
                );
                (matchedField as any).setText(fieldValues[fieldName]);
                filledFieldsCount++;
              }
            } catch (fuzzyError) {
              console.warn(`Failed fuzzy match for ${fieldName}:`, fuzzyError);
            }
          }
        }
      }

      // Special handling for address fields with double spaces
      if (fieldValues.mainOfficeAddress) {
        try {
          console.log(
            "Attempting to fill main office address:",
            fieldValues.mainOfficeAddress,
          );

          // First try direct approach with the specific field name with double space
          try {
            const field = form.getTextField(
              "Anschrift des Sitzes  der Hauptniederlassung",
            );
            field.setText(fieldValues.mainOfficeAddress);
            console.log("Successfully filled address field with double space");
            filledFieldsCount++;
          } catch (e) {
            console.warn("Direct approach with double space failed:", e);

            // If the direct approach failed, try another approach with all text fields
            const allTextFields = allFields.filter((field) =>
              field.constructor.name.includes("PDFTextField"),
            );

            console.log(
              "All text fields in form:",
              allTextFields.map((f) => f.getName()),
            );

            // Try to match with any field containing the address keywords
            const addressField = allTextFields.find((field) => {
              const name = field.getName();
              return (
                name.includes("Anschrift") &&
                name.includes("Sitzes") &&
                name.includes("Hauptniederlassung")
              );
            });

            if (addressField) {
              try {
                console.log(`Found address field: ${addressField.getName()}`);
                (addressField as any).setText(fieldValues.mainOfficeAddress);
                console.log("Successfully filled address field");
                filledFieldsCount++;
              } catch (fieldError) {
                console.warn(
                  `Failed to set matched address field: ${fieldError}`,
                );
              }
            } else {
              console.warn("Could not find any matching address field");
            }
          }
        } catch (e) {
          console.warn("Failed to fill address fields:", e);
        }
      }

      // Handle representative fields specially - ignore exceptions and try multiple methods
      if (
        fieldValues.representatives &&
        Array.isArray(fieldValues.representatives)
      ) {
        try {
          // Log all field values for debugging
          console.log(
            "Trying to fill representatives with values:",
            fieldValues.representatives,
          );

          // Define all possible field name patterns for representatives
          const exactRepFieldPatterns = [
            // Pattern 1: With double spaces between words
            [
              "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu",
              "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu_2",
              "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu_3",
              "Namen aller gesetzlichen Vertreter  Mitglieder des Vertretungsorgans Prokuristen gehören nicht dazu_4",
            ],
            // Other patterns removed since we now have the exact field names
          ];

          // Find all text fields using the normal API first
          const allTextFields = allFields.filter((field) =>
            field.constructor.name.includes("PDFTextField"),
          );

          // Extract all representative-like fields from document
          const repFieldsInDoc = allTextFields.filter((field) => {
            const name = field.getName();
            return (
              name.includes("Namen aller gesetzlichen Vertreter") ||
              name.includes("gesetzlichen Vertreter")
            );
          });

          console.log(
            "Representative-like fields found in document:",
            repFieldsInDoc.map((f) => f.getName()),
          );

          // First try to match each representative with a specific field
          let matchedFields: number = 0;

          // Attempt to fill each representative field directly - try all pattern variations
          for (
            let i = 0;
            i < Math.min(4, fieldValues.representatives.length);
            i++
          ) {
            if (fieldValues.representatives[i]) {
              const value = fieldValues.representatives[i];
              let fieldFilled = false;

              console.log(
                `Trying to fill representative ${i + 1} with value: ${value}`,
              );

              // Try each field pattern until one works
              for (const pattern of exactRepFieldPatterns) {
                if (fieldFilled) break;

                const fieldName = pattern[i];
                console.log(`Attempting pattern: ${fieldName}`);

                // Method 1: Try standard form API
                try {
                  const field = form.getTextField(fieldName);
                  field.setText(value);
                  console.log(
                    `Successfully filled representative field ${fieldName} using standard method`,
                  );
                  filledFieldsCount++;
                  matchedFields++;
                  fieldFilled = true;
                  continue;
                } catch (e) {
                  console.warn(
                    `Failed with standard setText for ${fieldName}: ${e}`,
                  );
                }

                // Method 2: Try direct field search
                try {
                  const matchedField = allTextFields.find(
                    (f) => f.getName() === fieldName,
                  );
                  if (matchedField) {
                    (matchedField as PDFTextField).setText(value);
                    console.log(
                      `Successfully filled representative field ${fieldName} using direct field access`,
                    );
                    filledFieldsCount++;
                    matchedFields++;
                    fieldFilled = true;
                    continue;
                  }
                } catch (e) {
                  console.warn(
                    `Failed with direct field access for ${fieldName}: ${e}`,
                  );
                }
              }

              // If we couldn't fill this field with any of the patterns, try fuzzy matching
              if (!fieldFilled) {
                // Method 3: Try fuzzy matching field name for this position
                try {
                  // Find a field with similar name that might match this position
                  const fuzzyField = allTextFields.find((field) => {
                    const name = field.getName();
                    const isMatchingPosition =
                      i === 0
                        ? !name.includes("_") &&
                          name.includes("Namen aller gesetzlichen Vertreter")
                        : name.includes(`_${i + 1}`) &&
                          name.includes("gesetzlichen Vertreter");
                    return isMatchingPosition;
                  });

                  if (fuzzyField) {
                    console.log(
                      `Found fuzzy match for rep ${i + 1}: ${fuzzyField.getName()}`,
                    );
                    const textField = fuzzyField as PDFTextField;
                    textField.setText(value);
                    console.log(
                      `Successfully filled representative with fuzzy match`,
                    );
                    filledFieldsCount++;
                    matchedFields++;
                    fieldFilled = true;
                  }
                } catch (e) {
                  console.warn(
                    `Failed with fuzzy match for position ${i + 1}: ${e}`,
                  );
                }
              }
            }
          }

          // If we couldn't match all representatives to their expected fields,
          // try to fill any remaining fields with the remaining representatives
          if (
            matchedFields <
            Math.min(repFieldsInDoc.length, fieldValues.representatives.length)
          ) {
            console.log(
              "Some representatives couldn't be matched to expected fields, trying remaining fields",
            );

            // Create a copy of the remaining representatives to fill
            const remainingReps = [...fieldValues.representatives].slice(
              matchedFields,
            );

            // Method 4: Try to find any unfilled representative field
            try {
              let repIndex = 0;
              for (const repField of repFieldsInDoc) {
                if (repIndex >= remainingReps.length) break;

                try {
                  const value = remainingReps[repIndex];
                  (repField as PDFTextField).setText(value);
                  console.log(
                    `Set ${repField.getName()} to ${value} as fallback`,
                  );
                  filledFieldsCount++;
                  repIndex++;
                } catch (repError) {
                  console.warn(
                    `Failed to set field ${repField.getName()}: ${repError}`,
                  );
                }
              }
            } catch (e) {
              console.warn(`Failed with fallback field assignment: ${e}`);
            }
          }
        } catch (e) {
          console.warn("Failed to fill representative fields:", e);
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

      // Handle economic beneficiaries - always set for GmbH/UG
      try {
        // Try with both possible field names for this checkbox
        await this.setEconomicBeneficiariesFields(form);
        filledFieldsCount++;
      } catch (e) {
        console.warn("Failed to set economic beneficiaries field:", e);
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

  private async setEconomicBeneficiariesFields(form: any): Promise<void> {
    // These are the possible field names that might be used in different PDF versions
    const noPersonFieldNames = [
      "Es existiert keine natürliche Person die mehr als …al oder Stimmrechtsanteilen hält Die aufgeführten",
      "Es existiert keine natürliche Person die mehr als 25 der Kapital oder Stimmrechtsanteilen hält Die aufgeführten",
    ];

    const personHoldsFieldNames = [
      "Die aufgeführten Personen halten unmittelbar oder …r mehr als 25 der Kapital oder Stimmrechtsanteile",
      "Die aufgeführten Personen halten unmittelbar oder mittelbar mehr als 25 der Kapital oder Stimmrechtsanteile",
    ];

    // Try to find and check the first field name that exists
    let checkboxFound = false;

    // Try to check "No person holds more than 25%" box
    for (const fieldName of noPersonFieldNames) {
      try {
        const field = form.getCheckBox(fieldName);
        field.check();
        checkboxFound = true;
        break;
      } catch (e) {
        // Field not found, try next
      }
    }

    if (checkboxFound) {
      // If we found and checked the first checkbox, uncheck the other one
      for (const fieldName of personHoldsFieldNames) {
        try {
          const field = form.getCheckBox(fieldName);
          field.uncheck();
        } catch (e) {
          // Field not found, continue
        }
      }
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

  // Helper to filter to just text fields, since those are the ones we can set text on
  private getTextFields(form: any): PDFTextField[] {
    return form.getFields().filter((field: PDFField) => {
      return field.constructor.name === "PDFTextField";
    }) as PDFTextField[];
  }

  async fillDocument(
    pdfDoc: PDFDocument,
    data: any,
  ): Promise<{ filledFields: number }> {
    try {
      const form = pdfDoc.getForm();

      // Filter to just text fields since those are the ones we can set
      const textFields = this.getTextFields(form);

      // Log all field names for debugging
      console.log(
        "Fields in doc:",
        textFields.map((f) => f.getName()),
      );

      let filledFieldsCount = 0;

      // For each company representative
      if (data.representatives && Array.isArray(data.representatives)) {
        // This is a 1-based index in the form field names
        let repIndex = 1;

        for (const rep of data.representatives) {
          if (repIndex > 3) {
            console.log("Only 3 representatives supported in form");
            break;
          }

          console.log(`Processing representative ${repIndex}:`, rep);

          // Get representative name, role and address
          const lastName = rep.lastName || "";
          const firstName = rep.firstName || "";
          const displayName = `${firstName} ${lastName}`.trim();
          const role = rep.title || "";

          // Get full address
          const addressParts = [];
          if (rep.street) addressParts.push(rep.street);
          if (rep.streetNumber) addressParts.push(rep.streetNumber);
          if (rep.zipCode || rep.city) {
            const zipCity = [rep.zipCode, rep.city].filter(Boolean).join(" ");
            if (zipCity) addressParts.push(zipCity);
          }
          const fullAddress = addressParts.join(", ");

          // Get all representative related fields that exist in this document
          const repFieldsInDoc = textFields.filter((field) => {
            const fieldName = field.getName();
            return (
              fieldName.includes("Vertretungs") ||
              fieldName.includes("Vertreter")
            );
          });

          if (repFieldsInDoc.length > 0) {
            console.log(
              `Found ${repFieldsInDoc.length} rep fields in document`,
            );
          } else {
            console.log("No representative fields found in document");
          }

          // For each possible field value
          for (const [fieldName, value] of Object.entries({
            name: displayName,
            role: role,
            address: fullAddress,
          })) {
            if (!value) continue;

            console.log(`Trying to set ${fieldName} = ${value}`);

            // Method 1: Try standard form API with exact fields
            try {
              // Exact field names based on reverse engineering
              const exactFieldNames = {
                name: [
                  `Vertretungsberechtigte Person ${repIndex}`,
                  `Vertreter${repIndex}_Name`,
                  `VertretungsberechtigtePerson${repIndex}`,
                ],
                role: [
                  `Funktion ${repIndex}`,
                  `Vertreter${repIndex}_Funktion`,
                  `Funktion${repIndex}`,
                ],
                address: [
                  `Anschrift ${repIndex}`,
                  `Vertreter${repIndex}_Anschrift`,
                  `Anschrift${repIndex}`,
                ],
              };

              const possibleFieldNames =
                exactFieldNames[fieldName as keyof typeof exactFieldNames] ||
                [];
              let exactFieldSuccess = false;

              for (const exactName of possibleFieldNames) {
                try {
                  const field = textFields.find(
                    (f) => f.getName() === exactName,
                  );
                  if (field) {
                    field.setText(value);
                    console.log(`Set ${exactName} to ${value}`);
                    filledFieldsCount++;
                    exactFieldSuccess = true;

                    // Remove this field from future consideration
                    const index = repFieldsInDoc.indexOf(field);
                    if (index > -1) {
                      repFieldsInDoc.splice(index, 1);
                    }

                    break;
                  }
                } catch (fieldError) {
                  console.warn(
                    `Failed with exact field ${exactName}: ${fieldError}`,
                  );
                }
              }

              if (exactFieldSuccess) {
                continue; // Skip to next field if exact matching worked
              }
            } catch (e) {
              console.warn(`Failed with exact fields for ${fieldName}: ${e}`);
            }

            // Method 2: Try fuzzy matching field names
            try {
              // Search for fields containing the fieldName
              const matchingFields = textFields.filter((field) => {
                const name = field.getName().toLowerCase();
                const searchTerm = fieldName.toLowerCase();
                return name.includes(searchTerm);
              });

              let fuzzyMatchSuccess = false;

              for (const field of matchingFields) {
                try {
                  field.setText(value);
                  console.log(
                    `Set ${field.getName()} to ${value} via fuzzy match`,
                  );
                  filledFieldsCount++;
                  fuzzyMatchSuccess = true;

                  // Remove this field from future consideration
                  const index = repFieldsInDoc.indexOf(field);
                  if (index > -1) {
                    repFieldsInDoc.splice(index, 1);
                  }

                  break;
                } catch (fieldError) {
                  console.warn(
                    `Failed with fuzzy match field ${field.getName()}: ${fieldError}`,
                  );
                }
              }

              if (fuzzyMatchSuccess) {
                continue; // Skip to next field if fuzzy matching worked
              }
            } catch (e) {
              console.warn(`Failed with fuzzy matching for ${fieldName}: ${e}`);
            }

            // Method 3: Try to find any unfilled representative field
            try {
              if (repFieldsInDoc.length > 0) {
                // Try each rep field in order until one succeeds
                for (const repField of repFieldsInDoc) {
                  try {
                    repField.setText(value);
                    console.log(`Set ${repField.getName()} to ${value}`);
                    filledFieldsCount++;

                    // Remove this field from future consideration
                    const index = repFieldsInDoc.indexOf(repField);
                    if (index > -1) {
                      repFieldsInDoc.splice(index, 1);
                    }

                    break; // Found a field that worked, stop trying more
                  } catch (repError) {
                    // Keep trying other fields
                  }
                }
              }
            } catch (e) {
              console.warn(`Failed with any rep field for ${fieldName}: ${e}`);
            }
          }

          repIndex++;
        }
      }

      return { filledFields: filledFieldsCount };
    } catch (e) {
      console.error("Error filling Dokumentationsbogen:", e);
      return { filledFields: 0 };
    }
  }
}
