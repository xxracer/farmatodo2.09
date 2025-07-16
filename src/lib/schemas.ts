import { z } from "zod";

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
});

export type ApplicationSchema = z.infer<typeof applicationSchema>;
