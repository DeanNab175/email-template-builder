import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProviders } from "@/components/builder/app-providers";
import "./globals.css";

const themeInitializer = `
  try {
    const stored = localStorage.getItem("northstar-app-theme");
    const theme = stored === "light" || stored === "dark"
      ? stored
      : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {}
`;

export const metadata: Metadata = {
  title: "Northstar Email Studio",
  description:
    "Build responsive, accessible emails visually and export client-ready HTML.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
