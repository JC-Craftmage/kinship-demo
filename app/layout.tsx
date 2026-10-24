import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/providers/theme-provider';
import "./globals.css";

export const metadata: Metadata = {
  title: "Kinship - Church Community App",
  description: "Your church family, connected. Automated coordination, frictionless engagement, meaningful community.",
  manifest: "/manifest.json",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  appleMobileWebAppCapable: "yes",
  appleMobileWebAppStatusBarStyle: "default",
  appleMobileWebAppTitle: "Kinship",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
