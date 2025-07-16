"use client";

import { useState } from "react";
import { CheckCircle, Circle, FileText, FileUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

type Phase = "application" | "documentation";

export function ProgressTracker() {
  const [currentPhase, setCurrentPhase] = useState<Phase>("application");

  const phases = [
    {
      id: "application",
      name: "Application",
      description: "Submit initial candidate data.",
      icon: FileText,
    },
    {
      id: "documentation",
      name: "Detailed Documentation",
      description: "Upload and verify all required documents.",
      icon: FileUp,
    },
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);

  return (
    <Card>
        <CardContent className="p-6">
            <h2 className="text-xl font-headline font-semibold mb-4">Onboarding Progress</h2>
            <div className="relative">
                <div className="absolute left-0 top-0 h-full w-[2px] bg-border translate-x-[1rem]" aria-hidden="true" />
                <ol className="space-y-8">
                {phases.map((phase, index) => {
                    const isCompleted = index < currentPhaseIndex;
                    const isCurrent = index === currentPhaseIndex;
                    
                    return (
                    <li key={phase.id} className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                            <span className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full",
                                isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                                isCurrent && "ring-4 ring-primary/20 bg-primary text-primary-foreground"
                            )}>
                                {isCompleted ? <CheckCircle className="h-5 w-5" /> : <phase.icon className="h-5 w-5" />}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">{phase.name}</p>
                            <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </div>
                    </li>
                    )
                })}
                </ol>
            </div>
             {/* This is for demo purposes to show state changes */}
             <div className="mt-6 flex gap-2">
                <Button onClick={() => setCurrentPhase('application')} variant={currentPhase === 'application' ? 'default' : 'outline'} size="sm">Set to Application</Button>
                <Button onClick={() => setCurrentPhase('documentation')} variant={currentPhase === 'documentation' ? 'default' : 'outline'} size="sm">Set to Documentation</Button>
            </div>
        </CardContent>
    </Card>

  );
}
