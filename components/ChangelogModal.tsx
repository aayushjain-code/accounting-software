import React from "react";
import { ChangelogEntry } from "@/types";
import {
  PlusIcon,
  WrenchScrewdriverIcon,
  ArrowUpIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
  changelog: ChangelogEntry[];
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({
  isOpen,
  onClose,
  changelog,
}) => {
  if (!isOpen) {
    return null;
  }

  const getTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case "feature":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "bugfix":
        return "bg-green-100 text-green-800 border-green-200";
      case "improvement":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "breaking":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string): JSX.Element => {
    switch (type.toLowerCase()) {
      case "feature":
        return <PlusIcon className="h-4 w-4" />;
      case "bugfix":
        return <WrenchScrewdriverIcon className="h-4 w-4" />;
      case "improvement":
        return <ArrowUpIcon className="h-4 w-4" />;
      case "breaking":
        return <ExclamationTriangleIcon className="h-4 w-4" />;
      default:
        return <InformationCircleIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              What&apos;s New
            </h2>
            <p className="text-gray-600 mt-1">
              Latest updates and improvements to the system
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {changelog.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No updates yet
              </h3>
              <p className="text-gray-500">
                Check back later for new features and improvements!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {changelog.map(entry => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Entry Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {getTypeIcon(entry.type)}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {entry.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Version {entry.version}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(
                          entry.type
                        )}`}
                      >
                        {entry.type.charAt(0).toUpperCase() +
                          entry.type.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(entry.releaseDate)}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-700 mb-4">{entry.description}</p>

                  {/* Changes List */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Changes:</h4>
                    <ul className="space-y-2">
                      {entry.changes.map((change, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-gray-700"
                        >
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            {changelog.length} update{changelog.length !== 1 ? "s" : ""}{" "}
            available
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
