
'use client';

import { getEmployees, updateCandidateStatus, deleteCandidate } from "@/app/actions/client-actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationData, DocumentFile } from "@/lib/schemas";
import { Briefcase, UserPlus, Folder, User, Search, Trash2, Archive, Upload, Loader2, File as FileIcon } from "lucide-react";
import { useEffect, useState, useMemo, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AddLegacyEmployeeForm } from "./_components/add-legacy-employee-form";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationView } from "@/components/dashboard/application-view";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { uploadKvFile, deleteFile } from "@/app/actions/kv-actions";
import { format } from "date-fns";


type InactiveInfo = {
  date: Date;
  reason: 'Renunciation' | 'Termination' | 'Other';
  description: string;
}

function EmployeeList({ 
    employees, 
    onStatusChange, 
    onDelete, 
    onUpload,
    onDeleteFile,
    isUploading,
}: { 
    employees: ApplicationData[],
    onStatusChange: (id: string, info: InactiveInfo) => void,
    onDelete: (id: string) => void,
    onUpload: (employeeId: string, file: File, title: string, type: 'required' | 'misc') => void,
    onDeleteFile: (employeeId: string, fileId: string, type: 'required' | 'misc') => void,
    isUploading: boolean,
}) {
    const [isInactiveModalOpen, setInactiveModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [inactiveInfo, setInactiveInfo] = useState<{ date: Date | undefined, reason: string, description: string }>({ date: new Date(), reason: '', description: '' });
    const { toast } = useToast();

    // State for uploading new documents
    const [newDocFile, setNewDocFile] = useState<File | null>(null);
    const [newDocTitle, setNewDocTitle] = useState('');
    const [uploadTarget, setUploadTarget] = useState<{ employeeId: string; type: 'required' | 'misc' } | null>(null);
    const [activeAccordionItem, setActiveAccordionItem] = useState<string | null>(null);


    const openInactiveModal = (id: string) => {
        setSelectedEmployeeId(id);
        setInactiveModalOpen(true);
    };

    const handleInactiveSubmit = () => {
        if (!selectedEmployeeId || !inactiveInfo.date || !inactiveInfo.reason) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all fields.' });
            return;
        }
        onStatusChange(selectedEmployeeId, {
            date: inactiveInfo.date,
            reason: inactiveInfo.reason as InactiveInfo['reason'],
            description: inactiveInfo.description
        });
        setInactiveModalOpen(false);
        setSelectedEmployeeId(null);
    };
    
    const openDeleteConfirm = (id: string) => {
        setSelectedEmployeeId(id);
        setDeleteConfirmOpen(true);
    }
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setNewDocFile(e.target.files[0]);
        }
    };
    
    const handleUploadDocument = (employeeId: string, type: 'required' | 'misc') => {
        if (!newDocFile || !newDocTitle) {
            toast({ variant: 'destructive', title: 'Upload Failed', description: 'Please select a file and provide a title.'});
            return;
        }
        setUploadTarget({ employeeId, type });
        onUpload(employeeId, newDocFile, newDocTitle, type);
        setNewDocFile(null);
        setNewDocTitle('');
    };
    
    const isCurrentlyUploading = (employeeId: string, type: 'required' | 'misc') => {
      return isUploading && uploadTarget?.employeeId === employeeId && uploadTarget?.type === type;
    }


    return (
        <Accordion type="single" collapsible className="w-full" value={activeAccordionItem || undefined} onValueChange={setActiveAccordionItem}>
            {employees.map(employee => (
                <AccordionItem key={employee.id} value={employee.id}>
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                <span>{employee.firstName} {employee.lastName}</span>
                                <span className="text-xs text-muted-foreground">- {employee.position}</span>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="pl-8 pt-2 space-y-6">
                            <Accordion type="multiple" className="w-full" defaultValue={['details']}>
                                <AccordionItem value="details">
                                    <AccordionTrigger className="font-semibold"><Folder className="mr-2 h-5 w-5 text-primary" /> Employee Details</AccordionTrigger>
                                    <AccordionContent className="p-4 bg-muted/30 rounded-md">
                                        <ApplicationView data={employee} />
                                    </AccordionContent>
                                </AccordionItem>
                                
                                <AccordionItem value="required_docs">
                                    <AccordionTrigger className="font-semibold"><Folder className="mr-2 h-5 w-5 text-primary" /> Required Documents</AccordionTrigger>
                                    <AccordionContent className="p-4 bg-muted/30 rounded-md space-y-2">
                                        {employee.documents?.map((doc: DocumentFile) => (
                                            <div key={doc.id} className="flex items-center justify-between gap-2 text-sm hover:bg-muted/50 p-1 rounded-md">
                                                <a href={`/files/${encodeURIComponent(doc.id)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                                                    <FileIcon className="h-4 w-4" /> {doc.title}
                                                </a>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDeleteFile(employee.id, doc.id, 'required')}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                        {(!employee.documents || employee.documents.length === 0) && <p className="text-sm text-muted-foreground">No required documents uploaded.</p>}
                                        <div className="mt-4 pt-4 border-t space-y-2">
                                            <h4 className="font-medium">Upload New Required Document</h4>
                                            <Input placeholder="Document Title (e.g., Driver's License)" value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} />
                                            <Input type="file" onChange={handleFileChange} />
                                            <Button size="sm" onClick={() => handleUploadDocument(employee.id, 'required')} disabled={isCurrentlyUploading(employee.id, 'required')}>
                                                {isCurrentlyUploading(employee.id, 'required') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                                Upload
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="misc_docs">
                                    <AccordionTrigger className="font-semibold"><Folder className="mr-2 h-5 w-5 text-primary" /> Miscellaneous Documents</AccordionTrigger>
                                    <AccordionContent className="p-4 bg-muted/30 rounded-md space-y-2">
                                        {employee.miscDocuments?.map((doc: DocumentFile) => (
                                             <div key={doc.id} className="flex items-center justify-between gap-2 text-sm hover:bg-muted/50 p-1 rounded-md">
                                                <a href={`/files/${encodeURIComponent(doc.id)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                                                    <FileIcon className="h-4 w-4" /> {doc.title}
                                                </a>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDeleteFile(employee.id, doc.id, 'misc')}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        ))}
                                        {(!employee.miscDocuments || employee.miscDocuments.length === 0) && <p className="text-sm text-muted-foreground">No miscellaneous documents uploaded.</p>}
                                        <div className="mt-4 pt-4 border-t space-y-2">
                                            <h4 className="font-medium">Upload New Miscellaneous Document</h4>
                                            <Input placeholder="Document Title (e.g., Performance Review)" value={newDocTitle} onChange={e => setNewDocTitle(e.target.value)} />
                                            <Input type="file" onChange={handleFileChange} />
                                            <Button size="sm" onClick={() => handleUploadDocument(employee.id, 'misc')} disabled={isCurrentlyUploading(employee.id, 'misc')}>
                                                {isCurrentlyUploading(employee.id, 'misc') ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                                Upload
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <div className="flex gap-2 justify-end">
                                {employee.status !== 'inactive' ? (
                                    <Button variant="outline" onClick={() => openInactiveModal(employee.id)}>
                                        <Archive className="mr-2 h-4 w-4" />
                                        Mark as Inactive
                                    </Button>
                                ) : (
                                    <Button variant="destructive" onClick={() => openDeleteConfirm(employee.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Employee Data
                                    </Button>
                                )}
                            </div>
                        </div>
                    </AccordionContent>
                    <Dialog open={isInactiveModalOpen && selectedEmployeeId === employee.id} onOpenChange={setInactiveModalOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Mark Employee as Inactive</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Date of Change</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !inactiveInfo.date && "text-muted-foreground")}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {inactiveInfo.date ? format(inactiveInfo.date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar mode="single" selected={inactiveInfo.date} onSelect={(d) => setInactiveInfo(prev => ({ ...prev, date: d }))} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label>Reason for Inactivity</Label>
                                    <Select onValueChange={(value) => setInactiveInfo(prev => ({...prev, reason: value}))}>
                                        <SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Renunciation">Renunciation</SelectItem>
                                            <SelectItem value="Termination">Termination</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea placeholder="Add a description..." value={inactiveInfo.description} onChange={(e) => setInactiveInfo(prev => ({...prev, description: e.target.value}))} />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" onClick={() => setInactiveModalOpen(false)}>Cancel</Button>
                                    <Button onClick={handleInactiveSubmit}>Confirm</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <AlertDialog open={isDeleteConfirmOpen && selectedEmployeeId === employee.id} onOpenChange={setDeleteConfirmOpen}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete this employee's data?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the employee's data from the system.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setSelectedEmployeeId(null)}>NO</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                    if (selectedEmployeeId) onDelete(selectedEmployeeId);
                                    setSelectedEmployeeId(null);
                                }}>YES</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </AccordionItem>
            ))}
        </Accordion>
    );
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getEmployees();
    setEmployees(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    startTransition(() => {
        loadData();
    });
  }, [loadData]);
  
  const onEmployeeAdded = () => {
    setIsFormOpen(false);
    startTransition(() => {
        loadData();
    });
  }

  const handleStatusChange = async (id: string, info: InactiveInfo) => {
    startTransition(async () => {
        await updateCandidateStatus(id, 'inactive', info);
        toast({ title: 'Employee Updated', description: 'Status set to inactive.' });
        loadData();
    });
  }
  
  const handleDelete = async (id: string) => {
    startTransition(async () => {
        await deleteCandidate(id);
        toast({ title: 'Employee Deleted', description: 'All employee data has been removed.' });
        loadData();
    });
  }
  
  const handleUpload = async (employeeId: string, file: File, title: string, type: 'required' | 'misc') => {
      if (!file || !title) return;
      
      setIsUploading(true);
      toast({ title: 'Uploading...', description: 'Please wait while the file is uploaded.'});

      try {
          const fileName = `${employeeId}/${type}/${Date.now()}-${file.name}`;
          const fileKey = await uploadKvFile(file, fileName);
          
          startTransition(() => {
            loadData();
          });
          
          toast({ title: 'Upload Successful', description: `${title} has been added.`});

      } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: 'Upload Failed', description: 'Could not upload the file.'});
      } finally {
        setIsUploading(false);
      }
  }

  const handleDeleteFile = async (employeeId: string, fileId: string, type: 'required' | 'misc') => {
      if (!confirm("Are you sure you want to delete this document?")) return;

      toast({ title: 'Deleting...', description: 'Please wait while the file is deleted.'});
      try {
          await deleteFile(fileId);

          startTransition(() => {
            loadData();
          });
          toast({ title: 'File Deleted', description: 'The document has been removed.'});
      } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Could not delete the file.'});
      }
  }


  const { activeEmployees, inactiveEmployees } = useMemo(() => {
    const filtered = employees.filter(e => 
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return {
      activeEmployees: filtered.filter(e => e.status !== 'inactive'),
      inactiveEmployees: filtered.filter(e => e.status === 'inactive'),
    };
  }, [employees, searchTerm]);


  if (loading || isPending) {
    return (
         <div className="flex flex-1 items-center justify-center">
            <Briefcase className="h-12 w-12 text-muted-foreground animate-pulse" />
        </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold text-foreground">Employees</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Legacy Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Legacy Employee</DialogTitle>
                    <CardDescription>Upload an old employee's application PDF. The AI will extract their information.</CardDescription>
                </DialogHeader>
                <AddLegacyEmployeeForm onEmployeeAdded={onEmployeeAdded} />
            </DialogContent>
        </Dialog>
      </div>
      
       <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
              placeholder="Search employees by name..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active ({activeEmployees.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveEmployees.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <Card>
            <CardContent className="p-4">
               {activeEmployees.length > 0 ? (
                 <EmployeeList employees={activeEmployees} onStatusChange={handleStatusChange} onDelete={handleDelete} onUpload={handleUpload} onDeleteFile={handleDeleteFile} isUploading={isUploading} />
               ) : (
                  <div className="text-center py-10 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">No Active Employees</h3>
                      <p className="text-sm">New hires or legacy employees will appear here.</p>
                  </div>
               )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inactive">
           <Card>
            <CardContent className="p-4">
               {inactiveEmployees.length > 0 ? (
                 <EmployeeList employees={inactiveEmployees} onStatusChange={handleStatusChange} onDelete={handleDelete} onUpload={handleUpload} onDeleteFile={handleDeleteFile} isUploading={isUploading} />
               ) : (
                  <div className="text-center py-10 text-muted-foreground">
                      <Archive className="h-12 w-12 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold">No Inactive Employees</h3>
                      <p className="text-sm">Employees marked as inactive will be listed here.</p>
                  </div>
               )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
