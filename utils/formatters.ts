import { format } from "date-fns";

// Currency formatting with consistent locale
export const formatCurrency = (amount: number, locale: string = "en-IN", currency: string = "INR"): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Status color mapping with consistent styling
export const getStatusColor = (status: string | undefined): string => {
  switch (status?.toLowerCase()) {
    case "active":
    case "paid":
    case "approved":
    case "completed":
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800";
    
    case "pending":
    case "draft":
    case "submitted":
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800";
    
    case "sent":
    case "invoiced":
      return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800";
    
    case "rejected":
    case "cancelled":
      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800";
    
    case "inactive":
    case "archived":
    case "on-hold":
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600";
    
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600";
  }
};

// Date formatting with consistent format
export const formatDate = (date: Date | string, formatStr: string = "MMM dd, yyyy"): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr);
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Percentage formatting
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Number formatting with thousands separator
export const formatNumber = (value: number, locale: string = "en-IN"): string => {
  return new Intl.NumberFormat(locale).format(value);
};

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
};

// Email masking for privacy
export const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) return email;
  
  const maskedLocal = localPart.charAt(0) + "*".repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Format duration in hours
export const formatDuration = (hours: number): string => {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) return `${days}d`;
  return `${days}d ${remainingHours.toFixed(1)}h`;
};

// Format progress percentage
export const formatProgress = (current: number, total: number): string => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  return `${percentage.toFixed(1)}%`;
}; 