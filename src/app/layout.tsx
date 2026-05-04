import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: {
    template: "%s | CCA-F Prep",
    default: "CCA-F Exam Prep — Claude Certified Architect Foundations",
  },
  description:
    "Interactive study guide for the Claude Certified Architect — Foundations (CCA-F) exam. Covers agentic architecture, Claude Code configuration, prompt engineering, tool design, context management, and RAG.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-100">
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
