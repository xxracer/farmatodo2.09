"use server";

import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface JwtPayload {
  candidateId: string;
}

export async function verifyPhase3Token(token: string) {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables.");
    return { error: "Configuration error: Cannot verify token." };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    // Optional: Check if the candidate still exists in the database
    const candidate = await prisma.candidate.findUnique({
      where: { id: decoded.candidateId },
    });

    if (!candidate) {
      return { error: "Invalid token: Candidate not found." };
    }

    return { success: "Token is valid.", candidateId: decoded.candidateId };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { error: "This link has expired." };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { error: "This link is invalid." };
    }
    console.error("Error verifying JWT:", error);
    return { error: "An unexpected error occurred while verifying the link." };
  }
}
