// src/app/layout.tsx
"use client";
import '@/app/globals.css';
import { AuthProvider } from "@/context/AuthContext"; // Adjust the import path if necessary

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
