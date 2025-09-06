
import { z } from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_RESUME_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
const ACCEPTED_PDF_ONLY = ["application/pdf"];


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

const professionalReferenceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  telephone: z.string().min(10, "A valid phone number is required"),
  address: z.string().min(1, "Address is required"),
});

export const applicationSchema = z.object({
  // This field is no longer displayed but kept for schema compatibility for now.
  // It should be populated on the backend based on the portal's company.
  applyingFor: z.array(z.string()).optional(),

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

  // Additional Information
  differentLastName: z.enum(["yes", "no"], { required_error: "This field is required." }),
  previousName: z.string().optional(),
  currentlyEmployed: z.enum(["yes", "no"], { required_error: "This field is required." }),
  reliableTransportation: z.enum(["yes", "no"], { required_error: "This field is required." }),

  // Professional References
  professionalReferences: z.array(professionalReferenceSchema).min(1, "At least one professional reference is required.").max(3, "You can add a maximum of 3 references."),
  
  // General
  convictedOfCrime: z.enum(["yes", "no"], { required_error: "This field is required." }),
  crimeDescription: z.string().optional(),
  capableOfPerformingJob: z.enum(["yes", "no"], { required_error: "This field is required." }),
  jobRequirementLimitation: z.string().optional(),

  // Credentials & Skills
  specializedSkills: z.string().optional(),
  
  // Resume
  resume: z
    .any()
    .refine((file): file is File => file instanceof File, "Resume is required.")
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_RESUME_TYPES.includes(file.type),
      ".pdf, .doc, and .docx files are accepted."
    ),

  // Driver's License
  driversLicense: z
    .any()
    .refine((file): file is File => file instanceof File, "Driver's license is required.")
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, .webp and .pdf files are accepted."
    ),
  driversLicenseName: z.string().min(1, "Name on license is required."),
  driversLicenseExpiration: z.date({ required_error: "Expiration date is required." }),


  // Certification
  certification: z.literal(true, {
    errorMap: () => ({ message: "You must certify to submit the application." }),
  }),
  signature: z.string().min(1, "Signature is required"),
  status: z.enum(['candidate', 'interview', 'new-hire', 'employee']).optional(),
}).superRefine((data, ctx) => {
    if (data.differentLastName === 'yes' && !data.previousName) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['previousName'],
            message: 'Please provide your previous name.',
        });
    }
    if (data.convictedOfCrime === 'yes' && !data.crimeDescription) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['crimeDescription'],
            message: 'Please provide a description.',
        });
    }
    if (data.capableOfPerformingJob === 'no' && !data.jobRequirementLimitation) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['jobRequirementLimitation'],
            message: 'Please specify which requirement you cannot meet.',
        });
    }
});


export type ApplicationSchema = z.infer<typeof applicationSchema>;


// This is the type for the data that will be stored
export type ApplicationData = Omit<ApplicationSchema, 'resume' | 'driversLicense'> & {
    id: string;
    // We now store the path to the file in Supabase Storage, not a data URL
    resume?: string;
    driversLicense?: string;
    idCard?: string;
    proofOfAddress?: string;
    // Add fields for other uploaded documents
    i9?: string;
    w4?: string;
    educationalDiplomas?: string;
    [key: string]: any; // Allow for custom doc fields
};

export const interviewReviewSchema = z.object({
    applicantName: z.string().min(1, "Applicant name is required"),
    date: z.date({ required_error: "Date is required." }),
    daysAvailable: z.array(z.string()),
    personality: z.enum(["friendly", "average", "quiet"]),
    verbalSkills: z.enum(["excellent", "average", "poor"]),
    communicates: z.enum(["clear", "somewhat clear", "not very clear"]),
    flexibility: z.enum(["very flexible", "somewhat", "not flexible"]),
    skillLevel: z.enum(["higher skilled", "moderately skilled", "lower skilled"]),
    appearance: z.enum(["professional", "semi-professional", "not professional"]),
    goodCandidate: z.enum(["yes", "no"]),
    overallInterview: z.string().min(1, "Overall interview summary is required."),
    interviewer: z.string().min(1, "Interviewer name is required"),
    interviewerDate: z.date({ required_error: "Interviewer date is required." }),
});

export type InterviewReviewSchema = z.infer<typeof interviewReviewSchema>;

const requiredDocUpload = z.any()
  .refine((file): file is File => file instanceof File, "File is required.")
  .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
  .refine(
    (file) => ACCEPTED_PDF_ONLY.includes(file.type),
    "Only .pdf files are accepted."
  );

export const documentationSchema = z.object({
  i9: requiredDocUpload.optional(),
  w4: requiredDocUpload.optional(),
  proofOfIdentity: requiredDocUpload.optional(),
  educationalDiplomas: requiredDocUpload.optional(),
  // This allows for dynamic custom fields
}).catchall(requiredDocUpload.optional());

export type DocumentationSchema = z.infer<typeof documentationSchema>;
