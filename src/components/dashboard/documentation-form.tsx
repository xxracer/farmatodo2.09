
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"

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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Calendar } from "../ui/calendar"
import { cn } from "@/lib/utils"


export function DocumentationForm({ company, candidateId }: { company: string, candidateId?: string | null }) {
    const { toast } = useToast()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm<DocumentationSchema>({
        resolver: zodResolver(documentationSchema),
        defaultValues: {
            idCard: undefined,
            proofOfAddress: undefined,
            driversLicense: undefined,
            driversLicenseName: "",
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
        const result = await updateCandidateWithDocuments(
            candidateId, 
            {
                idCard: data.idCard,
                proofOfAddress: data.proofOfAddress,
                driversLicense: data.driversLicense,
            },
            {
                driversLicenseName: data.driversLicenseName,
                driversLicenseExpiration: data.driversLicenseExpiration,
            }
        );
        setIsSubmitting(false);

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
                <FormField
                    control={form.control}
                    name="driversLicense"
                    render={({ field: { onChange, ...fieldProps } }) => {
                        return (
                            <FormItem>
                                <FormLabel>Driver's License</FormLabel>
                                <FormControl>
                                    <Input type="file" accept="image/*,.pdf" {...fieldProps} onChange={(e) => onChange(e.target.files?.[0])} value={undefined} />
                                </FormControl>
                                <FormDescription>Please upload a photo or PDF of your driver's license.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
                 <FormField
                    control={form.control}
                    name="driversLicenseName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name on Driver's License</FormLabel>
                            <FormControl>
                                <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField 
                    control={form.control} 
                    name="driversLicenseExpiration" 
                    render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>License Expiration Date</FormLabel>
                        <Popover><PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={"outline"} className={cn("w-full md:w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                        </PopoverContent></Popover>
                        <FormMessage />
                        </FormItem>
                    )}
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
