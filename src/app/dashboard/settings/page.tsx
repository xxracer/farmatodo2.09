
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Building, Save, PlusCircle, Trash2, Loader2, Eye, Workflow, FileQuestion, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { getCompanies, createOrUpdateCompany, deleteCompany } from "@/app/actions/company-actions";
import { type Company, type OnboardingProcess, type RequiredDoc } from "@/lib/company-schemas";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { generateId } from "@/lib/local-storage-client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// Helper to convert file to Base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const STANDARD_DOCS: RequiredDoc[] = [
    { id: 'i9', label: 'Form I-9', type: 'upload' },
    { id: 'w4', label: 'Form W-4', type: 'upload' },
    { id: 'proofOfIdentity', label: 'Proof of Identity (Govt. ID)', type: 'upload' },
    { id: 'educationalDiplomas', label: 'Educational Diplomas/Certificates', type: 'upload' },
    { id: 'proofOfAddress', label: 'Proof of Address', type: 'upload' },
];


export default function SettingsPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | 'new'>('new');
  const [companyForEdit, setCompanyForEdit] = useState<Partial<Company>>({});
  const [onboardingProcesses, setOnboardingProcesses] = useState<OnboardingProcess[]>([]);
  const [users, setUsers] = useState<{name: string, role: string, email: string}[]>([]);

  const loadAllCompanies = async () => {
    setIsLoading(true);
    try {
        const data = await getCompanies();
        setAllCompanies(data);
        if (data.length > 0) {
            // Select the first company by default if one exists
            setSelectedCompanyId(data[0].id!);
        } else {
            // Otherwise, set to create a new one
            setSelectedCompanyId('new');
        }
    } catch (error) {
        toast({ variant: 'destructive', title: "Failed to load companies", description: (error as Error).message });
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAllCompanies();

    const handleStorageChange = () => loadAllCompanies();
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }
  }, [toast]);


  // Effect to update the form when the selected company changes
  useEffect(() => {
    if (selectedCompanyId === 'new') {
        setCompanyForEdit({ name: '', onboardingProcesses: [] });
        setOnboardingProcesses([]);
    } else {
        const company = allCompanies.find(c => c.id === selectedCompanyId);
        if (company) {
            setCompanyForEdit(company);
            setOnboardingProcesses(company.onboardingProcesses || []);
        }
    }
  }, [selectedCompanyId, allCompanies]);

  
  const handleSaveCompany = () => {
      startTransition(async () => {
          if (!companyForEdit.name) {
              toast({ variant: 'destructive', title: "Validation Error", description: "Company name is required."});
              return;
          }
          
          try {
              const dataToSave: Partial<Company> = {
                  ...companyForEdit,
                  onboardingProcesses: onboardingProcesses,
              };
              
              const result = await createOrUpdateCompany(dataToSave);
  
              if (!result.success || !result.company) throw new Error("Failed to save company settings.");
              
              toast({ title: "Company Settings Saved", description: `Settings for ${result.company.name} have been saved.` });
              
              // Refresh all companies and select the one we just saved
              await loadAllCompanies();
              setSelectedCompanyId(result.company.id!);

          } catch (error) {
               toast({ variant: "destructive", title: "Save Failed", description: (error as Error).message });
          }
      });
  }

  const handleDeleteCurrentCompany = () => {
    if (selectedCompanyId === 'new') return;
     startTransition(async () => {
        await deleteCompany(selectedCompanyId);
        toast({ title: "Company Deleted", description: "The company has been removed."});
        await loadAllCompanies();
     });
  }

  const handleAddNewUser = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const name = formData.get('user-name') as string;
      const role = formData.get('user-role') as string;
      const email = formData.get('user-email') as string;
      
      if (!name || !role || !email) {
          toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill out all user fields.' });
          return;
      }
      
      const companyName = companyForEdit.name?.split(' ')[0].toLowerCase() || 'company';
      const random = Math.floor(1000 + Math.random() * 9000);
      const password = `${companyName}${random}`;

      setUsers(prev => [...prev, {name, role, email}]);
      toast({ title: `User Added (Simulated)`, description: `Password for ${name}: ${password}` });
      
      e.currentTarget.reset();
  };

  const handleLogoChange = async (file: File | null) => {
    if (file) {
        const base64Logo = await toBase64(file);
        setCompanyForEdit(prev => ({ ...prev, logo: base64Logo }));
    }
  };

  const handleAddNewProcess = () => {
    const newProcess: OnboardingProcess = {
        id: generateId(),
        name: `New Onboarding Process #${onboardingProcesses.length + 1}`,
        applicationForm: { id: generateId(), name: 'Default Application', type: 'template' },
        interviewScreen: { type: 'template', imageUrl: null },
        requiredDocs: [],
    };
    setOnboardingProcesses(prev => [...prev, newProcess]);
  };
  
  const handleUpdateProcessField = <K extends keyof OnboardingProcess>(processId: string, field: K, value: OnboardingProcess[K]) => {
      setOnboardingProcesses(prev => prev.map(p => p.id === processId ? { ...p, [field]: value } : p));
  };
  
  const handleUpdateNestedProcessField = (processId: string, topField: 'applicationForm' | 'interviewScreen', nestedField: string, value: any) => {
    setOnboardingProcesses(prev => prev.map(p => {
        if (p.id === processId) {
            return {
                ...p,
                [topField]: {
                    ...p[topField],
                    [nestedField]: value
                }
            };
        }
        return p;
    }));
  };
  
  const handleAddRequiredDoc = (processId: string, doc: RequiredDoc) => {
      const updatedProcesses = onboardingProcesses.map(p => {
          if (p.id === processId) {
              const existingDocs = p.requiredDocs || [];
              if (existingDocs.some(d => d.id === doc.id)) return p;
              return { ...p, requiredDocs: [...existingDocs, doc] };
          }
          return p;
      });
      setOnboardingProcesses(updatedProcesses);
  };
  
  const handleAddCustomDoc = (processId: string, docLabel: string) => {
      if (!docLabel) return;
      const docId = docLabel.toLowerCase().replace(/\s/g, '-') + `-${generateId()}`;
      const newDoc: RequiredDoc = { id: docId, label: docLabel, type: 'upload' };
      handleAddRequiredDoc(processId, newDoc);
  };


  const handleRemoveRequiredDoc = (processId: string, docId: string) => {
      const updatedProcesses = onboardingProcesses.map(p => {
          if (p.id === processId) {
              return { ...p, requiredDocs: p.requiredDocs?.filter(d => d.id !== docId) };
          }
          return p;
      });
      setOnboardingProcesses(updatedProcesses);
  };


  const handleDeleteProcess = (processId: string) => {
    if (window.confirm('Are you sure you want to delete this onboarding process? This change is temporary until you save.')) {
      setOnboardingProcesses(prev => prev.filter(p => p.id !== processId));
    }
  };

  const SaveButton = ({ onSave, isPending, size = "default", children }: { onSave: () => void, isPending: boolean, size?: "lg" | "default" | "sm" | "icon" | null, children: React.ReactNode}) => (
      <Button size={size} disabled={isPending} onClick={onSave}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {children}
      </Button>
  );


  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
                <Settings className="h-8 w-8 text-foreground" />
                <div>
                    <h1 className="text-3xl font-headline font-bold text-foreground">System Settings</h1>
                    <p className="text-muted-foreground">
                       Manage companies and their onboarding processes.
                    </p>
                </div>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Company Management</CardTitle>
                <CardDescription>Select a company to edit, or create a new one.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                 <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId} disabled={isPending}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Select a company..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="new">
                            <span className="flex items-center gap-2"><PlusCircle className="h-4 w-4" />Create New Company</span>
                        </SelectItem>
                        <Separator className="my-1" />
                        {allCompanies.map(company => (
                            <SelectItem key={company.id} value={company.id!}>{company.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 {selectedCompanyId !== 'new' && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isPending}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected Company
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete '{allCompanies.find(c => c.id === selectedCompanyId)?.name}' and all of its associated data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteCurrentCompany}>Confirm & Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </CardContent>
        </Card>

      {isLoading ? (
          <div className="flex flex-1 items-center justify-center p-10">
            <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
          </div>
      ) : (
        <>
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {selectedCompanyId === 'new' ? 'New Company Details' : 'Company Details'}
                    </div>
                    <SaveButton onSave={handleSaveCompany} isPending={isPending}>Save Company</SaveButton>
                </CardTitle>
                <CardDescription>Manage the company profile and associated onboarding users. Remember to save your changes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Side: Company Details */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="company-name">Company Name</Label>
                            <Input id="company-name" placeholder="e.g., Noble Health" value={companyForEdit.name || ''} onChange={(e) => setCompanyForEdit(prev => ({...prev, name: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-address">Address</Label>
                            <Input id="company-address" placeholder="123 Main St, Anytown, USA" value={companyForEdit.address || ''} onChange={(e) => setCompanyForEdit(prev => ({...prev, address: e.target.value}))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="company-phone">Phone Number</Label>
                                <Input id="company-phone" type="tel" value={companyForEdit.phone || ''} onChange={(e) => setCompanyForEdit(prev => ({...prev, phone: e.target.value}))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="company-fax">Fax</Label>
                                <Input id="company-fax" value={companyForEdit.fax || ''} onChange={(e) => setCompanyForEdit(prev => ({...prev, fax: e.target.value}))} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-email">Company Email</Label>
                            <Input id="company-email" type="email" value={companyForEdit.email || ''} onChange={(e) => setCompanyForEdit(prev => ({...prev, email: e.target.value}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company-logo">Company Logo</Label>
                            <div className="flex items-center gap-4">
                                <Input id="company-logo" type="file" className="max-w-xs" onChange={(e) => handleLogoChange(e.target.files?.[0] || null)} accept="image/*" />
                                {companyForEdit.logo && <Image src={companyForEdit.logo} alt="Logo Preview" width={40} height={40} className="rounded-sm object-contain" />}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Onboarding Users */}
                    <div className="space-y-4">
                        <Label className="font-semibold">Onboarding Users</Label>
                        <form onSubmit={handleAddNewUser} className="grid grid-cols-1 gap-4 items-end p-4 border rounded-md">
                            <div className="space-y-2">
                                <Label htmlFor="user-name">User Name</Label>
                                <Input id="user-name" name="user-name" placeholder="e.g., John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user-role">Role</Label>
                                <Input id="user-role" name="user-role" placeholder="e.g., HR Manager" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="user-email">Email</Label>
                                <Input id="user-email" name="user-email" type="email" placeholder="e.g., john.doe@company.com" />
                            </div>
                            <Button type="submit">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add User
                            </Button>
                        </form>
                        <div className="space-y-2">
                            {users.map((user, index) => (
                                <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                                <div>
                                    <p className="font-medium">{user.name} <span className="text-xs text-muted-foreground">({user.role})</span></p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setUsers(users.filter((_, i) => i !== index))}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                </CardContent>
            </Card>
      
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Workflow className="h-5 w-5" /> Onboarding Processes</CardTitle>
                    <CardDescription>Define reusable onboarding flows. Changes here must be saved to take effect.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Accordion type="multiple" className="w-full space-y-4">
                        {onboardingProcesses.map((process) => (
                            <AccordionItem key={process.id} value={process.id} className="border rounded-md p-4 bg-muted/20">
                                <AccordionTrigger className="w-full hover:no-underline -mb-2">
                                    <div className="flex items-center justify-between w-full">
                                    <Input 
                                        className="text-lg font-semibold border-none shadow-none -ml-3 p-2 focus-visible:ring-1 focus-visible:ring-ring bg-transparent"
                                        value={process.name}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleUpdateProcessField(process.id, 'name', e.target.value)}
                                    />
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pt-4 space-y-6">
                                    {/* Phase 1 Configuration */}
                                    <div className="p-4 border rounded-md bg-background/50 space-y-4">
                                    <h3 className="font-semibold">Phase 1: Application Form</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                        <div>
                                            <RadioGroup 
                                                value={process.applicationForm.type} 
                                                onValueChange={(val: 'template' | 'custom') => {
                                                    handleUpdateNestedProcessField(process.id, 'applicationForm', 'type', val)
                                                }}
                                                className="space-y-2 mt-2"
                                            >
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="template" id={`p1-template-${process.id}`} /><Label htmlFor={`p1-template-${process.id}`}>Default Template Form</Label></div>
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="custom" id={`p1-custom-${process.id}`} /><Label htmlFor={`p1-custom-${process.id}`}>Custom Uploaded Form</Label></div>
                                            </RadioGroup>
                                            {process.applicationForm.type === 'custom' && (
                                                <div className="mt-4 pt-4 border-t"><Label htmlFor={`form-images-${process.id}`}>Upload Form Pages (Images)</Label><Input id={`form-images-${process.id}`} type="file" multiple accept="image/*" className="mt-1" /></div>
                                            )}
                                        </div>
                                        <div className="flex justify-end items-center">
                                            <Button variant="outline" asChild><Link href="/dashboard/settings/preview/application" target="_blank"><Eye className="mr-2 h-4 w-4" />Preview Phase 1 Form</Link></Button>
                                        </div>
                                    </div>
                                    </div>

                                    {/* Phase 2 Configuration */}
                                    <div className="p-4 border rounded-md bg-background/50 space-y-4">
                                    <h3 className="font-semibold">Phase 2: Interview Screen</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                        <div>
                                            <RadioGroup 
                                                value={process.interviewScreen.type} 
                                                onValueChange={(val: 'template' | 'custom') => {
                                                    handleUpdateNestedProcessField(process.id, 'interviewScreen', 'type', val);
                                                }}
                                                className="space-y-2 mt-2"
                                            >
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="template" id={`p2-template-${process.id}`} /><Label htmlFor={`p2-template-${process.id}`}>Default Template</Label></div>
                                                <div className="flex items-center space-x-2"><RadioGroupItem value="custom" id={`p2-custom-${process.id}`} /><Label htmlFor={`p2-custom-${process.id}`}>Custom Background</Label></div>
                                            </RadioGroup>
                                            {process.interviewScreen.type === 'custom' && (
                                                <div className="mt-4 pt-4 border-t"><Label htmlFor={`interview-image-${process.id}`}>Upload Background Image</Label><Input id={`interview-image-${process.id}`} type="file" accept="image/*" className="mt-1" /></div>
                                            )}
                                        </div>
                                        <div className="flex justify-end items-center">
                                            <Button variant="outline" asChild><Link href="/dashboard/settings/preview/interview" target="_blank"><Eye className="mr-2 h-4 w-4" />Preview Phase 2 Screen</Link></Button>
                                        </div>
                                    </div>
                                    </div>
                                    
                                    {/* Phase 3 Configuration */}
                                    <div className="p-4 border rounded-md bg-background/50 space-y-4">
                                    <h3 className="font-semibold">Phase 3: Documentation</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                        <div className="space-y-4">
                                            <Label>Required Documents for this Process</Label>
                                            <div className="space-y-2">
                                            {(process.requiredDocs || []).map(doc => (
                                                <div key={doc.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                                                    <span>{doc.label}</span>
                                                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveRequiredDoc(process.id, doc.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                            {process.requiredDocs?.length === 0 && <p className="text-xs text-muted-foreground">No documents added yet.</p>}
                                            </div>
                                            
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button type="button" variant="outline" size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Document</Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80">
                                                    <div className="grid gap-4">
                                                        <h4 className="font-medium leading-none">Add Documents</h4>
                                                        <p className="text-sm text-muted-foreground">Select standard documents or add a custom one.</p>
                                                        <div className="space-y-2">
                                                            {STANDARD_DOCS.map(doc => (
                                                                <div key={doc.id} className="flex items-center justify-between">
                                                                    <Label htmlFor={`doc-${process.id}-${doc.id}`} className="font-normal flex items-center gap-2">
                                                                        <Checkbox 
                                                                            id={`doc-${process.id}-${doc.id}`}
                                                                            checked={(process.requiredDocs || []).some(d => d.id === doc.id)}
                                                                            onCheckedChange={(checked) => {
                                                                                if (checked) {
                                                                                    handleAddRequiredDoc(process.id, doc)
                                                                                } else {
                                                                                    handleRemoveRequiredDoc(process.id, doc.id)
                                                                                }
                                                                            }}
                                                                        />
                                                                        {doc.label}
                                                                    </Label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Separator />
                                                        <form onSubmit={(e) => {
                                                            e.preventDefault();
                                                            const input = e.currentTarget.elements.namedItem('custom-doc-label') as HTMLInputElement;
                                                            handleAddCustomDoc(process.id, input.value);
                                                            input.value = '';
                                                        }} className="flex gap-2">
                                                            <Input name="custom-doc-label" placeholder="Custom document name..." className="h-8" />
                                                            <Button type="submit" size="sm" className="h-8">Add</Button>
                                                        </form>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                        </div>
                                        <div className="flex justify-end items-center">
                                            <Button variant="outline" asChild><Link href="/dashboard/settings/preview/documentation" target="_blank"><Eye className="mr-2 h-4 w-4" />Preview Phase 3 Page</Link></Button>
                                        </div>
                                    </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4">
                                        <Button type="button" variant="destructive" size="sm" onClick={() => handleDeleteProcess(process.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete Process</Button>
                                        <SaveButton onSave={handleSaveCompany} isPending={isPending} size="sm">Save All Changes</SaveButton>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddNewProcess} disabled={selectedCompanyId === 'new'}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Onboarding Process
                    </Button>
                    {selectedCompanyId === 'new' && <p className="text-xs text-muted-foreground">You must save the company before adding onboarding processes.</p>}
                </CardContent>
            </Card>
        </>
      )}
    </form>
  );
}

    