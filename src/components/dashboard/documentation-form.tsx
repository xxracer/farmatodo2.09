
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, File, FileText, Pencil } from "lucide-react"
import { z } from "zod"


import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { updateCandidateWithDocuments } from "@/app/actions/client-actions"
import { Company, RequiredDoc } from "@/lib/company-schemas"
import { I9Form } from "./i9-form" // Import the new I-9 form component


async function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Dynamically create a Zod schema based on the required documents
const createDocumentationSchema = (requiredDocs: RequiredDoc[]) => {
    const shape: Record<string, any> = {};
    requiredDocs.forEach(doc => {
        // We can just use z.any() for the file and handle validation elsewhere if needed
        shape[doc.id] = z.any().optional(); 
    });
    // Add specific schema for I-9 form if it's present
    if (requiredDocs.some(d => d.id === 'i9')) {
        shape.i9 = z.object({
            lastName: z.string().optional(),
            firstName: z.string().optional(),
            middleInitial: z.string().optional(),
            otherLastNames: z.string().optional(),
            address: z.string().optional(),
            aptNumber: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zipCode: z.string().optional(),
            dateOfBirth: z.string().optional(),
            ssn: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            citizenshipStatus: z.string().optional(),
        }).optional()
    }

    return z.object(shape);
};


export function DocumentationForm({ companyName, candidateId, requiredDocs, companyData }: { companyName: string, candidateId?: string | null, requiredDocs: RequiredDoc[], companyData?: Partial<Company> | null }) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const documentationSchema = createDocumentationSchema(requiredDocs);
    type DocumentationSchema = z.infer<typeof documentationSchema>;

    const form = useForm<DocumentationSchema>({
        resolver: zodResolver(documentationSchema),
    });

    async function onSubmit(data: DocumentationSchema) {
        if (!candidateId) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "No candidate ID found. This link may be invalid.",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const documentsToUpload: Record<string, string> = {};
            
            for (const doc of requiredDocs) {
                if (doc.type === 'upload') {
                    const file = data[doc.id as keyof typeof data];
                    if (file instanceof File) {
                        documentsToUpload[doc.id] = await fileToDataURL(file);
                    }
                }
            }

            // This needs to be adapted if the server expects specific keys
            // Map our dynamic doc IDs to the expected server action keys
            const result = await updateCandidateWithDocuments(
                candidateId, 
                {
                    idCard: documentsToUpload["proofOfIdentity"],
                    proofOfAddress: documentsToUpload["proofOfAddress"],
                    // ... we can add more specific fields to the server action later
                }
            );

            if (result.success) {
                toast({
                  title: "Documents Submitted",
                  description: "Candidate documents have been uploaded.",
                });
                router.push('/documentation/success');
            } else {
                toast({
                  variant: "destructive",
                  title: "Submission Failed",
                  description: result.error || "An unknown error occurred.",
                });
            }
        } catch (error) {
            toast({
              variant: "destructive",
              title: "Submission Failed",
              description: (error as Error).message || "An unexpected error occurred.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handleFillForm = (docName: string) => {
        toast({
            title: `Simulating Digital Form`,
            description: `Opening a secure portal to fill out ${docName}.`,
        });
    }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardContent className="pt-6 space-y-6">
                {requiredDocs.length > 0 ? (
                    requiredDocs.map(doc => (
                        <div key={doc.id}>
                           {doc.type === 'digital' && doc.id === 'i9' ? (
                                <I9Form form={form} companyData={companyData} />
                           ) : doc.type === 'digital' ? (
                                <div className="flex items-center justify-between p-4 border rounded-md">
                                    <div>
                                        <FormLabel className="font-semibold">{doc.label}</FormLabel>
                                        <FormDescription>This form must be completed digitally.</FormDescription>
                                    </div>
                                    <Button type="button" variant="secondary" onClick={() => handleFillForm(doc.label)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Fill Out Form
                                    </Button>
                                </div>
                            ) : (
                                <Controller
                                    control={form.control}
                                    name={doc.id}
                                    render={({ field: { onChange, ...fieldProps }, fieldState }) => {
                                        const file = form.watch(doc.id as any);
                                        return (
                                            <FormItem>
                                                <FormLabel className="font-semibold">{doc.label}</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input 
                                                          type="file" 
                                                          accept="image/*,.pdf" 
                                                          {...fieldProps} 
                                                          onChange={(e) => onChange(e.target.files?.[0])} 
                                                          value={undefined}
                                                          className="pr-12"
                                                        />
                                                        <File className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                </FormControl>
                                                 {file instanceof File && (
                                                    <FormDescription className="flex items-center gap-2 pt-1">
                                                       <FileText className="h-4 w-4 text-muted-foreground" /> {file.name}
                                                    </FormDescription>
                                                 )}
                                                <FormMessage />
                                            </FormItem>
                                        )
                                    }}
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        No specific documents have been requested for this position.
                    </div>
                )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || requiredDocs.length === 0}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Documents
          </Button>
        </div>
      </form>
    </Form>
  )
}

    