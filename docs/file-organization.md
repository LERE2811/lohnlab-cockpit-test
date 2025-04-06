# Givve Onboarding Document Management Strategy

This document outlines the file organization strategy for managing documents in the Givve onboarding process.

## Storage Structure

All files are stored in the Supabase `givve_documents` bucket with the following folder structure:

```
givve_documents/
├── {subsidiary_id}/                   # Root folder per subsidiary
│   ├── legal_form_documents/          # Legal form-specific documents
│   │   ├── {document_type}/           # Specific document type (e.g., 'gewerbeanmeldung')
│   │   │   └── {timestamp}_{filename} # Actual file with timestamp
│   │
│   ├── prefilled_forms/               # Pre-filled PDF forms
│   │   ├── bestellformular/           # Pre-filled Bestellformular
│   │   │   └── {timestamp}_{filename} # Actual file with timestamp
│   │   └── dokumentationsbogen/       # Pre-filled Dokumentationsbogen
│   │       └── {timestamp}_{filename} # Actual file with timestamp
│   │
│   ├── signed_forms/                  # Signed order forms
│   │   ├── bestellformular/           # Signed Bestellformular
│   │   │   └── {timestamp}_{filename} # Actual file with timestamp
│   │   └── dokumentationsbogen/       # Signed Dokumentationsbogen
│   │       └── {timestamp}_{filename} # Actual file with timestamp
│   │
│   ├── identification_documents/      # Identification documents (if required)
│   │   └── {document_type}/           # Specific identification document type
│   │       └── {timestamp}_{filename} # Actual file with timestamp
│   │
│   ├── additional_documents/          # Any additional documents
│   │   └── {document_type}/           # Specific additional document type
│   │       └── {timestamp}_{filename} # Actual file with timestamp
│   │
│   ├── logos/                         # Company logos for cards
│   │   └── logo/
│   │       └── {timestamp}_{filename} # Actual logo file with timestamp
│   │
│   └── design_files/                  # Custom card design files
│       └── design/
│           └── {timestamp}_{filename} # Actual design file with timestamp
```

## Document Categories

The system organizes documents into the following categories:

1. **Legal Form Documents**: Documents specific to a company's legal form (e.g., Handelsregisterauszug, Gesellschaftsvertrag)
2. **Pre-filled Forms**: System-generated forms with pre-filled company information that need to be signed
3. **Signed Forms**: Completed and signed order forms (Bestellformular, Dokumentationsbogen)
4. **Identification Documents**: Documents used for identity verification
5. **Additional Documents**: Any supplementary documentation required in the process
6. **Logos**: Company logos for card customization
7. **Design Files**: Custom card design files

## Implementation Details

### File Naming Strategy

Files are renamed on upload using the following format:

- `{timestamp}_{sanitized_filename}`

The original filename is sanitized by:

- Replacing special characters with underscores
- Replacing multiple consecutive underscores with a single one

### Database References

Files are referenced in two places:

1. **Subsidiary Table**:

   - `givve_legal_documents_path`: Path to legal documents folder
   - `givve_signed_documents_path`: Path to signed forms folder
   - `givve_logo_file_path`: Direct path to the logo file
   - `givve_design_file_path`: Direct path to the design file

2. **Onboarding Progress Form Data**:
   - The `documents` object contains metadata for each uploaded file, including:
     - `fileName`: Original file name
     - `filePath`: Full path in storage
     - `fileType`: MIME type
     - `fileSize`: File size in bytes
     - `uploadedAt`: Timestamp of upload
     - `signedUrl`: Signed URL for access (refreshed as needed)

## Utility Functions

The system provides the following utility functions for document management:

- `uploadGivveDocument`: Upload a single document
- `uploadSignedForms`: Upload signed Bestellformular and Dokumentationsbogen
- `uploadLegalFormDocuments`: Upload legal form-specific documents
- `uploadCardCustomizationFile`: Upload logo or design files
- `refreshSignedUrl`: Refresh a signed URL for a stored document
- `updateFormDataWithFileMetadata`: Update form data with file metadata

## Security Considerations

- All file access is managed through signed URLs with a 1-hour expiration
- Sensitive documents are organized in separate folders for access control
- File paths include the subsidiary ID to prevent unauthorized access
