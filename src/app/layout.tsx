import type { Metadata } from "next";
import { SidebarProvider } from '@/components/SidebarContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: "Weva Workspace",
  description: "Weva Project Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div className="flex">
            <Sidebar />
            <div className="flex-1">
              <Header />
              <main className="p-6">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
