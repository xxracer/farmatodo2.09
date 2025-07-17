
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

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


export function DocumentationForm({ company, candidateId }: { company: string, candidateId?: string | null }) {
    const { toast } = useToast()
    const router = useRouter()

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

        // TODO: Handle file uploads to a cloud storage
        const documentsData = {
            idCard: data.idCard?.name,
            proofOfAddress: data.proofOfAddress?.name,
        };

        const result = await updateCandidateWithDocuments(candidateId, documentsData);

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
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6 space-y-6">
                <FormField
                    control={form.control}
                    name="idCard"
                    render={({ field }) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { value, ...rest } = field;
                        return (
                            <FormItem>
                                <FormLabel>Government-issued ID</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*,.pdf" {...rest} onChange={(e) => field.onChange(e.target.files?.[0])} />
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
                    render={({ field }) => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { value, ...rest } = field;
                        return (
                            <FormItem>
                                <FormLabel>Proof of Address</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*,.pdf" {...rest} onChange={(e) => field.onChange(e.target.files?.[0])} />
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
          <Button type="submit">Submit Documents</Button>
        </div>
      </form>
    </Form>
  )
}
