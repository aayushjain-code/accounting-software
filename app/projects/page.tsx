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

export default function ProjectsPage() {
  const { projects, clients, addProject, updateProject, deleteProject } =
    useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    projectCode: "",
    name: "",
    clientId: "",
    description: "",
    budget: "",
    startDate: "",
    status: "active",
    billingTerms: "30",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const projectData = {
      ...formData,
      startDate: new Date(formData.startDate),
      budget: parseFloat(formData.budget),
      billingTerms: parseInt(formData.billingTerms),
      status: formData.status as
        | "active"
        | "completed"
        | "on-hold"
        | "archived",
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
      budget: "",
      startDate: "",
      status: "active",
      billingTerms: "30",
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your client projects</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Project
        </button>
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
                <th>Budget</th>
                <th>Billing Terms</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => {
                const client = clients.find((c) => c.id === project.clientId);
                return (
                  <tr key={project.id}>
                    <td>
                      <span className="font-mono font-medium text-primary-600">
                        {project.projectCode}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {project.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {project.description}
                        </div>
                      </div>
                    </td>
                    <td>{client?.name || "Unknown Client"}</td>
                    <td className="font-medium text-gray-900">
                      ₹{project.budget.toLocaleString()}
                    </td>
                    <td className="font-medium text-gray-900">
                      {project.billingTerms} days
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
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        {project.status !== "archived" && (
                          <button
                            onClick={() => handleArchive(project.id)}
                            className="text-warning-600 hover:text-warning-900"
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
          {projects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No projects found. Add your first project to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {editingProject ? "Edit Project" : "Add New Project"}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                            | "completed"
                            | "on-hold"
                            | "archived",
                        })
                      }
                      className="input"
                    >
                      <option value="active">Active</option>
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
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProject(null);
                      setFormData({
                        projectCode: "",
                        name: "",
                        clientId: "",
                        description: "",
                        budget: "",
                        startDate: "",
                        status: "active",
                        billingTerms: "30",
                      });
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingProject ? "Update" : "Add"} Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
