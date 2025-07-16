import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ApplicationSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          <CardTitle className="font-headline text-2xl mt-4">Thank You for Applying!</CardTitle>
          <CardDescription>
            Your application has been successfully submitted. We appreciate your interest in our organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Our HR department will review your application. If your qualifications match our needs, we will contact you to schedule an interview.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Return to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
