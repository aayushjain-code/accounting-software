"use client";

import { useState, useEffect, useMemo } from "react";
import { useAccountingStore } from "@/store";
import { Project } from "@/types";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  FolderIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { ActionTooltip } from "@/components/Tooltip";
import React from "react";
import Modal from "@/components/Modal";
import { useSearch } from "@/hooks/useSearch";
import { ProjectsTable } from "@/components/ProjectsTable";

export default function ProjectsPage() {
  const { projects, clients, addProject, updateProject, deleteProject } =
    useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
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
    personAssigned: "", // Optional - Person assigned to project
    gstRate: "18",
    gstInclusive: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
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
      personAssigned: formData.personAssigned || undefined,
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
      name: "",
      clientId: "",
      description: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      status: "active" as const,
      budget: "",
      billingTerms: "30",
      billingRate: "",
      estimatedHours: "",
      personAssigned: "",
      gstRate: "18",
      gstInclusive: true,
    });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
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
      personAssigned: project.personAssigned || "",
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

  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  const handleView = (project: Project) => {
    setViewingProject(project);
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

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? `${client.name} - ${client.company}` : "Client not found";
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
      filtered = filtered.filter(project => project.status === statusFilter);
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
                <FolderIcon className="h-4 w-4 text-primary-600" />
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
              placeholder="Search projects by name or description..."
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
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
              onChange={e => setStatusFilter(e.target.value)}
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
      {/* Table View */}
      <div className="space-y-6">
        <ProjectsTable
          projects={filteredProjects}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <FolderIcon className="h-16 w-16" />
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
                Project Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e =>
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
                onChange={e =>
                  setFormData({ ...formData, clientId: e.target.value })
                }
                className="input"
              >
                <option value="">Select a client</option>
                {clients.map(client => (
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
                onChange={e =>
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
                onChange={e =>
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
                onChange={e =>
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
                onChange={e =>
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
                onChange={e =>
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
                Person Assigned (Optional)
              </label>
              <input
                type="text"
                value={formData.personAssigned}
                onChange={e =>
                  setFormData({
                    ...formData,
                    personAssigned: e.target.value,
                  })
                }
                className="input"
                placeholder="e.g., John Doe"
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
                onChange={e =>
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
                onChange={e =>
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
                onChange={e =>
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

      {/* View Project Modal */}
      {viewingProject && (
        <Modal
          isOpen={!!viewingProject}
          onClose={() => setViewingProject(null)}
          title="Project Details"
          footer={
            <button
              type="button"
              onClick={() => setViewingProject(null)}
              className="btn-secondary"
            >
              Close
            </button>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Code
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {viewingProject.projectCode}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    viewingProject.status
                  )}`}
                >
                  {viewingProject.status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Name
              </label>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {viewingProject.name}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Client
              </label>
              <p className="text-gray-900 dark:text-white">
                {getClientName(viewingProject.clientId)}
              </p>
            </div>

            {viewingProject.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                  {viewingProject.description}
                </p>
              </div>
            )}

            {viewingProject.personAssigned && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Person Assigned
                </label>
                <p className="text-gray-900 dark:text-white">
                  {viewingProject.personAssigned}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget
                </label>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ₹{viewingProject.budget?.toLocaleString() || "0"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Billing Rate
                </label>
                <p className="text-gray-900 dark:text-white">
                  ₹{viewingProject.billingRate?.toLocaleString() || "0"}/hr
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Hours
                </label>
                <p className="text-gray-900 dark:text-white">
                  {viewingProject.estimatedHours || "Not specified"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <p className="text-gray-900 dark:text-white">
                  {viewingProject.startDate
                    ? format(new Date(viewingProject.startDate), "MMM dd, yyyy")
                    : "Not specified"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GST Rate
                </label>
                <p className="text-gray-900 dark:text-white">
                  {viewingProject.gstRate}%
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GST Inclusive
                </label>
                <p className="text-gray-900 dark:text-white">
                  {viewingProject.gstInclusive ? "Yes" : "No"}
                </p>
              </div>
            </div>

            {viewingProject.billingTerms && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Billing Terms
                </label>
                <p className="text-gray-900 dark:text-white">
                  {viewingProject.billingTerms} days
                </p>
              </div>
            )}

            {viewingProject.costBreakdown && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Cost Breakdown
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal:
                    </span>
                    <span className="font-medium">
                      ₹{viewingProject.costBreakdown.subtotal?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      GST Amount:
                    </span>
                    <span className="font-medium">
                      ₹
                      {viewingProject.costBreakdown.gstAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t pt-2">
                    <span className="text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      ₹{viewingProject.costBreakdown.total?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
