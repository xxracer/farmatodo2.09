
'use server';

import { z } from "zod";

export const companySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Company name is required"),
  logo: z.string().nullable().optional(),
  formCustomization: z.enum(['template', 'custom']).default('template').optional(),
  phase1Images: z.array(z.string()).optional(),
  interviewImage: z.string().nullable().optional(),
  requiredDocs: z.string().optional(),
});

export type Company = z.infer<typeof companySchema>;
