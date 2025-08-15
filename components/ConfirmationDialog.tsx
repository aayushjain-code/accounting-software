import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}) => {
  if (!isOpen) {
    return null;
  }

  const getVariantStyles = (): string => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-danger-600",
          button: "bg-danger-600 hover:bg-danger-700 text-white",
        };
      case "warning":
        return {
          icon: "text-warning-600",
          button: "bg-warning-600 hover:bg-warning-700 text-white",
        };
      case "info":
        return {
          icon: "text-primary-600",
          button: "bg-primary-600 hover:bg-primary-700 text-white",
        };
      default:
        return {
          icon: "text-danger-600",
          button: "bg-danger-600 hover:bg-danger-700 text-white",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon
              className={`h-6 w-6 ${styles.icon} mr-3`}
            />
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${styles.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
