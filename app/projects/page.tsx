"use client";

import { useState, useMemo, useEffect } from "react";
import { useAccountingStore } from "@/store";
import { Project, Client } from "@/types";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  TagIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Tooltip, ActionTooltip, IconTooltip } from "@/components/Tooltip";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import React from "react";
import Modal from "@/components/Modal";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import { Pagination } from "@/components/Pagination";
import { performanceMonitor } from "@/utils/performance";
import { ViewToggle } from "@/components/ViewToggle";
import { ProjectsTable } from "@/components/ProjectsTable";
import { ProjectCard } from "@/components/ProjectCard";

export default function ProjectsPage() {
  const { projects, clients, addProject, updateProject, deleteProject } =
    useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [formData, setFormData] = useState({
    projectCode: "",
    name: "",
    clientId: "",
    description: "",
    startDate: "",
    status: "active" as
      | "active"
      | "inactive"
      | "completed"
      | "on-hold"
      | "archived",
    budget: "",
    billingTerms: "",
    billingRate: "",
    estimatedHours: "", // Made optional
    gstRate: "18",
    gstInclusive: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      projectCode: formData.projectCode,
      name: formData.name,
      clientId: formData.clientId,
      description: formData.description,
      startDate: new Date(formData.startDate),
      status: formData.status,
      budget: parseFloat(formData.budget),
      billingTerms: parseInt(formData.billingTerms),
      billingRate: formData.billingRate ? parseFloat(formData.billingRate) : 0,
      estimatedHours: formData.estimatedHours
        ? parseFloat(formData.estimatedHours)
        : undefined,
      gstRate: parseFloat(formData.gstRate),
      gstInclusive: formData.gstInclusive,
      totalCost:
        parseFloat(formData.budget) * (1 + parseFloat(formData.gstRate) / 100),
      costBreakdown: {
        subtotal: parseFloat(formData.budget),
        gstAmount:
          parseFloat(formData.budget) * (parseFloat(formData.gstRate) / 100),
        total:
          parseFloat(formData.budget) *
          (1 + parseFloat(formData.gstRate) / 100),
      },
    };

    if (editingProject) {
      await updateProject(editingProject.id, projectData);
      toast.success("Project updated successfully");
    } else {
      addProject(projectData);
      toast.success("Project added successfully");
    }

    setIsModalOpen(false);
    setEditingProject(null);
    setFormData({
      projectCode: "",
      name: "",
      clientId: "",
      description: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      status: "active" as const,
      budget: "",
      billingTerms: "30",
      billingRate: "",
      estimatedHours: "",
      gstRate: "18",
      gstInclusive: true,
    });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      projectCode: project.projectCode,
      name: project.name,
      description: project.description,
      clientId: project.clientId,
      startDate: project.startDate
        ? format(new Date(project.startDate), "yyyy-MM-dd")
        : "",
      status: project.status,
      budget: project.budget?.toString() || "",
      billingTerms: project.billingTerms?.toString() || "",
      billingRate: project.billingRate?.toString() || "",
      estimatedHours: project.estimatedHours?.toString() || "",
      gstRate: project.gstRate?.toString() || "",
      gstInclusive: project.gstInclusive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
      toast.success("Project deleted successfully");
    }
  };

  const handleArchive = (id: string) => {
    if (confirm("Are you sure you want to archive this project?")) {
      updateProject(id, { status: "archived" });
      toast.success("Project archived successfully");
    }
  };

  const handleView = (project: Project) => {
    // For now, just open the edit modal to view details
    // You can implement a separate view modal later if needed
    setEditingProject(project);
    setFormData({
      projectCode: project.projectCode,
      name: project.name,
      description: project.description,
      clientId: project.clientId,
      startDate: project.startDate
        ? format(new Date(project.startDate), "yyyy-MM-dd")
        : "",
      status: project.status,
      budget: project.budget?.toString() || "",
      billingTerms: project.billingTerms?.toString() || "",
      billingRate: project.billingRate?.toString() || "",
      estimatedHours: project.estimatedHours?.toString() || "",
      gstRate: project.gstRate?.toString() || "",
      gstInclusive: project.gstInclusive,
    });
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-success-600 bg-success-100";
      case "completed":
        return "text-primary-600 bg-primary-100";
      case "on-hold":
        return "text-warning-600 bg-warning-100";
      case "archived":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Search and filter functionality
  const {
    searchTerm,
    isSearching,
    handleSearchChange,
    filteredItems: searchFilteredProjects,
  } = useSearch(projects, ["name", "projectCode", "description"]);

  // Filter projects based on search and status
  const filteredProjects = useMemo(() => {
    let filtered = searchFilteredProjects;

    if (statusFilter !== "all") {
      filtered = filtered.filter((project) => project.status === statusFilter);
    }

    return filtered;
  }, [searchFilteredProjects, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your projects and track their progress
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <BuildingOfficeIcon className="h-4 w-4 text-primary-600" />
                <span>
                  <span className="font-semibold text-primary-600">
                    {projects.length}
                  </span>{" "}
                  Projects
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ViewToggle
              viewMode={viewMode}
              onViewChange={setViewMode}
              className="mr-2"
            />
            <ActionTooltip
              content="Add New Project"
              action="Create a new project profile"
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Project
              </button>
            </ActionTooltip>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search projects by name, code, or description..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            />
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-primary-600"></div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
              <option value="on-hold">On Hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === "cards" ? (
        /* Cards View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                client={clients.find((c) => c.id === project.clientId)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Table View */
        <div className="space-y-6">
          <ProjectsTable
            projects={filteredProjects}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <BuildingOfficeIcon className="h-16 w-16" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-4">
            {searchTerm || statusFilter !== "all"
              ? "No projects found matching your criteria."
              : "No projects found. Add your first project to get started."}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200"
            >
              Add Your First Project
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        title={editingProject ? "Edit Project" : "Add New Project"}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingProject(null);
              }}
              className="btn-secondary mr-2"
            >
              Cancel
            </button>
            <button type="submit" form="project-form" className="btn-primary">
              {editingProject ? "Update" : "Create"}
            </button>
          </>
        }
      >
        <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Code *
              </label>
              <input
                type="text"
                required
                value={formData.projectCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    projectCode: e.target.value,
                  })
                }
                className="input"
                placeholder="e.g., BST-01, BST-02"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) =>
                  setFormData({ ...formData, clientId: e.target.value })
                }
                className="input"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as
                      | "active"
                      | "inactive"
                      | "completed"
                      | "on-hold"
                      | "archived",
                  })
                }
                className="input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    budget: e.target.value,
                  })
                }
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Terms
              </label>
              <select
                required
                value={formData.billingTerms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingTerms: e.target.value,
                  })
                }
                className="input"
              >
                <option value="10">10 days</option>
                <option value="15">15 days</option>
                <option value="30">30 days</option>
                <option value="45">45 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Rate (₹/hr) (Optional)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.billingRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billingRate: e.target.value,
                  })
                }
                className="input"
                placeholder="e.g., 1200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Hours (Optional)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    estimatedHours: e.target.value,
                  })
                }
                className="input"
                placeholder="e.g., 400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Rate (%)
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                step="0.01"
                value={formData.gstRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gstRate: e.target.value,
                  })
                }
                className="input"
                placeholder="e.g., 18"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST Inclusive
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gstInclusive"
                    value="false"
                    checked={!formData.gstInclusive}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        gstInclusive: false,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Exclusive</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="gstInclusive"
                    value="true"
                    checked={formData.gstInclusive}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        gstInclusive: true,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Inclusive</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
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
