"use client";

import React, { useState } from "react";
import { Invoice, Client, Project } from "@/types";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import Modal from "./Modal"; // Added import for Modal

interface InvoicesTableProps {
  invoices: Invoice[];
  clients: Client[];
  projects: Project[];
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({
  invoices,
  clients,
  projects,
  onEdit,
  onDelete,
}) => {
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case "paid":
        return "✓";
      case "pending":
        return "⏳";
      case "overdue":
        return "⚠";
      case "draft":
        return "📝";
      default:
        return "•";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Invoice #
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Client/Project
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {invoices
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map(invoice => {
                const client = clients.find(c => c.id === invoice.clientId);
                const project = projects.find(p => p.id === invoice.projectId);
                return (
                  <tr
                    key={invoice.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <DocumentIcon className="h-4 w-4 text-primary-600 mr-1" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {client?.name || "Unknown Client"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {project?.name || "No Project"}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-xs text-gray-900 dark:text-white">
                        {invoice.issueDate
                          ? format(new Date(invoice.issueDate), "MMM dd")
                          : "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Due:{" "}
                        {invoice.dueDate
                          ? format(new Date(invoice.dueDate), "MMM dd")
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.total)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        <span className="mr-1">
                          {getStatusIcon(invoice.status)}
                        </span>
                        {formatStatus(invoice.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setViewInvoice(invoice)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(invoice)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                          title="Edit Invoice"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(invoice.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                          title="Delete Invoice"
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

      {/* View Modal */}
      {viewInvoice && (
        <Modal
          isOpen={!!viewInvoice}
          onClose={() => setViewInvoice(null)}
          title="Invoice Details"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Invoice Number
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {viewInvoice.invoiceNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    viewInvoice.status
                  )}`}
                >
                  <span className="mr-1">
                    {getStatusIcon(viewInvoice.status)}
                  </span>
                  {formatStatus(viewInvoice.status)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Client
                </label>
                <p className="text-gray-900 dark:text-white">
                  {clients.find(c => c.id === viewInvoice.clientId)?.name ||
                    "Unknown Client"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {clients.find(c => c.id === viewInvoice.clientId)?.company ||
                    "No Company"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project
                </label>
                <p className="text-gray-900 dark:text-white">
                  {projects.find(p => p.id === viewInvoice.projectId)?.name ||
                    "No Project"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {projects.find(p => p.id === viewInvoice.projectId)
                    ?.projectCode || ""}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Issue Date
                </label>
                <p className="text-gray-900 dark:text-white">
                  {viewInvoice.issueDate
                    ? format(new Date(viewInvoice.issueDate), "MMMM dd, yyyy")
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <p className="text-gray-900 dark:text-white">
                  {viewInvoice.dueDate
                    ? format(new Date(viewInvoice.dueDate), "MMMM dd, yyyy")
                    : "N/A"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount
              </label>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(viewInvoice.total)}
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  onEdit(viewInvoice);
                  setViewInvoice(null);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setViewInvoice(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
