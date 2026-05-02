import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AccessibilityProvider } from "@/components/accessibility-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VocabVault — Master English Vocabulary",
    template: "%s | VocabVault",
  },
  description:
    "A structured, science-backed word acquisition system that takes you through ten cognitive stages per word — from first exposure to fluent spoken production.",
  keywords: [
    "vocabulary",
    "English",
    "IELTS",
    "learning",
    "education",
    "VocabVault",
    "word mastery",
  ],
  authors: [{ name: "TechWisdom Technologies" }],
  openGraph: {
    title: "VocabVault — Master English Vocabulary",
    description:
      "10-stage word mastery system for IELTS preparation and English fluency.",
    type: "website",
    siteName: "VocabVault",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider defaultTheme="system">
          <AccessibilityProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

