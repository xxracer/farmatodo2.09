
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Building, Upload, Save, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save the settings to Supabase.
    // For now, we just simulate it with a toast.
    toast({
      title: "Settings Saved",
      description: "Your company settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-foreground" />
        <h1 className="text-3xl font-headline font-bold text-foreground">Company Settings</h1>
      </div>
      <p className="text-muted-foreground">
        Customize the application portal for your company. These settings will be reflected in the application forms and communications.
      </p>

      <form onSubmit={handleSaveChanges}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Identity
            </CardTitle>
            <CardDescription>Set your company's name and logo that candidates will see.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" placeholder="e.g., Noble Health" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-logo">Company Logo</Label>
              <div className="flex items-center gap-4">
                <Input id="company-logo" type="file" className="max-w-xs" />
                <Button variant="outline" type="button">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Upload a logo to be displayed on the application and documentation pages.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Required Documentation (Phase 3)
            </CardTitle>
            <CardDescription>
              Define the list of documents that candidates must upload in the final phase.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <Label htmlFor="required-docs">Required Documents</Label>
                <Textarea 
                  id="required-docs" 
                  placeholder="Enter each required document on a new line, e.g.,&#10;Form W-4&#10;Form I-9&#10;Proof of Identity"
                  rows={5}
                />
                <p className="text-sm text-muted-foreground">
                  The AI assistant will use this list to determine which documents are missing.
                </p>
              </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
