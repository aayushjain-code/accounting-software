"use client";

import React, { useState } from "react";
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useAccountingStore } from "@/store";
import { toast } from "react-hot-toast";

export const StorageManager: React.FC = () => {
  const [isImporting, setIsImporting] = useState(false);
  const {
    replaceAllData,
    clients,
    projects,
    timesheets,
    invoices,
    expenses,
    dailyLogs,
    companyProfile,
  } = useAccountingStore();

  const exportData = () => {
    try {
      const data = {
        clients,
        projects,
        timesheets,
        invoices,
        expenses,
        dailyLogs,
        companyProfile,
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `accounting-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      toast.error("Please select a valid JSON file");
      return;
    }

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate the imported data structure
      if (
        !data.clients ||
        !data.projects ||
        !data.timesheets ||
        !data.invoices ||
        !data.expenses ||
        !data.dailyLogs ||
        !data.companyProfile
      ) {
        toast.error("Invalid data format. Please use a valid export file.");
        return;
      }

      // Confirm before replacing data
      if (
        window.confirm(
          "This will replace all existing data. Are you sure you want to continue?"
        )
      ) {
        replaceAllData(data);

        // Also save to localStorage
        localStorage.setItem("accountingData", JSON.stringify(data));

        toast.success("Data imported successfully!");
      }
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Failed to import data. Please check the file format.");
    } finally {
      setIsImporting(false);
      // Reset the input
      event.target.value = "";
    }
  };

  const backupData = () => {
    try {
      const data = {
        clients,
        projects,
        timesheets,
        invoices,
        expenses,
        dailyLogs,
        companyProfile,
        backedUpAt: new Date().toISOString(),
        version: "1.0.0",
        type: "backup",
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `accounting-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Backup created successfully!");
    } catch (error) {
      console.error("Backup failed:", error);
      toast.error("Failed to create backup");
    }
  };

  const clearAllData = () => {
    if (
      window.confirm(
        "This will permanently delete ALL data. Are you absolutely sure?"
      )
    ) {
      try {
        // Clear localStorage
        localStorage.removeItem("accountingData");

        // Reset store to empty state
        replaceAllData({
          clients: [],
          projects: [],
          timesheets: [],
          invoices: [],
          expenses: [],
          dailyLogs: [],
          companyProfile: {
            id: "default",
            name: "BST Accounting",
            legalName: "BST Accounting System",
            email: "info@bstaccounting.com",
            phone: "+1-555-0123",
            website: "https://bstaccounting.com",
            address: "123 Business Street",
            city: "Business City",
            state: "BS",
            pincode: "12345",
            country: "United States",
            gstNumber: "",
            panNumber: "",
            cinNumber: "",
            logo: "",
            description: "Professional accounting services",
            foundedYear: 2024,
            industry: "Accounting",
            companySize: "small",
            bankDetails: {
              accountNumber: "",
              ifscCode: "",
              bankName: "",
              branch: "",
            },
            contactPerson: {
              name: "Contact Person",
              email: "contact@bstaccounting.com",
              phone: "+1-555-0124",
              designation: "Manager",
            },
            socialMedia: {
              linkedin: "",
              twitter: "",
              facebook: "",
              instagram: "",
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        toast.success("All data cleared successfully!");
      } catch (error) {
        console.error("Clear data failed:", error);
        toast.error("Failed to clear data");
      }
    }
  };

  const getDataStats = () => {
    return {
      clients: clients.length,
      projects: projects.length,
      timesheets: timesheets.length,
      invoices: invoices.length,
      expenses: expenses.length,
      dailyLogs: dailyLogs.length,
    };
  };

  const stats = getDataStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <DocumentArrowDownIcon className="h-8 w-8 text-primary-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Data Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Import, export, backup, and manage your accounting data
            </p>
          </div>
        </div>

        {/* Data Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {stats.clients}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Clients
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {stats.projects}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Projects
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {stats.timesheets}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Timesheets
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {stats.invoices}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Invoices
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {stats.expenses}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Expenses
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary-600">
              {stats.dailyLogs}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Daily Logs
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Export Data */}
        <button
          onClick={exportData}
          className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors duration-200"
        >
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Export Data</span>
        </button>

        {/* Import Data */}
        <label className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors duration-200 cursor-pointer">
          <ArrowUpTrayIcon className="h-5 w-5" />
          <span>{isImporting ? "Importing..." : "Import Data"}</span>
          <input
            type="file"
            accept=".json"
            onChange={importData}
            className="hidden"
            disabled={isImporting}
          />
        </label>

        {/* Backup Data */}
        <button
          onClick={backupData}
          className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors duration-200"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          <span>Create Backup</span>
        </button>

        {/* Clear All Data */}
        <button
          onClick={clearAllData}
          className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors duration-200"
        >
          <TrashIcon className="h-5 w-5" />
          <span>Clear All Data</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
          How to use:
        </h3>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>
            • <strong>Export Data:</strong> Download all your data as a JSON
            file
          </li>
          <li>
            • <strong>Import Data:</strong> Upload a previously exported JSON
            file to restore data
          </li>
          <li>
            • <strong>Create Backup:</strong> Create a backup copy of your
            current data
          </li>
          <li>
            • <strong>Clear All Data:</strong> Remove all data and reset to
            default state
          </li>
        </ul>
        <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
          <strong>Note:</strong> Data is stored locally in your browser.
          Clearing browser data will remove your accounting information.
        </div>
      </div>
    </div>
  );
};
