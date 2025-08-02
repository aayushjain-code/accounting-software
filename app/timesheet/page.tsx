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
  CurrencyRupeeIcon,
  CalculatorIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  getDaysInMonth,
} from "date-fns";
import toast from "react-hot-toast";
import { Timesheet, TimesheetEntry, Project } from "@/types";
import { useSearch } from "@/hooks/useSearch";
import { formatCurrency, getStatusColor } from "@/utils/helpers";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { Tooltip, ActionTooltip, IconTooltip } from "@/components/Tooltip";
import {
  InformationCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

// Enhanced Status Badge Component
const StatusBadge = React.memo(({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "draft":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: DocumentTextIcon,
          bg: "bg-gray-50",
        };
      case "submitted":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: ClockIcon,
          bg: "bg-blue-50",
        };
      case "approved":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckIcon,
          bg: "bg-green-50",
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XMarkIcon,
          bg: "bg-red-50",
        };
      case "invoiced":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: CurrencyRupeeIcon,
          bg: "bg-purple-50",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: DocumentTextIcon,
          bg: "bg-gray-50",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color} shadow-sm`}
    >
      <Icon className="h-3.5 w-3.5 mr-1.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// Enhanced Stats Card Component
const StatsCard = React.memo(
  ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    trend,
  }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    trend?: { value: number; isPositive: boolean };
  }) => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span
                  className={`text-xs font-medium ${
                    trend.isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs last month
                </span>
              </div>
            )}
          </div>
          <div
            className={`p-3 rounded-lg ${color
              .replace("text-", "bg-")
              .replace("-600", "-100")}`}
          >
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
        </div>
      </div>
    );
  }
);

StatsCard.displayName = "StatsCard";

// Enhanced Timesheet Row Component
const TimesheetRow = React.memo(
  ({
    timesheet,
    project,
    onEdit,
    onDelete,
    onApprove,
    onReject,
    onGenerateInvoice,
    onMarkInvoiced,
  }: {
    timesheet: Timesheet;
    project: Project | undefined;
    onEdit: (timesheet: Timesheet) => void;
    onDelete: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    onGenerateInvoice: (id: string) => void;
    onMarkInvoiced: (id: string) => void;
  }) => {
    const formatDate = useCallback((date: Date) => {
      return format(new Date(date), "MMM dd, yyyy");
    }, []);

    return (
      <tr
        key={timesheet.id}
        className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
      >
        <td className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <FolderIcon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                {project?.name || "Unknown Project"}
              </div>
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">
                  {project?.projectCode || "N/A"}
                </span>
                <span>•</span>
                <span>
                  {format(new Date(timesheet.month + "-01"), "MMMM yyyy")}
                </span>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <CalculatorIcon className="h-4 w-4 text-primary-600" />
              <span className="font-medium text-gray-900">
                {timesheet.daysWorked} days
              </span>
            </div>
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <ClockIcon className="h-3 w-3" />
              <span>{timesheet.totalHours} hours</span>
              <span>•</span>
              <span>₹{timesheet.billingRate}/hr</span>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-right">
            <div className="font-bold text-lg text-gray-900">
              {formatCurrency(timesheet.totalAmount)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {timesheet.daysWorked} × {timesheet.hoursPerDay}h × ₹
              {timesheet.billingRate}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <StatusBadge status={timesheet.status} />
        </td>
        <td className="px-6 py-4">
          {timesheet.submittedAt && (
            <div className="text-sm text-gray-600">
              {formatDate(timesheet.submittedAt)}
            </div>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center space-x-1">
            <ActionTooltip
              content="Edit timesheet"
              action="Click to modify details"
            >
              <button
                onClick={() => onEdit(timesheet)}
                className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </ActionTooltip>
            {timesheet.status === "draft" && (
              <ActionTooltip
                content="Submit for approval"
                action="Move to review queue"
              >
                <button
                  onClick={() => onApprove(timesheet.id)}
                  className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-all duration-200"
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
              </ActionTooltip>
            )}
            {timesheet.status === "submitted" && (
              <>
                <ActionTooltip
                  content="Approve timesheet"
                  action="Approve for invoicing"
                >
                  <button
                    onClick={() => onApprove(timesheet.id)}
                    className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-all duration-200"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                </ActionTooltip>
                <ActionTooltip
                  content="Reject timesheet"
                  action="Return to draft status"
                >
                  <button
                    onClick={() => onReject(timesheet.id)}
                    className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all duration-200"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </ActionTooltip>
              </>
            )}
            {timesheet.status === "approved" && (
              <>
                <ActionTooltip
                  content="Generate invoice"
                  action="Create invoice automatically"
                >
                  <button
                    onClick={() => onGenerateInvoice(timesheet.id)}
                    className="p-2 text-gray-400 hover:text-warning-600 hover:bg-warning-50 rounded-lg transition-all duration-200"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                  </button>
                </ActionTooltip>
                <ActionTooltip
                  content="Mark as invoiced"
                  action="Mark as billed"
                >
                  <button
                    onClick={() => onMarkInvoiced(timesheet.id)}
                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  >
                    <CurrencyRupeeIcon className="h-4 w-4" />
                  </button>
                </ActionTooltip>
              </>
            )}
            <ActionTooltip
              content="Delete timesheet"
              action="Permanently remove"
            >
              <button
                onClick={() => onDelete(timesheet.id)}
                className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all duration-200"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </ActionTooltip>
          </div>
        </td>
      </tr>
    );
  }
);

TimesheetRow.displayName = "TimesheetRow";

// Helper function to calculate working days in a month
const calculateWorkingDays = (year: number, month: number) => {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  const days = eachDayOfInterval({ start, end });
  return days.filter((day) => !isWeekend(day)).length;
};

// Enhanced Timesheet Modal Component
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
      year: 2024,
      daysWorked: "",
      hoursPerDay: "8",
      totalWorkingDays: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedProject, setSelectedProject] = useState<Project | null>(
      null
    );

    // Reset form when modal opens/closes
    React.useEffect(() => {
      if (isOpen) {
        if (editingTimesheet) {
          setFormData({
            projectId: editingTimesheet.projectId,
            month: editingTimesheet.month,
            year: editingTimesheet.year,
            daysWorked: editingTimesheet.daysWorked.toString(),
            hoursPerDay: editingTimesheet.hoursPerDay.toString(),
            totalWorkingDays: editingTimesheet.totalWorkingDays.toString(),
          });
          const project = projects.find(
            (p) => p.id === editingTimesheet.projectId
          );
          setSelectedProject(project || null);
        } else {
          const now = new Date();
          setFormData({
            projectId: "",
            month: format(now, "yyyy-MM"),
            year: now.getFullYear(),
            daysWorked: "",
            hoursPerDay: "8",
            totalWorkingDays: "",
          });
          setSelectedProject(null);
        }
        setErrors({});
      }
    }, [isOpen, editingTimesheet, projects]);

    // Calculate working days when project or month changes
    React.useEffect(() => {
      if (formData.month && formData.year) {
        const [year, month] = formData.month.split("-").map(Number);
        const workingDays = calculateWorkingDays(year, month);
        setFormData((prev) => ({
          ...prev,
          totalWorkingDays: workingDays.toString(),
        }));
      }
    }, [formData.month, formData.year]);

    // Update selected project when projectId changes
    React.useEffect(() => {
      if (formData.projectId) {
        const project = projects.find((p) => p.id === formData.projectId);
        setSelectedProject(project || null);
      } else {
        setSelectedProject(null);
      }
    }, [formData.projectId, projects]);

    const validateForm = useCallback(() => {
      const newErrors: Record<string, string> = {};

      if (!formData.projectId) newErrors.projectId = "Project is required";
      if (!formData.month) newErrors.month = "Month is required";
      if (!formData.daysWorked || parseInt(formData.daysWorked) <= 0)
        newErrors.daysWorked = "Valid days worked is required";

      const totalWorkingDays = parseInt(formData.totalWorkingDays || "0");
      const daysWorked = parseInt(formData.daysWorked);

      if (daysWorked > totalWorkingDays)
        newErrors.daysWorked = `Days worked cannot exceed ${totalWorkingDays} working days`;

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
          const totalWorkingDays = parseInt(formData.totalWorkingDays || "0");
          const daysWorked = parseInt(formData.daysWorked);
          const hoursPerDay = parseInt(formData.hoursPerDay);
          const billingRate = selectedProject?.billingTerms || 0;
          const totalHours = daysWorked * hoursPerDay;
          const totalAmount = totalHours * billingRate;

          onSubmit({
            ...formData,
            totalWorkingDays,
            daysLeave: totalWorkingDays - daysWorked,
            billingRate,
            totalHours,
            totalAmount,
          });
        }
      },
      [formData, validateForm, onSubmit, selectedProject]
    );

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingTimesheet ? "Edit Timesheet" : "Create New Timesheet"}
                </h3>
                <p className="text-gray-600 mt-1">
                  {editingTimesheet
                    ? "Update timesheet details"
                    : "Add a new work timesheet"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Project *
                    <IconTooltip
                      content="Select the project this timesheet is for. The billing rate will be automatically set from the project."
                      icon={InformationCircleIcon}
                      position="right"
                    >
                      <span></span>
                    </IconTooltip>
                  </label>
                  <select
                    required
                    value={formData.projectId}
                    onChange={(e) =>
                      setFormData({ ...formData, projectId: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                      errors.projectId ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} - ₹{project.billingTerms}/hr
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.projectId}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Month *
                    <IconTooltip
                      content="Select the month for this timesheet. Working days will be automatically calculated."
                      icon={InformationCircleIcon}
                      position="right"
                    >
                      <span></span>
                    </IconTooltip>
                  </label>
                  <input
                    type="month"
                    required
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                      errors.month ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.month && (
                    <p className="text-red-500 text-sm mt-2">{errors.month}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Days Worked *
                    <IconTooltip
                      content="Enter the number of days you actually worked this month. This cannot exceed the total working days."
                      icon={InformationCircleIcon}
                      position="right"
                    >
                      <span></span>
                    </IconTooltip>
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
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                      errors.daysWorked ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.daysWorked && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.daysWorked}
                    </p>
                  )}
                  {formData.totalWorkingDays && (
                    <p className="text-xs text-gray-500 mt-2">
                      Total working days: {formData.totalWorkingDays}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Hours Per Day
                    <IconTooltip
                      content="Default is 8 hours per day. This will be used to calculate total hours and billing amount."
                      icon={InformationCircleIcon}
                      position="right"
                    >
                      <span></span>
                    </IconTooltip>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={formData.hoursPerDay}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hoursPerDay: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Project and Costing Information */}
              {selectedProject && (
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-xl border border-primary-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CalculatorIcon className="h-5 w-5 mr-2 text-primary-600" />
                    Project Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">
                        Project
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {selectedProject.name}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">
                        Billing Rate
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        ₹{selectedProject.billingTerms}/hr
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">
                        Working Days
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formData.totalWorkingDays}
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <p className="text-xs text-gray-500 font-medium">
                        Estimated Amount
                      </p>
                      <p className="text-sm font-semibold text-primary-600 mt-1">
                        ₹
                        {parseInt(formData.daysWorked || "0") *
                          parseInt(formData.hoursPerDay) *
                          selectedProject.billingTerms}
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

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
    const draftTimesheets = timesheets.filter(
      (t) => t.status === "draft"
    ).length;
    const submittedTimesheets = timesheets.filter(
      (t) => t.status === "submitted"
    ).length;
    const approvedTimesheets = timesheets.filter(
      (t) => t.status === "approved"
    ).length;
    const invoicedTimesheets = timesheets.filter(
      (t) => t.status === "invoiced"
    ).length;
    const totalAmount = timesheets.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalHours = timesheets.reduce((sum, t) => sum + t.totalHours, 0);

    return {
      totalTimesheets,
      draftTimesheets,
      submittedTimesheets,
      approvedTimesheets,
      invoicedTimesheets,
      totalAmount,
      totalHours,
    };
  }, [timesheets]);

  const handleSubmit = useCallback(
    (formData: any) => {
      const timesheetData = {
        ...formData,
        status: "draft",
      };

      if (editingTimesheet) {
        updateTimesheet(editingTimesheet.id, timesheetData);
        toast.success("Timesheet updated successfully");
      } else {
        addTimesheet(timesheetData);
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
      const timesheet = timesheets.find((t) => t.id === id);
      if (timesheet?.status === "draft") {
        updateTimesheet(id, {
          status: "submitted",
          submittedAt: new Date(),
        });
        toast.success("Timesheet submitted for approval");
      } else {
        updateTimesheet(id, {
          status: "approved",
          approvedAt: new Date(),
          approvedBy: "admin",
        });
        toast.success("Timesheet approved successfully");
      }
    },
    [updateTimesheet, timesheets]
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
      } catch (error) {
        toast.error("Failed to generate invoice");
      }
    },
    [generateInvoiceFromTimesheet]
  );

  const handleMarkInvoiced = useCallback(
    (id: string) => {
      updateTimesheet(id, {
        status: "invoiced",
        invoicedAt: new Date(),
      });
      toast.success("Timesheet marked as invoiced");
    },
    [updateTimesheet]
  );

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Work Timesheets
            </h1>
            <p className="text-gray-600 mt-2">
              Manage project work calculations and generate invoices
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Timesheet
          </button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Tooltip content="Total number of timesheets created across all projects">
          <div>
            <StatsCard
              icon={CalculatorIcon}
              title="Total Timesheets"
              value={stats.totalTimesheets.toString()}
              color="text-primary-600"
            />
          </div>
        </Tooltip>
        <Tooltip content="Total billing amount across all timesheets">
          <div>
            <StatsCard
              icon={CurrencyRupeeIcon}
              title="Total Amount"
              value={formatCurrency(stats.totalAmount)}
              color="text-success-600"
            />
          </div>
        </Tooltip>
        <Tooltip content="Total hours worked across all timesheets">
          <div>
            <StatsCard
              icon={ClockIcon}
              title="Total Hours"
              value={stats.totalHours.toString()}
              color="text-info-600"
            />
          </div>
        </Tooltip>
        <Tooltip content="Number of timesheets that have been invoiced">
          <div>
            <StatsCard
              icon={DocumentTextIcon}
              title="Invoiced"
              value={stats.invoicedTimesheets.toString()}
              color="text-purple-600"
            />
          </div>
        </Tooltip>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Tooltip content="Timesheets in draft status - ready for submission">
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft</p>
                  <p className="text-2xl font-bold text-gray-600 mt-1">
                    {stats.draftTimesheets}
                  </p>
                </div>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </Tooltip>
        <Tooltip content="Timesheets submitted for approval - awaiting review">
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Submitted</p>
                  <p className="text-2xl font-bold text-warning-600 mt-1">
                    {stats.submittedTimesheets}
                  </p>
                </div>
                <div className="p-3 bg-warning-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-warning-600" />
                </div>
              </div>
            </div>
          </div>
        </Tooltip>
        <Tooltip content="Timesheets approved and ready for invoicing">
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-success-600 mt-1">
                    {stats.approvedTimesheets}
                  </p>
                </div>
                <div className="p-3 bg-success-100 rounded-lg">
                  <CheckIcon className="h-6 w-6 text-success-600" />
                </div>
              </div>
            </div>
          </div>
        </Tooltip>
        <Tooltip content="Timesheets that have been invoiced and billed">
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Invoiced</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {stats.invoicedTimesheets}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </Tooltip>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search timesheets by project, month, or status..."
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
            <Tooltip content="Search across project names, months, and status. Try 'draft', 'approved', or project names.">
              <div className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <QuestionMarkCircleIcon className="h-5 w-5" />
              </div>
            </Tooltip>
          </div>
        </div>

        {/* Enhanced Timesheets Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Work Details
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
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
                    onMarkInvoiced={handleMarkInvoiced}
                  />
                );
              })}
            </tbody>
          </table>
          {filteredTimesheets.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <CalculatorIcon className="h-12 w-12" />
              </div>
              <p className="text-gray-500 text-lg font-medium">
                {searchTerm
                  ? "No timesheets found matching your search."
                  : "No timesheets found. Create your first timesheet to get started."}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200"
                >
                  Create Your First Timesheet
                </button>
              )}
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
