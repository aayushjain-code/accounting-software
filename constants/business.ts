// Business logic constants

export const EXPENSE_CATEGORIES = [
  { value: "office-supplies", label: "Office Supplies", color: "blue" },
  { value: "software-tools", label: "Software & Tools", color: "purple" },
  {
    value: "travel-transportation",
    label: "Travel & Transportation",
    color: "green",
  },
  {
    value: "meals-entertainment",
    label: "Meals & Entertainment",
    color: "yellow",
  },
  {
    value: "professional-services",
    label: "Professional Services",
    color: "indigo",
  },
  {
    value: "marketing-advertising",
    label: "Marketing & Advertising",
    color: "pink",
  },
  { value: "utilities", label: "Utilities", color: "gray" },
  { value: "rent-equipment", label: "Rent & Equipment", color: "red" },
  { value: "insurance", label: "Insurance", color: "teal" },
  { value: "other", label: "Other", color: "gray" },
] as const;

export const BUSINESS_CONFIG = {
  company: {
    name: "Brandsmashers Tech",
    legalName: "Brandsmashers Tech Private Limited",
    gstin: "27AADCB1234Z1Z5",
    pan: "AADCB1234Z",
    cin: "U72200MH2020PTC345678",
    address: "123 Tech Park, Andheri West, Mumbai - 400058",
    state: "Maharashtra",
    stateCode: "27",
    country: "India",
    phone: "+91-22-1234-5678",
    email: "info@brandsmashers.com",
    website: "https://www.brandsmashers.com/",
  },
  tax: {
    defaultGstRate: 18,
    gstRates: [0, 5, 12, 18, 28] as const,
    igstThreshold: 20000, // Amount above which IGST applies
  },
  billing: {
    defaultBillingTerms: 30, // Days
    defaultBillingRate: 1200, // Per hour
    currency: "INR",
    currencySymbol: "₹",
    decimalPlaces: 2,
  },
  projects: {
    defaultStatus: "active" as const,
    statuses: [
      "active",
      "inactive",
      "completed",
      "on-hold",
      "archived",
    ] as const,
    defaultEstimatedHours: 160, // 1 month at 8 hours/day
    maxBudget: 10000000, // 1 crore
  },
  clients: {
    defaultStatus: "active" as const,
    statuses: ["active", "inactive", "prospect", "lead"] as const,
    companySizes: [
      "startup",
      "small",
      "medium",
      "large",
      "enterprise",
    ] as const,
    industries: [
      "Technology",
      "Healthcare",
      "Finance",
      "Education",
      "Retail",
      "Manufacturing",
      "Real Estate",
      "Consulting",
      "Media",
      "Other",
    ] as const,
  },
  timesheets: {
    defaultStatus: "draft" as const,
    statuses: [
      "draft",
      "submitted",
      "approved",
      "rejected",
      "invoiced",
    ] as const,
    defaultHoursPerDay: 8,
    maxHoursPerDay: 12,
    workingDaysPerWeek: 5,
    approvalRequired: true,
  },
  invoices: {
    defaultStatus: "draft" as const,
    statuses: ["draft", "sent", "paid"] as const,
    defaultPaymentTerms: "Net 30",
    paymentTerms: [
      "Net 0",
      "Net 7",
      "Net 15",
      "Net 30",
      "Net 45",
      "Net 60",
      "Net 90",
    ] as const,
    autoNumbering: true,
    numberPrefix: "INV",
    numberFormat: "INV-{YYYY}-{MM}-{XXXX}",
  },
  expenses: {
    defaultStatus: "pending" as const,
    statuses: ["pending", "approved", "rejected"] as const,
    categories: [
      "Travel",
      "Meals",
      "Office Supplies",
      "Software",
      "Hardware",
      "Marketing",
      "Training",
      "Other",
    ] as const,
    maxAmount: 100000,
    approvalRequired: true,
    approvalThreshold: 10000,
  },
  dailyLogs: {
    categories: ["accounting", "important", "reminder", "milestone"] as const,
    priorities: ["low", "medium", "high", "critical"] as const,
    statuses: ["pending", "in-progress", "completed"] as const,
  },
} as const;

export const CODE_GENERATION_CONFIG = {
  client: {
    prefix: "CLT",
    format: "CLT-{YYYY}-{XXXX}",
    startSequence: 1,
  },
  project: {
    prefix: "PRJ",
    format: "PRJ-{YYYY}-{XXXX}",
    startSequence: 1,
  },
  timesheet: {
    prefix: "TMS",
    format: "TMS-{YYYY}-{MM}-{XXXX}",
    startSequence: 1,
  },
  invoice: {
    prefix: "INV",
    format: "INV-{YYYY}-{MM}-{XXXX}",
    startSequence: 1,
  },
  expense: {
    prefix: "EXP",
    format: "EXP-{YYYY}-{MM}-{XXXX}",
    startSequence: 1,
  },
} as const;

export const VALIDATION_MESSAGES = {
  required: "This field is required",
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number",
  minLength: (field: string, length: number) =>
    `${field} must be at least ${length} characters`,
  maxLength: (field: string, length: number) =>
    `${field} must be no more than ${length} characters`,
  minValue: (field: string, value: number) =>
    `${field} must be at least ${value}`,
  maxValue: (field: string, value: number) =>
    `${field} must be no more than ${value}`,
  positiveNumber: "Please enter a positive number",
  validDate: "Please enter a valid date",
  futureDate: "Date must be in the future",
  pastDate: "Date must be in the past",
  fileSize: (maxSize: string) => `File size must be less than ${maxSize}`,
  fileType: "File type not supported",
  gstin: "Please enter a valid GSTIN",
  pan: "Please enter a valid PAN",
  ifsc: "Please enter a valid IFSC code",
  accountNumber: "Please enter a valid account number",
} as const;
