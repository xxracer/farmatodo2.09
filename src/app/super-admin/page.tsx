
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, LogOut, Loader2, AlertCircle, Settings, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useTransition } from "react";
import { getCompanies, deleteCompany } from "@/app/actions/company-actions";
import { Company } from "@/lib/company-schemas";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SuperAdminPage() {
    const [clients, setClients] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const loadData = () => {
        setLoading(true);
        getCompanies().then(data => {
            setClients(data);
            setLoading(false);
        });
    }

    useEffect(() => {
        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, []);

    const handleDeleteClient = (id: string) => {
        if (confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
            startTransition(async () => {
                await deleteCompany(id);
                loadData(); // Re-fetch from local storage
            });
        }
    }
    
    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col items-center justify-center bg-muted/40">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading clients...</p>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                 <div className="flex items-center gap-2">
                    <User className="h-6 w-6" />
                    <h1 className="text-2xl font-bold font-headline">Super Admin Dashboard</h1>
                </div>
                 <div className="ml-auto flex items-center gap-2">
                     <Button asChild>
                        <Link href="/dashboard/settings">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Company
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
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
                        <CardTitle>Client Companies</CardTitle>
                        <CardDescription>
                            A list of all companies managed in the system. Add a new one or edit existing ones.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       {clients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg min-h-[200px]">
                                <AlertCircle className="h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-4 text-lg font-semibold">No Companies Found</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Click "Add New Company" to set up your first client.
                                </p>
                                 <Button asChild className="mt-4">
                                    <Link href="/dashboard/settings">Add New Company</Link>
                                </Button>
                            </div>
                       ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Company Name</TableHead>
                                        <TableHead>Created At</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {clients.map((client) => (
                                    <TableRow key={client.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            {client.logo && <Image src={client.logo} alt="logo" width={24} height={24} className="rounded-sm" />}
                                            {client.name}
                                        </TableCell>
                                        <TableCell>
                                           {client.created_at ? new Date(client.created_at).toLocaleDateString() : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href="/dashboard/settings">
                                                    <Settings className="mr-2 h-4 w-4" /> Edit
                                                </Link>
                                            </Button>
                                            <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleDeleteClient(client.id!)} disabled={isPending}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                       )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}

    