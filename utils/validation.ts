// Validation utility functions

import { VALIDATION_MESSAGES } from "@/constants";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  field: string;
  value: unknown;
  rules: ValidationRule[];
}

export interface ValidationRule {
  type: "required" | "email" | "phone" | "minLength" | "maxLength" | "minValue" | "maxValue" | "positiveNumber" | "validDate" | "futureDate" | "pastDate" | "gstin" | "pan" | "ifsc" | "accountNumber" | "custom";
  value?: number | string | RegExp | ((value: unknown) => boolean);
  message?: string;
}

export class Validator {
  private errors: string[] = [];

  /**
   * Validates a single field
   */
  static validateField(field: string, value: unknown, rules: ValidationRule[]): ValidationResult {
    const validator = new Validator();
    validator.validateField(field, value, rules);
    return validator.getResult();
  }

  /**
   * Validates multiple fields
   */
  static validateFields(fields: FieldValidation[]): ValidationResult {
    const validator = new Validator();
    fields.forEach(({ field, value, rules }) => {
      validator.validateField(field, value, rules);
    });
    return validator.getResult();
  }

  /**
   * Validates a form object
   */
  static validateForm<T extends Record<string, unknown>>(
    formData: T,
    validationSchema: Record<keyof T, ValidationRule[]>
  ): ValidationResult {
    const validator = new Validator();
    Object.entries(validationSchema).forEach(([field, rules]) => {
      validator.validateField(field, formData[field], rules);
    });
    return validator.getResult();
  }

  private validateField(field: string, value: unknown, rules: ValidationRule[]): void {
    rules.forEach((rule) => {
      const error = this.applyRule(field, value, rule);
      if (error) {
        this.errors.push(error);
      }
    });
  }

  private applyRule(field: string, value: unknown, rule: ValidationRule): string | null {
    switch (rule.type) {
      case "required":
        return this.validateRequired(field, value, rule.message);
      case "email":
        return this.validateEmail(field, value, rule.message);
      case "phone":
        return this.validatePhone(field, value, rule.message);
      case "minLength":
        return this.validateMinLength(field, value, rule.value as number, rule.message);
      case "maxLength":
        return this.validateMaxLength(field, value, rule.value as number, rule.message);
      case "minValue":
        return this.validateMinValue(field, value, rule.value as number, rule.message);
      case "maxValue":
        return this.validateMaxValue(field, value, rule.value as number, rule.message);
      case "positiveNumber":
        return this.validatePositiveNumber(field, value, rule.message);
      case "validDate":
        return this.validateValidDate(field, value, rule.message);
      case "futureDate":
        return this.validateFutureDate(field, value, rule.message);
      case "pastDate":
        return this.validatePastDate(field, value, rule.message);
      case "gstin":
        return this.validateGSTIN(field, value, rule.message);
      case "pan":
        return this.validatePAN(field, value, rule.message);
      case "ifsc":
        return this.validateIFSC(field, value, rule.message);
      case "accountNumber":
        return this.validateAccountNumber(field, value, rule.message);
      case "custom":
        return this.validateCustom(field, value, rule.value as (value: unknown) => boolean, rule.message);
      default:
        return null;
    }
  }

  private validateRequired(field: string, value: unknown, message?: string): string | null {
    if (value === null || value === undefined || value === "") {
      return message || VALIDATION_MESSAGES.required;
    }
    return null;
  }

  private validateEmail(field: string, value: unknown, message?: string): string | null {
    if (typeof value !== "string") return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return message || VALIDATION_MESSAGES.email;
    }
    return null;
  }

  private validatePhone(field: string, value: unknown, message?: string): string | null {
    if (typeof value !== "string") return null;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ""))) {
      return message || VALIDATION_MESSAGES.phone;
    }
    return null;
  }

  private validateMinLength(field: string, value: unknown, minLength: number, message?: string): string | null {
    if (typeof value !== "string") return null;
    if (value.length < minLength) {
      return message || VALIDATION_MESSAGES.minLength(field, minLength);
    }
    return null;
  }

  private validateMaxLength(field: string, value: unknown, maxLength: number, message?: string): string | null {
    if (typeof value !== "string") return null;
    if (value.length > maxLength) {
      return message || VALIDATION_MESSAGES.maxLength(field, maxLength);
    }
    return null;
  }

  private validateMinValue(field: string, value: unknown, minValue: number, message?: string): string | null {
    if (typeof value !== "number") return null;
    if (value < minValue) {
      return message || VALIDATION_MESSAGES.minValue(field, minValue);
    }
    return null;
  }

  private validateMaxValue(field: string, value: unknown, maxValue: number, message?: string): string | null {
    if (typeof value !== "number") return null;
    if (value > maxValue) {
      return message || VALIDATION_MESSAGES.maxValue(field, maxValue);
    }
    return null;
  }

  private validatePositiveNumber(field: string, value: unknown, message?: string): string | null {
    if (typeof value !== "number") return null;
    if (value <= 0) {
      return message || VALIDATION_MESSAGES.positiveNumber;
    }
    return null;
  }

  private validateValidDate(field: string, value: unknown, message?: string): string | null {
    if (value instanceof Date) {
      if (isNaN(value.getTime())) {
        return message || VALIDATION_MESSAGES.validDate;
      }
    } else if (typeof value === "string") {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return message || VALIDATION_MESSAGES.validDate;
      }
    }
    return null;
  }

  private validateFutureDate(field: string, value: unknown, message?: string): string | null {
    const date = this.parseDate(value);
    if (date && date <= new Date()) {
      return message || VALIDATION_MESSAGES.futureDate;
    }
    return null;
  }

  private validatePastDate(field: string, value: unknown, message?: string): string | null {
    const date = this.parseDate(value);
    if (date && date >= new Date()) {
      return message || VALIDATION_MESSAGES.pastDate;
    }
    return null;
  }

  private validateGSTIN(field: string, value: unknown, message?: string): string | null {
    if (typeof value !== "string") return null;
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstinRegex.test(value)) {
      return message || VALIDATION_MESSAGES.gstin;
    }
    return null;
  }

  private validatePAN(field: string, value: unknown, message?: string): string | null {
    if (typeof value !== "string") return null;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(value)) {
      return message || VALIDATION_MESSAGES.pan;
    }
    return null;
  }

  private validateIFSC(field: string, value: unknown, message?: string): string | null {
    if (typeof value !== "string") return null;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(value)) {
      return message || VALIDATION_MESSAGES.ifsc;
    }
    return null;
  }

  private validateAccountNumber(field: string, value: unknown, message?: string): string | null {
    if (typeof value !== "string") return null;
    const accountRegex = /^[0-9]{9,18}$/;
    if (!accountRegex.test(value)) {
      return message || VALIDATION_MESSAGES.accountNumber;
    }
    return null;
  }

  private validateCustom(field: string, value: unknown, validator: (value: unknown) => boolean, message?: string): string | null {
    if (!validator(value)) {
      return message || `Validation failed for ${field}`;
    }
    return null;
  }

  private parseDate(value: unknown): Date | null {
    if (value instanceof Date) {
      return value;
    }
    if (typeof value === "string") {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }

  private getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: [...this.errors],
    };
  }
}

// Convenience functions
export const validateRequired = (value: unknown): boolean => {
  return value !== null && value !== undefined && value !== "";
};

export const validateEmail = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const validatePhone = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(value.replace(/\s/g, ""));
};

export const validateGSTIN = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstinRegex.test(value);
};

export const validatePAN = (value: unknown): boolean => {
  if (typeof value !== "string") return false;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(value);
};
