
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Building, Save, FileText, PlusCircle, Trash2, Loader2 } from "lucide-react";
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

  // State for the primary company being edited
  const [company, setCompany] = useState<Partial<Company>>({});
  
  // State for documentation settings
  const [requiredDocs, setRequiredDocs] = useState<RequiredDoc[]>([]);
  const [customDocLabel, setCustomDocLabel] = useState("");


  // Load the first company from Supabase on component mount
  useEffect(() => {
    setIsLoading(true);
    getCompanies().then(async (data) => {
      let activeCompany: Partial<Company> = {};
      if (data && data.length > 0) {
        activeCompany = data[0]; // Always edit the first company on this page
        if (activeCompany.logo && !activeCompany.logo.startsWith('http')) {
             const { data: signedUrlData } = await supabase.storage.from('logos').createSignedUrl(activeCompany.logo, 3600);
             activeCompany.logo = signedUrlData?.signedUrl || activeCompany.logo;
        }
      }
      setCompany(activeCompany);
      setRequiredDocs(activeCompany.requiredDocs || []);
      setIsLoading(false);
    });
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
        if (!company.name) {
            toast({ variant: "destructive", title: "Validation Error", description: `Company name is required.`});
            return;
        }
        
        try {
            const dataToSave: Partial<Company> = {
                ...company,
                requiredDocs,
            };

            const result = await createOrUpdateCompany(dataToSave);
            if (!result.success || !result.company) throw new Error("Failed to save company settings.");
            
            // Update local state with the returned data, including new ID and signed URL for logo
            setCompany(result.company);
            setRequiredDocs(result.company.requiredDocs || []);

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

  const handleCompanyFieldChange = (field: keyof Company, value: string) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  };
    
    const handleStandardDocChange = (doc: Omit<RequiredDoc, 'type'>, checked: boolean) => {
        setRequiredDocs(prevDocs => {
            if (checked) {
                // All documents are now 'upload' type
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
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-foreground" />
        <h1 className="text-3xl font-headline font-bold text-foreground">Company Settings</h1>
      </div>
      <p className="text-muted-foreground">
        Manage your company profile and documentation requirements here.
      </p>

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
           <div className="space-y-2">
              <Label htmlFor="company-address">Address</Label>
              <Input id="company-address" placeholder="123 Health St, Suite 100" value={company.address || ''} onChange={(e) => handleCompanyFieldChange('address', e.target.value)} />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label htmlFor="company-phone">Phone Number</Label>
                  <Input id="company-phone" placeholder="(555) 123-4567" value={company.phone || ''} onChange={(e) => handleCompanyFieldChange('phone', e.target.value)} />
               </div>
                <div className="space-y-2">
                  <Label htmlFor="company-fax">Fax Number</Label>
                  <Input id="company-fax" placeholder="(555) 123-4568" value={company.fax || ''} onChange={(e) => handleCompanyFieldChange('fax', e.target.value)} />
               </div>
           </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Required Documentation</CardTitle>
              <CardDescription>Select the official documents candidates must download, fill, and upload.</CardDescription>
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
          </CardContent>
      </Card>

      <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save All Settings
          </Button>
      </div>
    </form>
  );
}

    