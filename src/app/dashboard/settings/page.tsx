
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Building, Save, FileText, PlusCircle, Trash2, Loader2, Eye, Image as ImageIcon, Users, Workflow } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { getCompanies, createOrUpdateCompany, deleteCompany } from "@/app/actions/company-actions";
import { type Company, type RequiredDoc } from "@/lib/company-schemas";
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

export default function SettingsPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  // State for multiple companies
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Partial<Company> | null>(null);

  // State for adding/editing a company
  const [companyForEdit, setCompanyForEdit] = useState<Partial<Company>>({});
  
  // State for managing application forms for a company
  const [appForms, setAppForms] = useState<{ id: string, name: string, type: 'template' | 'custom', images?: string[] }[]>([]);

  // State for users
  const [users, setUsers] = useState<{name: string, role: string, email: string}[]>([]);


  // Load all companies from localStorage on component mount
  useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        try {
            const data = await getCompanies();
            setCompanies(data);
            if (data.length > 0) {
                // Select the first company by default
                setSelectedCompany(data[0]);
                setCompanyForEdit(data[0]);
                setAppForms(data[0].applicationForms || [{ id: 'default', name: 'Default Application', type: 'template' }]);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: "Failed to load settings", description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    }
    loadData();

    window.addEventListener('storage', loadData);
    return () => {
        window.removeEventListener('storage', loadData);
    }
  }, [toast]);
  
  const handleSaveCompany = (e: React.FormEvent) => {
      e.preventDefault();
      startTransition(async () => {
          if (!companyForEdit.name) {
              toast({ variant: 'destructive', title: "Validation Error", description: "Company name is required."});
              return;
          }
          
          try {
              const dataToSave: Partial<Company> = {
                  ...companyForEdit,
                  applicationForms: appForms,
              };
              
              const result = await createOrUpdateCompany(dataToSave);
  
              if (!result.success || !result.company) throw new Error("Failed to save company settings.");
              
              // Refresh company list
              const updatedCompanies = await getCompanies();
              setCompanies(updatedCompanies);
              setSelectedCompany(result.company);

              toast({ title: "Settings Saved", description: "Company settings have been updated." });
          } catch (error) {
               toast({ variant: "destructive", title: "Save Failed", description: (error as Error).message });
          }
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
      
      // Reset form fields
      e.currentTarget.reset();
  };

  const handleLogoChange = async (file: File | null) => {
    if (file) {
        const base64Logo = await toBase64(file);
        setCompanyForEdit(prev => ({ ...prev, logo: base64Logo }));
    }
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
    <form onSubmit={handleSaveCompany} className="space-y-6">
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
                <Settings className="h-8 w-8 text-foreground" />
                <div>
                    <h1 className="text-3xl font-headline font-bold text-foreground">System Settings</h1>
                    <p className="text-muted-foreground">
                        Manage companies, users, and onboarding processes here.
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
            Company & User Management
          </CardTitle>
          <CardDescription>Manage all companies and the users responsible for the onboarding process.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side: Company Details */}
              <div className="space-y-4">
                  <Label className="font-semibold text-lg">Company Details</Label>
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
                  <div className="flex gap-2">
                      <Button type="button" onClick={() => toast({title: "Feature coming soon"})}>
                          <PlusCircle className="mr-2 h-4 w-4" /> Add New Company
                      </Button>
                  </div>
              </div>

              {/* Right Side: Onboarding Users */}
              <div className="space-y-4">
                  <Label className="font-semibold text-lg">Onboarding Users</Label>
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
                <CardTitle className="flex items-center gap-2"><Workflow className="h-5 w-5" /> Onboarding Process</CardTitle>
                <CardDescription>Customize the application forms and document requirements for this company.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {appForms.map((form, index) => (
                    <div key={form.id} className="p-4 border rounded-md">
                        <Input 
                          className="text-lg font-semibold border-none shadow-none -ml-3 mb-2 focus-visible:ring-1 focus-visible:ring-ring"
                          value={form.name}
                          onChange={(e) => {
                              const newForms = [...appForms];
                              newForms[index].name = e.target.value;
                              setAppForms(newForms);
                          }}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                             <div>
                                 <Label>Application Form Type</Label>
                                 <RadioGroup 
                                    value={form.type} 
                                    onValueChange={(val: 'template' | 'custom') => {
                                        const newForms = [...appForms];
                                        newForms[index].type = val;
                                        setAppForms(newForms);
                                    }}
                                    className="space-y-2 mt-2"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="template" id={`template-${form.id}`} />
                                        <Label htmlFor={`template-${form.id}`}>Default Template Form</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="custom" id={`custom-${form.id}`} />
                                        <Label htmlFor={`custom-${form.id}`}>Custom Uploaded Form</Label>
                                    </div>
                                </RadioGroup>
                                 {form.type === 'custom' && (
                                     <div className="mt-4 pt-4 border-t">
                                        <Label htmlFor={`form-images-${form.id}`}>Upload Form Pages (Images/PDF)</Label>
                                        <Input id={`form-images-${form.id}`} type="file" multiple accept="image/*,.pdf" className="mt-1" />
                                     </div>
                                 )}
                             </div>
                             <div className="flex justify-end items-center">
                                 <Button variant="outline" asChild>
                                    <Link href="/dashboard/settings/preview/application" target="_blank">
                                        <Eye className="mr-2 h-4 w-4" />
                                        Preview Form
                                    </Link>
                                </Button>
                             </div>
                        </div>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => setAppForms([...appForms, {id: `form_${Date.now()}`, name: 'New Application Form', type: 'template'}])}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Application Form
                </Button>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" />Phase 2: Interview</CardTitle>
                <CardDescription>Customize the background image for the interview review screen.</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div>
                        <Label>Interview Screen Style</Label>
                        <RadioGroup 
                            value={companyForEdit.interviewImage ? 'custom' : 'template'} 
                            onValueChange={(value) => {
                                if (value === 'template') {
                                    setCompanyForEdit(prev => ({...prev, interviewImage: null}));
                                }
                            }}
                            className="space-y-2 mt-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="template" id="p2-template" />
                                <Label htmlFor="p2-template">Default Template</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="custom" id="p2-custom" />
                                <Label htmlFor="p2-custom">Custom Background</Label>
                            </div>
                        </RadioGroup>
                        
                        {companyForEdit.interviewImage !== null && (
                            <div className="mt-4 pt-4 border-t space-y-2">
                                <Label htmlFor="interview-image">Upload Background Image</Label>
                                <Input id="interview-image" type="file" accept="image/*" />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end items-center">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/settings/preview/interview" target="_blank">
                                <Eye className="mr-2 h-4 w-4" />
                                {companyForEdit.interviewImage ? "Preview Custom Screen" : "Preview Template Screen"}
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
