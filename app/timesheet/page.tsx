"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useAccountingStore } from "@/store";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
} from "date-fns";
import toast from "react-hot-toast";
import { Timesheet, TimesheetEntry, Project } from "@/types";
import { useSearch } from "@/hooks/useSearch";
import { formatCurrency, getStatusColor } from "@/utils/helpers";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";

// Timesheet Status Badge Component
const StatusBadge = React.memo(({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "draft":
        return { color: "bg-gray-100 text-gray-800", icon: DocumentTextIcon };
      case "submitted":
        return { color: "bg-blue-100 text-blue-800", icon: ClockIcon };
      case "approved":
        return { color: "bg-green-100 text-green-800", icon: CheckIcon };
      case "rejected":
        return { color: "bg-red-100 text-red-800", icon: XMarkIcon };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: DocumentTextIcon };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// Timesheet Row Component
const TimesheetRow = React.memo(
  ({
    timesheet,
    project,
    onEdit,
    onDelete,
    onApprove,
    onReject,
    onGenerateInvoice,
  }: {
    timesheet: Timesheet;
    project: Project | undefined;
    onEdit: (timesheet: Timesheet) => void;
    onDelete: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onGenerateInvoice: (id: string) => void;
  }) => {
    const formatDate = useCallback((date: Date) => {
      return format(new Date(date), "MMM dd, yyyy");
    }, []);

    return (
      <tr key={timesheet.id} className="hover:bg-gray-50">
        <td>
          <div>
            <div className="font-medium text-gray-900">
              {project?.name || "Unknown Project"}
            </div>
            <div className="text-sm text-gray-500">
              {timesheet.workingDays} working days
            </div>
          </div>
        </td>
        <td>
          <div className="text-sm text-gray-900">
            {format(new Date(timesheet.month + "-01"), "MMMM yyyy")}
          </div>
        </td>
        <td>
          <div className="text-sm text-gray-900">
            {timesheet.totalHours} hours
          </div>
          <div className="text-xs text-gray-500">
            {timesheet.workingDays} working days
          </div>
        </td>
        <td>
          <StatusBadge status={timesheet.status} />
        </td>
        <td>
          {timesheet.submittedAt && (
            <div className="text-sm text-gray-900">
              {formatDate(timesheet.submittedAt)}
            </div>
          )}
        </td>
        <td>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(timesheet)}
              className="text-primary-600 hover:text-primary-900 transition-colors"
              title="Edit timesheet"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            {timesheet.status === "submitted" && (
              <>
                <button
                  onClick={() => onApprove(timesheet.id)}
                  className="text-success-600 hover:text-success-900 transition-colors"
                  title="Approve timesheet"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onReject(timesheet.id)}
                  className="text-danger-600 hover:text-danger-900 transition-colors"
                  title="Reject timesheet"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </>
            )}
            {timesheet.status === "approved" && (
              <button
                onClick={() => onGenerateInvoice(timesheet.id)}
                className="text-warning-600 hover:text-warning-900 transition-colors"
                title="Generate invoice"
              >
                <DocumentTextIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onDelete(timesheet.id)}
              className="text-danger-600 hover:text-danger-900 transition-colors"
              title="Delete timesheet"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  }
);

TimesheetRow.displayName = "TimesheetRow";

// Timesheet Modal Component
const TimesheetModal = React.memo(
  ({
    isOpen,
    onClose,
    editingTimesheet,
    onSubmit,
  }: {
    isOpen: boolean;
    onClose: () => void;
    editingTimesheet: Timesheet | null;
    onSubmit: (data: any) => void;
  }) => {
    const { projects } = useAccountingStore();
    const [formData, setFormData] = useState({
      projectId: "",
      month: "",
      year: new Date().getFullYear(),
      totalWorkingDays: "",
      daysWorked: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when modal opens/closes
    React.useEffect(() => {
      if (isOpen) {
        if (editingTimesheet) {
          setFormData({
            projectId: editingTimesheet.projectId,
            month: editingTimesheet.month,
            year: editingTimesheet.year,
            totalWorkingDays: editingTimesheet.workingDays.toString(),
            daysWorked: editingTimesheet.workingDays.toString(),
          });
        } else {
          setFormData({
            projectId: "",
            month: format(new Date(), "yyyy-MM"),
            year: new Date().getFullYear(),
            totalWorkingDays: "",
            daysWorked: "",
          });
        }
        setErrors({});
      }
    }, [isOpen, editingTimesheet]);

    const validateForm = useCallback(() => {
      const newErrors: Record<string, string> = {};

      if (!formData.projectId) newErrors.projectId = "Project is required";
      if (!formData.month) newErrors.month = "Month is required";
      if (
        !formData.totalWorkingDays ||
        parseInt(formData.totalWorkingDays) <= 0
      )
        newErrors.totalWorkingDays = "Valid total working days is required";
      if (!formData.daysWorked || parseInt(formData.daysWorked) <= 0)
        newErrors.daysWorked = "Valid days worked is required";
      if (parseInt(formData.daysWorked) > parseInt(formData.totalWorkingDays))
        newErrors.daysWorked = "Days worked cannot exceed total working days";

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
          onSubmit(formData);
        }
      },
      [formData, validateForm, onSubmit]
    );

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              {editingTimesheet ? "Edit Timesheet" : "Create New Timesheet"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project *
                  </label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) =>
                      setFormData({ ...formData, projectId: e.target.value })
                    }
                    className={`input ${
                      errors.projectId ? "border-danger-500" : ""
                    }`}
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.projectId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Month *
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                    className={`input ${
                      errors.month ? "border-danger-500" : ""
                    }`}
                  />
                  {errors.month && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.month}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        year: parseInt(e.target.value),
                      })
                    }
                    className="input"
                    min="2020"
                    max="2030"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Working Days *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="31"
                    value={formData.totalWorkingDays}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalWorkingDays: e.target.value,
                      })
                    }
                    className={`input ${
                      errors.totalWorkingDays ? "border-danger-500" : ""
                    }`}
                  />
                  {errors.totalWorkingDays && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.totalWorkingDays}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days Worked *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="31"
                    value={formData.daysWorked}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        daysWorked: e.target.value,
                      })
                    }
                    className={`input ${
                      errors.daysWorked ? "border-danger-500" : ""
                    }`}
                  />
                  {errors.daysWorked && (
                    <p className="text-danger-500 text-sm mt-1">
                      {errors.daysWorked}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTimesheet ? "Update" : "Create"} Timesheet
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
);

TimesheetModal.displayName = "TimesheetModal";

export default function TimesheetPage() {
  const {
    timesheets,
    projects,
    addTimesheet,
    updateTimesheet,
    deleteTimesheet,
    generateInvoiceFromTimesheet,
  } = useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [timesheetToDelete, setTimesheetToDelete] = useState<string | null>(
    null
  );

  // Use the search hook
  const {
    searchTerm,
    filteredItems: filteredTimesheets,
    handleSearchChange,
    isSearching,
  } = useSearch(timesheets, ["month", "status"]);

  // Memoized stats
  const stats = useMemo(() => {
    const totalTimesheets = timesheets.length;
    const pendingTimesheets = timesheets.filter(
      (t) => t.status === "submitted"
    ).length;
    const approvedTimesheets = timesheets.filter(
      (t) => t.status === "approved"
    ).length;
    const totalHours = timesheets.reduce((sum, t) => sum + t.totalHours, 0);

    return {
      totalTimesheets,
      pendingTimesheets,
      approvedTimesheets,
      totalHours,
    };
  }, [timesheets]);

  const handleSubmit = useCallback(
    (formData: any) => {
      const timesheetData = {
        ...formData,
        staffId: "", // Remove staff member as requested
        workingDays: parseInt(formData.totalWorkingDays),
        totalHours: parseInt(formData.daysWorked) * 8, // Assuming 8 hours per day
        leaveDays:
          parseInt(formData.totalWorkingDays) - parseInt(formData.daysWorked),
      };

      if (editingTimesheet) {
        updateTimesheet(editingTimesheet.id, timesheetData);
        toast.success("Timesheet updated successfully");
      } else {
        addTimesheet({
          ...timesheetData,
          status: "draft",
        });
        toast.success("Timesheet created successfully");
      }

      setIsModalOpen(false);
      setEditingTimesheet(null);
    },
    [editingTimesheet, addTimesheet, updateTimesheet]
  );

  const handleEdit = useCallback((timesheet: Timesheet) => {
    setEditingTimesheet(timesheet);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTimesheetToDelete(id);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (timesheetToDelete) {
      deleteTimesheet(timesheetToDelete);
      toast.success("Timesheet deleted successfully");
      setTimesheetToDelete(null);
    }
  }, [timesheetToDelete, deleteTimesheet]);

  const handleApprove = useCallback(
    (id: string) => {
      updateTimesheet(id, {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: "admin",
      });
      toast.success("Timesheet approved successfully");
    },
    [updateTimesheet]
  );

  const handleReject = useCallback(
    (id: string) => {
      updateTimesheet(id, {
        status: "rejected",
        rejectionReason: "Rejected by admin",
      });
      toast.success("Timesheet rejected successfully");
    },
    [updateTimesheet]
  );

  const handleGenerateInvoice = useCallback(
    (id: string) => {
      try {
        const invoice = generateInvoiceFromTimesheet(id);
        toast.success("Invoice generated successfully");
        // You could navigate to the invoice page here
      } catch (error) {
        toast.error("Failed to generate invoice");
      }
    },
    [generateInvoiceFromTimesheet]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
          <p className="text-gray-600">
            Manage project timesheets and generate invoices
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Timesheet
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Total Timesheets
          </h3>
          <p className="text-3xl font-bold text-primary-600">
            {stats.totalTimesheets}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Pending Approval
          </h3>
          <p className="text-3xl font-bold text-warning-600">
            {stats.pendingTimesheets}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Approved</h3>
          <p className="text-3xl font-bold text-success-600">
            {stats.approvedTimesheets}
          </p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Total Hours
          </h3>
          <p className="text-3xl font-bold text-info-600">{stats.totalHours}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search timesheets..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-primary-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* Timesheets Table */}
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Month</th>
                <th>Hours & Days</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTimesheets.map((timesheet) => {
                const project = projects.find(
                  (p) => p.id === timesheet.projectId
                );

                return (
                  <TimesheetRow
                    key={timesheet.id}
                    timesheet={timesheet}
                    project={project}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onGenerateInvoice={handleGenerateInvoice}
                  />
                );
              })}
            </tbody>
          </table>
          {filteredTimesheets.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm
                  ? "No timesheets found matching your search."
                  : "No timesheets found. Create your first timesheet to get started."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <TimesheetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTimesheet(null);
        }}
        editingTimesheet={editingTimesheet}
        onSubmit={handleSubmit}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Timesheet"
        message="Are you sure you want to delete this timesheet? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
