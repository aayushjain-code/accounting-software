"use client";

import { useState, useMemo } from "react";
import { useAccountingStore } from "@/store";
import { Invoice, Client, Project } from "@/types";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { ActionTooltip } from "@/components/Tooltip";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import Modal from "@/components/Modal";
import { useSearch } from "@/hooks/useSearch";
import { ViewToggle } from "@/components/ViewToggle";
import { InvoicesTable } from "@/components/InvoicesTable";

export default function InvoicesPage() {
  const {
    invoices,
    clients,
    projects,
    addInvoice,
    updateInvoice,
    deleteInvoice,
  } = useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Search and filter functionality
  const {
    searchTerm,
    isSearching,
    handleSearchChange,
    filteredItems: searchFilteredInvoices,
  } = useSearch(invoices, ["invoiceNumber"]);

  // Filter invoices based on search and status
  const filteredInvoices = useMemo(() => {
    let filtered = searchFilteredInvoices;

    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    return filtered;
  }, [searchFilteredInvoices, statusFilter]);

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    clientId: "",
    projectId: "",
    amount: "",
    issueDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: format(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      "yyyy-MM-dd"
    ),
    status: "draft" as "draft" | "sent" | "paid",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invoiceData = {
      invoiceNumber: formData.invoiceNumber,
      clientId: formData.clientId,
      projectId: formData.projectId,
      timesheetId: "", // We'll need to get this from a timesheet
      amount: parseFloat(formData.amount),
      issueDate: new Date(formData.issueDate),
      dueDate: new Date(formData.dueDate),
      status: formData.status,
      subtotal: parseFloat(formData.amount),
      taxRate: 0,
      taxAmount: 0,
      total: parseFloat(formData.amount),
    };

    if (editingInvoice) {
      await updateInvoice(editingInvoice.id, invoiceData);
      toast.success("Invoice updated successfully");
    } else {
      addInvoice(invoiceData);
      toast.success("Invoice added successfully");
    }

    setIsModalOpen(false);
    setEditingInvoice(null);
    setFormData({
      invoiceNumber: "",
      clientId: "",
      projectId: "",
      amount: "",
      issueDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd"
      ),
      status: "draft",
    });
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
      projectId: invoice.projectId,
      amount: invoice.total.toString(),
      issueDate: format(new Date(invoice.issueDate), "yyyy-MM-dd"),
      dueDate: format(new Date(invoice.dueDate), "yyyy-MM-dd"),
      status: invoice.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setInvoiceToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete);
      toast.success("Invoice deleted successfully");
      setShowDeleteDialog(false);
      setInvoiceToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Invoices
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your invoices and track payments
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <DocumentTextIcon className="h-4 w-4 text-primary-600" />
                <span>
                  <span className="font-semibold text-primary-600">
                    {invoices.length}
                  </span>{" "}
                  Invoices
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ViewToggle
              viewMode={viewMode}
              onViewChange={setViewMode}
              className="mr-2"
            />
            <ActionTooltip
              content="Create New Invoice"
              action="Generate a new invoice for a client"
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Invoice
              </button>
            </ActionTooltip>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search invoices by number or description..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-primary-600"></div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "cards" ? (
        /* Cards View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => {
              const client = clients.find((c) => c.id === invoice.clientId);
              const project = projects.find((p) => p.id === invoice.projectId);
              return (
                <div
                  key={invoice.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-mono font-semibold text-primary-700 bg-primary-50 dark:bg-primary-900 px-3 py-1 rounded-md border border-primary-200 dark:border-primary-800 text-sm">
                          {invoice.invoiceNumber}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {formatStatus(invoice.status)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        Invoice #{invoice.invoiceNumber}
                      </h3>
                    </div>
                  </div>

                  {/* Client and Project Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Client:</span>
                      <span className="text-gray-900 dark:text-white">
                        {client?.name || "Unknown Client"}
                      </span>
                    </div>
                    {project && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Project:</span>
                        <span className="text-gray-900 dark:text-white">
                          {project.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Invoice Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Amount:
                      </span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(invoice.total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Issue Date:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Due Date:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit Invoice"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete Invoice"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="space-y-6">
          <InvoicesTable
            invoices={filteredInvoices}
            clients={clients}
            projects={projects}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <DocumentTextIcon className="h-16 w-16" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-4">
            {searchTerm || statusFilter !== "all"
              ? "No invoices found matching your criteria."
              : "No invoices found. Create your first invoice to get started."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200"
            >
              Create Your First Invoice
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
          setFormData({
            invoiceNumber: "",
            clientId: "",
            projectId: "",
            amount: "",
            issueDate: format(new Date(), "yyyy-MM-dd"),
            dueDate: format(
              new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              "yyyy-MM-dd"
            ),
            status: "draft",
          });
        }}
        title={editingInvoice ? "Edit Invoice" : "Create New Invoice"}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingInvoice(null);
                setFormData({
                  invoiceNumber: "",
                  clientId: "",
                  projectId: "",
                  amount: "",
                  issueDate: format(new Date(), "yyyy-MM-dd"),
                  dueDate: format(
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    "yyyy-MM-dd"
                  ),
                  status: "draft",
                });
              }}
              className="btn-secondary mr-2"
            >
              Cancel
            </button>
            <button type="submit" form="invoice-form" className="btn-primary">
              {editingInvoice ? "Update" : "Create"} Invoice
            </button>
          </>
        }
      >
        <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) =>
                setFormData((f) => ({ ...f, invoiceNumber: e.target.value }))
              }
              className="input"
              required
            />
          </div>
          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Client
            </label>
            <select
              value={formData.clientId}
              onChange={(e) =>
                setFormData((f) => ({ ...f, clientId: e.target.value }))
              }
              className="input"
              required
            >
              <option value="">Select Client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} ({client.company})
                </option>
              ))}
            </select>
          </div>
          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project
            </label>
            <select
              value={formData.projectId}
              onChange={(e) =>
                setFormData((f) => ({ ...f, projectId: e.target.value }))
              }
              className="input"
              required
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.projectCode} - {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount (₹)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData((f) => ({ ...f, amount: e.target.value }))
              }
              className="input"
              required
              min="0"
              step="0.01"
            />
          </div>
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((f) => ({
                  ...f,
                  status: e.target.value as "draft" | "sent" | "paid",
                }))
              }
              className="input"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          {/* Issue Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Issue Date
            </label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) =>
                setFormData((f) => ({ ...f, issueDate: e.target.value }))
              }
              className="input"
              required
            />
          </div>
          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((f) => ({ ...f, dueDate: e.target.value }))
              }
              className="input"
              required
            />
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete invoice "${
          editingInvoice?.invoiceNumber || invoiceToDelete
        }"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
