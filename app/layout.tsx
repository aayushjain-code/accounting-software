import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Brandsmashers Tech - Accounting Management System",
  description: "Comprehensive accounting software for Brandsmashers Tech",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Layout>{children}</Layout>
          <Toaster position="top-right" />
        </ErrorBoundary>
      </body>
    </html>
  );
}
