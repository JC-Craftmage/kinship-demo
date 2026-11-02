import type { Metadata, Viewport } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/providers/theme-provider';
import "./globals.css";

export const metadata: Metadata = {
  title: "Kinship - Church Community App",
  description: "Your church family, connected. Automated coordination, frictionless engagement, meaningful community.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kinship",
  },
};

// Next.js 15 deprecated `viewport` inside `metadata` — it must be its own
// export, or the build prints an "Unsupported metadata viewport" warning on
// every page. The values are unchanged from the original.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
