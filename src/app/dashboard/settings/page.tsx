
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Building, Upload, Save, FileText, Image as ImageIcon, ClipboardList, PlusCircle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SettingsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [phase1Images, setPhase1Images] = useState<string[]>(['']);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('companySettings', JSON.stringify({ configured: true }));
    
    toast({
      title: "Settings Saved",
      description: "Your company settings have been updated.",
    });

    router.push('/dashboard');
  };

  const addPhase1Image = () => {
    setPhase1Images([...phase1Images, '']);
  }

  const removePhase1Image = (index: number) => {
    const newImages = phase1Images.filter((_, i) => i !== index);
    setPhase1Images(newImages);
  }

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
              <Label>Will you manage one or multiple companies?</Label>
              <RadioGroup defaultValue="one" className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="one" id="one" />
                    <Label htmlFor="one">Just One</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple" id="multiple" />
                    <Label htmlFor="multiple">Multiple Companies</Label>
                  </div>
              </RadioGroup>
            </div>
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
              <ClipboardList className="h-5 w-5" />
              Application Form Customization (Phase 1)
            </CardTitle>
            <CardDescription>
              Supply images for the application sections (e.g., one image per page of your form). You can also use the system's predefined template.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             {phase1Images.map((image, index) => (
                <div key={index} className="space-y-2">
                    <Label htmlFor={`application-header-${index}`}>Application Form Image #{index + 1}</Label>
                    <div className="flex items-center gap-4">
                        <Input id={`application-header-${index}`} type="file" className="max-w-xs" />
                        <Button variant="outline" type="button">
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Button>
                        {phase1Images.length > 1 && (
                            <Button variant="ghost" size="icon" type="button" onClick={() => removePhase1Image(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        )}
                    </div>
                </div>
             ))}
              <Button variant="outline" size="sm" type="button" onClick={addPhase1Image}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add another image
              </Button>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Interview Phase Customization (Phase 2)
            </CardTitle>
            <CardDescription>
              Personalize the interview review section with a custom image, or use the system default.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
              <Label htmlFor="interview-image">Interview Header Image</Label>
               <div className="flex items-center gap-4">
                  <Input id="interview-image" type="file" className="max-w-xs" />
                  <Button variant="outline" type="button">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
              </div>
               <p className="text-sm text-muted-foreground">
                This image will be displayed in the background of the interview review form.
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
              Define the list of documents and images that candidates must upload. This list will be used by the AI to detect missing items. Mention if forms like W-4 or I-9 need to be filled digitally.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <Label htmlFor="required-docs">Required Documents List</Label>
                <Textarea 
                  id="required-docs" 
                  placeholder="Enter each required document on a new line, e.g.,&#10;Form W-4 (Digital)&#10;Form I-9 (Digital)&#10;Proof of Identity&#10;Educational Diplomas"
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
