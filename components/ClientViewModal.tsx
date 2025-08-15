import React from "react";
import { Client } from "@/types";
import { format } from "date-fns";
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  UserIcon,
  MapPinIcon,
  ReceiptRefundIcon,
} from "@heroicons/react/24/outline";
import Modal from "./Modal";

interface ClientViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export const ClientViewModal: React.FC<ClientViewModalProps> = ({
  isOpen,
  onClose,
  client,
}) => {
  if (!client) {
    return null;
  }

  const getStatusColor = (status: string | undefined) => {
    const safeStatus = status || "active";
    switch (safeStatus) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700";
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
      case "prospect":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700";
      case "lead":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-700";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600";
    }
  };

  const getCompanySizeColor = (size: string | undefined) => {
    const safeSize = size || "small";
    switch (safeSize) {
      case "startup":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "small":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "medium":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "large":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "enterprise":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const formatStatus = (status: string | undefined) => {
    const safeStatus = status || "active";
    return safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1);
  };

  const formatCompanySize = (size: string | undefined) => {
    const safeSize = size || "small";
    return safeSize.charAt(0).toUpperCase() + safeSize.slice(1);
  };

  const formatUrl = (url: string) => {
    if (!url) {
      return "";
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`;
    }
    return url;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md" footer={null}>
      <div className="relative">
        <div className="space-y-6">
          {/* Header with Client ID prominently displayed */}
          <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6">
            <div className="mb-4">
              <span className="font-mono font-semibold text-primary-700 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-lg border border-primary-200 dark:border-primary-700 text-sm">
                {client.clientCode}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {client.name}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {client.company}
            </p>
          </div>

          {/* Status and Company Size */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(
                client.status
              )}`}
            >
              {formatStatus(client.status)}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getCompanySizeColor(
                client.companySize
              )}`}
            >
              {formatCompanySize(client.companySize)}
            </span>
            {client.industry && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {client.industry}
              </span>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {client.email}
                    </span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {client.phone}
                      </span>
                    </div>
                  )}
                  {client.companyWebsite && (
                    <div className="flex items-center space-x-3">
                      <GlobeAltIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <a
                        href={formatUrl(client.companyWebsite)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline transition-colors"
                      >
                        {client.companyWebsite}
                      </a>
                    </div>
                  )}
                  {client.companyAddress && (
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {client.companyAddress}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Company Details */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Company Details
                </h3>
                <div className="space-y-3">
                  {client.companyOwner && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Owner:
                      </span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {client.companyOwner}
                      </span>
                    </div>
                  )}
                  {client.companyLinkedin && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        LinkedIn:
                      </span>
                      <a
                        href={formatUrl(client.companyLinkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 underline transition-colors"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                  {client.source && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Source:
                      </span>
                      <span className="ml-2 text-gray-700 dark:text-gray-300">
                        {client.source}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Point of Contact */}
              {client.pocName && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Point of Contact
                  </h3>
                  <div className="space-y-3">
                    <div className="text-blue-800 dark:text-blue-200 font-medium">
                      {client.pocName}
                    </div>
                    {client.pocEmail && (
                      <div className="flex items-center space-x-3">
                        <EnvelopeIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-blue-700 dark:text-blue-300">
                          {client.pocEmail}
                        </span>
                      </div>
                    )}
                    {client.pocContact && (
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-blue-700 dark:text-blue-300">
                          {client.pocContact}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* GST Information */}
              {client.gstId && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4 flex items-center">
                    <ReceiptRefundIcon className="h-5 w-5 mr-2 text-green-600" />
                    GST Information
                  </h3>
                  <div className="text-green-800 dark:text-green-200 font-mono text-lg">
                    {client.gstId}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              {client.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Additional Notes
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <div>
                Created: {format(new Date(client.createdAt), "MMMM dd, yyyy")}
              </div>
              <div>
                Last Updated:{" "}
                {format(new Date(client.updatedAt), "MMMM dd, yyyy")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
