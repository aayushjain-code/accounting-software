"use client";

import { useState } from "react";
import { useAccountingStore } from "@/store";
import Layout from "@/components/Layout";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function InvoicesPage() {
  const {
    invoices,
    clients,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getClientById,
  } = useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [formData, setFormData] = useState({
    clientId: "",
    invoiceNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    status: "draft" as const,
    subtotal: 0,
    taxRate: 0,
    taxAmount: 0,
    total: 0,
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taxAmount = (formData.subtotal * formData.taxRate) / 100;
    const total = formData.subtotal + taxAmount;

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, {
        ...formData,
        subtotal: parseFloat(formData.subtotal.toString()),
        taxRate: parseFloat(formData.taxRate.toString()),
        taxAmount,
        total,
        issueDate: new Date(formData.issueDate),
        dueDate: new Date(formData.dueDate),
      });
      toast.success("Invoice updated successfully");
    } else {
      addInvoice({
        ...formData,
        subtotal: parseFloat(formData.subtotal.toString()),
        taxRate: parseFloat(formData.taxRate.toString()),
        taxAmount,
        total,
        issueDate: new Date(formData.issueDate),
        dueDate: new Date(formData.dueDate),
      });
      toast.success("Invoice created successfully");
    }

    setIsModalOpen(false);
    setEditingInvoice(null);
    setFormData({
      clientId: "",
      invoiceNumber: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: "draft",
      subtotal: 0,
      taxRate: 0,
      taxAmount: 0,
      total: 0,
      notes: "",
    });
  };

  const handleEdit = (invoice: any) => {
    setEditingInvoice(invoice);
    setFormData({
      clientId: invoice.clientId,
      invoiceNumber: invoice.invoiceNumber,
      issueDate: format(new Date(invoice.issueDate), "yyyy-MM-dd"),
      dueDate: format(new Date(invoice.dueDate), "yyyy-MM-dd"),
      status: invoice.status,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      notes: invoice.notes,
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
      case "overdue":
        return "text-danger-600 bg-danger-100";
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
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="text-gray-600">
              Manage your client invoices and payments
            </p>
          </div>
          <button
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                invoiceNumber: generateInvoiceNumber(),
              }));
              setIsModalOpen(true);
            }}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Invoice
          </button>
        </div>

        {/* Invoices Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Client</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoices
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime()
                  )
                  .map((invoice) => {
                    const client = getClientById(invoice.clientId);
                    return (
                      <tr key={invoice.id}>
                        <td>
                          <div className="font-medium text-gray-900">
                            {invoice.invoiceNumber}
                          </div>
                        </td>
                        <td>{client?.name || "Unknown Client"}</td>
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Total Invoices
            </h3>
            <p className="text-3xl font-bold text-primary-600">
              {invoices.length}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Paid</h3>
            <p className="text-3xl font-bold text-success-600">
              {formatCurrency(
                invoices
                  .filter((i) => i.status === "paid")
                  .reduce((sum, i) => sum + i.total, 0)
              )}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Outstanding
            </h3>
            <p className="text-3xl font-bold text-warning-600">
              {formatCurrency(
                invoices
                  .filter((i) => i.status !== "paid")
                  .reduce((sum, i) => sum + i.total, 0)
              )}
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Overdue</h3>
            <p className="text-3xl font-bold text-danger-600">
              {formatCurrency(
                invoices
                  .filter((i) => i.status === "overdue")
                  .reduce((sum, i) => sum + i.total, 0)
              )}
            </p>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingInvoice ? "Edit Invoice" : "Create New Invoice"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Client
                    </label>
                    <select
                      required
                      value={formData.clientId}
                      onChange={(e) =>
                        setFormData({ ...formData, clientId: e.target.value })
                      }
                      className="input mt-1"
                    >
                      <option value="">Select a client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} - {client.company}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Invoice Number
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.invoiceNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          invoiceNumber: e.target.value,
                        })
                      }
                      className="input mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.issueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, issueDate: e.target.value })
                      }
                      className="input mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Due Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="input mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as any,
                        })
                      }
                      className="input mt-1"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Subtotal ($)
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
                          subtotal: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="input mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
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
                          taxRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="input mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="input mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingInvoice(null);
                        setFormData({
                          clientId: "",
                          invoiceNumber: "",
                          issueDate: new Date().toISOString().split("T")[0],
                          dueDate: new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000
                          )
                            .toISOString()
                            .split("T")[0],
                          status: "draft",
                          subtotal: 0,
                          taxRate: 0,
                          taxAmount: 0,
                          total: 0,
                          notes: "",
                        });
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingInvoice ? "Update" : "Create"} Invoice
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
