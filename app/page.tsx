"use client";

import React, { useMemo } from "react";
import { useAccountingStore } from "@/store";
import { Invoice, Project } from "@/types";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { format } from "date-fns";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Memoized components with display names
const StatCard = React.memo(
  ({
    title,
    value,
    icon: Icon,
    change,
    changeType,
    color = "text-gray-900 dark:text-white",
  }: {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    change?: string;
    changeType?: "positive" | "negative";
    color?: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold ${color}`}>
            {value}
          </p>
          {change && (
            <p
              className={`text-sm ${
                changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}
            >
              {change}
            </p>
          )}
        </div>
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
    </Card>
  )
);
StatCard.displayName = "StatCard";

const InvoiceItem = React.memo(({ invoice }: { invoice: Invoice }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
    <div>
      <p className="font-medium text-gray-900 dark:text-white">
        {invoice.invoiceNumber}
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {formatDate(invoice.issueDate)}
      </p>
    </div>
    <div className="text-right">
      <p className="font-medium text-gray-900 dark:text-white">
        {formatCurrency(invoice.total)}
      </p>
      <StatusBadge status={invoice.status} />
    </div>
  </div>
));
InvoiceItem.displayName = "InvoiceItem";

const ProjectItem = React.memo(({ project }: { project: Project }) => {
  const { clients } = useAccountingStore();
  const client = clients.find((c) => c.id === project.clientId);

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">
          {project.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {client?.name || "Unknown Client"}
        </p>
      </div>
      <div className="text-right">
        <p className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(project.budget)}
        </p>
        <StatusBadge status={project.status} />
      </div>
    </div>
  );
});
ProjectItem.displayName = "ProjectItem";

const getCategoryColor = (category: string) => {
  const colors = {
    "Office Supplies": "bg-blue-100 text-blue-800",
    "Software & Tools": "bg-purple-100 text-purple-800",
    "Travel & Transportation": "bg-green-100 text-green-800",
    "Meals & Entertainment": "bg-yellow-100 text-yellow-800",
    "Professional Services": "bg-indigo-100 text-indigo-800",
    "Marketing & Advertising": "bg-pink-100 text-pink-800",
    Utilities: "bg-gray-100 text-gray-800",
    "Rent & Equipment": "bg-red-100 text-red-800",
    Insurance: "bg-teal-100 text-teal-800",
    Other: "bg-gray-100 text-gray-800",
  };
  return (
    colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "text-green-600 bg-green-100";
    case "sent":
      return "text-yellow-600 bg-yellow-100";
    case "draft":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

export default function Home() {
  const { clients, projects, invoices, timesheets, expenses } = useAccountingStore();

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const totalProjects = projects.length;
    const totalInvoices = invoices.length;
    const totalTimesheets = timesheets.length;

    const totalRevenue = invoices.reduce(
      (sum: number, invoice: Invoice) => sum + (invoice.total || 0),
      0
    );
    const pendingInvoices = invoices.filter(
      (invoice: Invoice) => invoice.status === "sent"
    ).length;
    const activeProjects = projects.filter(
      (project: Project) => project.status === "active"
    ).length;

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const outstandingAmount = invoices
      .filter((invoice) => invoice.status === "sent")
      .reduce((sum, invoice) => sum + invoice.total, 0);

    return {
      totalClients,
      totalProjects,
      totalInvoices,
      totalTimesheets,
      totalRevenue,
      totalExpenses,
      netProfit,
      outstandingAmount,
      pendingInvoices,
      activeProjects,
    };
  }, [clients, projects, invoices, timesheets, expenses]);

  const recentInvoices = useMemo(() => {
    return invoices
      .sort(
        (a: Invoice, b: Invoice) =>
          new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      )
      .slice(0, 5);
  }, [invoices]);

  const recentProjects = useMemo(() => {
    return projects
      .sort(
        (a: Project, b: Project) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [projects]);

  const recentActivity = useMemo(() => {
    return invoices
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10);
  }, [invoices]);

  const expensesByCategory = useMemo(() => {
    return Object.entries(
      expenses.reduce((acc, expense) => {
        acc[expense.category] =
          (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>)
    ).sort(([, a], [, b]) => b - a);
  }, [expenses]);

  const thisMonthExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        const expenseDate = new Date(e.date);
        const now = new Date();
        return (
          expenseDate.getMonth() === now.getMonth() &&
          expenseDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const averageMonthlyExpenses = useMemo(() => {
    return expenses.length > 0 ? expenses.reduce((sum, e) => sum + e.amount, 0) / 12 : 0;
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to Your Accounting Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive overview of your business finances and performance
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={ArrowTrendingUpIcon}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(stats.totalExpenses)}
          icon={ArrowTrendingDownIcon}
          color="text-red-600 dark:text-red-400"
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(stats.netProfit)}
          icon={CurrencyDollarIcon}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(stats.outstandingAmount)}
          icon={ClockIcon}
          color="text-yellow-600 dark:text-yellow-400"
        />
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={stats.totalClients.toString()}
          icon={UserGroupIcon}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects.toString()}
          icon={ChartBarIcon}
        />
        <StatCard
          title="Total Invoices"
          value={stats.totalInvoices.toString()}
          icon={DocumentTextIcon}
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices.toString()}
          icon={ClockIcon}
          change={`${stats.pendingInvoices > 0 ? "+" : ""}${
            stats.pendingInvoices
          }`}
          changeType={stats.pendingInvoices > 0 ? "negative" : "positive"}
        />
      </div>

      {/* Detailed Reports Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Analysis */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
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
          </div>
        </Card>

        {/* Expense Analysis */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Expense Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Expenses
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(stats.totalExpenses)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                This Month
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(thisMonthExpenses)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Average per Month
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(averageMonthlyExpenses)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Expenses by Category */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Expenses by Category
        </h3>
        <div className="space-y-3">
          {expensesByCategory.length > 0 ? (
            expensesByCategory.map(([category, amount]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                      category
                    )}`}
                  >
                    {category}
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(amount)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No expenses recorded yet
            </p>
          )}
        </div>
      </Card>

      {/* Recent Activity and Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Invoices
          </h3>
          <div className="space-y-2">
            {recentInvoices.length > 0 ? (
              recentInvoices.map((invoice: Invoice) => (
                <InvoiceItem key={invoice.id} invoice={invoice} />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No invoices yet
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Projects
          </h3>
          <div className="space-y-2">
            {recentProjects.length > 0 ? (
              recentProjects.map((project: Project) => (
                <ProjectItem key={project.id} project={project} />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No projects yet
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((invoice) => (
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
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No recent activity
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
