"use client";

import { useState, useMemo } from "react";
import { useAccountingStore } from "@/store";
import {
  DocumentTextIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Modal from "@/components/Modal";

// Interface for uploaded invoice records
interface InvoiceUpload {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  month: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  status: "pending" | "approved" | "rejected";
  file: File;
}

export default function InvoiceManagementPage(): JSX.Element {
  const { projects, clients } = useAccountingStore();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [invoiceUploads, setInvoiceUploads] = useState<InvoiceUpload[]>([]);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceUpload | null>(
    null
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Get current month for default selection
  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Filter invoices by selected project
  const projectInvoices = useMemo(() => {
    if (!selectedProject) {
      return [];
    }
    return invoiceUploads.filter(
      invoice => invoice.projectId === selectedProject
    );
  }, [selectedProject, invoiceUploads]);

  // Handle file drag and drop
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
      setUploadedFile(files[0]);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // Submit invoice upload
  const handleSubmitInvoice = (): void => {
    if (!uploadedFile || !selectedProject) {
      return;
    }

    const project = projects.find(p => p.id === selectedProject);
    const client = clients.find(c => c.id === project?.clientId);

    const newInvoice: InvoiceUpload = {
      id: Date.now().toString(),
      projectId: selectedProject,
      projectName: project?.name ?? "Unknown Project",
      clientName: client?.name ?? "Unknown Client",
      month: currentMonth,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      uploadDate: new Date(),
      status: "pending",
      file: uploadedFile,
    };

    setInvoiceUploads(prev => [...prev, newInvoice]);
    setUploadedFile(null);
  };

  // Handle status changes
  const handleStatusChange = (
    invoiceId: string,
    newStatus: "approved" | "rejected"
  ): void => {
    setInvoiceUploads(prev =>
      prev.map(invoice =>
        invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
      )
    );
  };

  // Delete invoice
  const handleDeleteInvoice = (invoiceId: string): void => {
    setInvoiceUploads(prev => prev.filter(invoice => invoice.id !== invoiceId));
  };

  // View invoice details
  const handleViewInvoice = (invoice: InvoiceUpload): void => {
    setViewingInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const closeViewModal = (): void => {
    setIsViewModalOpen(false);
    setViewingInvoice(null);
  };

  // Helper functions
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case "approved":
        return <CheckIcon className="h-4 w-4" />;
      case "rejected":
        return <XMarkIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Invoice Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Upload and manage invoices for each project
          </p>
        </div>

        {/* Project Tabs */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Project Tabs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map(project => {
              const projectInvoices = invoiceUploads.filter(
                invoice => invoice.projectId === project.id
              );
              const isSelected = selectedProject === project.id;
              const client = clients.find(c => c.id === project.clientId);

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {project.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {projectInvoices.length} invoices
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {client?.name ?? "Unknown Client"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Project Content */}
        {selectedProject ? (
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {projects.find(p => p.id === selectedProject)?.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Client:{" "}
                    {
                      clients.find(
                        c =>
                          c.id ===
                          projects.find(p => p.id === selectedProject)?.clientId
                      )?.name
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current Month
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {currentMonth}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload New Invoice */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload New Invoice
              </h3>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {uploadedFile ? (
                  <div className="space-y-4">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-primary-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Drop invoice file here
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        or click to browse
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-300 dark:bg-primary-900/20 dark:hover:bg-primary-900/30"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={handleSubmitInvoice}
                  disabled={!uploadedFile}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Upload Invoice
                </button>
              </div>
            </div>

            {/* Project Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Project Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projectInvoices.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Total
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {projectInvoices.filter(i => i.status === "pending").length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Pending
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      projectInvoices.filter(i => i.status === "approved")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Approved
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {
                      projectInvoices.filter(i => i.status === "rejected")
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Rejected
                  </div>
                </div>
              </div>
            </div>

            {/* Previous Invoices */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Previous Invoices
                </h3>
                <button
                  onClick={() =>
                    document
                      .getElementById("invoices-table")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  View All
                </button>
              </div>

              {projectInvoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No invoices uploaded for this project yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          File
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {projectInvoices.map(invoice => (
                        <tr key={invoice.id} id="invoices-table">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {invoice.fileName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {invoice.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(invoice.fileSize)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                invoice.status
                              )}`}
                            >
                              {getStatusIcon(invoice.status)}
                              <span className="ml-1 capitalize">
                                {invoice.status}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleViewInvoice(invoice)}
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            >
                              View Details
                            </button>
                            {invoice.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusChange(invoice.id, "approved")
                                  }
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusChange(invoice.id, "rejected")
                                  }
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No project selected
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select a project from the tabs above to manage invoices.
            </p>
          </div>
        )}
      </div>

      {/* Invoice View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        title={`Invoice Details - ${viewingInvoice?.projectName}`}
        size="md"
      >
        {viewingInvoice && (
          <div className="space-y-6">
            {/* File Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                File Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    File Name:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {viewingInvoice.fileName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    File Size:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {formatFileSize(viewingInvoice.fileSize)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Upload Date:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {viewingInvoice.uploadDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Status:
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                      viewingInvoice.status
                    )}`}
                  >
                    {getStatusIcon(viewingInvoice.status)}
                    <span className="ml-1 capitalize">
                      {viewingInvoice.status}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Project Information */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Project Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Project:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {viewingInvoice.projectName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Client:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {viewingInvoice.clientName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Month:
                  </span>
                  <span className="text-gray-900 dark:text-white">
                    {viewingInvoice.month}
                  </span>
                </div>
              </div>
            </div>

            {/* File Preview */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                File Preview
              </h4>
              <div className="text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {viewingInvoice.fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(viewingInvoice.fileSize)}
                </p>
                <button className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 dark:text-primary-300 dark:bg-primary-900/20 dark:hover:bg-primary-900/30">
                  Open File
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeViewModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Close
              </button>
              {viewingInvoice.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(viewingInvoice.id, "approved");
                      closeViewModal();
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(viewingInvoice.id, "rejected");
                      closeViewModal();
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
