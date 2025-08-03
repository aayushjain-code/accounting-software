// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone number validation
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

// Required field validation
export const validateRequired = (value: string | number | boolean | undefined): boolean => {
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  if (typeof value === "boolean") {
    return value === true;
  }
  return value !== undefined && value !== null;
};

// Number validation with range
export const validateNumber = (value: string | number, min: number = 0, max?: number): boolean => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return false;
  if (num < min) return false;
  if (max !== undefined && num > max) return false;
  return true;
};

// URL validation
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// GST number validation (Indian format)
export const validateGST = (gst: string): boolean => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst.toUpperCase());
};

// PAN number validation (Indian format)
export const validatePAN = (pan: string): boolean => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan.toUpperCase());
};

// Date validation
export const validateDate = (date: string | Date): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
};

// File size validation
export const validateFileSize = (fileSize: number, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
};

// File type validation
export const validateFileType = (fileName: string, allowedTypes: string[]): boolean => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
};

// Password strength validation
export const validatePassword = (password: string): {
  isValid: boolean;
  strength: "weak" | "medium" | "strong";
  errors: string[];
} => {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  } else {
    score += 1;
  }

  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score < 3) {
    errors.push("Password must contain uppercase, lowercase, number, and special character");
  }

  let strength: "weak" | "medium" | "strong" = "weak";
  if (score >= 4) strength = "strong";
  else if (score >= 3) strength = "medium";

  return {
    isValid: errors.length === 0,
    strength,
    errors,
  };
};

// Form validation helper
export const validateForm = (data: Record<string, any>, rules: Record<string, (value: any) => boolean | string>): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];
    const result = rule(value);
    
    if (result !== true) {
      errors[field] = typeof result === "string" ? result : "Invalid value";
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Common validation rules
export const validationRules = {
  email: (value: string) => validateEmail(value) || "Invalid email address",
  required: (value: any) => validateRequired(value) || "This field is required",
  phone: (value: string) => validatePhone(value) || "Invalid phone number",
  url: (value: string) => validateUrl(value) || "Invalid URL",
  gst: (value: string) => validateGST(value) || "Invalid GST number",
  pan: (value: string) => validatePAN(value) || "Invalid PAN number",
  positiveNumber: (value: number) => validateNumber(value, 0) || "Must be a positive number",
  percentage: (value: number) => validateNumber(value, 0, 100) || "Must be between 0 and 100",
}; 