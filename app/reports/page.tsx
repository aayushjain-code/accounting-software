"use client";

import { useAccountingStore } from "@/store";
import Layout from "@/components/Layout";
import { format } from "date-fns";

export default function ReportsPage() {
  const { invoices, expenses, projects, clients, staff } = useAccountingStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate financial metrics
  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const outstandingInvoices = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.total, 0);

  // Monthly revenue calculation
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRevenue = invoices
    .filter((i) => {
      const invoiceDate = new Date(i.issueDate);
      return (
        i.status === "paid" &&
        invoiceDate.getMonth() === currentMonth &&
        invoiceDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, i) => sum + i.total, 0);

  // Monthly expenses calculation
  const monthlyExpenses = expenses
    .filter((e) => {
      const expenseDate = new Date(e.date);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    })
    .reduce((sum, e) => sum + e.amount, 0);

  // Project metrics
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter(
    (p) => p.status === "completed"
  ).length;
  const totalProjectBudget = projects.reduce((sum, p) => sum + p.budget, 0);

  // Client metrics
  const totalClients = clients.length;
  const activeClients = clients.length; // All clients are considered active for now

  // Staff metrics
  const activeStaff = staff.filter((s) => s.isActive).length;
  const totalStaffCost = staff.reduce(
    (sum, s) => sum + s.hourlyRate * 40 * 4,
    0
  ); // Rough monthly estimate

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Financial Reports
          </h1>
          <p className="text-gray-600">
            Comprehensive financial analytics and insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold text-success-600">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Lifetime revenue from paid invoices
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Total Expenses
            </h3>
            <p className="text-3xl font-bold text-danger-600">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Total business expenses tracked
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Net Profit
            </h3>
            <p
              className={`text-3xl font-bold ${
                netProfit >= 0 ? "text-success-600" : "text-danger-600"
              }`}
            >
              {formatCurrency(netProfit)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Revenue minus expenses</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Profit Margin
            </h3>
            <p
              className={`text-3xl font-bold ${
                profitMargin >= 0 ? "text-success-600" : "text-danger-600"
              }`}
            >
              {formatPercentage(profitMargin)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Net profit as percentage of revenue
            </p>
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              This Month's Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenue</span>
                <span className="font-medium text-success-600">
                  {formatCurrency(monthlyRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expenses</span>
                <span className="font-medium text-danger-600">
                  {formatCurrency(monthlyExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Net Profit</span>
                <span
                  className={`font-medium ${
                    monthlyRevenue - monthlyExpenses >= 0
                      ? "text-success-600"
                      : "text-danger-600"
                  }`}
                >
                  {formatCurrency(monthlyRevenue - monthlyExpenses)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Outstanding</span>
                <span className="font-medium text-warning-600">
                  {formatCurrency(outstandingInvoices)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Overview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Projects Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Projects</span>
                <span className="font-medium text-success-600">
                  {activeProjects}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed Projects</span>
                <span className="font-medium text-primary-600">
                  {completedProjects}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Budget</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(totalProjectBudget)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Project Budget</span>
                <span className="font-medium text-gray-900">
                  {projects.length > 0
                    ? formatCurrency(totalProjectBudget / projects.length)
                    : "$0"}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Client Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Clients</span>
                <span className="font-medium text-primary-600">
                  {totalClients}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Clients</span>
                <span className="font-medium text-success-600">
                  {activeClients}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Revenue per Client</span>
                <span className="font-medium text-gray-900">
                  {totalClients > 0
                    ? formatCurrency(totalRevenue / totalClients)
                    : "$0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Client Retention</span>
                <span className="font-medium text-success-600">100%</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Staff Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Staff</span>
                <span className="font-medium text-success-600">
                  {activeStaff}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Staff</span>
                <span className="font-medium text-primary-600">
                  {staff.length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Hourly Rate</span>
                <span className="font-medium text-gray-900">
                  {staff.length > 0
                    ? formatCurrency(
                        staff.reduce((sum, s) => sum + s.hourlyRate, 0) /
                          staff.length
                      )
                    : "$0"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monthly Staff Cost</span>
                <span className="font-medium text-danger-600">
                  {formatCurrency(totalStaffCost)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Status Breakdown */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Invoice Status Breakdown
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600">
                {invoices.filter((i) => i.status === "paid").length}
              </div>
              <div className="text-sm text-gray-600">Paid</div>
              <div className="text-xs text-gray-500">
                {formatCurrency(
                  invoices
                    .filter((i) => i.status === "paid")
                    .reduce((sum, i) => sum + i.total, 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600">
                {invoices.filter((i) => i.status === "sent").length}
              </div>
              <div className="text-sm text-gray-600">Sent</div>
              <div className="text-xs text-gray-500">
                {formatCurrency(
                  invoices
                    .filter((i) => i.status === "sent")
                    .reduce((sum, i) => sum + i.total, 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {invoices.filter((i) => i.status === "draft").length}
              </div>
              <div className="text-sm text-gray-600">Draft</div>
              <div className="text-xs text-gray-500">
                {formatCurrency(
                  invoices
                    .filter((i) => i.status === "draft")
                    .reduce((sum, i) => sum + i.total, 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-danger-600">
                {invoices.filter((i) => i.status === "overdue").length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
              <div className="text-xs text-gray-500">
                {formatCurrency(
                  invoices
                    .filter((i) => i.status === "overdue")
                    .reduce((sum, i) => sum + i.total, 0)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expense Categories */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top Expense Categories
          </h3>
          <div className="space-y-3">
            {Object.entries(
              expenses.reduce((acc, expense) => {
                acc[expense.category] =
                  (acc[expense.category] || 0) + expense.amount;
                return acc;
              }, {} as Record<string, number>)
            )
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([category, amount]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-600">{category}</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
