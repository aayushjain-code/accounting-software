// Export all types from organized modules
export * from "./common";
export * from "./client";
export * from "./project";
export * from "./invoice";
export * from "./timesheet";
// Note: dashboard types are already exported by individual modules

// Base interface for all filters
export interface BaseFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Legacy types that need to be migrated
export interface Expense {
  id: string;
  expenseCode: string; // EXP-YYYY-MM-XXXX format
  description: string;
  amount: number;
  category: string;
  date: Date;
  projectId?: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  receipt?: string;
  notes?: string;
  files?: import("./common").ExpenseFile[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyLog {
  id: string;
  date: Date;
  title: string;
  description: string;
  category: "accounting" | "important" | "reminder" | "milestone";
  priority: "low" | "medium" | "high" | "critical";
  projectId?: string; // Optional reference to related project
  tags: string[];
  files?: import("./common").DailyLogFile[]; // Optional file attachments
  status: "pending" | "in-progress" | "completed";
  assignedTo?: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyProfile {
  id: string;
  name: string;
  legalName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  cinNumber: string;
  logo?: string;
  description: string;
  foundedYear: number;
  industry: string;
  companySize: "startup" | "small" | "medium" | "large" | "enterprise";
  annualRevenue?: number;
  employeeCount?: number;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  };
  contactPerson: {
    name: string;
    email: string;
    phone: string;
    designation: string;
  };
  socialMedia: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  createdAt: Date;
  updatedAt: Date;
  // Legacy property names for backward compatibility
  gstNumber?: string; // Alias for gstin
  panNumber?: string; // Alias for pan
}

export interface DirectoryContact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  country: string;
  website: string;
  linkedin: string;
  notes: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "admin" | "user" | "manager";
  department?: string;
  position?: string;
  bio?: string;
  preferences: {
    theme: "light" | "dark" | "auto";
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    language: "en" | "hi" | "es";
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string;
  changes: string[];
  releaseDate: Date;
  type: "feature" | "bugfix" | "improvement" | "breaking";
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Global window interface for web-based app
declare global {
  interface Window {
    // Add any web-specific global interfaces here if needed
  }
}
