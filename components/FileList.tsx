import React from "react";
import { DocumentIcon, TrashIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { TimesheetFile, InvoiceFile } from "@/types";

interface FileListProps {
  files: (TimesheetFile | InvoiceFile)[];
  onDelete?: (fileId: string) => void;
  title?: string;
  showActions?: boolean;
}

const FileList: React.FC<FileListProps> = ({
  files,
  onDelete,
  title = "Attached Files",
  showActions = true,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (fileType: string): string => {
    const extension = fileType.toLowerCase();
    if (extension.includes("pdf")) return "📄";
    if (extension.includes("doc")) return "📝";
    if (extension.includes("xls")) return "📊";
    if (extension.includes("jpg") || extension.includes("jpeg") || extension.includes("png")) return "🖼️";
    return "📎";
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title} ({files.length})
        </h3>
      </div>

      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getFileIcon(file.fileType)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.originalName}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span>•</span>
                  <span>Uploaded {formatDate(file.uploadDate)}</span>
                  <span>•</span>
                  <span>by {file.uploadedBy}</span>
                </div>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    // In a real app, this would trigger a download
                    console.log("Download file:", file.fileName);
                  }}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                  title="Download file"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
                {onDelete && (
                  <button
                    onClick={() => onDelete(file.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete file"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList; 