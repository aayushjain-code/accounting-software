"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccountingStore } from "@/store";
import { Invoice } from "@/types";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { ActionTooltip } from "@/components/Tooltip";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import Modal from "@/components/Modal";
import { useSearch } from "@/hooks/useSearch";
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
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    return filtered;
  }, [searchFilteredInvoices, statusFilter]);

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
              onChange={e => handleSearchChange(e.target.value)}
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
              onChange={e => setStatusFilter(e.target.value)}
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
      {/* Table View */}
      <div className="space-y-6">
        <InvoicesTable
          invoices={filteredInvoices}
          clients={clients}
          projects={projects}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

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
              onChange={e =>
                setFormData(f => ({ ...f, invoiceNumber: e.target.value }))
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
              onChange={e =>
                setFormData(f => ({ ...f, clientId: e.target.value }))
              }
              className="input"
              required
            >
              <option value="">Select Client</option>
              {clients.map(client => (
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
              onChange={e =>
                setFormData(f => ({ ...f, projectId: e.target.value }))
              }
              className="input"
              required
            >
              <option value="">Select Project</option>
              {projects.map(project => (
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
              onChange={e =>
                setFormData(f => ({ ...f, amount: e.target.value }))
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
              onChange={e =>
                setFormData(f => ({
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
              onChange={e =>
                setFormData(f => ({ ...f, issueDate: e.target.value }))
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
              onChange={e =>
                setFormData(f => ({ ...f, dueDate: e.target.value }))
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
