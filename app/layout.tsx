import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { UpdateNotificationWrapper } from "@/components/UpdateNotificationWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BST - Accounting Management System",
  description: "Comprehensive accounting software for BST",
};

// Client Component for database loading
import { DatabaseLoader } from "@/components/DatabaseLoader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <DatabaseLoader>
            <Layout>{children}</Layout>
            <UpdateNotificationWrapper />
            <Toaster position="top-right" />
            <PerformanceMonitor
              showDetails={process.env.NODE_ENV === "development"}
            />
          </DatabaseLoader>
        </ErrorBoundary>
      </body>
    </html>
  );
}
