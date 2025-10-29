"use server";

"use server";

import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const getBaseUrl = () => {
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Assume localhost for development
  return "http://localhost:9002";
};

export async function generatePhase3Link(candidateId: string) {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables.");
    return { error: "Configuration error: Cannot generate link." };
  }

  try {
    const token = jwt.sign({ candidateId }, process.env.JWT_SECRET, {
      expiresIn: "7d", // The link will be valid for 7 days
    });

    const url = `${getBaseUrl()}/phase3?token=${token}`;

    return { success: "Link generated successfully!", url };
  } catch (error) {
    console.error("Error generating JWT:", error);
    return { error: "An unexpected error occurred while generating the link." };
  }
}

export async function getCandidates() {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { candidates };
  } catch (error) {
    console.error("Error fetching candidates:", error);
    return { error: "Failed to fetch candidates." };
  }
}
