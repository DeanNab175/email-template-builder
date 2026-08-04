import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/builder/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Northstar Email Studio",
  description:
    "Build responsive, accessible emails visually and export client-ready HTML.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
