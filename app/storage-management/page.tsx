"use client";

import React from "react";
import { DataLocationManager } from "@/components/DataLocationManager";
import { ElectronInfo } from "@/components/ElectronInfo";

export default function StorageManagementPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Storage Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your data storage, backups, and database location
          </p>
        </div>
      </div>

      {/* Electron Info - Only shows in desktop app */}
      <ElectronInfo />

      {/* Data Location Manager - Only shows in desktop app */}
      <DataLocationManager />
    </div>
  );
}
