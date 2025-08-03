"use client";

import React, { useMemo } from "react";
import { useAccountingStore } from "@/store";
import { Invoice, Project } from "@/types";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/utils/formatters";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

// Memoized components with display names
const StatCard = React.memo(
  ({
    title,
    value,
    icon: Icon,
    change,
    changeType,
  }: {
    title: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    change?: string;
    changeType?: "positive" | "negative";
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
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

export default function Dashboard() {
  const { clients, projects, invoices, timesheets } = useAccountingStore();

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

    return {
      totalClients,
      totalProjects,
      totalInvoices,
      totalTimesheets,
      totalRevenue,
      pendingInvoices,
      activeProjects,
    };
  }, [clients, projects, invoices, timesheets]);

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

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
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
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={CurrencyDollarIcon}
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices.toString()}
          icon={DocumentTextIcon}
          change={`${stats.pendingInvoices > 0 ? "+" : ""}${
            stats.pendingInvoices
          }`}
          changeType={stats.pendingInvoices > 0 ? "negative" : "positive"}
        />
      </div>

      {/* Recent Activity */}
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
    </div>
  );
}
