"use client";

import { useState, useRef } from "react";
import { format } from "date-fns";
import {
  CloudArrowUpIcon,
  DocumentIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { useAccountingStore } from "@/store";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { InvoiceFile } from "@/types/invoice";

export default function InvoiceUploadPage(): JSX.Element {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { invoices, invoiceFiles, addInvoiceFile, deleteInvoiceFile } =
    useAccountingStore();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { files } = event.target;
    if (!files) {
      return;
    }

    setUploading(true);

    // Simulate file upload
    setTimeout(() => {
      Array.from(files).forEach(file => {
        addInvoiceFile("", {
          id: `file_${Date.now()}_${Math.random()}`,
          invoiceId: "", // Will be linked when invoice is selected
          fileName: `${Date.now()}_${file.name}`,
          originalName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadDate: new Date(),
          uploadedBy: "Current User",
          filePath: `/uploads/invoices/${selectedMonth}/${file.name}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 1000);
  };

  const getMonthFiles = (): InvoiceFile[] => {
    // For now, return all files since we removed the month field
    // In a real implementation, you might want to add month metadata or use a different approach
    return invoiceFiles;
  };

  const handleDeleteFile = (fileId: string): void => {
    deleteInvoiceFile(fileId);
  };

  const months = [
    { value: "2024-01", label: "January 2024" },
    { value: "2024-02", label: "February 2024" },
    { value: "2024-03", label: "March 2024" },
    { value: "2024-04", label: "April 2024" },
    { value: "2024-05", label: "May 2024" },
    { value: "2024-06", label: "June 2024" },
    { value: "2024-07", label: "July 2024" },
    { value: "2024-08", label: "August 2024" },
    { value: "2024-09", label: "September 2024" },
    { value: "2024-10", label: "October 2024" },
    { value: "2024-11", label: "November 2024" },
    { value: "2024-12", label: "December 2024" },
    { value: "2025-01", label: "January 2025" },
    { value: "2025-02", label: "February 2025" },
    { value: "2025-03", label: "March 2025" },
    { value: "2025-04", label: "April 2025" },
    { value: "2025-05", label: "May 2025" },
    { value: "2025-06", label: "June 2025" },
    { value: "2025-07", label: "July 2025" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Invoice Upload</h1>
        <p className="text-gray-600">
          Upload and manage invoice files by month
        </p>
      </div>

      {/* Month Selection */}
      <Card>
        <div className="flex items-center space-x-4 mb-6">
          <CalendarIcon className="h-6 w-6 text-primary-600" />
          <div>
            <label
              htmlFor="month"
              className="block text-sm font-medium text-gray-700"
            >
              Select Month
            </label>
            <select
              id="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              Click to select files or drag and drop
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports PDF, images, and Word documents
            </p>
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
              >
                Choose Files
              </label>
            </div>
            {uploading && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-primary-600 mt-2">Uploading...</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Uploaded Files */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <FolderIcon className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Files for {format(new Date(`${selectedMonth}-01`), "MMMM yyyy")}
            </h3>
          </div>
          <span className="text-sm text-gray-500">
            {getMonthFiles().length} files
          </span>
        </div>

        {getMonthFiles().length === 0 ? (
          <div className="text-center py-8">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-gray-500 mt-2">
              No files uploaded for this month
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {getMonthFiles().map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="h-8 w-8 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {file.originalName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.fileSize)} •{" "}
                      {format(new Date(file.uploadDate), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Handle file preview
                      window.open(file.filePath, "_blank");
                    }}
                  >
                    <EyeIcon className="h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Files</p>
            <p className="text-2xl font-bold text-gray-900">
              {getMonthFiles().length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Total Size</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatFileSize(
                getMonthFiles().reduce((sum, file) => sum + file.fileSize, 0)
              )}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Invoices</p>
            <p className="text-2xl font-bold text-gray-900">
              {
                invoices.filter(invoice => {
                  const invoiceMonth = format(
                    new Date(invoice.issueDate),
                    "yyyy-MM"
                  );
                  return invoiceMonth === selectedMonth;
                }).length
              }
            </p>
          </div>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Recent Invoices for{" "}
          {format(new Date(`${selectedMonth}-01`), "MMMM yyyy")}
        </h3>
        <div className="space-y-3">
          {invoices
            .filter(invoice => {
              const invoiceMonth = format(
                new Date(invoice.issueDate),
                "yyyy-MM"
              );
              return invoiceMonth === selectedMonth;
            })
            .slice(0, 5)
            .map(invoice => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(invoice.issueDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(invoice.total)}
                  </p>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      invoice.status === "paid"
                        ? "text-success-600 bg-success-100"
                        : invoice.status === "sent"
                          ? "text-warning-600 bg-warning-100"
                          : "text-gray-600 bg-gray-100"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
