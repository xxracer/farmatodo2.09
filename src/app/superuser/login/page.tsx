
'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function SuperUserLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (email === "Maijel@ipltecnologies.com" && password === "millionares2025") {
            toast({
                title: "Super User Access Granted",
                description: "Welcome, Administrator.",
            });
            router.push("/superuser/dashboard");
        } else {
            toast({
                variant: "destructive",
                title: "Access Denied",
                description: "Invalid credentials for Super User access.",
            });
        }
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4">
             <div className="absolute top-4 left-4">
                <Button variant="link" asChild>
                    <Link href="/login">&larr; Return to Standard Login</Link>
                </Button>
            </div>
            <Card className="w-full max-w-md">
                <form onSubmit={handleLogin}>
                    <CardHeader className="text-center">
                         <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                            <ShieldAlert className="h-8 w-8 text-destructive" />
                        </div>
                        <CardTitle className="font-headline text-2xl mt-4">Super User Login</CardTitle>
                        <CardDescription>Restricted access area.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="admin@example.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                placeholder="••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" variant="destructive" className="w-full">
                            Access Admin Panel
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
