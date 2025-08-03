"use client";

import { useState } from "react";
import { useAccountingStore } from "@/store";
import { Expense, ExpenseFile } from "@/types";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import React from "react";

export default function ExpensesPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    expenses,
    projects,
    addExpense,
    updateExpense,
    deleteExpense,
    addExpenseFile,
    removeExpenseFile,
  } = useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    date: "",
    projectId: "",
  });

  const expenseCategories = [
    "Office Supplies",
    "Software & Tools",
    "Travel & Transportation",
    "Meals & Entertainment",
    "Professional Services",
    "Marketing & Advertising",
    "Utilities",
    "Rent & Equipment",
    "Insurance",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expenseData = {
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
      projectId: formData.projectId || undefined,
      status: "pending" as const,
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
      toast.success("Expense updated successfully");
    } else {
      addExpense(expenseData);
      toast.success("Expense added successfully");
    }

    setIsModalOpen(false);
    setEditingExpense(null);
    setFormData({
      category: "",
      description: "",
      amount: "",
      date: "",
      projectId: "",
    });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: format(new Date(expense.date), "yyyy-MM-dd"),
      projectId: expense.projectId || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpense(id);
      toast.success("Expense deleted successfully");
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
        const fileData: ExpenseFile = {
          id: `file_${Date.now()}_${Math.random()}`,
          expenseId: editingExpense?.id || "temp",
          fileName: `expense_${editingExpense?.id || "temp"}_${file.name}`,
          originalName: file.name,
          fileSize: file.size,
          fileType: file.type || `.${file.name.split(".").pop()}`,
          uploadDate: new Date(),
          uploadedBy: "Admin User",
          filePath: `/uploads/expenses/${file.name}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addExpenseFile(editingExpense?.id || "temp", fileData);
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
    if (editingExpense) {
      removeExpenseFile(editingExpense.id, fileId);
      toast.success("File deleted successfully!");
    }
  };

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

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Expenses
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your business expenses and costs
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Total Expenses
          </h3>
          <p className="text-3xl font-bold text-danger-600 dark:text-danger-400">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            This Month
          </h3>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
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
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Total Expenses
          </h3>
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
            {expenses.length}
          </p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Project</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
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
                    <tr key={expense.id}>
                      <td>
                        <div className="space-y-1">
                          <div>
                            {format(new Date(expense.date), "MMM dd, yyyy")}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {expense.expenseCode}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                            expense.category
                          )}`}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td>
                        <div
                          className="max-w-xs truncate"
                          title={expense.description}
                        >
                          {expense.description}
                        </div>
                      </td>
                      <td className="font-medium text-gray-900">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td>{project?.name || "-"}</td>
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
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
          {expenses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No expenses found. Add your first expense to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Expenses by Category
        </h3>
        <div className="space-y-3">
          {Object.entries(expensesByCategory)
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

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
          setFormData({
            category: "",
            description: "",
            amount: "",
            date: "",
            projectId: "",
          });
          setUploadedFiles([]);
        }}
        title={editingExpense ? "Edit Expense" : "Add New Expense"}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingExpense(null);
                setFormData({
                  category: "",
                  description: "",
                  amount: "",
                  date: "",
                  projectId: "",
                });
                setUploadedFiles([]);
              }}
              className="btn-secondary mr-2"
            >
              Cancel
            </button>
            <button type="submit" form="expense-form" className="btn-primary">
              {editingExpense ? "Update" : "Add"} Expense
            </button>
          </>
        }
      >
        <form id="expense-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input"
              >
                <option value="">Select a category</option>
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: e.target.value,
                  })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project (Optional)
              </label>
              <select
                value={formData.projectId}
                onChange={(e) =>
                  setFormData({ ...formData, projectId: e.target.value })
                }
                className="input"
              >
                <option value="">No specific project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="input"
                placeholder="What was this expense for?"
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <FileUpload
              files={uploadedFiles}
              onFilesChange={setUploadedFiles}
              maxFiles={5}
              maxSize={10}
              title="Upload Expense Files"
              description="Upload receipts, invoices, or supporting documents for this expense"
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
          {editingExpense?.files && editingExpense.files.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <FileList
                files={editingExpense.files}
                onDelete={handleFileDelete}
                title="Expense Files"
              />
            </div>
          )}
        </form>
      </Modal>
    </div>
  );
}
