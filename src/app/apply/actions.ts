"use server";

import { PrismaClient } from "@prisma/client";
import * as z from "zod";

const prisma = new PrismaClient();

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  companyId: z.string().cuid("Invalid company ID."),
});

export async function createCandidate(values: z.infer<typeof formSchema>) {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { firstName, lastName, email, companyId } = validatedFields.data;

  try {
    // First, ensure the company exists.
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      console.error(`Error: Company with ID ${companyId} not found.`);
      return { error: "Configuration error: Company not found." };
    }

    const newCandidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        companyId: companyId,
        status: "PHASE1",
      },
    });

    return { success: "Candidate created successfully!", candidate: newCandidate };
  } catch (error) {
    console.error("Error creating candidate:", error);
    // Check for unique constraint violation
    if (error instanceof Error && 'code' in error && (error as any).code === 'P2002') {
        return { error: "A candidate with this email already exists." };
    }
    return { error: "An unexpected error occurred." };
  }
}
