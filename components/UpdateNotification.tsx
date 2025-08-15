import React, { useState, useEffect } from "react";
import { BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { ChangelogEntry } from "@/types";

interface UpdateNotificationProps {
  changelog: ChangelogEntry[];
  onDismiss?: () => void;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  changelog,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState<ChangelogEntry | null>(null);

  useEffect(() => {
    if (changelog.length > 0) {
      const [latest] = changelog;
      const lastSeen = localStorage.getItem("lastSeenUpdate");

      if (!lastSeen || new Date(latest.releaseDate) > new Date(lastSeen)) {
        setLatestUpdate(latest);
        setIsVisible(true);
      }
    }
  }, [changelog]);

  const handleDismiss = (): void => {
    setLatestUpdate(null);
    setLastSeen(new Date().toISOString());
  };

  const handleViewUpdate = (): void => {
    // This would typically open the changelog modal
    // For now, we'll just dismiss the notification
    handleDismiss();
  };

  if (!isVisible || !latestUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-top-2 duration-300">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <BellIcon className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-semibold text-gray-900">
                New Update Available!
              </h4>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              {latestUpdate.title} - Version {latestUpdate.version}
            </p>

            <div className="flex space-x-2">
              <button
                onClick={handleViewUpdate}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
              >
                View Details
              </button>
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
