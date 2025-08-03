"use client";

import React from "react";
import {
  ShieldCheckIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface ElectronInfoProps {
  className?: string;
}

export const ElectronInfo: React.FC<ElectronInfoProps> = ({
  className = "",
}) => {
  const [isElectron, setIsElectron] = React.useState(false);
  const [appVersion, setAppVersion] = React.useState<string | null>(null);
  const [platform, setPlatform] = React.useState<string | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    const checkElectron =
      typeof window !== "undefined" && window.electronAPI?.isElectron;
    setIsElectron(checkElectron || false);

    if (checkElectron && window.electronAPI) {
      setAppVersion(window.electronAPI.getAppVersion());
      setPlatform(window.electronAPI.getPlatform());
    }
  }, []);

  // Don't render anything during SSR or before client-side hydration
  if (!isClient) {
    return null;
  }

  if (!isElectron) {
    return null; // Don't show in web version
  }

  return (
    <div
      className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 ${className}`}
    >
      <div className="flex items-center space-x-3 mb-4">
        <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
          Secure Desktop Application
        </h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <ComputerDesktopIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Platform
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {platform}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Version
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {appVersion}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
            Security Features
          </h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-4 w-4 text-green-500" />
              <span>Local data storage with encryption</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-4 w-4 text-green-500" />
              <span>Offline-first capability</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-4 w-4 text-green-500" />
              <span>No internet connection required</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-4 w-4 text-green-500" />
              <span>Secure IPC communication</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h5 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Important Notice
              </h5>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This is a desktop application with local data storage. Regular
                backups are recommended to prevent data loss.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
