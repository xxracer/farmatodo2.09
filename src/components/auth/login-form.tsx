"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();

  const handleLogin = () => {
    // For this prototype, we simply redirect to the dashboard.
    router.push("/dashboard");
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-2xl">Welcome!</CardTitle>
        <CardDescription>Click the button to access the dashboard.</CardDescription>
      </CardHeader>
        <CardContent>
            {/* Content is empty as no input fields are needed */}
        </CardContent>
        <CardFooter>
          <Button onClick={handleLogin} className="w-full">
            Access Dashboard
          </Button>
        </CardFooter>
    </Card>
  );
}
