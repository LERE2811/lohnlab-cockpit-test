import { z } from "zod";
import { GivveCardType } from "../context/givve-onboarding-context";

export interface OnboardingFileMetadata {
  name: string;
  path: string;
  type: string;
  size: number;
  url: string;
}

export interface LegalFormDocument {
  files: OnboardingFileMetadata[];
  required: boolean;
}

export type LegalFormDocuments = Record<string, LegalFormDocument>;

export const givveOnboardingProgressSchema = z.object({
  id: z.string().uuid().optional(),
  subsidiary_id: z.string().uuid(),
  current_step: z.string(),
  form_data: z.record(z.any()),
  documents_submitted: z.boolean().optional(),
  video_identification_completed: z.boolean().optional(),
  initial_invoice_received: z.boolean().optional(),
  initial_invoice_paid: z.boolean().optional(),
  card_design_verified: z.boolean().optional(),
  legal_documents_uploaded: z.boolean().optional(),
  completed: z.boolean().optional(),
  status: z.string().optional(),
  last_updated: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
});
