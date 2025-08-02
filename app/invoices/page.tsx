"use client";

import { useState } from "react";
import { useAccountingStore } from "@/store";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";

export default function InvoicesPage() {
  const {
    invoices,
    clients,
    projects,
    timesheets,
    addInvoice,
    updateInvoice,
    deleteInvoice,
  } = useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [formData, setFormData] = useState({
    timesheetId: "",
    clientId: "",
    projectId: "",
    invoiceNumber: "",
    issueDate: "",
    dueDate: "",
    subtotal: "",
    taxRate: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subtotal = parseFloat(formData.subtotal);
    const taxRate = parseFloat(formData.taxRate);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const invoiceData = {
      ...formData,
      timesheetId: formData.timesheetId,
      issueDate: new Date(formData.issueDate),
      dueDate: new Date(formData.dueDate),
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: "draft" as const,
    };

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, invoiceData);
      toast.success("Invoice updated successfully");
    } else {
      addInvoice(invoiceData);
      toast.success("Invoice added successfully");
    }

    setIsModalOpen(false);
    setEditingInvoice(null);
    setFormData({
      timesheetId: "",
      clientId: "",
      projectId: "",
      invoiceNumber: "",
      issueDate: "",
      dueDate: "",
      subtotal: "",
      taxRate: "",
      notes: "",
    });
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setFormData({
      timesheetId: invoice.timesheetId,
      clientId: invoice.clientId,
      projectId: invoice.projectId,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: format(new Date(invoice.issueDate), "yyyy-MM-dd"),
      dueDate: format(new Date(invoice.dueDate), "yyyy-MM-dd"),
      subtotal: invoice.subtotal.toString(),
      taxRate: invoice.taxRate.toString(),
      notes: invoice.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoice(id);
      toast.success("Invoice deleted successfully");
    }
  };

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
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const count =
      invoices.filter(
        (i) =>
          new Date(i.createdAt).getFullYear() === year &&
          new Date(i.createdAt).getMonth() === date.getMonth()
      ).length + 1;
    return `INV-${year}${month}-${String(count).padStart(3, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invoices
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your client invoices
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Invoice
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Total Invoices
          </h3>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
            {invoices.length}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Paid
          </h3>
          <p className="text-3xl font-bold text-success-600 dark:text-success-400">
            {formatCurrency(
              invoices
                .filter((i) => i.status === "paid")
                .reduce((sum, i) => sum + i.total, 0)
            )}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Sent
          </h3>
          <p className="text-3xl font-bold text-warning-600 dark:text-warning-400">
            {formatCurrency(
              invoices
                .filter((i) => i.status === "sent")
                .reduce((sum, i) => sum + i.total, 0)
            )}
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Project</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoices
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((invoice) => {
                  const client = clients.find((c) => c.id === invoice.clientId);
                  const project = projects.find(
                    (p) => p.id === invoice.projectId
                  );
                  return (
                    <tr key={invoice.id}>
                      <td>
                        <div className="font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </div>
                      </td>
                      <td>{client?.name || "Unknown Client"}</td>
                      <td>{project?.name || "Unknown Project"}</td>
                      <td>
                        {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                      </td>
                      <td>
                        {format(new Date(invoice.dueDate), "MMM dd, yyyy")}
                      </td>
                      <td>{formatCurrency(invoice.total)}</td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="text-danger-600 hover:text-danger-900"
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
          {invoices.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No invoices found. Create your first invoice to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingInvoice(null);
          setFormData({
            timesheetId: "",
            clientId: "",
            projectId: "",
            invoiceNumber: "",
            issueDate: "",
            dueDate: "",
            subtotal: "",
            taxRate: "",
            notes: "",
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
                  timesheetId: "",
                  clientId: "",
                  projectId: "",
                  invoiceNumber: "",
                  issueDate: "",
                  dueDate: "",
                  subtotal: "",
                  taxRate: "",
                  notes: "",
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timesheet selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Timesheet
              </label>
              <select
                required
                value={formData.timesheetId}
                onChange={(e) => {
                  const timesheetId = e.target.value;
                  setFormData((prev) => ({ ...prev, timesheetId }));
                }}
                className="input"
              >
                <option value="">Select a timesheet</option>
                {timesheets.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.month} - {t.year} ({t.status})
                  </option>
                ))}
              </select>
            </div>
            {/* Show derived info if timesheet is selected */}
            {formData.timesheetId &&
              (() => {
                const timesheet = timesheets.find(
                  (t) => t.id === formData.timesheetId
                );
                const project =
                  timesheet &&
                  projects.find((p) => p.id === timesheet.projectId);
                const client =
                  project && clients.find((c) => c.id === project.clientId);
                return (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Client
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded px-3 py-2 text-gray-900 dark:text-white text-sm">
                        {client?.name || "Unknown Client"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Project
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded px-3 py-2 text-gray-900 dark:text-white text-sm">
                        {project?.name || "Unknown Project"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Invoice Number
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded px-3 py-2 text-gray-900 dark:text-white text-sm">
                        {editingInvoice
                          ? editingInvoice.invoiceNumber
                          : generateInvoiceNumber()}
                      </div>
                    </div>
                  </>
                );
              })()}
            {/* ...keep the rest of the form (issue date, due date, subtotal, tax, notes)... */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Issue Date
              </label>
              <input
                type="date"
                required
                value={formData.issueDate}
                onChange={(e) =>
                  setFormData({ ...formData, issueDate: e.target.value })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subtotal (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.subtotal}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    subtotal: e.target.value,
                  })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tax Rate (%)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.taxRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taxRate: e.target.value,
                  })
                }
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="input"
                rows={3}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
