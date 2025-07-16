import { z } from "zod";

const educationEntrySchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  course: z.string().optional(),
  degree: z.string().optional(),
});

const employmentHistoryEntrySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  telephone: z.string().min(10, "A valid phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "A valid ZIP code is required"),
  dateFrom: z.date({ required_error: "Start date is required." }),
  dateTo: z.date({ required_error: "End date is required." }),
  startingPay: z.coerce.number().min(1, "Starting pay is required"),
  jobTitleAndDescription: z.string().min(1, "Job title and description are required"),
  reasonForLeaving: z.string().min(1, "Reason for leaving is required"),
});

export const applicationSchema = z.object({
  // Personal Information
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  date: z.date({
    required_error: "A date of application is required.",
  }),

  // Contact Information
  streetAddress: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(5, "A valid ZIP code is required").max(10),
  homePhone: z.string().min(10, "A valid phone number is required"),
  businessPhone: z.string().optional(),
  emergencyContact: z.string().min(1, "Emergency contact is required"),

  // Employment Details
  previouslyEmployed: z.enum(["yes", "no"], {
    required_error: "This field is required.",
  }),
  hoursAvailable: z.coerce.number().min(1, "Please specify hours available").max(168),
  legallyEligible: z.enum(["yes", "no"], {
    required_error: "You must confirm eligibility.",
  }),
  howLearned: z.enum(["online", "employee", "other"], {
    required_error: "Please select how you learned about us.",
  }),
  workEveningsWeekends: z.boolean().default(false),
  position: z.string().min(1, "Position is required"),

  // Education
  education: z.object({
    college: educationEntrySchema.optional(),
    voTech: educationEntrySchema.optional(),
    highSchool: educationEntrySchema.optional(),
    other: educationEntrySchema.optional(),
  }),

  // Employment History
  employmentHistory: z.array(employmentHistoryEntrySchema).max(3, "You can add a maximum of 3 past employments."),
});

export type ApplicationSchema = z.infer<typeof applicationSchema>;