import { format } from "date-fns";

// Currency formatting utility
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Status color utility
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "paid":
      return "text-success-600 bg-success-100";
    case "sent":
      return "text-warning-600 bg-warning-100";
    case "draft":
      return "text-gray-600 bg-gray-100";
    case "overdue":
      return "text-danger-600 bg-danger-100";
    case "active":
      return "text-success-600 bg-success-100";
    case "completed":
      return "text-primary-600 bg-primary-100";
    case "on-hold":
      return "text-warning-600 bg-warning-100";
    case "archived":
      return "text-gray-600 bg-gray-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

// Date formatting utility
export const formatDate = (date: Date | string): string => {
  return format(new Date(date), "MMM dd, yyyy");
};

// Search utility
export const searchFilter = <T extends Record<string, any>>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm) return items;

  const searchLower = searchTerm.toLowerCase();
  return items.filter((item) =>
    searchFields.some((field) =>
      String(item[field]).toLowerCase().includes(searchLower)
    )
  );
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

export const validateNumber = (value: string, min = 0): boolean => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min;
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Generate ID utility
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// File size formatting utility
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0.00 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
};

// Pagination utility
export const paginate = <T>(
  items: T[],
  page: number,
  pageSize: number
): { items: T[]; totalPages: number; hasNext: boolean; hasPrev: boolean } => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedItems = items.slice(startIndex, endIndex);
  const totalPages = Math.ceil(items.length / pageSize);

  return {
    items: paginatedItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

// Sort utility
export const sortBy = <T>(
  items: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] => {
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === "asc" ? -1 : 1;
    if (aVal > bVal) return direction === "asc" ? 1 : -1;
    return 0;
  });
};
