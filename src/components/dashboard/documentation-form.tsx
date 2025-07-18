
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2 } from "lucide-react"

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
import { documentationSchema, type DocumentationSchema } from "@/lib/schemas"
import { updateCandidateWithDocuments } from "@/app/actions/candidates"


async function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


export function DocumentationForm({ company, candidateId }: { company: string, candidateId?: string | null }) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<DocumentationSchema>({
        resolver: zodResolver(documentationSchema),
        defaultValues: {
            idCard: undefined,
            proofOfAddress: undefined,
        },
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

            const idCardURL = data.idCard ? await fileToDataURL(data.idCard) : undefined;
            const proofOfAddressURL = data.proofOfAddress ? await fileToDataURL(data.proofOfAddress) : undefined;

            const result = await updateCandidateWithDocuments(
                candidateId, 
                {
                    idCard: idCardURL,
                    proofOfAddress: proofOfAddressURL,
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
                <FormField
                    control={form.control}
                    name="idCard"
                    render={({ field: { onChange, ...fieldProps } }) => {
                        return (
                            <FormItem>
                                <FormLabel>Government-issued ID</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*,.pdf" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} value={undefined} />
                                </FormControl>
                                <FormDescription>Please upload a clear copy of your ID (e.g., Driver's License, Passport).</FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
                 <FormField
                    control={form.control}
                    name="proofOfAddress"
                    render={({ field: { onChange, ...fieldProps } }) => {
                        return (
                            <FormItem>
                                <FormLabel>Proof of Address</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*,.pdf" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} value={undefined} />
                                </FormControl>
                                <FormDescription>Please upload a recent utility bill or bank statement.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Documents
          </Button>
        </div>
      </form>
    </Form>
  )
}
