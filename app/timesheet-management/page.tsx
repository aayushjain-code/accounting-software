"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { useAccountingStore } from "@/store";
import {
  ClockIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";

interface TimesheetUpload {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  month: string;
  year: string;
  employeeName: string;
  employeeRole: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  status: "pending" | "approved" | "rejected";
}

export default function TimesheetManagementPage(): JSX.Element {
  const { projects, clients } = useAccountingStore();

  const [selectedProject, setSelectedProject] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [timesheetUploads, setTimesheetUploads] = useState<TimesheetUpload[]>(
    []
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [viewingTimesheet, setViewingTimesheet] =
    useState<TimesheetUpload | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Filter timesheets for selected project
  const projectTimesheets = useMemo(() => {
    if (!selectedProject) {
      return [];
    }
    return timesheetUploads.filter(ts => ts.projectId === selectedProject);
  }, [timesheetUploads, selectedProject]);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setUploadedFile(files[0] || null);
    }
  };

  const handleSubmitTimesheet = (): void => {
    if (!selectedProject || !uploadedFile) {
      alert("Please select a project and file");
      return;
    }

    const currentMonth = format(new Date(), "yyyy-MM");
    const [year, month] = currentMonth.split("-");
    if (!year || !month) {
      alert("Invalid date format");
      return;
    }

    const project = projects.find(p => p.id === selectedProject);
    const client = clients.find(c => c.id === project?.clientId);

    if (!project || !client) {
      alert("Project or client not found");
      return;
    }

    const newTimesheet: TimesheetUpload = {
      id: Date.now().toString(),
      projectId: selectedProject,
      projectName: project.name,
      clientName: client.company,
      month,
      year,
      employeeName: "Not specified",
      employeeRole: "Not specified",
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      uploadDate: new Date(),
      status: "pending",
    };

    setTimesheetUploads(prev => [newTimesheet, ...prev]);

    // Reset form
    setUploadedFile(null);

    alert("Timesheet uploaded successfully!");
  };

  const handleStatusChange = (
    timesheetId: string,
    newStatus: "approved" | "rejected"
  ): void => {
    setTimesheetUploads(prev =>
      prev.map(ts =>
        ts.id === timesheetId ? { ...ts, status: newStatus } : ts
      )
    );
  };

  const handleDeleteTimesheet = (timesheetId: string): void => {
    if (confirm("Are you sure you want to delete this timesheet?")) {
      setTimesheetUploads(prev => prev.filter(ts => ts.id !== timesheetId));
    }
  };

  const handleViewTimesheet = (timesheet: TimesheetUpload): void => {
    setViewingTimesheet(timesheet);
    setIsViewModalOpen(true);
  };

  const closeViewModal = (): void => {
    setIsViewModalOpen(false);
    setViewingTimesheet(null);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 dark:text-yellow-800 dark:text-yellow-200";
    }
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "rejected":
        return <XCircleIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Timesheet Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage timesheets by project - Click on a project to upload and
                view timesheets
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                <ClockIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Tabs */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Project
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map(project => {
              const client = clients.find(c => c.id === project.clientId);
              const projectTimesheetsCount = timesheetUploads.filter(
                ts => ts.projectId === project.id
              ).length;

              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    selectedProject === project.id
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-300 dark:hover:border-primary-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <FolderIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                      {projectTimesheetsCount} timesheet
                      {projectTimesheetsCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                    {project.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {client?.company || "N/A"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Details and Upload */}
        {selectedProject && (
          <div className="space-y-8">
            {/* Project Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {projects.find(p => p.id === selectedProject)?.name}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {
                    clients.find(
                      c =>
                        c.id ===
                        projects.find(p => p.id === selectedProject)?.clientId
                    )?.company
                  }
                </span>
              </div>

              {/* Upload Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                    Upload New Timesheet
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <DocumentTextIcon className="h-4 w-4 inline mr-2 text-primary-600" />
                        Timesheet File *
                      </label>

                      {/* Drag & Drop Zone */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                          isDragOver
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500"
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        {uploadedFile ? (
                          <div className="text-green-600 dark:text-green-400">
                            <DocumentTextIcon className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-medium">{uploadedFile.name}</p>
                            <p className="text-sm">
                              {formatFileSize(uploadedFile.size)}
                            </p>
                          </div>
                        ) : (
                          <div className="text-gray-500 dark:text-gray-400">
                            <ArrowUpTrayIcon className="h-8 w-8 mx-auto mb-2" />
                            <p className="font-medium">
                              Drag & drop timesheet file here
                            </p>
                            <p className="text-sm">or click to browse</p>
                          </div>
                        )}

                        <input
                          type="file"
                          accept=".csv,.xlsx,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="mt-3 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
                        >
                          Browse Files
                        </label>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitTimesheet}
                      disabled={!uploadedFile}
                      className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                      Upload Timesheet
                    </button>
                  </div>
                </div>

                {/* Project Stats */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                    Project Overview
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Timesheets:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {projectTimesheets.length}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Pending:
                      </span>
                      <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                        {
                          projectTimesheets.filter(
                            ts => ts.status === "pending"
                          ).length
                        }
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Approved:
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {
                          projectTimesheets.filter(
                            ts => ts.status === "approved"
                          ).length
                        }
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Rejected:
                      </span>
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {
                          projectTimesheets.filter(
                            ts => ts.status === "rejected"
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Previous Timesheets */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Previous Timesheets
                </h3>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {projectTimesheets.length} timesheet
                    {projectTimesheets.length !== 1 ? "s" : ""} found
                  </span>
                  {projectTimesheets.length > 0 && (
                    <button
                      onClick={() => {
                        // Scroll to top of timesheet table
                        document
                          .querySelector(".timesheet-table")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg text-sm hover:bg-primary-200 dark:hover:bg-primary-800/30 transition-colors"
                    >
                      View All
                    </button>
                  )}
                </div>
              </div>

              {projectTimesheets.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>No timesheets uploaded yet for this project.</p>
                  <p className="text-sm">
                    Upload your first timesheet above to get started.
                  </p>
                </div>
              ) : (
                <>
                  {/* Quick Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {projectTimesheets.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {
                          projectTimesheets.filter(
                            ts => ts.status === "pending"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Pending
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {
                          projectTimesheets.filter(
                            ts => ts.status === "approved"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Approved
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {
                          projectTimesheets.filter(
                            ts => ts.status === "rejected"
                          ).length
                        }
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Rejected
                      </div>
                    </div>
                  </div>

                  {/* Timesheet Table */}
                  <div className="overflow-x-auto timesheet-table">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Month
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            File
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {projectTimesheets.map(timesheet => (
                          <tr
                            key={timesheet.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {format(
                                new Date(
                                  parseInt(timesheet.year),
                                  parseInt(timesheet.month) - 1
                                ),
                                "MMM yyyy"
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {timesheet.fileName}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatFileSize(timesheet.fileSize)}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(timesheet.status)}`}
                              >
                                {getStatusIcon(timesheet.status)}
                                <span className="ml-1 capitalize">
                                  {timesheet.status}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {timesheet.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleStatusChange(
                                          timesheet.id,
                                          "approved"
                                        )
                                      }
                                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                      title="Approve"
                                    >
                                      <CheckCircleIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleStatusChange(
                                          timesheet.id,
                                          "rejected"
                                        )
                                      }
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                      title="Reject"
                                    >
                                      <XCircleIcon className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleViewTimesheet(timesheet)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="View Timesheet"
                                >
                                  <DocumentTextIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteTimesheet(timesheet.id)
                                  }
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete"
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
                </>
              )}
            </div>
          </div>
        )}

        {/* No Project Selected State */}
        {!selectedProject && (
          <div className="text-center py-16">
            <FolderIcon className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Select a Project
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Click on a project above to upload timesheets and view previous
              submissions.
            </p>
          </div>
        )}

        {/* Timesheet View Modal */}
        {isViewModalOpen && viewingTimesheet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    View Timesheet
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {viewingTimesheet.projectName} -{" "}
                    {format(
                      new Date(
                        parseInt(viewingTimesheet.year),
                        parseInt(viewingTimesheet.month) - 1
                      ),
                      "MMMM yyyy"
                    )}
                  </p>
                </div>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* File Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      File Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          File Name:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {viewingTimesheet.fileName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          File Size:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatFileSize(viewingTimesheet.fileSize)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Upload Date:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {format(viewingTimesheet.uploadDate, "PPP")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Status:
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingTimesheet.status)}`}
                        >
                          {getStatusIcon(viewingTimesheet.status)}
                          <span className="ml-1 capitalize">
                            {viewingTimesheet.status}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                      Project Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Project:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {viewingTimesheet.projectName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Client:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {viewingTimesheet.clientName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Month:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {format(
                            new Date(
                              parseInt(viewingTimesheet.year),
                              parseInt(viewingTimesheet.month) - 1
                            ),
                            "MMMM yyyy"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Employee:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {viewingTimesheet.employeeName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Preview */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    File Preview
                  </h4>
                  <div className="text-center py-8">
                    <DocumentTextIcon className="h-16 w-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {viewingTimesheet.fileName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      File size: {formatFileSize(viewingTimesheet.fileSize)}
                    </p>
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          // In a real app, this would download or open the file
                          alert(
                            `Opening file: ${viewingTimesheet.fileName}\n\nNote: In a production app, this would open the actual file content.`
                          );
                        }}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        Open File
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Close
                </button>
                {viewingTimesheet.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusChange(viewingTimesheet.id, "approved");
                        closeViewModal();
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(viewingTimesheet.id, "rejected");
                        closeViewModal();
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
