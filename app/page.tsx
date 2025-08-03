"use client";

import React, { useState, useMemo } from "react";
import { useAccountingStore } from "@/store";
import {
  UsersIcon,
  FolderIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ReceiptRefundIcon,
  BanknotesIcon,
  DocumentTextIcon,
  UserGroupIcon,
  CheckIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

// Memoized stat card component
const StatCard = React.memo(
  ({
    icon: Icon,
    title,
    value,
    color,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string;
    color: string;
  }) => (
    <div className="card">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  )
);

StatCard.displayName = "StatCard";

// Memoized invoice item component
const InvoiceItem = React.memo(
  ({
    invoice,
    formatCurrency,
    getStatusColor,
  }: {
    invoice: {
      id: string;
      invoiceNumber: string;
      issueDate: Date;
      total: number;
      status: string;
    };
    formatCurrency: (amount: number) => string;
    getStatusColor: (status: string) => string;
  }) => (
    <div key={invoice.id} className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {invoice.invoiceNumber}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {formatCurrency(invoice.total)}
        </p>
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            invoice.status
          )}`}
        >
          {invoice.status}
        </span>
      </div>
    </div>
  )
);

InvoiceItem.displayName = "InvoiceItem";

// Memoized project item component
const ProjectItem = React.memo(
  ({
    project,
    formatCurrency,
  }: {
    project: import("@/types").Project;
    formatCurrency: (amount: number) => string;
  }) => (
    <div key={project.id} className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900">{project.name}</p>
        <p className="text-xs text-gray-500">
          Budget: {formatCurrency(project.budget)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
          ₹{project.billingTerms.toFixed(2)}/hr
        </p>
        <CheckCircleIcon className="h-4 w-4 text-success-600" />
      </div>
    </div>
  )
);

ProjectItem.displayName = "ProjectItem";

export default function Dashboard() {
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const stats = useAccountingStore((state) => state.getDashboardStats());
  const invoices = useAccountingStore((state) => state.invoices);
  const projects = useAccountingStore((state) => state.projects);
  const expenses = useAccountingStore((state) => state.expenses);

  // Memoized computed values
  const recentInvoices = useMemo(() => {
    return invoices
      .sort(
        (a, b) =>
          new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      )
      .slice(0, 5);
  }, [invoices]);

  const activeProjects = useMemo(() => {
    return projects.filter((p) => p.status === "active").slice(0, 5);
  }, [projects]);

  const formatCurrency = useMemo(() => {
    return (amount: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
    };
  }, []);

  const getStatusColor = useMemo(() => {
    return (status: string) => {
      switch (status) {
        case "paid":
          return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
        case "sent":
          return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
        case "draft":
          return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
        default:
          return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
      }
    };
  }, []);

  if (!isClient) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of BST accounting system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={ChartBarIcon}
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          color="text-green-600"
        />
        <StatCard
          icon={ReceiptRefundIcon}
          title="Total Expenses"
          value={formatCurrency(stats.totalExpenses)}
          color="text-red-600"
        />
        <StatCard
          icon={BanknotesIcon}
          title="Net Profit"
          value={formatCurrency(stats.netProfit)}
          color="text-blue-600"
        />
        <StatCard
          icon={DocumentTextIcon}
          title="Outstanding"
          value={formatCurrency(stats.outstandingAmount)}
          color="text-orange-600"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UserGroupIcon}
          title="Active Clients"
          value={stats.activeClients.toString()}
          color="text-purple-600"
        />
        <StatCard
          icon={FolderIcon}
          title="Active Projects"
          value={stats.activeProjects.toString()}
          color="text-indigo-600"
        />
        <StatCard
          icon={ClockIcon}
          title="Pending Timesheets"
          value={stats.pendingTimesheets.toString()}
          color="text-yellow-600"
        />
        <StatCard
          icon={CheckIcon}
          title="Approved Timesheets"
          value={stats.approvedTimesheets.toString()}
          color="text-green-600"
        />
        <StatCard
          icon={CurrencyRupeeIcon}
          title="Invoiced Timesheets"
          value={stats.invoicedTimesheets.toString()}
          color="text-purple-600"
        />
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 text-primary-600 mr-2" />
                <span className="text-sm text-gray-600">Active Clients</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.activeClients}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FolderIcon className="h-5 w-5 text-success-600 mr-2" />
                <span className="text-sm text-gray-600">Active Projects</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.activeProjects}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Invoices
          </h3>
          <div className="space-y-3">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice) => (
                <InvoiceItem
                  key={invoice.id}
                  invoice={invoice}
                  formatCurrency={formatCurrency}
                  getStatusColor={getStatusColor}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No invoices yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Active Projects
          </h3>
          <div className="space-y-3">
            {activeProjects.length > 0 ? (
              activeProjects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  formatCurrency={formatCurrency}
                />
              ))
            ) : (
              <p className="text-sm text-gray-500">No active projects</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Reports Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Financial Reports
          </h2>
        </div>

        {/* Revenue Analysis */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
              Revenue Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Paid Invoices
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {invoices.filter((i) => i.status === "paid").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Pending Invoices
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {invoices.filter((i) => i.status === "sent").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Draft Invoices
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {invoices.filter((i) => i.status === "draft").length}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Total Revenue
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(stats.totalRevenue)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expense Analysis */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600 mr-2" />
              Expense Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Expenses
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    expenses.reduce((sum, e) => sum + e.amount, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  This Month
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    expenses
                      .filter((e) => {
                        const expenseDate = new Date(e.date);
                        const now = new Date();
                        return (
                          expenseDate.getMonth() === now.getMonth() &&
                          expenseDate.getFullYear() === now.getFullYear()
                        );
                      })
                      .reduce((sum, e) => sum + e.amount, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Average per Month
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    expenses.length > 0
                      ? expenses.reduce((sum, e) => sum + e.amount, 0) / 12
                      : 0
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Net Profit
                  </span>
                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(stats.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Performance */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <FolderIcon className="h-5 w-5 text-indigo-600 mr-2" />
            Project Performance
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active Projects
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {projects.filter((p) => p.status === "active").length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Completed Projects
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {projects.filter((p) => p.status === "completed").length}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Budget
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(
                  projects.reduce((sum, p) => sum + (p.budget || 0), 0)
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity Report */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <CalendarIcon className="h-5 w-5 text-purple-600 mr-2" />
            Recent Activity Report
          </h3>
          <div className="space-y-3">
            {invoices
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 8)
              .map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.total)}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(
                        invoice.status
                      )}`}
                    >
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            {invoices.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
