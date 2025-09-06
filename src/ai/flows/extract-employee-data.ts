
'use server';

/**
 * @fileOverview An AI agent that extracts employee data from a PDF document.
 *
 * - extractEmployeeDataFromPdf - A function that handles the data extraction process.
 */

import {ai} from '@/ai/genkit';
import { ExtractEmployeeDataInput, ExtractEmployeeDataInputSchema, ExtractEmployeeDataOutput, ExtractEmployeeDataOutputSchema } from '@/lib/schemas';


export async function extractEmployeeDataFromPdf(input: ExtractEmployeeDataInput): Promise<ExtractEmployeeDataOutput> {
  return extractEmployeeDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractEmployeeDataPrompt',
  input: {schema: ExtractEmployeeDataInputSchema},
  output: {schema: ExtractEmployeeDataOutputSchema},
  prompt: `You are an expert HR assistant specializing in extracting key information from employee application documents.

You will be provided with a PDF document. Your task is to carefully analyze the document and extract the following information:
- First Name
- Last Name
- Full Street Address (just the street and number, not city/state)
- City
- State
- Zip Code
- Driver's License Expiration Date

Pay very close attention to the "Driver's License Expiration Date". It is a critical piece of information. Ensure the date is formatted as YYYY-MM-DD.

If any piece of information is not available in the document, return an empty string "" for that field.

Document: {{media url=pdfDataUri}}
`,
});

const extractEmployeeDataFlow = ai.defineFlow(
  {
    name: 'extractEmployeeDataFlow',
    inputSchema: ExtractEmployeeDataInputSchema,
    outputSchema: ExtractEmployeeDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
