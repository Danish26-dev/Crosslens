import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Clock,
  AlertTriangle,
  Radio,
  Settings,
  Brain,
  UploadCloud,
  Sparkles,
} from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const primary = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "Ingestion", url: "/dashboard/ingest", icon: UploadCloud },
  { title: "Ask CrossLens", url: "/dashboard/ask", icon: Sparkles },
  { title: "Live Testimony", url: "/dashboard/live", icon: Radio },
  { title: "Contradictions", url: "/dashboard/contradictions", icon: AlertTriangle },
  { title: "Memory", url: "/dashboard/memory", icon: Brain },
];

const research = [
  { title: "Cases", url: "/dashboard/cases", icon: Briefcase },
  { title: "Witnesses", url: "/dashboard/witnesses", icon: Users },
  { title: "Evidence", url: "/dashboard/evidence", icon: FileText },
  { title: "Timeline", url: "/dashboard/timeline", icon: Clock },
];

const system = [{ title: "Settings", url: "/dashboard/settings", icon: Settings }];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (url: string, exact?: boolean) =>
    exact ? pathname === url : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <Link to="/" className="px-2 py-2">
          <BrandLogo size="sm" showSubtitle />
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Trial</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={isActive(i.url, i.exact)} tooltip={i.title}>
                    <Link to={i.url} className="flex items-center gap-2">
                      <i.icon className="h-4 w-4" />
                      <span>{i.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Research</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {research.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={isActive(i.url)} tooltip={i.title}>
                    <Link to={i.url} className="flex items-center gap-2">
                      <i.icon className="h-4 w-4" />
                      <span>{i.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {system.map((i) => (
                <SidebarMenuItem key={i.url}>
                  <SidebarMenuButton asChild isActive={isActive(i.url)} tooltip={i.title}>
                    <Link to={i.url} className="flex items-center gap-2">
                      <i.icon className="h-4 w-4" />
                      <span>{i.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
