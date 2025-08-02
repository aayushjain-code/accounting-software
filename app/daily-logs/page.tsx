"use client";

import React, { useState, useMemo } from "react";
import { useAccountingStore } from "@/store";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  PencilIcon,
  TrashIcon,
  InformationCircleIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useSearch } from "@/hooks/useSearch";
import { Tooltip, ActionTooltip, IconTooltip } from "@/components/Tooltip";

// Log Card Component
const LogCard = React.memo(({ log, onEdit, onDelete }: any) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "accounting": return "📊";
      case "important": return "⭐";
      case "reminder": return "⏰";
      case "milestone": return "🎯";
      default: return "📝";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "accounting": return "bg-blue-100 text-blue-800";
      case "important": return "bg-purple-100 text-purple-800";
      case "reminder": return "bg-yellow-100 text-yellow-800";
      case "milestone": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getCategoryIcon(log.category)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{log.title}</h3>
            <p className="text-sm text-gray-500">{format(new Date(log.date), "MMM dd, yyyy")}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(log.priority)}`}>
            {log.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(log.category)}`}>
            {log.category}
          </span>
        </div>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">{log.description}</p>

      {log.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {log.tags.map((tag: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md flex items-center">
              <TagIcon className="h-3 w-3 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-500">
          <CalendarIcon className="h-4 w-4 mr-1" />
          Created: {format(new Date(log.createdAt), "MMM dd, yyyy")}
        </div>
        <div className="flex items-center space-x-2">
          <ActionTooltip content="Edit log entry" action="Modify details">
            <button onClick={() => onEdit(log)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200">
              <PencilIcon className="h-4 w-4" />
            </button>
          </ActionTooltip>
          <ActionTooltip content="Delete log entry" action="Permanently remove">
            <button onClick={() => onDelete(log.id)} className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all duration-200">
              <TrashIcon className="h-4 w-4" />
            </button>
          </ActionTooltip>
        </div>
      </div>
    </div>
  );
});

LogCard.displayName = "LogCard";

// Log Modal Component
const LogModal = React.memo(({ isOpen, onClose, editingLog, onSubmit }: any) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    category: "accounting" as const,
    priority: "medium" as const,
    tags: "",
  });

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
      } else {
        setFormData({
          title: "",
          description: "",
          date: format(new Date(), "yyyy-MM-dd"),
          category: "accounting",
          priority: "medium",
          tags: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, editingLog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.date) newErrors.date = "Date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const tags = formData.tags.split(",").map((tag) => tag.trim()).filter((tag) => tag.length > 0);

    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim(),
      date: new Date(formData.date),
      category: formData.category,
      priority: formData.priority,
      tags,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {editingLog ? "Edit Log Entry" : "Create New Log Entry"}
              </h3>
              <p className="text-gray-600 mt-1">
                {editingLog ? "Update the log entry details" : "Record important accounting activities and events"}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Title *
                <IconTooltip content="Brief title describing the log entry" icon={InformationCircleIcon} position="right">
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                  errors.title ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., GST Filing Completed"
              />
              {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Date *
                <IconTooltip content="Date when this event occurred" icon={InformationCircleIcon} position="right">
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                  errors.date ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.date && <p className="text-red-500 text-sm mt-2">{errors.date}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Description *
              <IconTooltip content="Detailed description of the event or activity" icon={InformationCircleIcon} position="right">
                <span></span>
              </IconTooltip>
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                errors.description ? "border-red-300" : "border-gray-300"
              }`}
              placeholder="Describe what happened, amounts involved, and any important details..."
            />
            {errors.description && <p className="text-red-500 text-sm mt-2">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Category
                <IconTooltip content="Type of log entry for better organization" icon={InformationCircleIcon} position="right">
                  <span></span>
                </IconTooltip>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
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
                <IconTooltip content="Importance level of this entry" icon={InformationCircleIcon} position="right">
                  <span></span>
                </IconTooltip>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
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
                <IconTooltip content="Comma-separated tags for easy searching" icon={InformationCircleIcon} position="right">
                  <span></span>
                </IconTooltip>
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="GST, tax-filing, payment"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {editingLog ? "Update" : "Create"} Log Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

LogModal.displayName = "LogModal";

export default function DailyLogsPage() {
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const { dailyLogs, addDailyLog, updateDailyLog, deleteDailyLog } = useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  const { searchTerm, filteredItems: filteredLogs, handleSearchChange, isSearching } = useSearch(dailyLogs, ["title", "description", "tags"]);

  const filteredByFilters = useMemo(() => {
    return filteredLogs.filter((log) => {
      const categoryMatch = selectedCategory === "all" || log.category === selectedCategory;
      const priorityMatch = selectedPriority === "all" || log.priority === selectedPriority;
      return categoryMatch && priorityMatch;
    });
  }, [filteredLogs, selectedCategory, selectedPriority]);

  const stats = useMemo(() => {
    const totalLogs = dailyLogs.length;
    const accountingLogs = dailyLogs.filter((l) => l.category === "accounting").length;
    const importantLogs = dailyLogs.filter((l) => l.category === "important").length;
    const criticalLogs = dailyLogs.filter((l) => l.priority === "critical").length;
    const highPriorityLogs = dailyLogs.filter((l) => l.priority === "high").length;

    return { totalLogs, accountingLogs, importantLogs, criticalLogs, highPriorityLogs };
  }, [dailyLogs]);

  const handleSubmit = (data: any) => {
    if (editingLog) {
      updateDailyLog(editingLog.id, data);
    } else {
      addDailyLog(data);
    }
  };

  const handleEdit = (log: any) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this log entry?")) {
      deleteDailyLog(id);
    }
  };

  if (!isClient) {
    return <div className="space-y-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Logs</h1>
            <p className="text-gray-600 mt-2">Record and track important accounting activities and events</p>
          </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Accounting</p>
              <p className="text-2xl font-bold text-blue-600">{stats.accountingLogs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <StarIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Important</p>
              <p className="text-2xl font-bold text-purple-600">{stats.importantLogs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalLogs}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-orange-600">{stats.highPriorityLogs}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
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
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

      {/* Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredByFilters.map((log: any) => (
          <LogCard key={log.id} log={log} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>

      {/* Empty State */}
      {filteredByFilters.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No logs found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedCategory !== "all" || selectedPriority !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first log entry"}
          </p>
          {!searchTerm && selectedCategory === "all" && selectedPriority === "all" && (
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
    </div>
  );
} 