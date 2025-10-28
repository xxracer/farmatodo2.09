
'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShieldCheck, PlayCircle, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Mock Data
const mockEmployees = [
  { id: '1', name: 'John Doe', position: 'RN', location: 'Miami, FL', status: 'green', lastSweep: '2024-05-15', nextSweep: '2024-06-15', license: true },
  { id: '2', name: 'Jane Smith', position: 'Caregiver', location: 'New York, NY', status: 'amber', lastSweep: '2024-04-20', nextSweep: '2024-05-20', license: false },
  { id: '3', name: 'Peter Jones', position: 'LVN', location: 'Austin, TX', status: 'red', lastSweep: '2024-05-10', nextSweep: '2024-06-10', license: true },
  { id: '4', name: 'Mary Johnson', position: 'Office Staff', location: 'Chicago, IL', status: 'green', lastSweep: '2024-05-18', nextSweep: '2024-06-18', license: false },
];

const mockHistory = [
    { id: 'h1', timestamp: '2024-05-15 10:30 AM', executedBy: 'Admin', result: 'Clean', evidenceUrl: '#', hash: 'a1b2c3d4...' },
    { id: 'h2', timestamp: '2024-04-15 09:00 AM', executedBy: 'Admin', result: 'Clean', evidenceUrl: '#', hash: 'e5f6g7h8...' },
];

const StatusBadge = ({ status }: { status: 'green' | 'amber' | 'red' }) => {
    const variants = {
        green: { icon: <CheckCircle className="h-3 w-3" />, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", label: "Clean" },
        amber: { icon: <AlertCircle className="h-3 w-3" />, color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", label: "Needs Review" },
        red: { icon: <XCircle className="h-3 w-3" />, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", label: "Match Found" },
    };
    const { icon, color, label } = variants[status];
    return <Badge className={`gap-1 ${color}`}>{icon} {label}</Badge>
}

export default function ComplianceCheckPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(mockEmployees[0].id);
    const { toast } = useToast();

    const filteredEmployees = mockEmployees.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const activeEmployee = mockEmployees.find(emp => emp.id === activeEmployeeId);

    const handleRunSweep = () => {
        if (!activeEmployee) return;
        toast({
            title: `National Sweep Initiated`,
            description: `Checks are now running for ${activeEmployee.name}.`,
        });
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-headline font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-8 w-8" />
                Compliance Check
            </h1>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Employee Workflow</CardTitle>
                            <CardDescription>Search, filter, and manage employee compliance checks.</CardDescription>
                        </div>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search employees..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Work Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last National Sweep</TableHead>
                                <TableHead>Next Scheduled</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.map(emp => (
                                <TableRow key={emp.id} className={`cursor-pointer ${activeEmployeeId === emp.id ? 'bg-muted/50' : ''}`} onClick={() => setActiveEmployeeId(emp.id)}>
                                    <TableCell className="font-medium">{emp.name}</TableCell>
                                    <TableCell>{emp.position}</TableCell>
                                    <TableCell>{emp.location}</TableCell>
                                    <TableCell><StatusBadge status={emp.status as any} /></TableCell>
                                    <TableCell>{emp.lastSweep}</TableCell>
                                    <TableCell>{emp.nextSweep}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setActiveEmployeeId(emp.id); }}>View Panel</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {activeEmployee && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Sanctions & Licensure Panel: {activeEmployee.name}</CardTitle>
                        <CardDescription>Run new checks, manage monitoring settings, and view historical results.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" defaultValue={['sweep', 'monitoring']} className="w-full space-y-4">
                            {/* Section A: One-Click National Sweep */}
                            <AccordionItem value="sweep" className="border rounded-lg p-4">
                                <AccordionTrigger className="font-semibold text-lg hover:no-underline -mb-2">A) One-Click National Sweep</AccordionTrigger>
                                <AccordionContent className="pt-6 space-y-6">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                        <Button size="lg" onClick={handleRunSweep}>
                                            <PlayCircle className="mr-2 h-5 w-5" />
                                            Run National Sweep
                                        </Button>
                                        <div className="flex flex-wrap gap-x-6 gap-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Switch id="oig-leie" defaultChecked />
                                                <Label htmlFor="oig-leie">OIG LEIE</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Switch id="sam-gov" defaultChecked />
                                                <Label htmlFor="sam-gov">SAM.gov</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Switch id="nsopw" defaultChecked />
                                                <Label htmlFor="nsopw">NSOPW</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Switch id="nursys" defaultChecked={activeEmployee.license} disabled={!activeEmployee.license} />
                                                <Label htmlFor="nursys" className={!activeEmployee.license ? "text-muted-foreground" : ""}>Nursys</Label>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">This check runs immediately. Results will be attached to this employee's file.</p>
                                    {!activeEmployee.license && <p className="text-xs text-yellow-600">Add license number to enable Nursys check.</p>}
                                </AccordionContent>
                            </AccordionItem>

                            {/* Section B: Monitoring & History */}
                             <AccordionItem value="monitoring" className="border rounded-lg p-4">
                                <AccordionTrigger className="font-semibold text-lg hover:no-underline -mb-2">B) Monitoring & History</AccordionTrigger>
                                <AccordionContent className="pt-6 space-y-6">
                                     <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">Monitoring Settings</CardTitle>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <Label>LEIE</Label>
                                                <Select defaultValue="monthly">
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent><SelectItem value="monthly">Monthly</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>SAM.gov</Label>
                                                <Select defaultValue="monthly">
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="monthly">Monthly</SelectItem>
                                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>NSOPW</Label>
                                                <Select defaultValue="annually">
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent><SelectItem value="annually">On-Hire + Annually</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>License</Label>
                                                <Select defaultValue="monthly-expiry" disabled={!activeEmployee.license}>
                                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                                    <SelectContent><SelectItem value="monthly-expiry">Auto Monthly until Expiry</SelectItem></SelectContent>
                                                </Select>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-base">History</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Timestamp</TableHead>
                                                        <TableHead>Executed By</TableHead>
                                                        <TableHead>Result</TableHead>
                                                        <TableHead className="text-right">Evidence</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {mockHistory.map(h => (
                                                        <TableRow key={h.id}>
                                                            <TableCell className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> {h.timestamp}</TableCell>
                                                            <TableCell>{h.executedBy}</TableCell>
                                                            <TableCell>{h.result}</TableCell>
                                                            <TableCell className="text-right"><Button variant="link" size="sm" asChild><a href={h.evidenceUrl}>View (PDF)</a></Button></TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </CardContent>
                                    </Card>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                 </Card>
            )}
        </div>
    );
}
