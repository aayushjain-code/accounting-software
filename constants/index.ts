// Expense Categories with metadata
export const EXPENSE_CATEGORIES = [
  { value: "office-supplies", label: "Office Supplies", color: "blue" },
  { value: "software-tools", label: "Software & Tools", color: "purple" },
  { value: "travel-transportation", label: "Travel & Transportation", color: "green" },
  { value: "meals-entertainment", label: "Meals & Entertainment", color: "yellow" },
  { value: "professional-services", label: "Professional Services", color: "indigo" },
  { value: "marketing-advertising", label: "Marketing & Advertising", color: "pink" },
  { value: "utilities", label: "Utilities", color: "gray" },
  { value: "rent-equipment", label: "Rent & Equipment", color: "red" },
  { value: "insurance", label: "Insurance", color: "teal" },
  { value: "other", label: "Other", color: "gray" },
] as const;

// Project Status Options
export const PROJECT_STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "green" },
  { value: "completed", label: "Completed", color: "blue" },
  { value: "on-hold", label: "On Hold", color: "yellow" },
  { value: "cancelled", label: "Cancelled", color: "red" },
] as const;

// Client Status Options
export const CLIENT_STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "green" },
  { value: "inactive", label: "Inactive", color: "gray" },
  { value: "prospect", label: "Prospect", color: "blue" },
  { value: "lead", label: "Lead", color: "yellow" },
] as const;

// Company Size Options
export const COMPANY_SIZE_OPTIONS = [
  { value: "startup", label: "Startup", color: "purple" },
  { value: "small", label: "Small", color: "blue" },
  { value: "medium", label: "Medium", color: "green" },
  { value: "large", label: "Large", color: "orange" },
  { value: "enterprise", label: "Enterprise", color: "red" },
] as const;

// Invoice Status Options
export const INVOICE_STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "gray" },
  { value: "sent", label: "Sent", color: "blue" },
  { value: "paid", label: "Paid", color: "green" },
  { value: "overdue", label: "Overdue", color: "red" },
  { value: "cancelled", label: "Cancelled", color: "gray" },
] as const;

// Daily Log Priority Options
export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low", color: "green" },
  { value: "medium", label: "Medium", color: "yellow" },
  { value: "high", label: "High", color: "red" },
  { value: "urgent", label: "Urgent", color: "red" },
] as const;

// Daily Log Category Options
export const LOG_CATEGORY_OPTIONS = [
  { value: "development", label: "Development", color: "blue" },
  { value: "meeting", label: "Meeting", color: "purple" },
  { value: "research", label: "Research", color: "green" },
  { value: "testing", label: "Testing", color: "yellow" },
  { value: "documentation", label: "Documentation", color: "indigo" },
  { value: "other", label: "Other", color: "gray" },
] as const;

// Pagination Settings
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
  MAX_VISIBLE_PAGES: 5,
} as const;

// File Upload Settings
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_TYPES: {
    images: ".jpg,.jpeg,.png,.gif,.webp",
    documents: ".pdf,.doc,.docx,.txt,.rtf",
    spreadsheets: ".xls,.xlsx,.csv",
    presentations: ".ppt,.pptx",
    archives: ".zip,.rar,.7z",
  },
  MAX_FILES_PER_UPLOAD: 5,
} as const;

// Performance Thresholds
export const PERFORMANCE_THRESHOLDS = {
  SLOW_RENDER_THRESHOLD: 16, // 60fps = 16ms
  SLOW_QUERY_THRESHOLD: 100, // 100ms
  BUNDLE_SIZE_WARNING: 250 * 1024, // 250KB
} as const;
