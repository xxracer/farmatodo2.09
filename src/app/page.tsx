
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow, Bot, FileClock, ClipboardCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const features = [
    {
        icon: <Workflow className="h-8 w-8 text-primary" />,
        title: "Streamlined Onboarding",
        description: "Guide candidates through a clear, phased workflow from application to hire.",
    },
    {
        icon: <Bot className="h-8 w-8 text-primary" />,
        title: "AI-Powered Assistance",
        description: "Leverage AI to automatically detect missing documents and streamline compliance.",
    },
    {
        icon: <FileClock className="h-8 w-8 text-primary" />,
        title: "Compliance & Alerts",
        description: "Get automated notifications for expiring documents, ensuring you stay compliant.",
    },
];

export default function HomePage() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-headline">Clear Comply HR</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link href="/login">HR Login</Link>
            </Button>
            <Button asChild>
                <Link href="/get-started">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tighter mb-4">
                      Revolutionize Your Hiring Workflow
                    </h1>
                    <p className="max-w-xl text-lg md:text-xl text-muted-foreground mb-8">
                      Clear Comply HR is the all-in-one platform that simplifies, automates, and ensures compliance at every step of your personnel onboarding.
                    </p>
                    <div className="flex justify-center md:justify-start gap-4">
                      <Button asChild size="lg">
                        <Link href="/get-started">Request a Demo</Link>
                      </Button>
                    </div>
                </div>
                 <div className="flex justify-center">
                    <Image 
                        src="https://placehold.co/600x400.png"
                        alt="HR Dashboard Illustration"
                        width={600}
                        height={400}
                        className="rounded-lg shadow-xl"
                        data-ai-hint="hr tech dashboard"
                    />
                </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 md:py-24 bg-muted/40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Everything you need, in one place</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground mt-4">
                From the first application to ongoing document tracking, our platform has you covered.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4 md:px-6 text-center">
                 <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">
                    Ready to optimize your HR workflow?
                </h2>
                <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
                    Create a trial account and see how Clear Comply HR can transform your company.
                </p>
                <Button asChild size="lg">
                    <Link href="/get-started">Get Started for Free</Link>
                </Button>
            </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex items-center justify-between p-4 md:px-6">
            <p className="text-sm text-muted-foreground">&copy; {year} Clear Comply HR. All rights reserved.</p>
            <div className="flex gap-4">
                <Link href="#" className="text-sm hover:underline">Privacy Policy</Link>
                 <Link href="#" className="text-sm hover:underline">Terms of Service</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}
