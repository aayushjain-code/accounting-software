"use client";

import React, { useState } from "react";
import { DailyLog } from "@/types";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { ConfirmationDialog } from "./ConfirmationDialog";

interface DailyLogsTableProps {
  dailyLogs: DailyLog[];
  onEdit: (dailyLog: DailyLog) => void;
  onDelete: (id: string) => void;
  onView?: (dailyLog: DailyLog) => void;
}

export const DailyLogsTable: React.FC<DailyLogsTableProps> = ({
  dailyLogs,
  onEdit,
  onDelete,
  onView,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    logId: string | null;
    logTitle: string;
  }>({
    isOpen: false,
    logId: null,
    logTitle: "",
  });

  const handleDeleteClick = (log: DailyLog) => {
    setDeleteConfirm({
      isOpen: true,
      logId: log.id,
      logTitle: log.title,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.logId) {
      onDelete(deleteConfirm.logId);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "accounting":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "important":
        return "bg-red-100 text-red-800 border-red-200";
      case "reminder":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "milestone":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getPriorityColor = (priority: string) => {
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

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Files
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {dailyLogs
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              )
              .map(dailyLog => {
                return (
                  <tr
                    key={dailyLog.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-primary-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {format(new Date(dailyLog.date), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs">
                        <div className="truncate" title={dailyLog.title}>
                          {dailyLog.title.length > 50
                            ? `${dailyLog.title.substring(0, 50)}...`
                            : dailyLog.title}
                        </div>
                        {dailyLog.description && (
                          <div
                            className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs"
                            title={dailyLog.description}
                          >
                            {dailyLog.description.length > 60
                              ? `${dailyLog.description.substring(0, 60)}...`
                              : dailyLog.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getCategoryColor(
                          dailyLog.category
                        )}`}
                      >
                        {formatCategory(dailyLog.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                          dailyLog.priority
                        )}`}
                      >
                        {formatPriority(dailyLog.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {dailyLog.files && dailyLog.files.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <PaperClipIcon className="h-4 w-4 text-primary-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {dailyLog.files.length} file
                            {dailyLog.files.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          No files
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onView?.(dailyLog)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(dailyLog)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit Daily Log"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(dailyLog)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Daily Log"
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
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${deleteConfirm.logTitle}"? This action cannot be undone.`}
      />
    </div>
  );
};
