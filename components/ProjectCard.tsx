"use client";

import React from "react";
import { Project, Client } from "@/types";
import { format } from "date-fns";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";

interface ProjectCardProps {
  project: Project;
  client?: Client;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onView?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  client,
  onEdit,
  onDelete,
  onView,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-mono font-semibold text-primary-700 bg-primary-50 dark:bg-primary-900 px-3 py-1 rounded-md border border-primary-200 dark:border-primary-800 text-sm">
              {project.projectCode}
            </span>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                project.status
              )}`}
            >
              {formatStatus(project.status)}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {project.description}
            </p>
          )}
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Client:</span>
          <span className="text-gray-900 dark:text-white">
            {client?.name || "Unknown Client"}
          </span>
        </div>
        {project.personAssigned && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
            <span className="font-medium">Assigned To:</span>
            <span className="text-gray-900 dark:text-white">
              {project.personAssigned}
            </span>
          </div>
        )}
      </div>

      {/* Project Details */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Budget:
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(project.budget)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">GST:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(project.costBreakdown.gstAmount)} ({project.gstRate}
            %)
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Total:
          </span>
          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(project.totalCost)}
          </span>
        </div>
        {project.estimatedHours && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Est. Hours:
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {project.estimatedHours} hrs
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Start Date:
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {format(new Date(project.startDate), "MMM dd, yyyy")}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {onView && (
            <button
              onClick={() => onView(project)}
              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              title="View Details"
            >
              <EyeIcon className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onEdit(project)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Edit Project"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Delete Project"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
