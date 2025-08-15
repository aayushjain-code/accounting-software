import React from "react";
import { getStatusColor } from "@/utils/formatters";

interface StatusBadgeProps {
  status: string | undefined;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "solid";
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
  variant = "default",
  className = "",
  showIcon = false,
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-2 py-0.5 text-xs";
      case "lg":
        return "px-3 py-1.5 text-sm";
      default:
        return "px-2.5 py-1 text-xs";
    }
  };

  const getVariantClasses = () => {
    const baseClasses = getStatusColor(status);

    switch (variant) {
      case "outline":
        return baseClasses
          .replace(/bg-\w+-\d+/, "bg-transparent")
          .replace(/text-\w+-\d+/, "text-gray-700 dark:text-gray-300");
      case "solid":
        return baseClasses
          .replace(/bg-\w+-\d+/, "bg-gray-900 dark:bg-gray-100")
          .replace(/text-\w+-\d+/, "text-white dark:text-gray-900");
      default:
        return baseClasses;
    }
  };

  const getStatusIcon = () => {
    if (!showIcon) {return null;}

    switch (status?.toLowerCase()) {
      case "active":
      case "paid":
      case "approved":
      case "completed":
        return "✓";
      case "pending":
      case "draft":
      case "submitted":
        return "⏳";
      case "sent":
      case "invoiced":
        return "📤";
      case "rejected":
      case "cancelled":
        return "✗";
      case "inactive":
      case "archived":
      case "on-hold":
        return "⏸";
      default:
        return "•";
    }
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-medium border
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${className}
      `}
    >
      {getStatusIcon()}
      {status}
    </span>
  );
};
