
'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, MoreHorizontal, LogOut } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

type ClientStatus = "Active" | "Inactive" | "Trial";
type ClientPlan = "Basic" | "Medium" | "Full";

type Client = {
    id: number;
    name: string;
    plan: ClientPlan;
    status: ClientStatus;
    endDate: string;
};

// This component now dynamically loads clients from localStorage
export default function SuperAdminPage() {
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        const savedSettings = localStorage.getItem('companySettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            const loadedClients = settings.companies.map((company: { name: string }, index: number) => ({
                id: index + 1,
                name: company.name,
                plan: "Medium", // Default or logic to determine plan
                status: "Active", // Default or logic to determine status
                endDate: "2024-12-31", // Default or logic to determine end date
            }));
            setClients(loadedClients);
        }
    }, []);

    const handlePlanChange = (clientId: number, newPlan: ClientPlan) => {
        setClients(clients.map(client => 
            client.id === clientId ? { ...client, plan: newPlan } : client
        ));
        // Note: This change is not persisted back to localStorage in this example.
        // A full solution would update the central settings store.
    };

    const handleStatusChange = (clientId: number, newStatus: ClientStatus) => {
        setClients(clients.map(client => 
            client.id === clientId ? { ...client, status: newStatus } : client
        ));
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                 <div className="flex items-center gap-2">
                    <User className="h-6 w-6" />
                    <h1 className="text-2xl font-bold font-headline">Super Admin Dashboard</h1>
                </div>
                 <div className="ml-auto flex items-center gap-2">
                    <Button asChild>
                        <Link href="/login">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Link>
                    </Button>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Clients</CardTitle>
                        <CardDescription>
                            A list of all clients configured in the settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Company Name</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Contract End</TableHead>
                                    <TableHead>
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={client.plan === "Full" ? "default" : "secondary"}>{client.plan}</Badge>
                                    </TableCell>
                                     <TableCell>
                                        <Badge variant={client.status === "Active" ? "outline" : client.status === "Trial" ? "secondary" : "destructive"}>{client.status}</Badge>
                                    </TableCell>
                                    <TableCell>{client.endDate}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>Change Plan</DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuItem onClick={() => handlePlanChange(client.id, 'Basic')}>Basic</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handlePlanChange(client.id, 'Medium')}>Medium</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handlePlanChange(client.id, 'Full')}>Full</DropdownMenuItem>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                {client.status === 'Active' ? (
                                                     <DropdownMenuItem className="text-destructive" onClick={() => handleStatusChange(client.id, 'Inactive')}>Terminate Contract</DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleStatusChange(client.id, 'Active')}>Reactivate Account</DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
