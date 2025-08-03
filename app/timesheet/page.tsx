"use client";

import React, { useState, useMemo } from "react";
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
} from "date-fns";
import toast from "react-hot-toast";
import { Timesheet, Project } from "@/types";
import { useSearch } from "@/hooks/useSearch";
import { formatCurrency, getStatusColor } from "@/utils/helpers";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { ActionTooltip, IconTooltip } from "@/components/Tooltip";
import {
  InformationCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { TimesheetFile } from "@/types";

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
    const formatDate = React.useCallback((date: Date) => {
      return format(new Date(date), "MMM dd, yyyy");
    }, []);

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
              {format(new Date(timesheet.month + "-01"), "MMMM yyyy")}
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
  return days.filter((day) => !isWeekend(day)).length;
};

// Enhanced Timesheet Modal Component
const TimesheetModal = React.memo(
  ({
    isOpen,
    onClose,
    editingTimesheet,
    onSubmit,
    formId,
    hideHeaderAndFooter,
  }: {
    isOpen: boolean;
    onClose: () => void;
    editingTimesheet: Timesheet | null;
    onSubmit: (data: any) => void;
    formId: string;
    hideHeaderAndFooter: boolean;
  }) => {
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
    const { projects, addTimesheetFile, removeTimesheetFile } =
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

    // Calculate real-time amount for timesheet
    const calculatedAmount = React.useMemo(() => {
      if (selectedProject && formData.daysWorked && formData.totalWorkingDays) {
        const daysWorked = parseInt(formData.daysWorked);
        const totalWorkingDays = parseInt(formData.totalWorkingDays);

        // Calculate monthly rate: (Project Budget without GST) ÷ (Total Working Days)
        const projectBudgetWithoutGST = selectedProject.budget; // Budget is already without GST
        const monthlyRate = projectBudgetWithoutGST / totalWorkingDays;

        // Calculate amount: Monthly Rate × Days Worked
        return monthlyRate * daysWorked;
      }
      return 0;
    }, [selectedProject, formData.daysWorked, formData.totalWorkingDays]);

    const validateForm = React.useCallback(() => {
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

    const handleSubmit = React.useCallback(
      (e: React.FormEvent) => {
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
      if (uploadedFiles.length === 0) return;
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
      } catch (error) {
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

    if (!isOpen) return null;

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
              onChange={(e) =>
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
              onChange={(e) =>
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
                <p className="text-xs text-gray-500 font-medium">Project</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  {selectedProject.name}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-500 font-medium">
                  Project Budget
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  ₹
                  {selectedProject.budget.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-500 font-medium">
                  Monthly Rate
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  ₹
                  {formData.totalWorkingDays
                    ? (
                        selectedProject.budget /
                        parseInt(formData.totalWorkingDays)
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : 0}
                  /day
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
                  Calculated Amount
                </p>
                <p className="text-sm font-semibold text-primary-600 mt-1">
                  ₹
                  {calculatedAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
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
    const totalAmount = timesheets.reduce(
      (sum, t) => sum + (t.totalAmount || 0),
      0
    );
    const totalHours = timesheets.reduce(
      (sum, t) => sum + (t.totalHours || 0),
      0
    );

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

  const handleSubmit = React.useCallback(
    (formData: any) => {
      const timesheetData = {
        ...formData,
        status: formData.status || "draft",
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

  const handleEdit = React.useCallback((timesheet: Timesheet) => {
    setEditingTimesheet(timesheet);
    setIsModalOpen(true);
  }, []);

  const handleDelete = React.useCallback((id: string) => {
    setTimesheetToDelete(id);
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = React.useCallback(() => {
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
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center shadow-lg hover:shadow-xl"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Timesheet
          </button>
        </div>
      </div>
      {/* (Removed: Stats Cards and Status Summary Cards) */}

      {/* Enhanced Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search timesheets by project, month, or status..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-primary-600"></div>
                </div>
              )}
            </div>
            <Tooltip content="Search across project names, months, and status. Try 'draft', 'approved', or project names.">
              <div className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <QuestionMarkCircleIcon className="h-5 w-5" />
              </div>
            </Tooltip>
          </div>
        </div>

        {/* Enhanced Timesheets Table */}
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
          onClose={() => {
            setIsModalOpen(false);
            setEditingTimesheet(null);
          }}
          editingTimesheet={editingTimesheet}
          onSubmit={handleSubmit}
          formId="timesheet-form"
          hideHeaderAndFooter={true}
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
