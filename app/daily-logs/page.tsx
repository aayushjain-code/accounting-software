"use client";

import React, { useState, useMemo } from "react";
import { useAccountingStore } from "@/store";
import { DailyLog, DailyLogFile } from "@/types";
import { format } from "date-fns";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useSearch } from "@/hooks/useSearch";
import { IconTooltip } from "@/components/Tooltip";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import FileList from "@/components/FileList";
import { DailyLogsTable } from "@/components/DailyLogsTable";

// Helper functions for colors
const getCategoryColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case "accounting":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "important":
      return "bg-red-100 text-red-800 border-red-200";
    case "reminder":
      return "bg-yellow-100 text-yellow-800 border-red-200";
    case "milestone":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Log Modal Component
interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingLog: DailyLog | null;
  onSubmit: (data: Omit<DailyLog, "id" | "createdAt" | "updatedAt">) => void;
}

const LogModal = React.memo(
  ({ isOpen, onClose, editingLog, onSubmit }: LogModalProps) => {
    const [formData, setFormData] = useState({
      title: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      category: "accounting" as
        | "accounting"
        | "important"
        | "reminder"
        | "milestone",
      priority: "medium" as "low" | "medium" | "high" | "critical",
      tags: "",
    });

    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    React.useEffect(() => {
      if (isOpen) {
        if (editingLog) {
          setFormData({
            title: editingLog.title,
            description: editingLog.description,
            date: format(new Date(editingLog.date), "yyyy-MM-dd"),
            category: editingLog.category,
            priority: editingLog.priority,
            tags: editingLog.tags.join(", "),
          });
          setUploadedFiles([]);
        } else {
          setFormData({
            title: "",
            description: "",
            date: format(new Date(), "yyyy-MM-dd"),
            category: "accounting",
            priority: "medium",
            tags: "",
          });
          setUploadedFiles([]);
        }
        setErrors({});
      }
    }, [isOpen, editingLog]);

    const handleSubmit = (e: React.FormEvent): void => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};

      if (!formData.title.trim()) {
        newErrors.title = "Title is required";
      }
      if (!formData.description.trim()) {
        newErrors.description = "Description is required";
      }
      if (!formData.date) {
        newErrors.date = "Date is required";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      const tags = formData.tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Handle file uploads
      const files: DailyLogFile[] = [];
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileData: DailyLogFile = {
            id: `file_${Date.now()}_${Math.random()}`,
            dailyLogId: editingLog?.id ?? "new",
            fileName: `dailylog_${editingLog?.id ?? "new"}_${file.name}`,
            originalName: file.name,
            fileSize: file.size,
            fileType: file.type ?? `.${file.name.split(".").pop()}`,
            uploadDate: new Date(),
            uploadedBy: "Admin User",
            filePath: `/uploads/dailylogs/${file.name}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          files.push(fileData);
        }
      }

      onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date),
        category: formData.category,
        priority: formData.priority,
        tags,
        files,
        status: "pending",
      });

      onClose();
    };

    if (!isOpen) {
      return null;
    }

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editingLog ? "Edit Log Entry" : "Create New Log Entry"}
        footer={
          <>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary mr-2"
            >
              Cancel
            </button>
            <button type="submit" form="log-form" className="btn-primary">
              {editingLog ? "Update" : "Create"} Log Entry
            </button>
          </>
        }
      >
        <form id="log-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Title *
                <IconTooltip
                  content="Brief title describing the log entry"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., GST Filing Completed"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-2">{errors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Date *
                <IconTooltip
                  content="Date when this event occurred"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                  errors.date ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-2">{errors.date}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Description *
              <IconTooltip
                content="Detailed description of the event or activity"
                icon={InformationCircleIcon}
                position="right"
              >
                <span></span>
              </IconTooltip>
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Describe what happened, amounts involved, and any important details..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-2">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category
                <IconTooltip
                  content="Type of log entry for better organization"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <select
                value={formData.category}
                onChange={e =>
                  setFormData({
                    ...formData,
                    category: e.target.value as
                      | "accounting"
                      | "important"
                      | "reminder"
                      | "milestone",
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="accounting">Accounting</option>
                <option value="important">Important</option>
                <option value="reminder">Reminder</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Priority
                <IconTooltip
                  content="Importance level of this entry"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <select
                value={formData.priority}
                onChange={e =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as
                      | "low"
                      | "medium"
                      | "high"
                      | "critical",
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Tags
                <IconTooltip
                  content="Comma-separated tags for easy searching"
                  icon={InformationCircleIcon}
                  position="right"
                >
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={e =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="GST, tax-filing, payment"
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Attachments
              <IconTooltip
                content="Upload supporting documents, receipts, or other files for this log entry"
                icon={InformationCircleIcon}
                position="right"
              >
                <span></span>
              </IconTooltip>
            </label>
            {/* FileUpload component was removed from imports, so this section is commented out */}
            {/* <FileUpload
              files={uploadedFiles}
              onFilesChange={setUploadedFiles}
              maxFiles={5}
              acceptedTypes={[
                ".pdf",
                ".doc",
                ".docx",
                ".xls",
                ".xlsx",
                ".jpg",
                ".jpeg",
                ".png",
                ".txt",
              ]}
              title="Upload Files"
              description="Upload supporting documents, receipts, or other files for this log entry"
            /> */}
          </div>
        </form>
      </Modal>
    );
  }
);

LogModal.displayName = "LogModal";

export default function DailyLogsPage(): JSX.Element {
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const { dailyLogs, projects, addDailyLog, updateDailyLog, deleteDailyLog } =
    useAccountingStore();
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [viewLog, setViewLog] = useState<DailyLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  const {
    searchTerm,
    filteredItems: filteredLogs,
    handleSearchChange,
    isSearching,
  } = useSearch(dailyLogs, ["title", "description", "tags"]);

  const filteredByFilters = useMemo(() => {
    return filteredLogs.filter(log => {
      const categoryMatch =
        selectedCategory === "all" || log.category === selectedCategory;
      const priorityMatch =
        selectedPriority === "all" || log.priority === selectedPriority;
      return categoryMatch && priorityMatch;
    });
  }, [filteredLogs, selectedCategory, selectedPriority]);

  const stats = useMemo(() => {
    const totalLogs = dailyLogs.length;
    const accountingLogs = dailyLogs.filter(
      l => l.category === "accounting"
    ).length;
    const importantLogs = dailyLogs.filter(
      l => l.category === "important"
    ).length;
    const criticalLogs = dailyLogs.filter(
      l => l.priority === "critical"
    ).length;
    const highPriorityLogs = dailyLogs.filter(
      l => l.priority === "high"
    ).length;

    return {
      totalLogs,
      accountingLogs,
      importantLogs,
      criticalLogs,
      highPriorityLogs,
    };
  }, [dailyLogs]);

  const handleSubmit = async (
    data: Omit<DailyLog, "id" | "createdAt" | "updatedAt">
  ): Promise<void> => {
    if (editingLog) {
      await updateDailyLog(editingLog.id, data);
      toast.success("Log updated successfully");
    } else {
      addDailyLog(data);
      toast.success("Log added successfully");
    }
    setIsModalOpen(false);
    setEditingLog(null);
  };

  const handleEdit = (log: DailyLog): void => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteDailyLog(id);
      toast.success("Daily log deleted successfully");
    } catch {
      toast.error("Failed to delete daily log");
    }
  };

  const handleView = (log: DailyLog): void => {
    setViewLog(log);
  };

  if (!isClient) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Daily Logs
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Record and track important accounting activities and events
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setEditingLog(null);
                setIsModalOpen(true);
              }}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Log Entry
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Logs
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalLogs}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Accounting
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.accountingLogs}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                {/* StarIcon was removed from imports, so this will cause an error */}
                {/* <StarIcon className="h-5 w-5 text-purple-600" /> */}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Important
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.importantLogs}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                {/* ExclamationTriangleIcon was removed from imports, so this will cause an error */}
                {/* <ExclamationTriangleIcon className="h-5 w-5 text-red-600" /> */}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Critical
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.criticalLogs}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                High Priority
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.highPriorityLogs}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs by title, description, or tags..."
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-primary-600"></div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Categories</option>
                <option value="accounting">Accounting</option>
                <option value="important">Important</option>
                <option value="reminder">Reminder</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedPriority}
                onChange={e => setSelectedPriority(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {/* Table View */}
      <div className="space-y-6">
        <DailyLogsTable
          dailyLogs={filteredByFilters}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>

      {/* Empty State */}
      {filteredByFilters.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No logs found
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm ||
            selectedCategory !== "all" ||
            selectedPriority !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first log entry"}
          </p>
          {!searchTerm &&
            selectedCategory === "all" &&
            selectedPriority === "all" && (
              <button
                onClick={() => {
                  setEditingLog(null);
                  setIsModalOpen(true);
                }}
                className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center mx-auto"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create First Log
              </button>
            )}
        </div>
      )}

      {/* Modal */}
      <LogModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLog(null);
        }}
        editingLog={editingLog}
        onSubmit={handleSubmit}
      />

      {/* View Modal */}
      {viewLog && (
        <Modal
          isOpen={!!viewLog}
          onClose={() => setViewLog(null)}
          title="Log Details"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {viewLog.title}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <p className="text-gray-900 dark:text-white">
                  {format(new Date(viewLog.date), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>

            {viewLog.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {viewLog.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(
                    viewLog.category
                  )}`}
                >
                  {viewLog.category.charAt(0).toUpperCase() +
                    viewLog.category.slice(1)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(
                    viewLog.priority
                  )}`}
                >
                  {viewLog.priority.charAt(0).toUpperCase() +
                    viewLog.priority.slice(1)}
                </span>
              </div>
            </div>

            {viewLog.projectId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Related Project
                </label>
                <p className="text-gray-900 dark:text-white">
                  {projects.find(p => p.id === viewLog.projectId)?.name ??
                    "Unknown Project"}
                </p>
              </div>
            )}

            {viewLog.files && viewLog.files.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attached Files
                </label>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <FileList
                    files={viewLog.files}
                    onDelete={() => {}} // Read-only in view mode
                    title=""
                    showActions={false}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setEditingLog(viewLog);
                  setViewLog(null);
                  setIsModalOpen(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setViewLog(null)}
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
}
