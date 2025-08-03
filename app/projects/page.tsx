"use client";

import { useState } from "react";
import { useAccountingStore } from "@/store";
import { Project } from "@/types";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import clsx from "clsx";
import Modal from "@/components/Modal";

export default function ProjectsPage() {
  const { projects, clients, addProject, updateProject, deleteProject } =
    useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedTab, setSelectedTab] = useState<"all" | "active" | "inactive">(
    "all"
  );
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const budget = parseFloat(formData.budget);
    const gstRate = parseFloat(formData.gstRate);

    // Calculate cost breakdown
    const subtotal = budget;
    const gstAmount = (subtotal * gstRate) / 100;

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
      updateProject(editingProject.id, projectData);
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
      startDate: "",
      status: "active" as const,
      budget: "",
      billingTerms: "",
      billingRate: "",
      estimatedHours: "",
      gstRate: "18",
      gstInclusive: false,
    });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      projectCode: project.projectCode,
      name: project.name,
      clientId: project.clientId,
      description: project.description,
      budget: project.budget.toString(),
      startDate: format(new Date(project.startDate), "yyyy-MM-dd"),
      status: project.status,
      billingTerms: project.billingTerms.toString(),
      billingRate: project.billingRate?.toString() || "",
      estimatedHours: project.estimatedHours?.toString() || "",
      gstRate: project.gstRate.toString(),
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

  // Filter projects based on selected tab
  const filteredProjects = projects.filter((project) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "active") return project.status === "active";
    if (selectedTab === "inactive") return project.status === "inactive";
    return true;
  });

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
              Manage your client projects and track progress
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Project
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-2">
        {[
          { label: "All", value: "all" },
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedTab(tab.value as any)}
            className={clsx(
              "px-4 py-2 text-sm font-medium focus:outline-none border-b-2 transition",
              selectedTab === tab.value
                ? "border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Projects Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Client</th>
                <th>Costing</th>
                <th>GST</th>
                <th>Total</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProjects.map((project) => {
                const client = clients.find((c) => c.id === project.clientId);
                return (
                  <tr key={project.id}>
                    {/* Project Code as first column, rectangular background */}
                    <td>
                      <span className="font-mono font-semibold text-primary-700 bg-primary-50 dark:bg-primary-900 px-4 py-2 rounded-md border border-primary-200 dark:border-primary-800">
                        {project.projectCode}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {project.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {project.description}
                        </div>
                      </div>
                    </td>
                    <td className="text-gray-900 dark:text-white">
                      {client?.name || "Unknown Client"}
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          ₹
                          {project.budget.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {project.billingRate
                            ? `₹${project.billingRate.toFixed(2)}/hr × `
                            : ""}
                          {project.estimatedHours
                            ? `${project.estimatedHours} hrs`
                            : "Not specified"}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          ₹
                          {project.costBreakdown.gstAmount.toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {project.gstRate}%{" "}
                          {project.gstInclusive ? "(Inclusive)" : "(Exclusive)"}
                        </div>
                      </div>
                    </td>
                    <td className="font-medium text-green-600 dark:text-green-400">
                      ₹
                      {project.totalCost.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td>
                      {format(new Date(project.startDate), "MMM dd, yyyy")}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {project.status !== "archived" && (
                          <button
                            onClick={() => handleArchive(project.id)}
                            className="text-warning-600 dark:text-warning-400 hover:text-warning-900 dark:hover:text-warning-300"
                            title="Archive Project"
                          >
                            <ArchiveBoxIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(project.id)}
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
          {filteredProjects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No projects found. Add your first project to get started.
              </p>
            </div>
          )}
        </div>
      </div>

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
