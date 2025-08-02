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
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
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
        <p className="text-sm font-medium text-gray-900">
          {invoice.invoiceNumber}
        </p>
        <p className="text-xs text-gray-500">
          {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900">
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
          {formatCurrency(project.billingTerms)}/hr
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
          return "bg-green-100 text-green-800";
        case "sent":
          return "bg-blue-100 text-blue-800";
        case "draft":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };
  }, []);

  if (!isClient) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of Brandsmashers Tech accounting system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
    </div>
  );
}
