"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { useAccountingStore } from "@/store";
import { Project } from "@/types";
import Modal from "./Modal";

import { ConfirmationDialog } from "./ConfirmationDialog";
import { formatCurrency } from "@/utils/formatters";

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onView: (project: Project) => void;
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({
  projects,
  onEdit,
  onDelete,
  onView,
}) => {
  // State for table features
  const [sortField, setSortField] = useState<keyof Project>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [viewProject, setViewProject] = useState<Project | null>(null);

  // Excel-like sorting
  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Removed inline editing functionality - users must use explicit edit button

  const renderSortIcon = (field: keyof Project) => {
    if (sortField !== field) {return null;}
    return sortDirection === "asc" ? (
      <ArrowUpIcon className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDownIcon className="h-4 w-4 ml-1" />
    );
  };

  const renderReadOnlyCell = (
    project: Project,
    field: keyof Project,
    value: string | number | boolean
  ) => {
    return <div className="px-2 py-1">{value?.toString() || "-"}</div>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns = [
    { key: "projectCode", label: "Code", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "personAssigned", label: "Assigned To", sortable: true },
    { key: "budget", label: "Budget", sortable: true },
    { key: "startDate", label: "Start Date", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    column.sortable
                      ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                      : ""
                  }`}
                  onClick={() =>
                    column.sortable && handleSort(column.key as keyof Project)
                  }
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.sortable &&
                      renderSortIcon(column.key as keyof Project)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projects
              .sort((a, b) => {
                const aValue = a[sortField];
                const bValue = b[sortField];

                if (typeof aValue === "string" && typeof bValue === "string") {
                  return sortDirection === "asc"
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
                }

                if (aValue !== undefined && bValue !== undefined) {
                  if (aValue < bValue) {return sortDirection === "asc" ? -1 : 1;}
                  if (aValue > bValue) {return sortDirection === "asc" ? 1 : -1;}
                }
                return 0;
              })
              .map(project => (
                <tr
                  key={project.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.projectCode}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap max-w-32">
                    <div
                      className="text-sm font-medium text-gray-900 dark:text-white truncate"
                      title={project.name}
                    >
                      {renderReadOnlyCell(project, "name", project.name)}
                    </div>
                  </td>
                  <td className="px-3 py-2 max-w-48">
                    <div className="text-sm text-gray-900 dark:text-white">
                      <div className="truncate" title={project.description}>
                        {renderReadOnlyCell(
                          project,
                          "description",
                          project.description
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {project.personAssigned || "-"}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <CurrencyRupeeIcon className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                      {renderReadOnlyCell(
                        project,
                        "budget",
                        formatCurrency(project.budget || 0)
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-1 flex-shrink-0" />
                      {project.startDate
                        ? format(new Date(project.startDate), "MMM dd")
                        : "-"}
                    </div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onView(project)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEdit(project)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded"
                        title="Edit Project"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setProjectToDelete(project.id);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded"
                        title="Delete Project"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewProject && (
        <Modal
          isOpen={!!viewProject}
          onClose={() => setViewProject(null)}
          title="Project Details"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Code
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {viewProject.projectCode}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    viewProject.status
                  )}`}
                >
                  {viewProject.status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name
              </label>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {viewProject.name}
              </p>
            </div>

            {viewProject.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {viewProject.description}
                </p>
              </div>
            )}

            {viewProject.personAssigned && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Person Assigned
                </label>
                <p className="text-gray-900 dark:text-white">
                  {viewProject.personAssigned}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget
                </label>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(viewProject.budget || 0)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <p className="text-gray-900 dark:text-white">
                  {viewProject.startDate
                    ? format(new Date(viewProject.startDate), "MMMM dd, yyyy")
                    : "Not set"}
                </p>
              </div>
            </div>

            {viewProject.billingRate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Billing Rate
                </label>
                <p className="text-gray-900 dark:text-white">
                  {formatCurrency(viewProject.billingRate)}/hr
                </p>
              </div>
            )}

            {viewProject.estimatedHours && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Hours
                </label>
                <p className="text-gray-900 dark:text-white">
                  {viewProject.estimatedHours} hours
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  onEdit(viewProject);
                  setViewProject(null);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setViewProject(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <>
              <p className="text-lg font-medium">No projects yet</p>
              <p className="text-sm">
                Get started by adding your first project
              </p>
            </>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          if (projectToDelete) {
            onDelete(projectToDelete);
            setShowDeleteDialog(false);
            setProjectToDelete(null);
          }
        }}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
