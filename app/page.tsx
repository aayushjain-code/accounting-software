"use client";

import React, { useState, useMemo } from "react";
import { useAccountingStore } from "@/store";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/utils/formatters";

// Memoized components for better performance
const StatCard = React.memo<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
}>(({ title, value, change, changeType = "neutral", icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        {change && (
          <p className={`text-sm ${changeType === "positive" ? "text-green-600" : changeType === "negative" ? "text-red-600" : "text-gray-600"}`}>
            {change}
          </p>
        )}
      </div>
      {icon && <div className="text-gray-400">{icon}</div>}
    </div>
  </div>
));

const InvoiceItem = React.memo<{
  invoice: any;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
}>(({ invoice, formatCurrency, getStatusColor }) => (
  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <div>
      <h4 className="font-semibold text-gray-900 dark:text-white">
        {invoice.invoiceNumber}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {formatDate(invoice.issueDate)}
      </p>
    </div>
    <div className="text-right">
      <p className="font-semibold text-gray-900 dark:text-white">
        {formatCurrency(invoice.total)}
      </p>
      <StatusBadge status={invoice.status} />
    </div>
  </div>
));

const ProjectItem = React.memo<{
  project: any;
  formatCurrency: (amount: number) => string;
}>(({ project, formatCurrency }) => (
  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-semibold text-gray-900 dark:text-white">
        {project.name}
      </h4>
      <StatusBadge status={project.status} />
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
      {project.description}
    </p>
    <div className="flex justify-between text-sm">
      <span className="text-gray-600 dark:text-gray-400">
        Progress: {project.progress}%
      </span>
      <span className="font-medium text-gray-900 dark:text-white">
        Budget: {formatCurrency(project.budget)}
      </span>
    </div>
  </div>
));

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

  const formatCurrencyMemo = useMemo(() => {
    return (amount: number) => formatCurrency(amount);
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrencyMemo(stats.totalRevenue)}
          change="+12.5% from last month"
          changeType="positive"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrencyMemo(stats.totalExpenses)}
          change="+8.2% from last month"
          changeType="negative"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrencyMemo(stats.netProfit)}
          change="+15.3% from last month"
          changeType="positive"
        />
        <StatCard
          title="Outstanding Amount"
          value={formatCurrencyMemo(stats.outstandingAmount)}
          change="+5.1% from last month"
          changeType="neutral"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Invoices */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Invoices
          </h2>
          <div className="space-y-3">
            {recentInvoices.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No invoices found
              </p>
            ) : (
              recentInvoices.map((invoice) => (
                <InvoiceItem
                  key={invoice.id}
                  invoice={invoice}
                  formatCurrency={formatCurrencyMemo}
                  getStatusColor={() => ""} // Not used in new component
                />
              ))
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Projects
          </h2>
          <div className="space-y-3">
            {activeProjects.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No active projects found
              </p>
            ) : (
              activeProjects.map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  formatCurrency={formatCurrencyMemo}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Active Clients
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.activeClients}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Active Projects
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.activeProjects}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Pending Timesheets
          </h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.pendingTimesheets}
          </p>
        </div>
      </div>
    </div>
  );
}
