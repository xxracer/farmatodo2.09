
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, PlusCircle, MoreHorizontal, LogOut } from "lucide-react";
import Link from "next/link";


const clients = [
    {
        name: "Noble Health",
        plan: "Medium",
        status: "Active",
        endDate: "2024-12-31",
    },
    {
        name: "Central Lifecare",
        plan: "Full",
        status: "Active",
        endDate: "2025-06-30",
    },
    {
        name: "Innovate Inc.",
        plan: "Basic",
        status: "Trial",
        endDate: "2024-08-15",
    },
    {
        name: "Tech Solutions LLC",
        plan: "Full",
        status: "Inactive",
        endDate: "2024-05-31",
    },
]

export default function SuperAdminPage() {
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
                 <div className="flex items-center">
                    <div className="ml-auto flex items-center gap-2">
                    <Button size="sm" className="h-8 gap-1">
                        <PlusCircle className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Add Client
                        </span>
                    </Button>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Clients</CardTitle>
                        <CardDescription>
                            A list of all clients using Clear Comply HR.
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
                                <TableRow key={client.name}>
                                    <TableCell className="font-medium">{client.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={client.plan === "Full" ? "default" : "secondary"}>{client.plan}</Badge>
                                    </TableCell>
                                     <TableCell>
                                        <Badge variant={client.status === "Active" ? "outline" : "destructive"}>{client.status}</Badge>
                                    </TableCell>
                                    <TableCell>{client.endDate}</TableCell>
                                    <TableCell>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
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
