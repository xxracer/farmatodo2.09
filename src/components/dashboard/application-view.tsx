
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ApplicationData, type DocumentFile } from "@/lib/schemas";
import { Check, X, Paperclip, Download } from "lucide-react";
import { Button } from "../ui/button";
import { format, parseISO, isValid } from "date-fns";

// Helper to safely convert a string or date object to a formatted date string
function formatDisplayDate(dateValue: any): string {
    if (!dateValue) return 'N/A';
    try {
        const date = dateValue instanceof Date ? dateValue : parseISO(dateValue);
        if (!isValid(date)) {
            const parts = String(dateValue).split('-');
            if (parts.length === 3) {
                const parsed = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                if (isValid(parsed)) return format(parsed, "PPP");
            }
            return 'N/A';
        }
        return format(date, "PPP");
    } catch (error) {
        return String(dateValue);
    }
}

type DataRowProps = {
    label: string;
    value: React.ReactNode;
    isDate?: boolean;
};

const DataRow = ({ label, value, isDate = false }: DataRowProps) => {
    if (value === null || value === undefined || value === '') return null;
    
    let displayValue = value;

    if (isDate) {
        displayValue = formatDisplayDate(value);
    } else if (typeof value === 'string' && (value === 'yes' || value === 'no')) {
        displayValue = value === 'yes' ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-destructive" />;
    } else if (typeof value === 'boolean') {
        displayValue = value ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-destructive" />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <p className="font-medium text-muted-foreground">{label}</p>
            <div className="text-foreground break-words">
                {displayValue}
            </div>
        </div>
    );
};

const FileRow = ({ label, fileUrl }: { label: string, fileUrl?: string }) => {
    if (!fileUrl) return null;

    const downloadName = label.replace(/\s/g, '_');
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <p className="font-medium text-muted-foreground">{label}</p>
            <div>
                <Button asChild variant="link" className="p-0 h-auto">
                    <a href={fileUrl} download={downloadName} target="_blank" rel="noopener noreferrer">
                        View/Download Document <Download className="ml-2 h-4 w-4" />
                    </a>
                </Button>
            </div>
        </div>
    )
}

const EducationDetails = ({ title, education }: { title: string, education: ApplicationData['education']['college']}) => {
    if (!education || (!education.name && !education.location && !education.course && !education.degree)) return null;
    return (
         <div className="mt-4 p-4 border rounded-md">
            <h4 className="font-semibold text-md mb-2">{title}</h4>
            <div className="space-y-2">
                <DataRow label="School Name" value={education.name} />
                <DataRow label="Location" value={education.location} />
                <DataRow label="Course of Study" value={education.course} />
                <DataRow label="Degree/Diploma" value={education.degree} />
            </div>
        </div>
    )
}

const EmploymentHistoryDetails = ({ history }: { history: ApplicationData['employmentHistory'] }) => {
    if (!history || history.length === 0) return <p className="text-muted-foreground">No employment history provided.</p>;
    return (
        <div className="space-y-4">
            {history.map((job, index) => (
                <div key={index} className="p-4 border rounded-md">
                    <h4 className="font-semibold text-md mb-2">Employer #{index + 1}</h4>
                    <div className="space-y-2">
                        <DataRow label="Company Name" value={job.companyName} />
                        <DataRow label="Telephone" value={job.telephone} />
                        <DataRow label="Address" value={`${job.address}, ${job.city}, ${job.state} ${job.zipCode}`} />
                        <DataRow label="Employment Dates" value={`From: ${formatDisplayDate(job.dateFrom)} To: ${formatDisplayDate(job.dateTo)}`} />
                        <DataRow label="Starting Pay" value={`$${job.startingPay}`} />
                        <DataRow label="Job Title & Description" value={job.jobTitleAndDescription} />
                        <DataRow label="Reason for Leaving" value={job.reasonForLeaving} />
                    </div>
                </div>
            ))}
        </div>
    )
}

const ProfessionalReferences = ({ references }: { references: ApplicationData['professionalReferences'] }) => {
    if (!references || references.length === 0) return <p className="text-muted-foreground">No references provided.</p>;
    return (
        <div className="space-y-4">
            {references.map((ref, index) => (
                <div key={index} className="p-4 border rounded-md">
                    <h4 className="font-semibold text-md mb-2">Reference #{index + 1}</h4>
                    <div className="space-y-2">
                        <DataRow label="Name" value={ref.name} />
                        <DataRow label="Telephone" value={ref.telephone} />
                        <DataRow label="Address" value={ref.address} />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function ApplicationView({ data }: { data: ApplicationData }) {
  return (
    <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <DataRow label="Full Name" value={`${data.firstName} ${data.middleName || ''} ${data.lastName}`} />
            <DataRow label="Date of Application / Hire" value={data.date} isDate={true} />
            <DataRow label="Applying For" value={Array.isArray(data.applyingFor) ? data.applyingFor.join(", ") : 'N/A'} />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <DataRow label="Address" value={`${data.streetAddress}, ${data.city}, ${data.state} ${data.zipCode}`} />
                <DataRow label="Home Phone" value={data.homePhone} />
                <DataRow label="Business Phone" value={data.businessPhone} />
                <DataRow label="Emergency Contact" value={data.emergencyContact} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <DataRow label="Previously Employed Here" value={data.previouslyEmployed} />
                <DataRow label="Hours Available per Week" value={data.hoursAvailable} />
                <DataRow label="Legally Eligible to Work in US" value={data.legallyEligible} />
                <DataRow label="How Learned About Organization" value={data.howLearned} />
                <DataRow label="Willing to Work Evenings/Weekends" value={data.workEveningsWeekends} />
                <DataRow label="Position Applied For" value={data.position} />
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Education</CardTitle>
          </CardHeader>
          <CardContent>
            {data.education && <EducationDetails title="College" education={data.education.college} />}
            {data.education && <EducationDetails title="Vo-Tech or Trade" education={data.education.voTech} />}
            {data.education && <EducationDetails title="High School" education={data.education.highSchool} />}
            {data.education && <EducationDetails title="Other" education={data.education.other} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Employment History</CardTitle>
          </CardHeader>
          <CardContent>
            <EmploymentHistoryDetails history={data.employmentHistory} />
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <DataRow label="Previously Used a Different Name" value={data.differentLastName} />
                <DataRow label="Previous Name" value={data.previousName} />
                <DataRow label="Currently Employed" value={data.currentlyEmployed} />
                <DataRow label="Reliable Transportation" value={data.reliableTransportation} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Professional References</CardTitle>
            </CardHeader>
            <CardContent>
                <ProfessionalReferences references={data.professionalReferences} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">General Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <DataRow label="Convicted of a Crime in Past 5 Years" value={data.convictedOfCrime} />
                <DataRow label="Crime Description" value={data.crimeDescription} />
                <DataRow label="Capable of Performing Job" value={data.capableOfPerformingJob} />
                <DataRow label="Job Requirement Limitation" value={data.jobRequirementLimitation} />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Attached Documents</CardTitle>
                <CardDescription>Documents uploaded during the application and documentation phases.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                 <FileRow label="Original Application PDF" fileUrl={data.applicationPdfUrl} />
                 <FileRow label="Resume File" fileUrl={data.resume} />
                 <FileRow label="Driver's License" fileUrl={data.driversLicense} />
                 <FileRow label="Government-issued ID" fileUrl={data.idCard} />
                 <FileRow label="Proof of Address" fileUrl={data.proofOfAddress} />
                 <FileRow label="Form I-9" fileUrl={data.i9} />
                 <FileRow label="Form W-4" fileUrl={data.w4} />
                 <FileRow label="Educational Diplomas" fileUrl={data.educationalDiplomas} />

                 {data.documents?.map(doc => <FileRow key={doc.id} label={doc.title} fileUrl={doc.url} />)}
                 {data.miscDocuments?.map(doc => <FileRow key={doc.id} label={doc.title} fileUrl={doc.url} />)}

                <DataRow label="Name on License" value={data.driversLicenseName} />
                <DataRow label="License Expiration" value={data.driversLicenseExpiration} isDate={true}/>

                {!data.resume && !data.driversLicense && !data.idCard && (data.documents?.length || 0) === 0 && (
                    <div className="flex items-center justify-center text-sm text-muted-foreground p-4">
                        <Paperclip className="mr-2 h-4 w-4" />
                        No documents have been uploaded yet.
                    </div>
                )}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Credentials & Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <DataRow label="Specialized Skills & Qualifications" value={data.specializedSkills} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Certification & Authorization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <DataRow label="Agreed to Terms" value={data.certification} />
                <DataRow label="Electronic Signature" value={data.signature} />
            </CardContent>
        </Card>
    </div>
  );
}
