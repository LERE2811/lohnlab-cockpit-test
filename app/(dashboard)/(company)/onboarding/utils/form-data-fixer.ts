/**
 * Utility functions to fix form data issues when navigating between steps
 */

/**
 * Ensures that form data fields are properly formatted and consistent
 * This helps fix issues where data might be stored in different formats
 * or with different field names between the frontend and backend
 */
export function normalizeFormData(
  formData: Record<string, any>,
): Record<string, any> {
  if (!formData) return {};

  const normalizedData = { ...formData };

  // Fix company_form/legal_form mismatch
  if (normalizedData.legal_form && !normalizedData.company_form) {
    normalizedData.company_form = normalizedData.legal_form;
  }

  // Fix payroll_processing/payroll_processing_type mismatch
  if (
    normalizedData.payroll_processing &&
    !normalizedData.payroll_processing_type
  ) {
    normalizedData.payroll_processing_type = normalizedData.payroll_processing;
  }

  // Ensure boolean fields are actually booleans
  const booleanFields = [
    "has_works_council",
    "has_collective_agreement",
    "has_givve_card",
    "wants_import_file",
    "has_canteen",
    "has_ev_charging",
    "has_charging_stations",
  ];

  booleanFields.forEach((field) => {
    if (field in normalizedData) {
      // Convert string 'true'/'false' to actual boolean
      if (typeof normalizedData[field] === "string") {
        normalizedData[field] = normalizedData[field] === "true";
      }
      // Convert null/undefined to false
      if (
        normalizedData[field] === null ||
        normalizedData[field] === undefined
      ) {
        normalizedData[field] = false;
      }
    }
  });

  // Ensure enum fields have valid values
  const enumFields = [
    { field: "company_form", defaultValue: "" },
    { field: "payroll_processing_type", defaultValue: "intern" },
    { field: "payroll_system", defaultValue: "" },
    { field: "collective_agreement_type", defaultValue: "" },
    { field: "import_date_type", defaultValue: "standard" },
    { field: "payment_method", defaultValue: "sepa" },
    { field: "invoice_type", defaultValue: "company" },
  ];

  enumFields.forEach(({ field, defaultValue }) => {
    if (field in normalizedData) {
      // If the field is empty or null, set it to the default value
      if (
        normalizedData[field] === null ||
        normalizedData[field] === undefined ||
        normalizedData[field] === ""
      ) {
        normalizedData[field] = defaultValue;
      }
    }
  });

  // Ensure locations array is properly formatted
  if (normalizedData.locations && Array.isArray(normalizedData.locations)) {
    normalizedData.locations = normalizedData.locations.map((location) => {
      const normalizedLocation = { ...location };

      // Ensure boolean fields in locations are actually booleans
      ["has_canteen", "has_charging_stations", "is_headquarters"].forEach(
        (field) => {
          if (field in normalizedLocation) {
            if (typeof normalizedLocation[field] === "string") {
              normalizedLocation[field] = normalizedLocation[field] === "true";
            }
            if (
              normalizedLocation[field] === null ||
              normalizedLocation[field] === undefined
            ) {
              normalizedLocation[field] = false;
            }
          }
        },
      );

      return normalizedLocation;
    });
  }

  // Ensure contacts array is properly formatted
  if (normalizedData.contacts && Array.isArray(normalizedData.contacts)) {
    normalizedData.contacts = normalizedData.contacts.map((contact) => {
      const normalizedContact = { ...contact };

      // Ensure boolean fields in contacts are actually booleans
      if ("has_cockpit_access" in normalizedContact) {
        if (typeof normalizedContact.has_cockpit_access === "string") {
          normalizedContact.has_cockpit_access =
            normalizedContact.has_cockpit_access === "true";
        }
        if (
          normalizedContact.has_cockpit_access === null ||
          normalizedContact.has_cockpit_access === undefined
        ) {
          normalizedContact.has_cockpit_access = false;
        }
      }

      // Handle migration from category to categories
      if (
        !normalizedContact.categories ||
        !Array.isArray(normalizedContact.categories)
      ) {
        normalizedContact.categories = [];
      }

      // If we have a single category but it's not in the categories array, add it
      if (
        normalizedContact.category &&
        !normalizedContact.categories.includes(normalizedContact.category)
      ) {
        normalizedContact.categories = [
          normalizedContact.category,
          ...normalizedContact.categories,
        ];
      }

      return normalizedContact;
    });
  }

  // Ensure billing_info array is properly formatted
  if (normalizedData.billing_info) {
    // Make sure billing_info is always an array
    if (!Array.isArray(normalizedData.billing_info)) {
      console.warn(
        "billing_info is not an array, converting it:",
        normalizedData.billing_info,
      );
      // Try to convert to array if it's not one
      if (typeof normalizedData.billing_info === "object") {
        normalizedData.billing_info = [normalizedData.billing_info];
      } else {
        // If we can't convert, create a default entry
        normalizedData.billing_info = [{ billing_email: "" }];
      }
    }

    // Determine if the invoice_type has changed since form initialization
    // If we have a history property, check if invoice_type changed
    if (
      normalizedData._history &&
      normalizedData._history.invoice_type !== normalizedData.invoice_type
    ) {
      console.log(
        "Invoice type changed from",
        normalizedData._history.invoice_type,
        "to",
        normalizedData.invoice_type,
      );

      // If we've just switched to 'location', we'll need to rebuild the billing info completely
      if (normalizedData.invoice_type === "location") {
        // Clear out existing billing info to rebuild it for locations
        delete normalizedData.billing_info;
      } else if (normalizedData.invoice_type === "company") {
        // If switching to company, keep only one billing info without location ID
        if (normalizedData.billing_info.length > 0) {
          // Pick the first one as the template
          const templateInfo = normalizedData.billing_info[0];
          normalizedData.billing_info = [
            {
              ...templateInfo,
              location_id: undefined,
              location_name: undefined,
            },
          ];
        }
      }
    }

    // Ensure invoice_type is consistent with billing_info structure
    if (
      normalizedData.invoice_type === "location" &&
      (normalizedData.billing_info.length === 0 ||
        (normalizedData.billing_info.length === 1 &&
          !normalizedData.billing_info[0].location_id))
    ) {
      console.log("Fixing inconsistent billing_info for location invoice type");

      // If we have locations data, create billing info for each location
      if (
        normalizedData.locations &&
        Array.isArray(normalizedData.locations) &&
        normalizedData.locations.length > 1
      ) {
        // Get the template info (existing one or empty)
        const templateInfo = normalizedData.billing_info[0] || {
          billing_email: "",
        };

        // Create fresh billing info entries for each location
        normalizedData.billing_info = normalizedData.locations.map(
          (location: Record<string, any>) => {
            return {
              ...templateInfo,
              location_id:
                location.id ||
                `loc_${Math.random().toString(36).substring(2, 15)}`,
              location_name: location.name || "",
            };
          },
        );

        console.log(
          "Created billing info for each location:",
          normalizedData.billing_info,
        );
      }
    } else if (
      normalizedData.invoice_type === "company" &&
      normalizedData.billing_info.length > 1
    ) {
      console.log("Fixing inconsistent billing_info for company invoice type");
      // For company invoice type, we should only have one billing info without location ID
      normalizedData.billing_info = [
        {
          ...normalizedData.billing_info[0],
          location_id: undefined,
          location_name: undefined,
        },
      ];
    }

    // Clean up each billing info entry
    normalizedData.billing_info = normalizedData.billing_info.map(
      (info: Record<string, any>) => {
        const cleanInfo = { ...info };

        // Ensure required fields exist
        if (!cleanInfo.billing_email) {
          cleanInfo.billing_email = "";
        }

        // For location type, ensure each entry has location_id
        if (
          normalizedData.invoice_type === "location" &&
          !cleanInfo.location_id
        ) {
          console.warn(
            "Billing info missing location_id for location invoice type:",
            cleanInfo,
          );
          // Generate a fallback ID if needed
          cleanInfo.location_id = `loc_${Math.random().toString(36).substring(2, 15)}`;
        }

        return cleanInfo;
      },
    );

    console.log("Normalized billing_info:", normalizedData.billing_info);
  } else if (normalizedData.invoice_type) {
    // If we have an invoice_type but no billing_info, create default billing_info
    console.log(
      "Creating default billing_info for invoice_type:",
      normalizedData.invoice_type,
    );

    if (normalizedData.invoice_type === "company") {
      // Create a default company billing info
      normalizedData.billing_info = [{ billing_email: "" }];
    } else if (
      normalizedData.invoice_type === "location" &&
      normalizedData.locations &&
      Array.isArray(normalizedData.locations) &&
      normalizedData.locations.length > 0
    ) {
      // Create a billing info for each location
      normalizedData.billing_info = normalizedData.locations.map(
        (location: Record<string, any>) => ({
          location_id:
            location.id || `loc_${Math.random().toString(36).substring(2, 15)}`,
          location_name: location.name || "",
          billing_email: "",
        }),
      );
    }
  }

  // Log the normalized data for debugging
  console.log("Normalized form data:", normalizedData);

  return normalizedData;
}
