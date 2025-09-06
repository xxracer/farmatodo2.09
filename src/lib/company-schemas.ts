
import { z } from "zod";

export const requiredDocSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['digital', 'upload']),
});
export type RequiredDoc = z.infer<typeof requiredDocSchema>;


export const companySchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().optional(),
  name: z.string().min(1, "Company name is required"),
  logo: z.string().nullable().optional(),
  formCustomization: z.string().optional(),
  phase1Images: z.array(z.string()).nullable().optional(),
  interviewImage: z.string().nullable().optional(),
  requiredDocs: z.array(requiredDocSchema).nullable().optional(),
});

export type Company = z.infer<typeof companySchema>;
