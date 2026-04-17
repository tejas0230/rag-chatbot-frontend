import { AuthWrapper } from "@/components/auth-wrapper"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DashboardSidebar } from "./dashboard-sidebar"
import { ProfileProvider } from "@/components/profile-provider"
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthWrapper redirectTo="/sign-in">
      <ProfileProvider>
        <SidebarProvider>
          <DashboardSidebar />
          <SidebarInset>
            <div className="flex-1 p-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </ProfileProvider>
    </AuthWrapper>
  )
}

