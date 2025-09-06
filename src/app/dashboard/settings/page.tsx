
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
import { FormItem } from "@/components/ui/form";

// Helper to convert file to Base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

type EditableCompany = Partial<Company>;

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

  // State for company identity
  const [companyType, setCompanyType] = useState('one');
  const [companies, setCompanies] = useState<EditableCompany[]>([{}]);
  
  // State for customization settings, tied to the first company for now
  const [requiredDocs, setRequiredDocs] = useState<RequiredDoc[]>([]);
  const [customDocLabel, setCustomDocLabel] = useState("");


  // Load companies from Supabase on component mount
  useEffect(() => {
    setIsLoading(true);
    getCompanies().then(async (data) => {
      if (data && data.length > 0) {
        const companiesWithSignedUrls = await Promise.all(data.map(async (c) => {
            if (c.logo && !c.logo.startsWith('http')) {
                 const { data: signedUrlData } = await supabase.storage.from('logos').createSignedUrl(c.logo, 3600);
                 return { ...c, logo: signedUrlData?.signedUrl || c.logo };
            }
            return c;
        }));

        setCompanies(companiesWithSignedUrls);
        setCompanyType(data.length > 1 ? 'multiple' : 'one');
        
        const firstCompany = companiesWithSignedUrls[0];
        setRequiredDocs(firstCompany.requiredDocs || []);

      } else {
        setCompanies([{}]);
      }
      setIsLoading(false);
    });
  }, []);

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
        const companiesToSave = companyType === 'one' ? companies.slice(0, 1) : companies;
        
        for (const [index, company] of companiesToSave.entries()) {
             if (!company.name) {
                toast({ variant: "destructive", title: "Validation Error", description: `Company name is required for Company #${index + 1}.`});
                return;
            }
            
            try {
                // Save only identity fields
                const identityData = {
                    id: company.id,
                    name: company.name,
                    logo: company.logo,
                    address: company.address,
                    phone: company.phone,
                    fax: company.fax,
                };
                const result = await createOrUpdateCompany(identityData);
                if (!result.success || !result.company) throw new Error("Failed to save company identity.");
                
                 setCompanies(prevCompanies => {
                    const newCompanies = [...prevCompanies];
                    const foundIndex = newCompanies.findIndex(c => c.id === result.company!.id || (!c.id && c.name === result.company!.name));
                    newCompanies[foundIndex !== -1 ? foundIndex : index] = { ...prevCompanies[foundIndex !== -1 ? foundIndex : index], ...result.company!};
                    return newCompanies;
                 });

            } catch (error) {
                 toast({ variant: "destructive", title: "Save Failed", description: (error as Error).message });
                 return;
            }
        }
        toast({ title: "Company Identity Saved", description: "Your company details have been updated." });
    });
  };

  const handleSaveDocumentation = (e: React.FormEvent) => {
      e.preventDefault();
      startTransition(async () => {
        if (!companies.length || !companies[0].id) {
            toast({ variant: "destructive", title: "Save Company First", description: "Please save company identity before customizing." });
            return;
        }

        const firstCompany = companies[0];
        const documentationData: Partial<Company> = {
            id: firstCompany.id,
            requiredDocs,
        };

        try {
            const result = await createOrUpdateCompany(documentationData);
            if (!result.success) throw new Error("Failed to save documentation settings.");
            toast({ title: "Documentation Settings Saved", description: "Your required documents have been updated." });
        } catch (error) {
            toast({ variant: "destructive", title: "Save Failed", description: (error as Error).message });
        }
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
    setCompanies([...companies, { name: '', logo: null, address: '', phone: '', fax: '' }]);
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

  const handleCompanyFieldChange = (index: number, field: keyof EditableCompany, value: string) => {
    const newCompanies = [...companies];
    (newCompanies[index] as any)[field] = value;
    setCompanies(newCompanies);
  };
    
    const handleStandardDocChange = (doc: Omit<RequiredDoc, 'type'>, checked: boolean) => {
        if (checked) {
            // All documents are now 'upload' type
            setRequiredDocs([...requiredDocs, { ...doc, type: 'upload' }]);
        } else {
            setRequiredDocs(requiredDocs.filter(d => d.id !== doc.id));
        }
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
        Customize the application portal for your company. Each section saves independently.
      </p>

      <form onSubmit={handleSaveIdentity}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Identity
            </CardTitle>
            <CardDescription>Set your company's name, logo, and contact information. This is shared across all application materials.</CardDescription>
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
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor={`company-name-${index}`}>Company Name</Label>
                            <Input id={`company-name-${index}`} placeholder="e.g., Noble Health" value={company.name || ''} onChange={(e) => handleCompanyFieldChange(index, 'name', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor={`company-logo-${index}`}>Company Logo</Label>
                            <div className="flex items-center gap-4">
                                <Input id={`company-logo-${index}`} type="file" className="max-w-xs" onChange={(e) => handleLogoChange(index, e.target.files?.[0] || null)} accept="image/*" />
                                {company.logo && <Image src={company.logo} alt="Logo Preview" width={40} height={40} className="rounded-sm object-contain" />}
                            </div>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label htmlFor={`company-address-${index}`}>Address</Label>
                        <Input id={`company-address-${index}`} placeholder="123 Health St, Suite 100" value={company.address || ''} onChange={(e) => handleCompanyFieldChange(index, 'address', e.target.value)} />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor={`company-phone-${index}`}>Phone Number</Label>
                            <Input id={`company-phone-${index}`} placeholder="(555) 123-4567" value={company.phone || ''} onChange={(e) => handleCompanyFieldChange(index, 'phone', e.target.value)} />
                         </div>
                          <div className="space-y-2">
                            <Label htmlFor={`company-fax-${index}`}>Fax Number</Label>
                            <Input id={`company-fax-${index}`} placeholder="(555) 123-4568" value={company.fax || ''} onChange={(e) => handleCompanyFieldChange(index, 'fax', e.target.value)} />
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
            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Identity
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
      
      <form onSubmit={handleSaveDocumentation}>
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Required Documentation</CardTitle>
                <CardDescription>Select the official documents candidates must download, fill, and upload. The AI will use this list to detect missing items.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                           <Button variant="ghost" size="icon" onClick={() => removeDoc(doc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
                 <div className="mt-6 flex justify-end">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Documentation Settings
                    </Button>
                </div>
            </CardContent>
        </Card>

      </form>
    </div>
  );
}
