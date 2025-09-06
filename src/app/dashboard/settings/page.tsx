
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Building, Save, FileText, Image as ImageIcon, ClipboardList, PlusCircle, Trash2, Eye, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useTransition } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import Image from "next/image";
import { getCompanies, createOrUpdateCompany, deleteCompany } from "@/app/actions/company-actions";
import { type Company, type RequiredDoc } from "@/lib/company-schemas";
import { supabase } from "@/lib/supabaseClient";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

// Helper to convert file to Base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

type EditableCompany = Partial<Company>;

const standardDocs: Omit<RequiredDoc, 'type'>[] = [
    { id: 'w4', label: 'Form W-4' },
    { id: 'i9', label: 'Form I-9' },
    { id: 'proofOfIdentity', label: 'Proof of Identity' },
    { id: 'educationalDiplomas', label: 'Educational Diplomas/Certificates' },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  // Main state for all settings
  const [companyType, setCompanyType] = useState('one');
  const [companies, setCompanies] = useState<EditableCompany[]>([{}]);
  const [formCustomization, setFormCustomization] = useState('template');
  const [phase1Images, setPhase1Images] = useState<(string | null)[]>([]);
  const [interviewImage, setInterviewImage] = useState<string | null>(null);
  
  // State for new structured required documents
  const [requiredDocs, setRequiredDocs] = useState<RequiredDoc[]>([]);
  const [customDocLabel, setCustomDocLabel] = useState("");


  // Load companies from Supabase on component mount
  useEffect(() => {
    setIsLoading(true);
    getCompanies().then(async (data) => {
      if (data && data.length > 0) {
        // Since getCompanies might not return signed URLs, we fetch them now.
        const companiesWithSignedUrls = await Promise.all(data.map(async (c) => {
            if (c.logo && !c.logo.startsWith('http')) {
                 const { data: signedUrlData } = await supabase.storage.from('logos').createSignedUrl(c.logo, 3600);
                 return { ...c, logo: signedUrlData?.signedUrl || c.logo };
            }
            return c;
        }));

        setCompanies(companiesWithSignedUrls);
        setCompanyType(data.length > 1 ? 'multiple' : 'one');
        
        // Load shared settings from the first company
        const firstCompany = companiesWithSignedUrls[0];
        setFormCustomization(firstCompany.formCustomization || 'template');
        setPhase1Images(firstCompany.phase1Images || []);
        setInterviewImage(firstCompany.interviewImage || null);
        setRequiredDocs(firstCompany.requiredDocs || []);

      } else {
        setCompanies([{}]); // Start with a clean slate if no companies exist
      }
      setIsLoading(false);
    });
  }, []);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
        if (!companies.length || !companies[0].name) {
            toast({ variant: "destructive", title: "Validation Error", description: `A company name is required.`});
            return;
        }

        const companiesToSave = companyType === 'one' ? companies.slice(0, 1) : companies;

        for (const company of companiesToSave) {
            try {
                if (!company.name) {
                    toast({ variant: "destructive", title: "Validation Error", description: `Company name is required for all companies.`});
                    return;
                }
                
                const companyToSave: Partial<Company> = {
                    ...company,
                    formCustomization,
                    phase1Images,
                    interviewImage,
                    requiredDocs,
                };
                
                const result = await createOrUpdateCompany(companyToSave);

                if (!result.success || !result.company) {
                    throw new Error(result.error || "Failed to save one of the companies.");
                }

                // Update local state with returned data, including new temporary logo URL
                 setCompanies(prevCompanies => prevCompanies.map(c => {
                    if (c.id === result.company!.id || c.name === result.company!.name) {
                        return result.company!;
                    }
                    return c;
                }));

            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Save Failed",
                    description: (error as Error).message,
                });
                return; // Stop on first error
            }
        }

        toast({
            title: "Settings Saved",
            description: "Your company settings have been updated.",
        });
    });
  };
  
  const handleLogoChange = async (index: number, file: File | null) => {
    if (file) {
        const base64Logo = await toBase64(file);
        const newCompanies = [...companies];
        newCompanies[index].logo = base64Logo;
        setCompanies(newCompanies);
    }
  };

  const addCompany = () => {
    setCompanies([...companies, { name: '', logo: null }]);
  };

  const removeCompany = (index: number) => {
    startTransition(async () => {
        const companyToRemove = companies[index];
        if (companyToRemove.id) {
            await deleteCompany(companyToRemove.id);
        }
        const newCompanies = companies.filter((_, i) => i !== index);
        setCompanies(newCompanies);
        toast({ title: "Company Removed" });
    });
  };

  const handleCompanyNameChange = (index: number, name: string) => {
    const newCompanies = [...companies];
    newCompanies[index].name = name;
    setCompanies(newCompanies);
  };
  
    const addPhase1Image = () => setPhase1Images([...phase1Images, null]);
    const removePhase1Image = (index: number) => setPhase1Images(phase1Images.filter((_, i) => i !== index));

    const handlePhase1ImageChange = async (index: number, file: File | null) => {
        if (file) {
            const base64Image = await toBase64(file);
            const newImages = [...phase1Images];
            newImages[index] = base64Image;
            setPhase1Images(newImages);
        }
    };
    
    const handleInterviewImageChange = async (file: File | null) => {
        if (file) {
            setInterviewImage(await toBase64(file));
        }
    };
    
    const handleStandardDocChange = (doc: Omit<RequiredDoc, 'type'>, checked: boolean) => {
        if (checked) {
            setRequiredDocs([...requiredDocs, { ...doc, type: 'upload' }]);
        } else {
            setRequiredDocs(requiredDocs.filter(d => d.id !== doc.id));
        }
    };

    const handleDocTypeChange = (docId: string, isDigital: boolean) => {
        setRequiredDocs(requiredDocs.map(d => d.id === docId ? { ...d, type: isDigital ? 'digital' : 'upload' } : d));
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
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-foreground" />
        <h1 className="text-3xl font-headline font-bold text-foreground">Company Settings</h1>
      </div>
      <p className="text-muted-foreground">
        Customize the application portal for your company. These settings are saved in a secure database.
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
              <RadioGroup value={companyType} onValueChange={setCompanyType} className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="one" id="one" /><Label htmlFor="one">Just One</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="multiple" id="multiple" /><Label htmlFor="multiple">Multiple Companies</Label></div>
              </RadioGroup>
            </div>
            
            {(companyType === 'one' ? companies.slice(0, 1) : companies).map((company, index) => (
                <div key={company.id || index} className="p-4 border rounded-md space-y-4 relative">
                     {companyType === 'multiple' && <h4 className="font-semibold text-md">Company #{index + 1}</h4>}
                     <div className="space-y-2">
                        <Label htmlFor={`company-name-${index}`}>Company Name</Label>
                        <Input id={`company-name-${index}`} placeholder="e.g., Noble Health" value={company.name || ''} onChange={(e) => handleCompanyNameChange(index, e.target.value)} />
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor={`company-logo-${index}`}>Company Logo</Label>
                        <div className="flex items-center gap-4">
                            <Input id={`company-logo-${index}`} type="file" className="max-w-xs" onChange={(e) => handleLogoChange(index, e.target.files?.[0] || null)} accept="image/*" />
                            {company.logo && <Image src={company.logo} alt="Logo Preview" width={40} height={40} className="rounded-sm object-contain" />}
                        </div>
                     </div>
                     {companyType === 'multiple' && companies.length > 1 && (
                        <Button variant="ghost" size="icon" type="button" className="absolute top-2 right-2" onClick={() => removeCompany(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                     )}
                </div>
            ))}
             {companyType === 'multiple' && (
                 <Button variant="outline" size="sm" type="button" onClick={addCompany}><PlusCircle className="mr-2 h-4 w-4" />Add Company</Button>
             )}

          </CardContent>
        </Card>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" />Application Form Customization (Phase 1)</CardTitle>
            <CardDescription>Choose between a predefined template or upload your own images for the application form.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <RadioGroup value={formCustomization} onValueChange={setFormCustomization} className="flex gap-4">
                  <div className="flex items-center space-x-2"><RadioGroupItem value="template" id="template" /><Label htmlFor="template">Use Predefined Template</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="custom" id="custom" /><Label htmlFor="custom">Upload Custom Images</Label></div>
              </RadioGroup>
              {formCustomization === 'custom' && (
                <div className="space-y-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">Supply images for the application sections (e.g., one image per page of your form).</p>
                  {phase1Images.map((image, index) => (
                      <div key={index} className="space-y-2">
                          <Label htmlFor={`application-header-${index}`}>Application Form Image #{index + 1}</Label>
                          <div className="flex items-center gap-4">
                              <Input id={`application-header-${index}`} type="file" className="max-w-xs" onChange={(e) => handlePhase1ImageChange(index, e.target.files?.[0] || null)} accept="image/*" />
                               {image && <Image src={image} alt="Preview" width={40} height={40} className="rounded-sm object-contain" />}
                              {phase1Images.length > 1 && (<Button variant="ghost" size="icon" type="button" onClick={() => removePhase1Image(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>)}
                          </div>
                      </div>
                  ))}
                  <Button variant="outline" size="sm" type="button" onClick={addPhase1Image}><PlusCircle className="mr-2 h-4 w-4" />Add another image</Button>
                </div>
              )}
               <div className="flex justify-end pt-4 border-t">
                    <Button asChild variant="ghost"><Link href="/dashboard/settings/preview/application" target="_blank"><Eye className="mr-2 h-4 w-4" />Preview Application Form</Link></Button>
                </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />Interview Phase Customization (Phase 2)</CardTitle>
            <CardDescription>Personalize the interview review section with a custom background image. This is optional.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="interview-image">Interview Header Image</Label>
                <div className="flex items-center gap-4">
                    <Input id="interview-image" type="file" className="max-w-xs" onChange={(e) => handleInterviewImageChange(e.target.files?.[0] || null)} accept="image/*" />
                    {interviewImage && <Image src={interviewImage} alt="Preview" width={40} height={40} className="rounded-sm object-contain" />}
                </div>
                <p className="text-sm text-muted-foreground">This image will be displayed in the background of the interview review form.</p>
            </div>
            <div className="flex justify-end pt-4 border-t">
                <Button asChild variant="ghost"><Link href="/dashboard/settings/preview/interview" target="_blank"><Eye className="mr-2 h-4 w-4" />Preview Interview Section</Link></Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Required Documentation (Phase 3)</CardTitle>
                <CardDescription>Select the documents candidates must provide. The AI will use this list to detect missing items.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <Label className="font-semibold">Standard Documents</Label>
                    {standardDocs.map(doc => (
                        <div key={doc.id} className="flex items-center gap-4 p-2 border rounded-md">
                            <Checkbox 
                                id={doc.id}
                                checked={requiredDocs.some(d => d.id === doc.id)}
                                onCheckedChange={(checked) => handleStandardDocChange(doc, !!checked)}
                            />
                            <Label htmlFor={doc.id} className="flex-1">{doc.label}</Label>
                            {requiredDocs.some(d => d.id === doc.id) && (
                                <div className="flex items-center gap-2">
                                    <Label htmlFor={`${doc.id}-type`} className="text-sm">Digital Form</Label>
                                    <Switch 
                                        id={`${doc.id}-type`}
                                        checked={requiredDocs.find(d => d.id === doc.id)?.type === 'digital'}
                                        onCheckedChange={(isDigital) => handleDocTypeChange(doc.id, isDigital)}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <Label className="font-semibold">Custom Documents</Label>
                    {requiredDocs.filter(d => d.id.startsWith('custom_')).map(doc => (
                        <div key={doc.id} className="flex items-center gap-4 p-2 border rounded-md">
                           <span className="flex-1">{doc.label}</span>
                           <div className="flex items-center gap-2">
                                <Label htmlFor={`${doc.id}-type`} className="text-sm">Digital Form</Label>
                                <Switch 
                                    id={`${doc.id}-type`}
                                    checked={doc.type === 'digital'}
                                    onCheckedChange={(isDigital) => handleDocTypeChange(doc.id, isDigital)}
                                />
                            </div>
                           <Button variant="ghost" size="icon" onClick={() => removeDoc(doc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    ))}
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Enter custom document name" 
                            value={customDocLabel}
                            onChange={(e) => setCustomDocLabel(e.target.value)}
                        />
                        <Button type="button" onClick={addCustomDoc}>Add</Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
