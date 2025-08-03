import React, { useState, useEffect } from "react";
import { validateForm, validationRules } from "@/utils/validators";

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "tel" | "url" | "date" | "textarea" | "select" | "checkbox" | "radio";
  placeholder?: string;
  required?: boolean;
  validation?: (value: any) => boolean | string;
  options?: { value: string; label: string }[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

interface FormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
  submitText?: string;
  loading?: boolean;
  className?: string;
  showCancel?: boolean;
  onCancel?: () => void;
  cancelText?: string;
}

export const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  initialData = {},
  submitText = "Submit",
  loading = false,
  className = "",
  showCancel = false,
  onCancel,
  cancelText = "Cancel",
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const field = fields.find(f => f.name === name);
    if (field) {
      const validation = field.validation || validationRules[field.type as keyof typeof validationRules];
      if (validation) {
        const result = validation(formData[name]);
        if (result !== true) {
          setErrors(prev => ({ ...prev, [name]: typeof result === "string" ? result : "Invalid value" }));
        } else {
          setErrors(prev => ({ ...prev, [name]: "" }));
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const validationRulesMap: Record<string, (value: any) => boolean | string> = {};
    fields.forEach(field => {
      if (field.validation) {
        validationRulesMap[field.name] = field.validation;
      } else if (field.required) {
        validationRulesMap[field.name] = validationRules.required;
      }
    });

    const { isValid, errors: validationErrors } = validateForm(formData, validationRulesMap);
    
    if (isValid) {
      onSubmit(formData);
    } else {
      setErrors(validationErrors);
      setTouched(fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {}));
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.name] || "";
    const error = errors[field.name];
    const isTouched = touched[field.name];
    const showError = isTouched && error;

    const baseClasses = `
      w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
      dark:bg-gray-800 dark:text-white dark:border-gray-600
      ${showError ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
      ${field.className || ""}
    `;

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className={baseClasses}
          />
        );

      case "select":
        return (
          <select
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            className={baseClasses}
          >
            <option value="">{field.placeholder || "Select..."}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "checkbox":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              name={field.name}
              checked={Boolean(value)}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              onBlur={() => handleBlur(field.name)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {field.label}
            </label>
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  onBlur={() => handleBlur(field.name)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <input
            type={field.type}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className={baseClasses}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {fields.map((field) => (
        <div key={field.name}>
          {field.type !== "checkbox" && field.type !== "radio" && (
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          {renderField(field)}
          
          {touched[field.name] && errors[field.name] && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors[field.name]}
            </p>
          )}
        </div>
      ))}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : submitText}
        </button>
        
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {cancelText}
          </button>
        )}
      </div>
    </form>
  );
}; 