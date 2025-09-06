
'use server';

/**
 * @fileOverview An AI agent that detects potentially missing documents from a candidate's profile.
 *
 * - detectMissingDocuments - A function that handles the missing document detection process.
 * - DetectMissingDocumentsInput - The input type for the detectMissingDocuments function.
 * - DetectMissingDocumentsOutput - The return type for the detectMissingDocuments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectMissingDocumentsInputSchema = z.object({
  candidateProfile: z
    .string()
    .describe('The candidate profile, including information such as name, contact details, position applying for, etc.'),
  onboardingPhase: z
    .enum(['Application', 'Detailed Documentation'])
    .describe('The current onboarding phase of the candidate.'),
  submittedDocuments: z.array(z.string()).describe('A list of documents already submitted by the candidate.'),
  requiredDocuments: z.array(z.object({ label: z.string(), type: z.string() })).describe('The structured list of required documents configured by the admin.'),
});
export type DetectMissingDocumentsInput = z.infer<typeof DetectMissingDocumentsInputSchema>;

const DetectMissingDocumentsOutputSchema = z.object({
  missingDocuments: z
    .array(z.string())
    .describe('A ranked list of potentially missing documents, based on the candidate profile and onboarding phase.'),
});
export type DetectMissingDocumentsOutput = z.infer<typeof DetectMissingDocumentsOutputSchema>;

export async function detectMissingDocuments(input: DetectMissingDocumentsInput): Promise<DetectMissingDocumentsOutput> {
  return detectMissingDocumentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectMissingDocumentsPrompt',
  input: {schema: DetectMissingDocumentsInputSchema},
  output: {schema: DetectMissingDocumentsOutputSchema},
  prompt: `You are an expert HR assistant specializing in identifying missing documents in candidate onboarding processes.

Based on the candidate's profile, current onboarding phase, and the list of submitted documents, you will generate a ranked list of potentially missing documents.

The complete list of documents required by the company is:
{{#each requiredDocuments}}
- {{{this.label}}} (Type: {{{this.type}}})
{{/each}}

Candidate Profile: {{{candidateProfile}}}
Onboarding Phase: {{{onboardingPhase}}}
Submitted Documents: {{#each submittedDocuments}}{{{this}}}, {{/each}}

Analyze the provided information and determine which documents from the complete required list are still needed. Do not suggest documents that are already in the "Submitted Documents" list.

Do not suggest "Cover Letter" as it is not a standard requirement unless specified in the required list.

Return a ranked list of potentially missing documents.
`,
});

const detectMissingDocumentsFlow = ai.defineFlow(
  {
    name: 'detectMissingDocumentsFlow',
    inputSchema: DetectMissingDocumentsInputSchema,
    outputSchema: DetectMissingDocumentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
