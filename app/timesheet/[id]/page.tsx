"use client";

import React, { useState, useMemo } from "react";
import { useAccountingStore } from "@/store";
import {
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  CalculatorIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Timesheet, Project, TimesheetFile } from "@/types";
import { formatCurrency } from "@/utils/helpers";
import { ActionTooltip, IconTooltip } from "@/components/Tooltip";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import FileList from "@/components/FileList";

// Enhanced Status Badge Component
const StatusBadge = React.memo(({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "draft":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: DocumentTextIcon,
        };
      case "submitted":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: ClockIcon,
        };
      case "approved":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckIcon,
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: XMarkIcon,
        };
      case "invoiced":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: CurrencyRupeeIcon,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: DocumentTextIcon,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${config.color} shadow-sm`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
});

StatusBadge.displayName = "StatusBadge";

// Status Change Component
const StatusChangeDropdown = React.memo(({ 
  currentStatus, 
  onStatusChange 
}: { 
  currentStatus: string; 
  onStatusChange: (status: string) => void; 
}) => {
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "submitted", label: "Submitted" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "invoiced", label: "Invoiced" },
  ];

  return (
    <div className="flex items-center space-x-3">
      <StatusBadge status={currentStatus} />
      <select
        value={currentStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
});

StatusChangeDropdown.displayName = "StatusChangeDropdown";

// Enhanced Work Calculation Card Component
const WorkCalculationCard = React.memo(
  ({
    timesheet,
    project,
    onStatusChange,
  }: {
    timesheet: Timesheet;
    project: Project | undefined;
    onStatusChange: (status: string) => void;
  }) => {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <CalculatorIcon className="h-6 w-6 mr-3 text-primary-600" />
            Work Calculations
          </h3>
          <StatusChangeDropdown 
            currentStatus={timesheet.status} 
            onStatusChange={onStatusChange}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-6 rounded-xl border border-primary-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Project Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Project:</span>
                  <span className="font-semibold text-gray-900">
                    {project?.name || "Unknown Project"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Project Code:</span>
                  <span className="font-semibold text-gray-900">
                    {project?.projectCode || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Month:</span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(timesheet.month + "-01"), "MMMM yyyy")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Work Details
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Days Worked:</span>
                  <span className="font-semibold text-gray-900">
                    {timesheet.daysWorked} days
                  </span>
                </div>
                {timesheet.hoursPerDay && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Hours Per Day:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {timesheet.hoursPerDay} hours
                    </span>
                  </div>
                )}
                {timesheet.totalHours && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Hours:</span>
                    <span className="font-semibold text-gray-900">
                      {timesheet.totalHours} hours
                    </span>
                  </div>
                )}
                {timesheet.billingRate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Billing Rate:</span>
                    <span className="font-semibold text-gray-900">
                      ₹{timesheet.billingRate.toFixed(2)}/hr
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-medium opacity-90">
                Total Amount
              </span>
              <div className="text-3xl font-bold mt-1">
                {timesheet.totalAmount
                  ? formatCurrency(timesheet.totalAmount)
                  : "Not calculated"}
              </div>
              <div className="text-sm opacity-80 mt-2">
                {timesheet.daysWorked} days
                {timesheet.hoursPerDay && ` × ${timesheet.hoursPerDay}h`}
                {timesheet.billingRate &&
                  ` × ₹${timesheet.billingRate.toFixed(2)}/hr`}
              </div>
            </div>
            <div className="p-4 bg-white bg-opacity-20 rounded-xl">
              <CurrencyRupeeIcon className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

WorkCalculationCard.displayName = "WorkCalculationCard";

// Enhanced Status Actions Component
const StatusActions = React.memo(
  ({
    timesheet,
    onStatusChange,
  }: {
    timesheet: Timesheet;
    onStatusChange: (status: string) => void;
  }) => {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-3 text-primary-600" />
          Status Actions
        </h3>
        <div className="space-y-4">
          {timesheet.status === "draft" && (
            <ActionTooltip
              content="Submit for Approval"
              action="Move to review queue"
            >
              <button
                onClick={() => onStatusChange("submitted")}
                className="w-full bg-primary-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <CheckIcon className="h-5 w-5 mr-3" />
                Submit for Approval
              </button>
            </ActionTooltip>
          )}

          {timesheet.status === "submitted" && (
            <div className="space-y-3">
              <ActionTooltip
                content="Approve Timesheet"
                action="Approve for invoicing"
              >
                <button
                  onClick={() => onStatusChange("approved")}
                  className="w-full bg-success-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-success-700 transition-colors duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  <CheckIcon className="h-5 w-5 mr-3" />
                  Approve Timesheet
                </button>
              </ActionTooltip>
              <ActionTooltip
                content="Reject Timesheet"
                action="Return to draft status"
              >
                <button
                  onClick={() => onStatusChange("rejected")}
                  className="w-full bg-danger-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-danger-700 transition-colors duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  <XMarkIcon className="h-5 w-5 mr-3" />
                  Reject Timesheet
                </button>
              </ActionTooltip>
            </div>
          )}

          {timesheet.status === "approved" && (
            <div className="space-y-3">
              <ActionTooltip
                content="Mark as Invoiced"
                action="Generate invoice and mark as billed"
              >
                <button
                  onClick={() => onStatusChange("invoiced")}
                  className="w-full bg-primary-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  <CurrencyRupeeIcon className="h-5 w-5 mr-3" />
                  Mark as Invoiced
                </button>
              </ActionTooltip>
            </div>
          )}

          {timesheet.status === "invoiced" && (
            <IconTooltip content="This timesheet has been invoiced and billed to the client">
              <div className="text-center p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <CurrencyRupeeIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-green-800 font-bold text-lg mb-2">
                  Timesheet Invoiced
                </p>
                <p className="text-green-600 text-sm">
                  Invoice ID: {timesheet.invoiceId || "N/A"}
                </p>
              </div>
            </IconTooltip>
          )}
        </div>
      </div>
    );
  }
);

StatusActions.displayName = "StatusActions";

// Enhanced Stats Card Component
const DetailStatsCard = React.memo(
  ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
  }: {
    title: string;
    value: string;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
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

DetailStatsCard.displayName = "DetailStatsCard";

export default function TimesheetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [isClient, setIsClient] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    timesheets,
    projects,
    updateTimesheet,
    generateInvoiceFromTimesheet,
    addTimesheetFile,
    removeTimesheetFile,
  } = useAccountingStore();

  // Get timesheet data
  const timesheet = useMemo(() => {
    return timesheets.find((t) => t.id === params.id);
  }, [timesheets, params.id]);

  const project = useMemo(() => {
    return projects.find((p) => p.id === timesheet?.projectId);
  }, [projects, timesheet]);

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);
    try {
      // Simulate file upload
      for (const file of uploadedFiles) {
        const fileData: TimesheetFile = {
          id: `file_${Date.now()}_${Math.random()}`,
          timesheetId: timesheet!.id,
          fileName: `timesheet_${timesheet!.id}_${file.name}`,
          originalName: file.name,
          fileSize: file.size,
          fileType: file.type || `.${file.name.split(".").pop()}`,
          uploadDate: new Date(),
          uploadedBy: "Admin User",
          filePath: `/uploads/timesheets/${file.name}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addTimesheetFile(timesheet!.id, fileData);
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
    if (timesheet) {
      removeTimesheetFile(timesheet.id, fileId);
      toast.success("File deleted successfully");
    }
  };

  const handleStatusChange = React.useCallback(async (newStatus: string) => {
    if (timesheet && newStatus !== timesheet.status) {
      await updateTimesheet(timesheet.id, { status: newStatus as any });
      toast.success(`Status updated to ${newStatus}`);
    }
  }, [timesheet, updateTimesheet]);

  if (!timesheet) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
            <CalculatorIcon className="h-16 w-16" />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-4">
            Timesheet not found
          </p>
          <Link href="/timesheet" className="btn-primary">
            Back to Timesheets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              href="/timesheet"
              className="p-3 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-xl transition-colors"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Timesheet Details
              </h1>
              <p className="text-gray-600 mt-2">
                {project?.name} -{" "}
                {format(new Date(timesheet.month + "-01"), "MMMM yyyy")}
              </p>
            </div>
          </div>
          <StatusBadge status={timesheet.status} />
        </div>
      </div>

      {/* Work Calculations */}
      <WorkCalculationCard timesheet={timesheet} project={project} onStatusChange={handleStatusChange} />

      {/* Status Actions */}
      <StatusActions
        timesheet={timesheet}
        onStatusChange={handleStatusChange}
      />

      {/* Enhanced Additional Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <ChartBarSquareIcon className="h-6 w-6 mr-3 text-primary-600" />
            Work Summary
          </h3>
          <div className="space-y-4">
            <IconTooltip content="Total working days in the month (excluding weekends)">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">
                  Total Working Days:
                </span>
                <span className="font-semibold text-gray-900">
                  {timesheet.totalWorkingDays} days
                </span>
              </div>
            </IconTooltip>
            <IconTooltip content="Actual days you worked this month">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Days Worked:</span>
                <span className="font-semibold text-gray-900">
                  {timesheet.daysWorked} days
                </span>
              </div>
            </IconTooltip>
            <IconTooltip content="Days you were on leave or didn't work">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <span className="text-sm text-gray-600">Leave Days:</span>
                <span className="font-semibold text-gray-900">
                  {timesheet.daysLeave} days
                </span>
              </div>
            </IconTooltip>
            <IconTooltip content="Percentage of working days you were available">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Utilization:</span>
                <span className="font-semibold text-gray-900">
                  {(
                    (timesheet.daysWorked / timesheet.totalWorkingDays) *
                    100
                  ).toFixed(2)}
                  %
                </span>
              </div>
            </IconTooltip>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <CalendarIcon className="h-6 w-6 mr-3 text-primary-600" />
            Timeline
          </h3>
          <div className="space-y-4">
            <IconTooltip content="When this timesheet was first created">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="font-semibold text-gray-900">
                  {format(new Date(timesheet.createdAt), "MMM dd, yyyy")}
                </span>
              </div>
            </IconTooltip>
            {timesheet.submittedAt && (
              <IconTooltip content="When this timesheet was submitted for approval">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-600">Submitted:</span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(timesheet.submittedAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </IconTooltip>
            )}
            {timesheet.approvedAt && (
              <IconTooltip content="When this timesheet was approved for invoicing">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-600">Approved:</span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(timesheet.approvedAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </IconTooltip>
            )}
            {timesheet.invoicedAt && (
              <IconTooltip content="When this timesheet was invoiced and billed">
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-600">Invoiced:</span>
                  <span className="font-semibold text-gray-900">
                    {format(new Date(timesheet.invoicedAt), "MMM dd, yyyy")}
                  </span>
                </div>
              </IconTooltip>
            )}
          </div>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <FileUpload
          files={uploadedFiles}
          onFilesChange={setUploadedFiles}
          maxFiles={5}
          maxSize={10}
          title="Upload Timesheet Files"
          description="Upload supporting documents, receipts, or other files related to this timesheet"
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
              onClick={handleFileUpload}
              disabled={isUploading}
              className="btn-primary flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

      {/* File List Section */}
      {timesheet?.files && timesheet.files.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <FileList
            files={timesheet.files}
            onDelete={handleFileDelete}
            title="Timesheet Files"
          />
        </div>
      )}
    </div>
  );
}
