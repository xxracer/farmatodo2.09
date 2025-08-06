
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function GetStartedPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call to send lead email
    setTimeout(() => {
      const formData = new FormData(e.currentTarget);
      const lead = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        companyName: formData.get("companyName"),
      };
      
      console.log("Lead Info:", lead);

      toast({
        title: "Lead Sent!",
        description: "The registration request has been sent to our team.",
      });

      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
            <CardTitle className="font-headline text-2xl mt-4">Registration Request Sent!</CardTitle>
            <CardDescription>
                Our staff will contact you via email to complete your registration request.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Button asChild className="mt-6">
                <Link href="/">Return to Home</Link>
            </Button>
            </CardContent>
        </Card>
        </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Request a Demo</CardTitle>
                <CardDescription>
                    Fill out the form below and we'll get in touch to set up your account.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" name="firstName" placeholder="Jane" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" name="lastName" placeholder="Doe" required />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" type="email" placeholder="hr@yourcompany.com" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input id="companyName" name="companyName" placeholder="Your Company Inc." required />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                         {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Submit Request
                    </Button>
                </CardContent>
            </form>
        </Card>
    </div>
  );
}
