"use client";

import { useState, useMemo } from "react";
import { useAccountingStore } from "@/store";
import { Invoice } from "@/types";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import React from "react";
import { InvoiceFile } from "@/types";

export default function InvoicesPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    invoices,
    clients,
    projects,
    timesheets,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addInvoiceFile,
    removeInvoiceFile,
  } = useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    timesheetId: "",
    projectId: "",
    clientId: "",
    issueDate: "",
    dueDate: "",
    status: "draft" as "draft" | "sent" | "paid",
    subtotal: "",
    taxRate: "18",
    taxAmount: "",
    total: "",
    notes: "",
  });

  const generateInvoiceNumber = () => {
    const currentYear = new Date().getFullYear();
    const invoiceCount = invoices.length + 1;
    return `INV-${currentYear}-${invoiceCount.toString().padStart(3, "0")}`;
  };

  // Derive project, client, and amount from timesheet
  const selectedTimesheet = useMemo(
    () => timesheets.find((t) => t.id === formData.timesheetId),
    [formData.timesheetId, timesheets]
  );
  const selectedProject = useMemo(
    () =>
      projects.find(
        (p) => p.id === (formData.projectId || selectedTimesheet?.projectId)
      ),
    [formData.projectId, selectedTimesheet, projects]
  );
  const selectedClient = useMemo(
    () =>
      clients.find(
        (c) => c.id === (formData.clientId || selectedProject?.clientId)
      ),
    [formData.clientId, selectedProject, clients]
  );

  // Auto-populate fields when timesheet is selected
  React.useEffect(() => {
    if (selectedTimesheet && selectedProject && selectedClient) {
      const subtotal = selectedTimesheet.totalAmount || 0;
      const taxRate = parseFloat(formData.taxRate);
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;

      setFormData((prev) => ({
        ...prev,
        projectId: selectedProject.id,
        clientId: selectedClient.id,
        subtotal: subtotal.toString(),
        taxAmount: taxAmount.toString(),
        total: total.toString(),
      }));
    }
  }, [selectedTimesheet, selectedProject, selectedClient, formData.taxRate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTimesheet || !selectedProject || !selectedClient) {
      toast.error("Please select a valid timesheet");
      return;
    }

    const invoiceData = {
      timesheetId: formData.timesheetId,
      clientId: formData.clientId,
      projectId: formData.projectId,
      invoiceNumber: generateInvoiceNumber(),
      issueDate: new Date(formData.issueDate),
      dueDate: new Date(formData.dueDate),
      status: formData.status,
      subtotal: parseFloat(formData.subtotal),
      taxRate: parseFloat(formData.taxRate),
      taxAmount: parseFloat(formData.taxAmount),
      total: parseFloat(formData.total),
      notes: formData.notes,
    };

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, invoiceData);
      toast.success("Invoice updated successfully");
    } else {
      addInvoice(invoiceData);
      toast.success("Invoice created successfully");
    }

    setIsModalOpen(false);
    setEditingInvoice(null);
    setFormData({
      timesheetId: "",
      projectId: "",
      clientId: "",
      issueDate: "",
      dueDate: "",
      status: "draft" as const,
      subtotal: "",
      taxRate: "18",
      taxAmount: "",
      total: "",
      notes: "",
    });
    setUploadedFiles([]);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      timesheetId: invoice.timesheetId,
      projectId: invoice.projectId,
      clientId: invoice.clientId,
      issueDate: format(new Date(invoice.issueDate), "yyyy-MM-dd"),
      dueDate: format(new Date(invoice.dueDate), "yyyy-MM-dd"),
      status: invoice.status,
      subtotal: invoice.subtotal.toString(),
      taxRate: invoice.taxRate.toString(),
      taxAmount: invoice.taxAmount.toString(),
      total: invoice.total.toString(),
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

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    try {
      for (const file of uploadedFiles) {
        const fileData = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        };

        addInvoiceFile(editingInvoice?.id || "temp", fileData);
      }

      toast.success("Files uploaded successfully");
      setUploadedFiles([]);
    } catch {
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = (fileId: string) => {
    if (editingInvoice) {
      removeInvoiceFile(editingInvoice.id, fileId);
      toast.success("File deleted successfully!");
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
              Manage your client invoices and payments
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Invoice
          </button>
        </div>
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
                        <div className="space-y-1">
                          <span className="font-mono font-semibold text-primary-700 bg-primary-50 dark:bg-primary-900 px-3 py-1 rounded-md border border-primary-200 dark:border-primary-800 text-sm">
                            {invoice.invoiceNumber}
                          </span>
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
            projectId: "",
            clientId: "",
            issueDate: "",
            dueDate: "",
            status: "draft",
            subtotal: "",
            taxRate: "18",
            taxAmount: "",
            total: "",
            notes: "",
          });
          setUploadedFiles([]);
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
                  projectId: "",
                  clientId: "",
                  issueDate: "",
                  dueDate: "",
                  status: "draft",
                  subtotal: "",
                  taxRate: "18",
                  taxAmount: "",
                  total: "",
                  notes: "",
                });
                setUploadedFiles([]);
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
          {/* Timesheet selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Timesheet
            </label>
            <select
              value={formData.timesheetId}
              onChange={(e) =>
                setFormData((f) => ({ ...f, timesheetId: e.target.value }))
              }
              className="input"
              required
              disabled={!!editingInvoice}
            >
              <option value="">Select Timesheet</option>
              {timesheets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.month} {t.year} -{" "}
                  {projects.find((p) => p.id === t.projectId)?.name || ""}
                </option>
              ))}
            </select>
          </div>
          {/* Project (editable) */}
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
          {/* Client (editable) */}
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
          {/* Subtotal (editable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subtotal (₹)
            </label>
            <input
              type="number"
              value={formData.subtotal}
              onChange={(e) => {
                const subtotal = parseFloat(e.target.value) || 0;
                const taxRate = parseFloat(formData.taxRate);
                const taxAmount = subtotal * (taxRate / 100);
                const total = subtotal + taxAmount;
                setFormData((f) => ({
                  ...f,
                  subtotal: e.target.value,
                  taxAmount: taxAmount.toString(),
                  total: total.toString(),
                }));
              }}
              className="input"
              required
              min="0"
              step="0.01"
            />
          </div>
          {/* Tax Rate (editable) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tax Rate (%)
            </label>
            <input
              type="number"
              value={formData.taxRate}
              onChange={(e) => {
                const taxRate = parseFloat(e.target.value) || 0;
                const subtotal = parseFloat(formData.subtotal) || 0;
                const taxAmount = subtotal * (taxRate / 100);
                const total = subtotal + taxAmount;
                setFormData((f) => ({
                  ...f,
                  taxRate: e.target.value,
                  taxAmount: taxAmount.toString(),
                  total: total.toString(),
                }));
              }}
              className="input"
              required
              min="0"
              max="100"
              step="0.01"
            />
          </div>
          {/* Tax Amount (calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tax Amount (₹)
            </label>
            <input
              type="number"
              value={formData.taxAmount}
              className="input bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              readOnly
              tabIndex={-1}
            />
          </div>
          {/* Total (calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total (₹)
            </label>
            <input
              type="number"
              value={formData.total}
              className="input bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              readOnly
              tabIndex={-1}
            />
          </div>
          {/* Status dropdown */}
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
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((f) => ({ ...f, notes: e.target.value }))
              }
              className="input"
              rows={2}
            />
          </div>
          {/* File Upload Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <FileUpload
              files={uploadedFiles}
              onFilesChange={setUploadedFiles}
              maxFiles={5}
              maxSize={10}
              title="Upload Invoice Files"
              description="Upload invoice documents, receipts, or supporting files"
              acceptedTypes={[
                ".pdf",
                ".doc",
                ".docx",
                ".xls",
                ".xlsx",
                ".jpg",
                ".jpeg",
                ".png",
              ]}
            />

            {uploadedFiles.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleFileUpload}
                  disabled={isUploading}
                  className="btn-secondary flex items-center space-x-2"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="h-4 w-4" />
                      <span>Upload Files</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* File List Section */}
          {editingInvoice?.files && editingInvoice.files.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <FileList
                files={editingInvoice.files}
                onDelete={handleFileDelete}
                title="Invoice Files"
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
