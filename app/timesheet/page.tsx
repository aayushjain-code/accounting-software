"use client";

import React, { useState, useMemo } from "react";
import { useAccountingStore } from "@/store";
import { Timesheet, Project, TimesheetFile } from "@/types";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyRupeeIcon,
  CalculatorIcon,
  InformationCircleIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
} from "date-fns";
import toast from "react-hot-toast";
import { useSearch } from "@/hooks/useSearch";
import { formatCurrency } from "@/utils/helpers";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { ActionTooltip, IconTooltip, Tooltip } from "@/components/Tooltip";
import Modal from "@/components/Modal";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";
import { TimesheetsTable } from "@/components/TimesheetsTable";

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
  }: {
    timesheet: Timesheet;
    project: Project | undefined;
    onEdit: (timesheet: Timesheet) => void;
    onDelete: (id: string) => void;
  }) => {
    return (
      <tr
        key={timesheet.id}
        className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
      >
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <span className="font-mono font-semibold text-primary-700 bg-primary-50 dark:bg-primary-900 px-2.5 py-1 rounded-md border border-primary-200 dark:border-primary-800 text-xs">
              {project?.projectCode || "N/A"}
            </span>
            <span className="font-mono text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
              {timesheet.timesheetCode}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {project?.name || "Unknown Project"}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {format(new Date(`${timesheet.month}-01`), "MMMM yyyy")}
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
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-right">
            <div className="font-bold text-lg text-gray-900">
              {timesheet.totalAmount
                ? formatCurrency(timesheet.totalAmount)
                : "Not calculated"}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <StatusBadge status={timesheet.status} />
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
  return days.filter(day => !isWeekend(day)).length;
};

// Enhanced Timesheet Modal Component
const TimesheetModal = React.memo(
  ({
    isOpen,
    editingTimesheet,
    onSubmit,
    formId,
  }: {
    isOpen: boolean;
    editingTimesheet: Timesheet | null;
    onSubmit: (data: Record<string, unknown>) => void;
    formId: string;
  }) => {
    const { projects, clients, addTimesheetFile, removeTimesheetFile } =
      useAccountingStore();
    const [formData, setFormData] = useState({
      projectId: "",
      month: "",
      year: 2024,
      daysWorked: "",
      hoursPerDay: "8",
      totalWorkingDays: "",
      status: "draft",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedProject, setSelectedProject] = useState<Project | null>(
      null
    );
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Reset form when modal opens/closes
    React.useEffect(() => {
      if (isOpen) {
        if (editingTimesheet) {
          setFormData({
            projectId: editingTimesheet.projectId,
            month: editingTimesheet.month,
            year: editingTimesheet.year,
            daysWorked: (editingTimesheet.daysWorked || 0).toString(),
            hoursPerDay: (editingTimesheet.hoursPerDay || 8).toString(),
            totalWorkingDays: (
              editingTimesheet.totalWorkingDays || 0
            ).toString(),
            status: editingTimesheet.status,
          });
          const project = projects.find(
            p => p.id === editingTimesheet.projectId
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
            status: "draft",
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
        if (year && month) {
          const workingDays = calculateWorkingDays(year, month);
          setFormData(prev => ({
            ...prev,
            totalWorkingDays: workingDays.toString(),
          }));
        }
      }
    }, [formData.month, formData.year]);

    // Update selected project when projectId changes
    React.useEffect(() => {
      if (formData.projectId) {
        const project = projects.find(p => p.id === formData.projectId);
        setSelectedProject(project || null);
      } else {
        setSelectedProject(null);
      }
    }, [formData.projectId, projects]);

    const validateForm = React.useCallback((): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.projectId) {
        newErrors.projectId = "Project is required";
      } else {
        // Validate that the selected project is active
        const selectedProject = projects.find(p => p.id === formData.projectId);
        if (selectedProject && selectedProject.status !== "active") {
          newErrors.projectId = "Only active projects can have timesheets";
        }
      }

      if (!formData.month) {
        newErrors.month = "Month is required";
      }
      if (!formData.daysWorked || parseInt(formData.daysWorked) <= 0) {
        newErrors.daysWorked = "Valid days worked is required";
      }

      const totalWorkingDays = parseInt(formData.totalWorkingDays || "0");
      const daysWorked = parseInt(formData.daysWorked);

      if (daysWorked > totalWorkingDays) {
        newErrors.daysWorked = `Days worked cannot exceed ${totalWorkingDays} working days`;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }, [formData, projects]);

    const handleSubmit = React.useCallback(
      (e: React.FormEvent): void => {
        e.preventDefault();
        if (validateForm()) {
          const totalWorkingDays = parseInt(formData.totalWorkingDays || "0");
          const daysWorked = parseInt(formData.daysWorked);

          // Calculate monthly rate: (Project Budget without GST) ÷ (Total Working Days)
          const projectBudgetWithoutGST = selectedProject?.budget || 0;
          const monthlyRate = projectBudgetWithoutGST / totalWorkingDays;

          // Calculate amount: Monthly Rate × Days Worked
          const totalAmount = monthlyRate * daysWorked;

          onSubmit({
            ...formData,
            totalWorkingDays,
            daysLeave: totalWorkingDays - daysWorked,
            billingRate: monthlyRate, // Store the calculated monthly rate
            totalHours: daysWorked, // Store days worked as total hours for compatibility
            totalAmount,
            status: formData.status,
          });
        }
      },
      [formData, validateForm, onSubmit, selectedProject]
    );

    const handleFileUpload = async () => {
      if (uploadedFiles.length === 0) {
        return;
      }
      setIsUploading(true);
      try {
        for (const file of uploadedFiles) {
          const fileData: TimesheetFile = {
            id: `file_${Date.now()}_${Math.random()}`,
            timesheetId: editingTimesheet?.id || "new",
            fileName: `timesheet_${editingTimesheet?.id || "new"}_${file.name}`,
            originalName: file.name,
            fileSize: file.size,
            fileType: file.type || `.${file.name.split(".").pop()}`,
            uploadDate: new Date(),
            uploadedBy: "Admin User",
            filePath: `/uploads/timesheets/${file.name}`,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          addTimesheetFile(editingTimesheet?.id || "new", fileData);
        }
        setUploadedFiles([]);
        toast.success("Files uploaded successfully!");
      } catch {
        toast.error("Failed to upload files");
      } finally {
        setIsUploading(false);
      }
    };

    const handleFileDelete = (fileId: string) => {
      if (editingTimesheet) {
        removeTimesheetFile(editingTimesheet.id, fileId);
        toast.success("File deleted successfully!");
      }
    };

    if (!isOpen) {
      return null;
    }

    return (
      <form id={formId} onSubmit={handleSubmit}>
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
              onChange={e =>
                setFormData({ ...formData, projectId: e.target.value })
              }
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                errors.projectId ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">Select project</option>
              {projects
                .filter(project => project.status === "active")
                .map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} - ₹
                    {project.budget.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </option>
                ))}
            </select>
            {errors.projectId && (
              <p className="text-red-500 text-sm mt-2">{errors.projectId}</p>
            )}

            {projects.filter(p => p.status === "active").length === 0 && (
              <p className="text-amber-600 text-sm mt-2">
                ⚠️ No active projects available. Please create or activate a
                project first.
              </p>
            )}

            {/* Project Information Display */}
            {selectedProject && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Project Details
                </h4>
                <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                  <div className="flex justify-between">
                    <span>Client:</span>
                    <span className="font-medium">
                      {clients.find(c => c.id === selectedProject.clientId)
                        ?.company || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span className="font-medium">
                      ₹{selectedProject.budget.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span
                      className={`font-medium px-2 py-1 rounded text-xs ${
                        selectedProject.status === "active"
                          ? "bg-green-100 text-green-800"
                          : selectedProject.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedProject.status.charAt(0).toUpperCase() +
                        selectedProject.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
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
              onChange={e =>
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
              onChange={e =>
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
              <p className="text-red-500 text-sm mt-2">{errors.daysWorked}</p>
            )}
            {formData.totalWorkingDays && (
              <p className="text-xs text-gray-500 mt-2">
                Total working days: {formData.totalWorkingDays}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Hours Per Day (Optional)
              <IconTooltip
                content="Hours worked per day. If not specified, only days worked will be tracked without hourly calculations."
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
              placeholder="8"
              value={formData.hoursPerDay}
              onChange={e =>
                setFormData({
                  ...formData,
                  hoursPerDay: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Total Working Days and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Total Working Days in Month
              <IconTooltip
                content="Total number of working days in the selected month (excluding weekends). This is automatically calculated but can be manually adjusted."
                icon={InformationCircleIcon}
                position="right"
              >
                <span></span>
              </IconTooltip>
            </label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.totalWorkingDays}
              onChange={e =>
                setFormData({
                  ...formData,
                  totalWorkingDays: e.target.value,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
            <p className="text-xs text-gray-500 mt-2">
              Automatically calculated based on month selection
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Status
              <IconTooltip
                content="Current status of the timesheet. You can change this to move it through the workflow."
                icon={InformationCircleIcon}
                position="right"
              >
                <span></span>
              </IconTooltip>
            </label>
            <select
              value={formData.status}
              onChange={e =>
                setFormData({
                  ...formData,
                  status: e.target.value as
                    | "draft"
                    | "submitted"
                    | "approved"
                    | "rejected"
                    | "invoiced",
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            >
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="invoiced">Invoiced</option>
            </select>
            <div className="mt-2">
              <StatusBadge status={formData.status} />
            </div>

            {/* Approval Workflow Buttons */}
            {editingTimesheet && (
              <div className="mt-3 space-y-2">
                {formData.status === "draft" && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, status: "submitted" })
                    }
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Submit for Approval
                  </button>
                )}

                {formData.status === "submitted" && (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, status: "approved" })
                      }
                      className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve Timesheet
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, status: "rejected" })
                      }
                      className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject Timesheet
                    </button>
                  </div>
                )}

                {formData.status === "approved" && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, status: "invoiced" })
                    }
                    className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Mark as Invoiced
                  </button>
                )}

                {formData.status === "rejected" && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, status: "draft" })
                    }
                    className="w-full px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Return to Draft
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Project and Costing Information */}
        {/* Project Information section removed as requested */}

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <FileUpload
            files={uploadedFiles}
            onFilesChange={setUploadedFiles}
            maxFiles={5}
            maxSize={10}
            title="Upload Timesheet Files"
            description="Upload supporting documents, receipts, or other files for this timesheet"
            acceptedTypes={[
              ".pdf",
              ".doc",
              ".docx",
              ".xls",
              ".xlsx",
              ".jpg",
              ".jpeg",
              ".png",
            ]}
          />
          {uploadedFiles.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={isUploading}
                className="btn-secondary flex items-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-4 w-4" />
                    <span>Upload Files</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        {editingTimesheet?.files && editingTimesheet.files.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <FileList
              files={editingTimesheet.files}
              onDelete={handleFileDelete}
              title="Timesheet Files"
            />
          </div>
        )}
      </form>
    );
  }
);

TimesheetModal.displayName = "TimesheetModal";

export default function TimesheetPage() {
  const [isClient, setIsClient] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const { timesheets, projects, clients, deleteTimesheet } =
    useAccountingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [timesheetToDelete, setTimesheetToDelete] = useState<string | null>(
    null
  );
  const [viewMode] = useState<"cards" | "table">("cards");
  const [selectedProjectFilter, setSelectedProjectFilter] =
    useState<string>("all");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("all");

  // Use the search hook
  const {
    searchTerm,
    filteredItems: filteredTimesheets,
    handleSearchChange,
    isSearching,
  } = useSearch(timesheets, ["month", "status"]);

  // Filter timesheets by selected project and month
  const projectFilteredTimesheets = useMemo(() => {
    let filtered = filteredTimesheets;

    if (selectedProjectFilter !== "all") {
      filtered = filtered.filter(
        timesheet => timesheet.projectId === selectedProjectFilter
      );
    }

    if (selectedMonthFilter !== "all") {
      filtered = filtered.filter(
        timesheet => timesheet.month === selectedMonthFilter
      );
    }

    return filtered;
  }, [filteredTimesheets, selectedProjectFilter, selectedMonthFilter]);

  // Get unique projects for filter dropdown
  const uniqueProjects = useMemo(() => {
    const projectIds = Array.from(new Set(timesheets.map(t => t.projectId)));
    return projects.filter(project => projectIds.includes(project.id));
  }, [timesheets, projects]);

  // Get unique months for filter dropdown
  const uniqueMonths = useMemo(() => {
    const months = Array.from(new Set(timesheets.map(t => t.month)))
      .sort()
      .reverse();
    return months;
  }, [timesheets]);

  // Check for missing monthly timesheets for active projects
  const missingMonthlyTimesheets = useMemo(() => {
    const currentMonth = format(new Date(), "yyyy-MM");
    const activeProjects = projects.filter(p => p.status === "active");

    return activeProjects
      .map(project => {
        const hasTimesheet = timesheets.some(
          t => t.projectId === project.id && t.month === currentMonth
        );

        return {
          project,
          hasTimesheet,
          month: currentMonth,
          status: hasTimesheet ? "completed" : "missing",
        };
      })
      .filter(item => item.status === "missing");
  }, [projects, timesheets]);

  const handleSubmit = React.useCallback(
    (data: Record<string, unknown>): void => {
      // Handle timesheet submission
      console.log("Timesheet submitted:", data);
      // You can add logic here to handle the submitted data
      // For now, just close the modal
      setIsModalOpen(false);
      setEditingTimesheet(null);
    },
    []
  );

  const handleEdit = React.useCallback((timesheet: Timesheet): void => {
    setEditingTimesheet(timesheet);
    setIsModalOpen(true);
  }, []);

  const handleDelete = React.useCallback((id: string): void => {
    setTimesheetToDelete(id);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = React.useCallback((): void => {
    if (timesheetToDelete) {
      deleteTimesheet(timesheetToDelete);
      toast.success("Timesheet deleted successfully");
      setTimesheetToDelete(null);
    }
  }, [timesheetToDelete, deleteTimesheet]);

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Work Timesheets
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage project work calculations and generate invoices
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Timesheet
            </button>
          </div>
        </div>
      </div>
      {/* (Removed: Stats Cards and Status Summary Cards) */}

      {/* Monthly Reminder Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-lg">
                📅
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Monthly Timesheet Reminder
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                {format(new Date(), "MMMM yyyy")} timesheets are due. Each
                active project requires a monthly timesheet for proper billing
                and project tracking.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {missingMonthlyTimesheets.length} projects pending
            </span>
            {missingMonthlyTimesheets.length > 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Missing Timesheets
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Timesheet Requirements Alert */}
      {missingMonthlyTimesheets.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                <span className="text-amber-600 dark:text-amber-400 text-lg">
                  ⚠️
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Monthly Timesheet Requirements
              </h3>
              <p className="text-amber-700 dark:text-amber-300 mb-4">
                The following active projects require timesheets for{" "}
                {format(new Date(), "MMMM yyyy")}:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {missingMonthlyTimesheets.map(({ project }) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 bg-amber-100 dark:bg-amber-800/30 rounded-lg border border-amber-200 dark:border-amber-700"
                  >
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">
                        {project.name}
                      </p>
                      <p className="text-amber-600 dark:text-amber-400 text-xs">
                        {clients.find(c => c.id === project.clientId)
                          ?.company || "N/A"}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProjectFilter(project.id);
                        setSelectedMonthFilter(format(new Date(), "yyyy-MM"));
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1 bg-amber-600 text-white text-xs rounded-md hover:bg-amber-700 transition-colors"
                    >
                      Create Timesheet
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 text-sm">
                <span>💡</span>
                <span>
                  Each active project requires a monthly timesheet for proper
                  billing and project tracking.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Timesheet Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Project Timesheet Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueProjects.map(project => {
            const projectTimesheets = timesheets.filter(
              t => t.projectId === project.id
            );
            const totalDays = projectTimesheets.reduce(
              (sum, t) => sum + (t.daysWorked || 0),
              0
            );
            const totalAmount = projectTimesheets.reduce(
              (sum, t) => sum + (t.totalAmount || 0),
              0
            );
            const projectClient = clients.find(c => c.id === project.clientId);

            return (
              <div
                key={project.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {project.name}
                  </h4>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      project.status === "active"
                        ? "bg-green-100 text-green-800"
                        : project.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {project.status.charAt(0).toUpperCase() +
                      project.status.slice(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {projectClient?.company || "N/A"}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Timesheets:</span>
                    <span className="font-medium">
                      {projectTimesheets.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Days:</span>
                    <span className="font-medium">{totalDays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-medium">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 group"
          >
            <div className="text-center">
              <PlusIcon className="h-8 w-8 text-gray-400 group-hover:text-primary-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-700">
                Create New Timesheet
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedMonthFilter(format(new Date(), "yyyy-MM"));
              setSelectedProjectFilter("all");
            }}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
          >
            <div className="text-center">
              <ClockIcon className="h-8 w-8 text-gray-400 group-hover:text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700">
                View Current Month
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedProjectFilter("all");
              setSelectedMonthFilter("all");
            }}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 group"
          >
            <div className="text-center">
              <CheckIcon className="h-8 w-8 text-gray-400 group-hover:text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-700">
                Pending Approvals
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedProjectFilter("all");
              setSelectedMonthFilter("all");
            }}
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="h-8 w-8 text-gray-400 group-hover:text-purple-600 mx-auto mb-2 flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700">
                Compliance Report
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search timesheets by project, month, or status..."
                value={searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-primary-600"></div>
                </div>
              )}
            </div>

            {/* Project Filter */}
            <div className="min-w-[200px]">
              <select
                value={selectedProjectFilter}
                onChange={e => setSelectedProjectFilter(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Projects</option>
                {uniqueProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Filter */}
            <div className="min-w-[150px]">
              <select
                value={selectedMonthFilter}
                onChange={e => setSelectedMonthFilter(e.target.value)}
                className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Months</option>
                {uniqueMonths.map(month => (
                  <option key={month} value={month}>
                    {format(new Date(`${month}-01`), "MMMM yyyy")}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(searchTerm ||
              selectedProjectFilter !== "all" ||
              selectedMonthFilter !== "all") && (
              <button
                onClick={() => {
                  handleSearchChange("");
                  setSelectedProjectFilter("all");
                  setSelectedMonthFilter("all");
                }}
                className="px-4 py-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                Clear Filters
              </button>
            )}

            <Tooltip content="Search across project names, months, and status. Try 'draft', 'approved', or project names.">
              <div className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <InformationCircleIcon className="h-5 w-5" />
              </div>
            </Tooltip>
          </div>
        </div>

        {/* Filter Summary */}
        {(searchTerm ||
          selectedProjectFilter !== "all" ||
          selectedMonthFilter !== "all") && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">Active Filters:</span>
              {searchTerm && (
                <span className="ml-2 inline-block bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                  Search: &quot;{searchTerm}&quot;
                </span>
              )}
              {selectedProjectFilter !== "all" && (
                <span className="ml-2 inline-block bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                  Project:{" "}
                  {projects.find(p => p.id === selectedProjectFilter)?.name ||
                    "Unknown"}
                </span>
              )}
              {selectedMonthFilter !== "all" && (
                <span className="ml-2 inline-block bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                  Month:{" "}
                  {format(new Date(`${selectedMonthFilter}-01`), "MMMM yyyy")}
                </span>
              )}
              <span className="ml-2 text-blue-600 dark:text-blue-300">
                Showing {projectFilteredTimesheets.length} of{" "}
                {timesheets.length} timesheets
              </span>
            </p>
          </div>
        )}

        {/* Conditional Rendering for Cards vs Table View */}
        {viewMode === "cards" ? (
          /* Enhanced Timesheets Table (Card View) */
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Codes
                  </th>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {projectFilteredTimesheets.map(timesheet => {
                  const project = projects.find(
                    p => p.id === timesheet.projectId
                  );

                  return (
                    <TimesheetRow
                      key={timesheet.id}
                      timesheet={timesheet}
                      project={project}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  );
                })}
              </tbody>
            </table>
            {projectFilteredTimesheets.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <CalculatorIcon className="h-12 w-12" />
                </div>
                <p className="text-gray-500 text-lg font-medium">
                  {searchTerm || selectedProjectFilter !== "all"
                    ? "No timesheets found matching your current filters."
                    : "No timesheets found. Create your first timesheet to get started."}
                </p>
                {!searchTerm && selectedProjectFilter === "all" && (
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
        ) : (
          /* Table View */
          <TimesheetsTable
            timesheets={projectFilteredTimesheets}
            projects={projects}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTimesheet(null);
        }}
        title={editingTimesheet ? "Edit Timesheet" : "Create New Timesheet"}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingTimesheet(null);
              }}
              className="btn-secondary mr-2"
            >
              Cancel
            </button>
            <button type="submit" form="timesheet-form" className="btn-primary">
              {editingTimesheet ? "Update" : "Create"} Timesheet
            </button>
          </>
        }
      >
        <TimesheetModal
          isOpen={isModalOpen}
          editingTimesheet={editingTimesheet}
          onSubmit={handleSubmit}
          formId="timesheet-form"
        />
      </Modal>

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
