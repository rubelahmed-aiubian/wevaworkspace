import type { Metadata } from "next";
import './globals.css';

export const metadata: Metadata = {
  title: "Weva Workspace",
  description: "Weva Project Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}