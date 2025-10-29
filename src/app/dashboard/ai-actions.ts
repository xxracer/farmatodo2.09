"use server";

import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In a real application, this would likely come from the database
// and could be specific to a company or role.
const requiredDocuments = [
  "I-9 Form",
  "W-4 Form",
  "Direct Deposit Authorization",
  "Employee Handbook Acknowledgement",
  "Background Check Consent",
];

export async function getMissingDocuments(candidateId: string) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set.");
    return { error: "AI service is not configured." };
  }

  try {
    // 1. Fetch uploaded documents for the candidate
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: { documents: true },
    });

    if (!candidate) {
      return { error: "Candidate not found." };
    }

    const uploadedDocumentTypes = candidate.documents.map(
      (doc) => doc.documentType
    );

    // 2. Prepare the prompt for the AI
    const prompt = `
      Given a list of required documents and a list of documents a candidate has already uploaded,
      identify which documents are still missing.

      Required Documents: ${JSON.stringify(requiredDocuments)}
      Uploaded Documents: ${JSON.stringify(uploadedDocumentTypes)}

      Please return ONLY a JSON array of strings with the names of the missing documents.
      For example: ["Missing Document 1", "Missing Document 2"]
      If no documents are missing, return an empty array [].
    `;

    // 3. Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const messageContent = response.choices[0]?.message?.content;

    if (!messageContent) {
      return { error: "AI did not return a valid response." };
    }

    // 4. Parse the response and return the list
    // The response from gpt-4o with json_object format is a string that needs parsing.
    const missingDocsObject = JSON.parse(messageContent);

    // It's good practice to validate the structure of the parsed object.
    // Assuming the AI follows instructions, it will be an array of strings.
    // A more robust implementation might use Zod for validation.
    const missingDocs = Object.values(missingDocsObject);


    return { success: "Analysis complete.", missingDocuments: missingDocs };
  } catch (error) {
    console.error("Error analyzing documents with AI:", error);
    return { error: "An unexpected error occurred during AI analysis." };
  }
}
