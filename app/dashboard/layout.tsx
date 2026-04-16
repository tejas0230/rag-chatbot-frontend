import { AuthWrapper } from "@/components/auth-wrapper"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "./dashboard-sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper redirectTo="/sign-in">
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset>
          <div className="flex-1 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AuthWrapper>
  )
}

