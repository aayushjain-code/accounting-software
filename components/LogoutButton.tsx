import React from "react";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

interface LogoutButtonProps {
  className?: string;
  onLogout?: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  className = "",
  onLogout,
}) => {
  const handleLogout = async () => {
    try {
      // For web-based app, just call the onLogout callback if provided
      if (onLogout) {
        onLogout();
      } else {
        // Fallback to reload
        window.location.reload();
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
    >
      <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
      Logout
    </button>
  );
};
