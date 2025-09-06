
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, File, FileText, Pencil } from "lucide-react"
import { z } from "zod"
import Image from "next/image"


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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { updateCandidateWithDocuments } from "@/app/actions/client-actions"
import { Company, RequiredDoc } from "@/lib/company-schemas"


async function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const createDocumentationSchema = (requiredDocs: RequiredDoc[]) => {
    const shape: Record<string, any> = {};
    requiredDocs.forEach(doc => {
        shape[doc.id] = z.any().optional(); 
    });
    
    if (requiredDocs.some(d => d.id === 'i9' && d.type === 'digital')) {
        shape.i9_lastName = z.string().optional();
        shape.i9_firstName = z.string().optional();
        shape.i9_middleInitial = z.string().optional();
        // Add all other I-9 fields here as needed
    }

    return z.object(shape);
};


function I9FormDigital({ form, companyData }: { form: any, companyData?: Partial<Company> | null }) {
    return (
        <Card className="border-2 border-dashed">
            <CardHeader>
                <CardTitle className="font-headline">Form I-9: Employment Eligibility Verification</CardTitle>
                <CardDescription>
                Please fill out all the required fields in Section 1. Your employer has pre-filled their information in Section 2.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="relative w-full">
                    <Image
                        src="https://www.uscis.gov/sites/default/files/document/forms/i-9-paper-version.png"
                        alt="Form I-9"
                        width={2000}
                        height={2588}
                        priority
                        className="w-full h-auto select-none pointer-events-none"
                        data-ai-hint="document form"
                    />
                    
                    {/* Section 1 Overlays */}
                    <div className="absolute" style={{ top: '15.4%', left: '11.8%', width: '30%', height: '2.5%' }}>
                        <FormField control={form.control} name="i9_lastName" render={({ field }) => (
                            <Input {...field} placeholder="Last Name (Family Name)" className="absolute bg-transparent h-full" />
                        )} />
                    </div>
                     <div className="absolute" style={{ top: '15.4%', left: '42.9%', width: '30%', height: '2.5%' }}>
                        <FormField control={form.control} name="i9_firstName" render={({ field }) => (
                            <Input {...field} placeholder="First Name (Given Name)" className="absolute bg-transparent h-full" />
                        )} />
                    </div>
                     <div className="absolute" style={{ top: '15.4%', left: '74%', width: '10%', height: '2.5%' }}>
                        <FormField control={form.control} name="i9_middleInitial" render={({ field }) => (
                            <Input {...field} placeholder="MI" className="absolute bg-transparent h-full"/>
                        )} />
                    </div>
                    {/* Add more overlays for all of Section 1 as needed */}


                    {/* Section 2 - Pre-filled Data */}
                    <div className="absolute" style={{ top: '73.2%', left: '11.8%', width: '45.5%', height: '2.5%' }}>
                        <Input readOnly value={companyData?.name || ''} className="bg-blue-100/50 h-full" />
                    </div>
                     <div className="absolute" style={{ top: '73.2%', left: '58.8%', width: '38.2%', height: '2.5%' }}>
                        <Input readOnly value={companyData?.address || ''} className="bg-blue-100/50 h-full" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}


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

            const result = await updateCandidateWithDocuments(
                candidateId, 
                {
                    idCard: documentsToUpload["proofOfIdentity"],
                    proofOfAddress: documentsToUpload["proofOfAddress"],
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
    
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardContent className="pt-6 space-y-6">
                {requiredDocs.length > 0 ? (
                    requiredDocs.map(doc => (
                        <div key={doc.id}>
                           {doc.type === 'digital' && doc.id === 'i9' ? (
                                <I9FormDigital form={form} companyData={companyData} />
                           ) : doc.type === 'digital' ? (
                                <div className="flex items-center justify-between p-4 border rounded-md">
                                    <div>
                                        <FormLabel className="font-semibold">{doc.label}</FormLabel>
                                        <FormDescription>This form must be completed digitally.</FormDescription>
                                    </div>
                                    <Button type="button" variant="secondary" disabled>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Fill Out Form (Coming Soon)
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
