"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UserGroupIcon,
  FolderIcon,
  ClockIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  CloudArrowUpIcon,
  UsersIcon,
  CalendarIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import clsx from "clsx";
import { ErrorBoundary } from "./ErrorBoundary";
import { LogoutButton } from "./LogoutButton";
import { AuthOverlay } from "./AuthOverlay";
import { PerformanceDashboard } from "./PerformanceDashboard";

const mainNavigation = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Clients", href: "/clients", icon: UsersIcon },
  { name: "Projects", href: "/projects", icon: FolderIcon },
  { name: "Invoice Editor", href: "/invoice-editor", icon: PencilSquareIcon },
  {
    name: "Invoice Management",
    href: "/invoice-management",
    icon: DocumentTextIcon,
  },
  { name: "Expenses", href: "/expenses", icon: ReceiptRefundIcon },
  { name: "Daily Logs", href: "/daily-logs", icon: CalendarIcon },
  { name: "Directory", href: "/directory", icon: UserGroupIcon },
  {
    name: "Timesheet Management",
    href: "/timesheet-management",
    icon: ClockIcon,
  },
];

const betaArchiveNavigation = [
  {
    name: "Timesheet Generator",
    href: "/timesheet-generator",
    icon: DocumentTextIcon,
  },
];

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [betaArchiveExpanded, setBetaArchiveExpanded] = React.useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isLoading, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!isLoading && !isAuthenticated && (
        <AuthOverlay onAuthenticated={() => window.location.reload()} />
      )}
      {/* Top Navbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left side - Mobile menu button and logo */}
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-md"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="ml-4 lg:ml-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                BST
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Accounting Management
              </p>
            </div>
          </div>

          {/* Right side - Profile menu */}
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  admin@bst.com
                </p>
              </div>
            </button>

            {/* Profile dropdown */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <UserIcon className="h-4 w-4 mr-3" />
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    toggleTheme();
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {theme === "light" ? (
                    <MoonIcon className="h-4 w-4 mr-3" />
                  ) : (
                    <SunIcon className="h-4 w-4 mr-3" />
                  )}
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </button>
                <Link
                  href="/storage"
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <CloudArrowUpIcon className="h-4 w-4 mr-3" />
                  Data Management
                </Link>
                <LogoutButton
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onLogout={logout}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div
        className={clsx(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                BST
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Accounting Management
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {/* Main Navigation */}
            {mainNavigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={clsx(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-primary-500 dark:text-primary-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:hover:text-gray-400"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
          </nav>

          {/* Beta/Archive Section - Bottom of Sidebar */}
          <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setBetaArchiveExpanded(!betaArchiveExpanded)}
              className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 rounded-md transition-colors"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Beta/Archive
                </span>
              </div>
              <svg
                className={clsx(
                  "h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform",
                  betaArchiveExpanded ? "rotate-180" : ""
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {betaArchiveExpanded && (
              <div className="mt-2 ml-4 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                {betaArchiveNavigation.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                        isActive
                          ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={clsx(
                          "mr-3 h-4 w-4 flex-shrink-0",
                          isActive
                            ? "text-yellow-500 dark:text-yellow-400"
                            : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:hover:text-gray-400"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center px-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                BST
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Accounting Management
              </p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {/* Main Navigation */}
            {mainNavigation.map(item => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-primary-100 dark:bg-primary-900 text-primary-900 dark:text-primary-100"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <item.icon
                    className={clsx(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-primary-500 dark:text-primary-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:hover:text-gray-400"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
          </nav>

          {/* Beta/Archive Section - Bottom of Sidebar */}
          <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setBetaArchiveExpanded(!betaArchiveExpanded)}
              className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300 rounded-md transition-colors"
            >
              <div className="flex items-center">
                <DocumentTextIcon className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Beta/Archive
                </span>
              </div>
              <svg
                className={clsx(
                  "h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform",
                  betaArchiveExpanded ? "rotate-180" : ""
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {betaArchiveExpanded && (
              <div className="mt-2 ml-4 space-y-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                {betaArchiveNavigation.map(item => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={clsx(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                        isActive
                          ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-100"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                      )}
                    >
                      <item.icon
                        className={clsx(
                          "mr-3 h-4 w-4 flex-shrink-0",
                          isActive
                            ? "text-yellow-500 dark:text-yellow-400"
                            : "text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:hover:text-gray-400"
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>

      {/* Performance Dashboard - Only show in development */}
      {process.env.NODE_ENV === "development" && <PerformanceDashboard />}

      {/* Click outside to close profile menu */}
      {profileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileMenuOpen(false)}
        />
      )}
    </div>
  );
}
