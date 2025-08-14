"use client";

import { useAccountingStore } from "@/store";
import { format } from "date-fns";

export default function ReportsPage() {
  const stats = useAccountingStore((state) => state.getDashboardStats());
  const invoices = useAccountingStore((state) => state.invoices);
  const expenses = useAccountingStore((state) => state.expenses);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

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
        return "text-success-600 bg-success-100";
      case "sent":
        return "text-warning-600 bg-warning-100";
      case "draft":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Financial Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive financial analysis and insights
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Total Revenue
          </h3>
          <p className="text-3xl font-bold text-success-600 dark:text-success-400">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Total Expenses
          </h3>
          <p className="text-3xl font-bold text-danger-600 dark:text-danger-400">
            {formatCurrency(stats.totalExpenses)}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Net Profit
          </h3>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(stats.netProfit)}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Outstanding
          </h3>
          <p className="text-3xl font-bold text-warning-600 dark:text-warning-400">
            {formatCurrency(stats.outstandingAmount)}
          </p>
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Analysis */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
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
        </div>

        {/* Expense Analysis */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Expense Analysis
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total Expenses
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
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
          </div>
        </div>
      </div>

      {/* Expenses by Category */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Expenses by Category
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
            .map(([category, amount]) => (
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
                <span className="font-medium text-gray-900">
                  {formatCurrency(amount)}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {invoices
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 10)
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
        </div>
      </div>
    </div>
  );
}
