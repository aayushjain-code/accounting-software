"use client";

import React from "react";
import { Expense, Project } from "@/types";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ReceiptRefundIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface ExpensesTableProps {
  expenses: Expense[];
  projects: Project[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  onView?: (expense: Expense) => void;
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({
  expenses,
  projects,
  onEdit,
  onDelete,
  onView,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "travel":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "office":
        return "bg-green-100 text-green-800 border-green-200";
      case "marketing":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "utilities":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "equipment":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "travel":
        return "✈";
      case "office":
        return "🏢";
      case "marketing":
        return "📢";
      case "utilities":
        return "⚡";
      case "equipment":
        return "🖥";
      default:
        return "💰";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Description
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Project
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {expenses
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map((expense) => {
                const project = expense.projectId
                  ? projects.find((p) => p.id === expense.projectId)
                  : null;
                return (
                  <tr
                    key={expense.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(expense.date), "MMM dd")}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(
                          expense.category
                        )}`}
                      >
                        <span className="mr-1">
                          {getCategoryIcon(expense.category)}
                        </span>
                        {formatCategory(expense.category)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap max-w-xs">
                      <div className="text-sm text-gray-900 dark:text-white truncate" title={expense.description}>
                        {expense.description.length > 40 
                          ? `${expense.description.substring(0, 40)}...` 
                          : expense.description}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap max-w-32">
                      {project ? (
                        <div className="text-sm text-gray-900 dark:text-white truncate" title={project.name}>
                          {project.name.length > 25 
                            ? `${project.name.substring(0, 25)}...` 
                            : project.name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          No Project
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        {onView && (
                          <button
                            onClick={() => onView(expense)}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onEdit(expense)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                          title="Edit Expense"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(expense.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                          title="Delete Expense"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
