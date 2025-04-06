/**
 * Categories for organizing Givve documents in storage
 */
export enum GivveDocumentCategory {
  LEGAL_FORMS = "legal_form_documents",
  SIGNED_FORMS = "signed_forms",
  PREFILLED_FORMS = "prefilled_forms",
  IDENTIFICATION = "identification_documents",
  ADDITIONAL = "additional_documents",
  LOGOS = "logos",
  DESIGN = "design_files",
}

/**
 * Specific document types within the Givve onboarding process
 */
export enum GivveDocumentType {
  BESTELLFORMULAR = "bestellformular",
  DOKUMENTATIONSBOGEN = "dokumentationsbogen",
  IDENTIFICATION = "identification",
  COMMERCIAL_REGISTER = "commercial_register",
  LOGO = "logo",
  CARD_DESIGN = "design",
}
