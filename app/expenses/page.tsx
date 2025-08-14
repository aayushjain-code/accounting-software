"use client";

import { useState, useMemo } from "react";
import { useAccountingStore } from "@/store";
import { Expense, ExpenseFile } from "@/types";
import {
  PlusIcon,
  CurrencyRupeeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Modal from "@/components/Modal";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import React from "react";
import { ExpensesTable } from "@/components/ExpensesTable";
import { EXPENSE_CATEGORIES } from "@/constants";

export default function ExpensesPage() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"amount" | "date" | "category">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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
    status: "pending" as "pending" | "approved" | "rejected",
  });

  const expenseCategories = EXPENSE_CATEGORIES.map(cat => cat.label);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const expenseData = {
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date),
      projectId: formData.projectId || undefined,
      status: formData.status,
    };

    if (editingExpense) {
      await updateExpense(editingExpense.id, expenseData);
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
      date: format(new Date(), "yyyy-MM-dd"),
      projectId: "",
      status: "pending" as "pending" | "approved" | "rejected",
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
      status: expense.status,
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
      toast.success("File deleted successfully");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setFormData({
      category: "",
      description: "",
      amount: "",
      date: "",
      projectId: "",
      status: "pending" as "pending" | "approved" | "rejected",
    });
    setUploadedFiles([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    const filtered = expenses.filter((expense) => {
      const matchesSearch =
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (expense.projectId &&
          projects
            .find((p) => p.id === expense.projectId)
            ?.name.toLowerCase()
            .includes(searchTerm.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || expense.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" || expense.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort expenses
    filtered.sort((a, b) => {
      let aValue: number | string, bValue: number | string;

      switch (sortBy) {
        case "amount":
          aValue = a.amount;
          bValue = b.amount;
          break;
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "category":
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    expenses,
    projects,
    searchTerm,
    selectedCategory,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

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
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Expense
            </button>
          </div>
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
            {filteredAndSortedExpenses.length === expenses.length
              ? "Total Expenses"
              : "Filtered Expenses"}
          </h3>
          <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
            {filteredAndSortedExpenses.length}
            {filteredAndSortedExpenses.length !== expenses.length && (
              <span className="text-lg text-gray-400 ml-2">
                / {expenses.length}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses by description, category, or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Categories</option>
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "amount" | "date" | "category")
                }
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="date">Sort by Date</option>
                <option value="amount">Sort by Amount</option>
                <option value="category">Sort by Category</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 flex items-center space-x-2"
              title={sortOrder === "asc" ? "High to Low" : "Low to High"}
            >
              {sortOrder === "asc" ? (
                <ChevronUpIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDownIcon className="h-5 w-5 text-gray-600" />
              )}
              <span className="text-sm font-medium">
                {sortOrder === "asc" ? "Low to High" : "High to Low"}
              </span>
            </button>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(searchTerm ||
          selectedCategory !== "all" ||
          selectedStatus !== "all") && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  Search: &quot;{searchTerm}&quot;
                </span>
              )}
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Category: {selectedCategory}
                </span>
              )}
              {selectedStatus !== "all" && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Status: {selectedStatus}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedStatus("all");
                }}
                className="text-primary-600 hover:text-primary-700 text-xs font-medium underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content based on view mode */}
      {/* Table View */}
      <div className="space-y-6">
        <ExpensesTable
          expenses={filteredAndSortedExpenses}
          projects={projects}
          onEdit={handleEdit}
          onDelete={handleDelete}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(field: "amount" | "date" | "category") => {
            if (sortBy === field) {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            } else {
              setSortBy(field);
              setSortOrder("desc");
            }
          }}
        />
      </div>

      {/* Empty State */}
      {filteredAndSortedExpenses.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <CurrencyRupeeIcon className="h-16 w-16" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-4">
            {expenses.length === 0
              ? "No expenses found. Add your first expense to get started."
              : "No expenses match your current filters. Try adjusting your search or filters."}
          </p>
          {expenses.length === 0 ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200"
            >
              Add Your First Expense
            </button>
          ) : (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingExpense ? "Edit Expense" : "Add New Expense"}
        footer={
          <>
            <button
              type="button"
              onClick={handleModalClose}
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
