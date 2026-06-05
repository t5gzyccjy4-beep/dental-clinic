import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { SidebarProvider } from '@/components/layout/SidebarContext'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-full">
        <Sidebar />
        <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
