
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  ClipboardCheck,
  LayoutGrid,
  Users,
  Settings,
  LogOut,
  User,
  UserCheck,
  Briefcase,
  FileClock,
  BookOpenCheck,
  Files,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { checkForExpiringDocuments } from "@/app/actions/client-actions";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [showAlert, setShowAlert] = useState(false);

  const checkDocs = useCallback(async () => {
    const hasExpiring = await checkForExpiringDocuments();
    setShowAlert(hasExpiring);
  }, []);

  useEffect(() => {
    checkDocs();
    
    // Check on navigation changes and storage updates
    window.addEventListener('storage', checkDocs);
    const interval = setInterval(checkDocs, 5 * 60 * 1000); // Poll every 5 minutes

    return () => {
      window.removeEventListener('storage', checkDocs);
      clearInterval(interval);
    };
  }, [pathname, checkDocs]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <ClipboardCheck className="size-7 text-primary" />
          <span className="font-headline text-xl font-bold">Onboard Panel</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard"}
              tooltip="Dashboard"
            >
              <Link href="/dashboard">
                <LayoutGrid />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/dashboard/candidates")}
              tooltip="Candidates"
            >
              <Link href="/dashboard/candidates">
                <Users />
                <span>Candidates</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/dashboard/new-hires")}
              tooltip="New Hires"
            >
              <Link href="/dashboard/new-hires">
                <UserCheck />
                <span>New Hires</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/dashboard/employees")}
              tooltip="Employees"
            >
              <Link href="/dashboard/employees">
                <Briefcase />
                <span>Employees</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/dashboard/expiring-documentation")}
              tooltip="Expiring Documentation"
            >
              <Link href="/dashboard/expiring-documentation" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <FileClock />
                    <span>Expiring Docs</span>
                </div>
                {showAlert && <AlertTriangle className="h-4 w-4 text-yellow-400 animate-pulse" />}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/dashboard/in-services")}
              tooltip="In-Services"
            >
              <Link href="/dashboard/in-services">
                <BookOpenCheck />
                <span>In-Services</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/dashboard/misc-documents")}
              tooltip="Misc Documents"
            >
              <Link href="/dashboard/misc-documents">
                <Files />
                <span>Misc Docs</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/dashboard/settings")}
              tooltip="Settings"
            >
              <Link href="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Profile">
              <Link href="#">
                <User />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
              <Link href="/login">
                <LogOut />
                <span>Logout</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
