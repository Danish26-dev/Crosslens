import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { GuidedTour } from "@/components/guided-tour";
import { Bell, Command, Search } from "lucide-react";
import { getCaseInfoFn } from "@/lib/api";

const caseInfoQueryOptions = queryOptions({
  queryKey: ["caseInfo"],
  queryFn: () => getCaseInfoFn(),
});

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · CrossLens" },
      { name: "description", content: "Trial workspace: cases, witnesses, evidence, timeline, and live contradiction detection." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(caseInfoQueryOptions);
  },
  component: DashboardLayout,
  errorComponent: ({ error }) => <div className="p-8 text-destructive">Error: {error.message}</div>,
  notFoundComponent: () => <div className="p-8">Dashboard not found.</div>,
});

function DashboardLayout() {
  const { data: caseInfo } = useSuspenseQuery(caseInfoQueryOptions);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/30">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-xl">
            <SidebarTrigger />
            <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
              <Link to="/" className="hover:text-foreground">CrossLens</Link>
              <span>/</span>
              <span className="text-foreground">{caseInfo.caption}</span>
              <span className="rounded-md border bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium">
                {caseInfo.docket}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-xs text-muted-foreground md:flex">
                <Search className="h-3.5 w-3.5" />
                <span>Search memory graph…</span>
                <span className="ml-4 inline-flex items-center gap-0.5 rounded border bg-muted px-1 text-[10px]">
                  <Command className="h-3 w-3" />K
                </span>
              </div>
              <button className="grid size-8 place-items-center rounded-md border bg-card text-muted-foreground transition-colors hover:text-foreground">
                <Bell className="h-4 w-4" />
              </button>
              <div className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                MC
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
          <GuidedTour />
        </div>
      </div>
    </SidebarProvider>
  );
}
