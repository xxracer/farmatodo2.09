
'use server';

/**
 * @fileOverview An AI agent that extracts employee data from a PDF document.
 *
 * - extractEmployeeDataFromPdf - A function that handles the data extraction process.
 * - ExtractEmployeeDataInput - The input type for the extractEmployeeDataFromPdf function.
 * - ExtractEmployeeDataOutput - The return type for the extractEmployeeDataFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ExtractEmployeeDataInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "The PDF document of the employee's application, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractEmployeeDataInput = z.infer<typeof ExtractEmployeeDataInputSchema>;

export const ExtractEmployeeDataOutputSchema = z.object({
  firstName: z.string().describe("The employee's first name."),
  lastName: z.string().describe("The employee's last name."),
  address: z.string().describe("The employee's full street address."),
  city: z.string().describe("The employee's city."),
  state: z.string().describe("The employee's state."),
  zipCode: z.string().describe("The employee's zip code."),
  driversLicenseExpiration: z.string().describe("The expiration date of the driver's license in YYYY-MM-DD format."),
});
export type ExtractEmployeeDataOutput = z.infer<typeof ExtractEmployeeDataOutputSchema>;

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
