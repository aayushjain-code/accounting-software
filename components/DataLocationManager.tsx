"use client";

import React, { useState, useEffect } from "react";
import {
  FolderIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useAccountingStore } from "@/store";

interface DataLocationManagerProps {
  className?: string;
}

export const DataLocationManager: React.FC<DataLocationManagerProps> = ({
  className = "",
}) => {
  const [dataLocation, setDataLocation] = useState<string>("");
  const [isElectron, setIsElectron] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const replaceAllData = useAccountingStore((state) => state.replaceAllData);
  const clearAllData = useAccountingStore((state) => state.clearAllData);

  useEffect(() => {
    setIsClient(true);
    const checkElectron =
      typeof window !== "undefined" && window.electronAPI?.isElectron;
    setIsElectron(checkElectron || false);

    if (checkElectron && window.electronAPI) {
      loadDataLocation();
    }
  }, []);

  const loadDataLocation = async () => {
    try {
      if (window.electronAPI) {
        const location = await window.electronAPI.getDatabaseLocation();
        setDataLocation(location);
      }
    } catch (error) {
      console.error("Error loading database location:", error);
    }
  };

  const handleChangeLocation = async () => {
    if (!isElectron || !window.electronAPI) return;

    setIsLoading(true);
    try {
      // This will trigger the native dialog in the main process
      // The result will be handled by the main process
      await window.electronAPI.changeDatabaseLocation();
      // Reload the location after change
      await loadDataLocation();
    } catch (error) {
      console.error("Error changing database location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!isElectron || !window.electronAPI) return;

    setIsLoading(true);
    try {
      await window.electronAPI.exportData();
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    if (!isElectron || !window.electronAPI) return;

    setIsLoading(true);
    try {
      await window.electronAPI.importData();

      // Fetch the new data from the database after import
      if (window.electronAPI.getAllData) {
        const importedData = await window.electronAPI.getAllData();
        // Update Zustand store with the imported data
        replaceAllData(importedData);
        alert("Data imported successfully! UI has been updated.");
      } else {
        // Fallback: reload the page to get fresh data
        window.location.reload();
      }
    } catch (error) {
      console.error("Error importing data:", error);
      alert("Error importing data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupData = async () => {
    if (!isElectron || !window.electronAPI) return;

    setIsLoading(true);
    try {
      await window.electronAPI.backupDatabase();
    } catch (error) {
      console.error("Error backing up data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAllData = async () => {
    if (!isElectron || !window.electronAPI) return;

    setIsLoading(true);
    try {
      console.log("Starting clear all data process...");

      // Clear the database first
      if (window.electronAPI.clearAllData) {
        await window.electronAPI.clearAllData();
        console.log("Database cleared successfully");

        // Clear the Zustand store (this returns void)
        clearAllData();
        console.log("Store cleared successfully");

        // Show success message
        alert("All data has been cleared successfully!");

        // Reload the page to reflect the changes
        window.location.reload();
      } else {
        throw new Error("clearAllData function not available");
      }
    } catch (error) {
      console.error("Error clearing data:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Error clearing data: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setShowClearConfirm(false);
    }
  };

  // Don't render anything during SSR or before client-side hydration
  if (!isClient) {
    return null;
  }

  if (!isElectron) {
    return null; // Don't show in web version
  }

  return (
    <div
      className={`bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <FolderIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
          Data Storage Management
        </h3>
      </div>

      <div className="space-y-4">
        {/* Current Data Location */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Current Data Location
          </h4>
          <div className="flex items-center space-x-3">
            <FolderIcon className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                {dataLocation || "Loading..."}
              </p>
            </div>
          </div>
        </div>

        {/* Data Management Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Data Management
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={handleChangeLocation}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span className="text-sm">
                {isLoading ? "Changing..." : "Change Location"}
              </span>
            </button>

            <button
              onClick={handleExportData}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span className="text-sm">
                {isLoading ? "Exporting..." : "Export Data"}
              </span>
            </button>

            <button
              onClick={handleImportData}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors disabled:opacity-50"
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              <span className="text-sm">
                {isLoading ? "Importing..." : "Import Data"}
              </span>
            </button>

            <button
              onClick={handleBackupData}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors disabled:opacity-50"
            >
              <DocumentDuplicateIcon className="h-4 w-4" />
              <span className="text-sm">
                {isLoading ? "Backing up..." : "Backup Now"}
              </span>
            </button>

            <button
              onClick={() => window.location.reload()}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span className="text-sm">Refresh Data</span>
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" />
              <span className="text-sm">Clear All Data</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h5 className="font-semibold text-blue-800 dark:text-blue-200">
                How to Manage Your Data
              </h5>
              <div className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <p>
                  • <strong>Change Location:</strong> Move data to a custom
                  folder
                </p>
                <p>
                  • <strong>Export:</strong> Save data as JSON file (Ctrl+E)
                </p>
                <p>
                  • <strong>Import:</strong> Load data from backup file (Ctrl+I)
                </p>
                <p>
                  • <strong>Backup:</strong> Create automatic backup in
                  Documents
                </p>
                <p>
                  • <strong>Restore:</strong> Load data from backup file
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h5 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Data Security Notice
              </h5>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                All data is encrypted with AES-256 encryption. Keep your backup
                files secure and consider storing them in a safe location like
                an external drive or cloud storage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clear All Data Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Clear All Data
              </h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">
              This action will permanently delete all your data including
              clients, projects, timesheets, invoices, expenses, and daily logs.
              This action cannot be undone.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Clearing..." : "Clear All Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
