
'use client';

import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

interface I9FormProps {
  form: UseFormReturn<any>;
  companyData?: any;
}

export function I9Form({ form, companyData }: I9FormProps) {
  // This is a simplified representation of Form I-9, Section 1
  return (
    <Card className="border-2 border-dashed">
      <CardHeader>
        <CardTitle className="font-headline">Form I-9: Employment Eligibility Verification</CardTitle>
        <CardDescription>
          Section 1: Employee Information and Attestation. This section must be completed by the employee.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="i9.lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name (Family Name)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="i9.firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name (Given Name)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="i9.middleInitial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Initial</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="i9.otherLastNames"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Other Last Names Used (if any)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
          control={form.control}
          name="i9.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Street Number and Name)</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
                control={form.control}
                name="i9.aptNumber"
                render={({ field }) => (<FormItem><FormLabel>Apt. Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
            />
            <FormField
                control={form.control}
                name="i9.city"
                render={({ field }) => (<FormItem><FormLabel>City or Town</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
            />
            <FormField
                control={form.control}
                name="i9.state"
                render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
            />
             <FormField
                control={form.control}
                name="i9.zipCode"
                render={({ field }) => (<FormItem><FormLabel>ZIP Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
            />
        </div>
         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
                control={form.control}
                name="i9.dateOfBirth"
                render={({ field }) => (<FormItem><FormLabel>Date of Birth (mm/dd/yyyy)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
            />
             <FormField
                control={form.control}
                name="i9.ssn"
                render={({ field }) => (<FormItem><FormLabel>U.S. Social Security Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
            />
             <FormField
                control={form.control}
                name="i9.email"
                render={({ field }) => (<FormItem><FormLabel>Employee's Email Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
            />
             <FormField
                control={form.control}
                name="i9.phone"
                render={({ field }) => (<FormItem><FormLabel>Employee's Telephone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
            />
        </div>
        
        <FormField
            control={form.control}
            name="i9.citizenshipStatus"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Attestation of Citizenship or Immigration Status</FormLabel>
                    <FormDescription>I attest, under penalty of perjury, that I am (Check one of the following):</FormDescription>
                     <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2 pt-2">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="citizen" /></FormControl>
                            <FormLabel className="font-normal">1. A citizen of the United States</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="national" /></FormControl>
                            <FormLabel className="font-normal">2. A noncitizen national of the United States</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="permanent_resident" /></FormControl>
                            <FormLabel className="font-normal">3. A lawful permanent resident</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="alien_authorized" /></FormControl>
                            <FormLabel className="font-normal">4. An alien authorized to work</FormLabel>
                        </FormItem>
                    </RadioGroup>
                    <FormMessage />
                </FormItem>
            )}
        />
        
         <div className="border-t pt-4">
            <FormLabel>Section 2: Employer Review and Verification</FormLabel>
            <FormDescription>This section is to be completed by the employer.</FormDescription>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="employerName">Employer's Business or Organization Name</Label>
                    <Input id="employerName" value={companyData?.name || ''} readOnly disabled />
                </div>
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
