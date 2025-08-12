"use client";

import React from "react";
import { ViewColumnsIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

interface ViewToggleProps {
  viewMode: "cards" | "table";
  onViewChange: (mode: "cards" | "table") => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewChange,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 ${className}`}
    >
      <button
        onClick={() => onViewChange("cards")}
        className={`p-2 rounded-md transition-all duration-200 ${
          viewMode === "cards"
            ? "bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
        title="Card View"
      >
        <Squares2X2Icon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewChange("table")}
        className={`p-2 rounded-md transition-all duration-200 ${
          viewMode === "table"
            ? "bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
        title="Table View"
      >
        <ViewColumnsIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
