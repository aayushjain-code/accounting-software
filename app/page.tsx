"use client";

import { useAccountingStore } from "@/store";
import Layout from "@/components/Layout";
import {
  CurrencyDollarIcon,
  UsersIcon,
  FolderIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

export default function Dashboard() {
  const stats = useAccountingStore((state) => state.getDashboardStats());
  const invoices = useAccountingStore((state) => state.invoices);
  const projects = useAccountingStore((state) => state.projects);

  const recentInvoices = invoices
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const activeProjects = projects.filter((p) => p.status === "active");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-success-600 bg-success-100";
      case "sent":
        return "text-warning-600 bg-warning-100";
      case "draft":
        return "text-gray-600 bg-gray-100";
      case "overdue":
        return "text-danger-600 bg-danger-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your accounting overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Expenses
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.totalExpenses)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Net Profit</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.netProfit)}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatCurrency(stats.outstandingAmount)}
                </p>
              </div>
            </div>
          </div>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-warning-600 mr-2" />
                  <span className="text-sm text-gray-600">Active Staff</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {stats.activeStaff}
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
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between"
                  >
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
                  <div
                    key={project.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {project.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Budget: {formatCurrency(project.budget)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(project.hourlyRate)}/hr
                      </p>
                      <CheckCircleIcon className="h-4 w-4 text-success-600" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No active projects</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
