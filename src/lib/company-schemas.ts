
import { z } from "zod";

export const requiredDocSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['digital', 'upload']),
});
export type RequiredDoc = z.infer<typeof requiredDocSchema>;

export const applicationFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['template', 'custom']).default('template'),
  images: z.array(z.string()).optional(),
  requiredDocs: z.array(requiredDocSchema).optional(),
});
export type ApplicationForm = z.infer<typeof applicationFormSchema>;

export const companySchema = z.object({
  id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  name: z.string().min(1, "Company name is required"),
  logo: z.string().nullable().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email().optional(),
  
  // Replaces formCustomization and phase1Images
  applicationForms: z.array(applicationFormSchema).optional(),
  
  interviewImage: z.string().nullable().optional(),
  
  // This might now belong inside each ApplicationForm
  requiredDocs: z.array(requiredDocSchema).nullable().optional(),
});

export type Company = z.infer<typeof companySchema>;
