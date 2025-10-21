
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Building, Save, FileText, PlusCircle, Trash2, Loader2, Eye, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { getCompanies, createOrUpdateCompany } from "@/app/actions/company-actions";
import { type Company, type RequiredDoc } from "@/lib/company-schemas";
import { supabase } from "@/lib/supabaseClient";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

// Helper to convert file to Base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const standardDocs: Omit<RequiredDoc, 'type'>[] = [
    { id: 'i9', label: 'Form I-9' },
    { id: 'w4', label: 'Form W-4' },
    { id: 'proofOfIdentity', label: 'Proof of Identity' },
    { id: 'educationalDiplomas', label: 'Educational Diplomas/Certificates' },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [company, setCompany] = useState<Partial<Company>>({});
  const [requiredDocs, setRequiredDocs] = useState<RequiredDoc[]>([]);
  const [customDocLabel, setCustomDocLabel] = useState("");
  const [phase1ImagesToUpload, setPhase1ImagesToUpload] = useState<string[]>([]);
  const [phase1ImageFiles, setPhase1ImageFiles] = useState<File[]>([]);


  // Load the first company from Supabase on component mount
  useEffect(() => {
    async function loadCompany() {
        setIsLoading(true);
        try {
            const data = await getCompanies();
            let activeCompany: Partial<Company> = {};
            if (data && data.length > 0) {
                activeCompany = data[0]; 
                
                // Get signed URLs for display
                if (activeCompany.logo && !activeCompany.logo.startsWith('http')) {
                    const { data: signedUrlData } = await supabase.storage.from('logos').createSignedUrl(activeCompany.logo, 3600);
                    activeCompany.logo = signedUrlData?.signedUrl || activeCompany.logo;
                }
                 if (activeCompany.phase1Images && activeCompany.phase1Images.length > 0) {
                    const urls = await Promise.all(activeCompany.phase1Images.map(async p => {
                        if (p && !p.startsWith('http')) {
                            const { data: urlData } = await supabase.storage.from('forms').createSignedUrl(p, 3600);
                            return urlData?.signedUrl || null;
                        }
                        return p;
                    }));
                    activeCompany.phase1Images = urls.filter(Boolean) as string[];
                }
                if (activeCompany.interviewImage && !activeCompany.interviewImage.startsWith('http')) {
                    const { data: urlData } = await supabase.storage.from('forms').createSignedUrl(activeCompany.interviewImage, 3600);
                    activeCompany.interviewImage = urlData?.signedUrl || activeCompany.interviewImage;
                }
            }
            setCompany(activeCompany);
            setRequiredDocs(activeCompany.requiredDocs || []);
        } catch (error) {
            toast({ variant: 'destructive', title: "Failed to load settings", description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    }
    loadCompany();
  }, [toast]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
        if (!company.name) {
            toast({ variant: "destructive", title: "Validation Error", description: `Company name is required.`});
            return;
        }
        
        try {
            const dataToSave: Partial<Company> & { phase1ImagesToUpload?: string[] } = {
                ...company,
                requiredDocs,
                phase1ImagesToUpload: phase1ImagesToUpload
            };
            
            const result = await createOrUpdateCompany(dataToSave);

            if (!result.success || !result.company) throw new Error("Failed to save company settings.");
            
            setCompany(result.company);
            setRequiredDocs(result.company.requiredDocs || []);
            setPhase1ImagesToUpload([]);
            setPhase1ImageFiles([]);

            toast({ title: "Settings Saved", description: "Your company settings have been updated." });
        } catch (error) {
             toast({ variant: "destructive", title: "Save Failed", description: (error as Error).message });
        }
    });
  };

  const handleLogoChange = async (file: File | null) => {
    if (file) {
        const base64Logo = await toBase64(file);
        setCompany(prev => ({ ...prev, logo: base64Logo }));
    }
  };

  const handleInterviewImageChange = async (file: File | null) => {
    if (file) {
        const base64Image = await toBase64(file);
        setCompany(prev => ({ ...prev, interviewImage: base64Image }));
    }
  }

  const handleCompanyFieldChange = (field: keyof Company, value: string | string[]) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  };

  const handleFormCustomizationChange = (value: 'template' | 'custom') => {
    setCompany(prev => ({ ...prev, formCustomization: value }));
  }

  const handlePhase1ImagesChange = async (files: FileList | null) => {
    if (files) {
        const fileArray = Array.from(files);
        setPhase1ImageFiles(prev => [...prev, ...fileArray]);
        const base64Promises = fileArray.map(file => toBase64(file));
        const base64Results = await Promise.all(base64Promises);
        setPhase1ImagesToUpload(prev => [...prev, ...base64Results]);
    }
  }

  const removePhase1Image = (index: number) => {
    setPhase1ImagesToUpload(prev => prev.filter((_, i) => i !== index));
    setPhase1ImageFiles(prev => prev.filter((_, i) => i !== index));
  }
  
    const handleStandardDocChange = (doc: Omit<RequiredDoc, 'type'>, checked: boolean) => {
        setRequiredDocs(prevDocs => {
            if (checked) {
                return [...prevDocs, { ...doc, type: 'upload' }];
            } else {
                return prevDocs.filter(d => d.id !== doc.id);
            }
        });
    };
    
    const addCustomDoc = () => {
        if (customDocLabel.trim()) {
            const newDoc: RequiredDoc = {
                id: `custom_${Date.now()}`,
                label: customDocLabel.trim(),
                type: 'upload', 
            };
            setRequiredDocs([...requiredDocs, newDoc]);
            setCustomDocLabel("");
        }
    };

    const removeDoc = (docId: string) => {
        setRequiredDocs(requiredDocs.filter(d => d.id !== docId));
    };


  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
        <p className="ml-4">Loading settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
                <Settings className="h-8 w-8 text-foreground" />
                <div>
                    <h1 className="text-3xl font-headline font-bold text-foreground">Company Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your company profile and documentation requirements here.
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <Button type="submit" size="lg" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save All Settings
                </Button>
            </div>
        </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Company Identity
          </CardTitle>
          <CardDescription>Set your company's name, logo, and contact information. This is shared across all application materials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" placeholder="e.g., Noble Health" value={company.name || ''} onChange={(e) => handleCompanyFieldChange('name', e.target.value)} />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="company-logo">Company Logo</Label>
                  <div className="flex items-center gap-4">
                      <Input id="company-logo" type="file" className="max-w-xs" onChange={(e) => handleLogoChange(e.target.files?.[0] || null)} accept="image/*" />
                      {company.logo && <Image src={company.logo} alt="Logo Preview" width={40} height={40} className="rounded-sm object-contain" />}
                  </div>
              </div>
           </div>
        </CardContent>
      </Card>
      
      <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">Phase 1: Application Form</CardTitle>
                <CardDescription>Choose how candidates will fill out their initial application.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-6">
                    <RadioGroup 
                        value={company.formCustomization || 'template'} 
                        onValueChange={handleFormCustomizationChange}
                        className="space-y-2"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="template" id="template" />
                            <Label htmlFor="template">Default Template Form</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom">Custom Uploaded Form (Image/PDF)</Label>
                        </div>
                    </RadioGroup>

                    {company.formCustomization === 'custom' && (
                        <div className="pt-4 border-t mt-4">
                            <Label htmlFor="phase1-images">Upload Form Pages</Label>
                            <p className="text-sm text-muted-foreground mb-2">Upload images or a PDF of your paper application form. These will be displayed to the applicant instead of the digital form.</p>
                            <Input id="phase1-images" type="file" multiple onChange={(e) => handlePhase1ImagesChange(e.target.files)} accept="image/*,.pdf" />
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {phase1ImageFiles.map((file, index) => (
                                <div key={index} className="relative group">
                                    <Image src={URL.createObjectURL(file)} alt={`Form page ${index + 1}`} width={150} height={200} className="rounded-md object-cover w-full" />
                                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => removePhase1Image(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}
                </div>
                 <div className="flex justify-end md:justify-self-end">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/settings/preview/application" target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview Phase 1 Form
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />Phase 2: Interview</CardTitle>
                <CardDescription>Customize the background image for the interview review phase.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                 <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="interview-image">Interview Background Image</Label>
                  <div className="flex items-center gap-4">
                      <Input id="interview-image" type="file" className="max-w-xs" onChange={(e) => handleInterviewImageChange(e.target.files?.[0] || null)} accept="image/*" />
                      {company.interviewImage && <Image src={company.interviewImage} alt="Interview BG Preview" width={80} height={40} className="rounded-sm object-cover" />}
                  </div>
                </div>
                 <div className="flex justify-end md:justify-self-end">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/settings/preview/interview" target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview Phase 2 Screen
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>


      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Phase 3: Required Documentation</CardTitle>
              <CardDescription>Select the official documents candidates must download, fill, and upload during the documentation phase.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="space-y-4">
                        <Label className="font-semibold">Standard Documents</Label>
                        {standardDocs.map(doc => {
                            const isChecked = requiredDocs.some(d => d.id === doc.id);
                            return (
                                <div key={doc.id} className="p-4 border rounded-md space-y-2">
                                    <div className="flex items-center">
                                        <Checkbox
                                            id={doc.id}
                                            checked={isChecked}
                                            onCheckedChange={(checked) => handleStandardDocChange(doc, !!checked)}
                                        />
                                        <Label htmlFor={doc.id} className="ml-3 flex-1">{doc.label}</Label>
                                    </div>
                                    <p className="text-xs text-muted-foreground pl-7">
                                        Applicant will be required to download the official PDF, fill it, and upload the completed file.
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <Label className="font-semibold">Custom Documents</Label>
                        <p className="text-sm text-muted-foreground">Add any other documents your company requires applicants to upload.</p>
                        {requiredDocs.filter(d => d.id.startsWith('custom_')).map(doc => (
                            <div key={doc.id} className="flex items-center gap-4 p-2 border rounded-md">
                            <span className="flex-1">{doc.label}</span>
                            <p className="text-sm text-muted-foreground">(Applicant Upload)</p>
                            <Button variant="ghost" type="button" size="icon" onClick={() => removeDoc(doc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        ))}
                        <div className="flex gap-2">
                            <Input 
                                placeholder="Enter custom document name, e.g., 'Portfolio'" 
                                value={customDocLabel}
                                onChange={(e) => setCustomDocLabel(e.target.value)}
                            />
                            <Button type="button" onClick={addCustomDoc}>Add</Button>
                        </div>
                    </div>
                </div>
                <div className="flex justify-start md:justify-end md:justify-self-end">
                    <Button variant="outline" asChild>
                        <Link href="/dashboard/settings/preview/documentation" target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview Phase 3 Page
                        </Link>
                    </Button>
                </div>
             </div>
          </CardContent>
      </Card>
      
      <Separator />

      <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save All Settings
          </Button>
      </div>
    </form>
  );
}
