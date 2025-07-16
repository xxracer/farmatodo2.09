"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { applicationSchema, type ApplicationSchema } from "@/lib/schemas"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "../ui/checkbox"
import { useToast } from "@/hooks/use-toast"


export function ApplicationForm() {
    const { toast } = useToast()

    const form = useForm<ApplicationSchema>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            lastName: "",
            firstName: "",
            middleName: "",
            streetAddress: "",
            city: "",
            state: "",
            zipCode: "",
            homePhone: "",
            businessPhone: "",
            emergencyContact: "",
            hoursAvailable: 40,
            position: "",
        },
    });

    function onSubmit(data: ApplicationSchema) {
        toast({
          title: "Application Submitted",
          description: "Candidate data has been saved successfully.",
        })
        console.log(data)
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Personal Information</CardTitle>
            <CardDescription>Enter the candidate's basic details.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="Jane" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="middleName" render={({ field }) => (
                <FormItem><FormLabel>Middle Name</FormLabel><FormControl><Input placeholder="(Optional)" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Application Date</FormLabel>
                <Popover><PopoverTrigger asChild>
                    <FormControl>
                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                </PopoverContent></Popover>
                <FormMessage />
                </FormItem>
            )}/>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <FormField control={form.control} name="streetAddress" render={({ field }) => (
                        <FormItem className="md:col-span-3"><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Main St" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City</FormLabel><FormControl><Input placeholder="Anytown" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem><FormLabel>State</FormLabel><FormControl><Input placeholder="CA" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="zipCode" render={({ field }) => (
                        <FormItem><FormLabel>Zip Code</FormLabel><FormControl><Input placeholder="90210" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                 <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField control={form.control} name="homePhone" render={({ field }) => (
                        <FormItem><FormLabel>Home Phone</FormLabel><FormControl><Input placeholder="(555) 123-4567" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="businessPhone" render={({ field }) => (
                        <FormItem><FormLabel>Business Phone</FormLabel><FormControl><Input placeholder="(Optional)" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="emergencyContact" render={({ field }) => (
                    <FormItem><FormLabel>Emergency Contact (not living with you)</FormLabel><FormControl><Input placeholder="John Smith" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <FormField control={form.control} name="position" render={({ field }) => (
                    <FormItem><FormLabel>Position Applying For</FormLabel><FormControl><Input placeholder="Software Engineer" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="hoursAvailable" render={({ field }) => (
                    <FormItem><FormLabel>Hours Available Per Week</FormLabel><FormControl><Input type="number" placeholder="40" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="previouslyEmployed" render={({ field }) => (
                    <FormItem className="space-y-3"><FormLabel>Have you ever applied for employment with this Agency?</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row space-x-4">
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                            </RadioGroup>
                        </FormControl><FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="legallyEligible" render={({ field }) => (
                    <FormItem className="space-y-3"><FormLabel>Are you legally eligible for employment in the United States?</FormLabel>
                        <FormControl>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-row space-x-4">
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="no" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                            </RadioGroup>
                        </FormControl><FormMessage />
                    </FormItem>
                )}/>
                <FormField control={form.control} name="howLearned" render={({ field }) => (
                    <FormItem><FormLabel>How did you learn about us?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="online">Online Ad</SelectItem>
                                <SelectItem value="employee">Agency employee</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select><FormMessage />
                    </FormItem>
                )}/>
                 <FormField control={form.control} name="workEveningsWeekends" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>Willing to work evenings and/or weekends?</FormLabel>
                            <FormDescription>Check if the candidate is available for flexible hours.</FormDescription>
                        </div>
                    </FormItem>
                )}/>
            </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Save Application</Button>
        </div>
      </form>
    </Form>
  )
}
