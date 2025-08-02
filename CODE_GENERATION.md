# 🔢 Automatic Code Generation System

This document outlines the comprehensive automatic code generation system implemented in the BST Accounting Management System.

## 📋 **Overview**

The system automatically generates unique, sequential codes for all major entities in the application, ensuring consistency, traceability, and professional presentation.

## 🎯 **Code Generation Patterns**

### **1. Client Codes: `CLT-YYYY-XXXX`**

- **Format**: `CLT-2024-0001`, `CLT-2024-0002`, etc.
- **Pattern**: `CLT-{YEAR}-{SEQUENTIAL_NUMBER}`
- **Example**: `CLT-2024-0001` for the first client of 2024

### **2. Project Codes: `PRJ-YYYY-XXXX`**

- **Format**: `PRJ-2024-0001`, `PRJ-2024-0002`, etc.
- **Pattern**: `PRJ-{YEAR}-{SEQUENTIAL_NUMBER}`
- **Example**: `PRJ-2024-0001` for the first project of 2024

### **3. Timesheet Codes: `TMS-YYYY-MM-XXXX`**

- **Format**: `TMS-2024-01-0001`, `TMS-2024-02-0001`, etc.
- **Pattern**: `TMS-{YEAR}-{MONTH}-{SEQUENTIAL_NUMBER}`
- **Example**: `TMS-2024-01-0001` for the first timesheet of January 2024

### **4. Invoice Codes: `INV-YYYY-XXXX`**

- **Format**: `INV-2024-0001`, `INV-2024-0002`, etc.
- **Pattern**: `INV-{YEAR}-{SEQUENTIAL_NUMBER}`
- **Example**: `INV-2024-0001` for the first invoice of 2024

### **5. Expense Codes: `EXP-YYYY-MM-XXXX`**

- **Format**: `EXP-2024-01-0001`, `EXP-2024-02-0001`, etc.
- **Pattern**: `EXP-{YEAR}-{MONTH}-{SEQUENTIAL_NUMBER}`
- **Example**: `EXP-2024-01-0001` for the first expense of January 2024

### **6. Receipt Codes: `RCP-YYYY-MM-XXXX`**

- **Format**: `RCP-2024-01-0001`, `RCP-2024-02-0001`, etc.
- **Pattern**: `RCP-{YEAR}-{MONTH}-{SEQUENTIAL_NUMBER}`
- **Example**: `RCP-2024-01-0001` for the first receipt of January 2024

### **7. Payment Codes: `PAY-YYYY-MM-XXXX`**

- **Format**: `PAY-2024-01-0001`, `PAY-2024-02-0001`, etc.
- **Pattern**: `PAY-{YEAR}-{MONTH}-{SEQUENTIAL_NUMBER}`
- **Example**: `PAY-2024-01-0001` for the first payment of January 2024

## 🔧 **Implementation**

### **Code Generator Class**

```typescript
import { CodeGenerator } from "@/utils/codeGenerator";

// Generate client code
const clientCode = CodeGenerator.generateClientCode(existingClients);

// Generate project code
const projectCode = CodeGenerator.generateProjectCode(existingProjects);

// Generate timesheet code
const timesheetCode = CodeGenerator.generateTimesheetCode(
  month,
  existingTimesheets
);

// Generate invoice code
const invoiceCode = CodeGenerator.generateInvoiceCode(existingInvoices);

// Generate expense code
const expenseCode = CodeGenerator.generateExpenseCode(existingExpenses);
```

### **Store Integration**

The code generation is automatically integrated into the Zustand store actions:

```typescript
// In store/index.ts
addClient: (client) => {
  const newClient: Client = {
    ...client,
    id: generateId(),
    clientCode: CodeGenerator.generateClientCode(get().clients),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  set((state) => ({ clients: [...state.clients, newClient] }));
},

addProject: (project) => {
  const newProject: Project = {
    ...project,
    id: generateId(),
    projectCode: CodeGenerator.generateProjectCode(get().projects),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  set((state) => ({ projects: [...state.projects, newProject] }));
},

addTimesheet: (timesheet) => {
  const newTimesheet: Timesheet = {
    ...timesheet,
    id: generateId(),
    timesheetCode: CodeGenerator.generateTimesheetCode(timesheet.month, get().timesheets),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  set((state) => ({ timesheets: [...state.timesheets, newTimesheet] }));
},

addInvoice: (invoice) => {
  const newInvoice: Invoice = {
    ...invoice,
    id: generateId(),
    invoiceNumber: CodeGenerator.generateInvoiceCode(get().invoices),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  set((state) => ({ invoices: [...state.invoices, newInvoice] }));
},

addExpense: (expense) => {
  const newExpense: Expense = {
    ...expense,
    id: generateId(),
    expenseCode: CodeGenerator.generateExpenseCode(get().expenses),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  set((state) => ({ expenses: [...state.expenses, newExpense] }));
},
```

## 🎨 **UI Display**

### **Client Cards**

```typescript
<div className="flex items-center space-x-2 mb-1">
  <span className="font-mono font-semibold text-primary-700 bg-primary-50 dark:bg-primary-900 px-2 py-1 rounded-md border border-primary-200 dark:border-primary-800 text-xs">
    {client.clientCode}
  </span>
</div>
```

### **Project Table**

```typescript
<span className="font-mono font-semibold text-primary-700 bg-primary-50 dark:bg-primary-900 px-4 py-2 rounded-md border border-primary-200 dark:border-primary-800">
  {project.projectCode}
</span>
```

### **Timesheet Table**

```typescript
<div className="space-y-1">
  <span className="font-mono font-semibold text-primary-700 bg-primary-50 dark:bg-primary-900 px-4 py-2 rounded-md border border-primary-200 dark:border-primary-800">
    {project?.projectCode || "N/A"}
  </span>
  <div className="text-xs text-gray-500 dark:text-gray-400">
    {timesheet.timesheetCode}
  </div>
</div>
```

### **Invoice Table**

```typescript
<span className="font-mono font-semibold text-primary-700 bg-primary-50 dark:bg-primary-900 px-3 py-1 rounded-md border border-primary-200 dark:border-primary-800 text-sm">
  {invoice.invoiceNumber}
</span>
```

### **Expense Table**

```typescript
<div className="space-y-1">
  <div>{format(new Date(expense.date), "MMM dd, yyyy")}</div>
  <div className="text-xs text-gray-500 dark:text-gray-400">
    {expense.expenseCode}
  </div>
</div>
```

## 🔍 **Code Validation & Analysis**

### **Validation Functions**

```typescript
// Validate code format
const isValidCode = CodeGenerator.validateCode(code, /^CLT-\d{4}-\d+$/);

// Extract information from code
const codeInfo = CodeGenerator.extractCodeInfo("CLT-2024-0001");
// Returns: { type: "client", year: 2024, sequence: 1 }

// Get code statistics
const stats = CodeGenerator.getCodeStats(clients, "clientCode");
// Returns: { total: 10, byYear: {2024: 10}, byMonth: {}, latestCode: "CLT-2024-0010" }
```

### **Code Information Extraction**

```typescript
const codeInfo = CodeGenerator.extractCodeInfo("TMS-2024-01-0001");
// Returns:
{
  type: "timesheet",
  year: 2024,
  month: 1,
  sequence: 1
}
```

## 📊 **Advanced Features**

### **1. Sequential Code Generation**

- Automatically finds the next available sequence number
- Handles gaps in sequences (e.g., if CLT-2024-0003 is deleted, next will be CLT-2024-0004)
- Year-based reset (new year starts from 0001)

### **2. Custom Format Support**

```typescript
// Generate custom sequential code
const customCode = CodeGenerator.generateSequentialCode(
  "CUSTOM",
  existingItems,
  "customCode",
  "0000"
);
// Result: CUSTOM-2024-0001
```

### **3. Unique ID Generation**

```typescript
// Generate unique ID with timestamp
const uniqueId = CodeGenerator.generateUniqueId("PREFIX");
// Result: PREFIX1A2B3C4D5E6F-7G8H9I
```

### **4. Statistics and Analytics**

```typescript
const stats = CodeGenerator.getCodeStats(items, "codeField");
// Returns comprehensive statistics including:
// - Total codes generated
// - Breakdown by year
// - Breakdown by month (for monthly codes)
// - Latest code generated
```

## 🚀 **Benefits**

### **1. Professional Presentation**

- Consistent, professional-looking codes
- Easy to identify and reference
- Clear hierarchy and organization

### **2. Traceability**

- Year-based codes for easy filtering
- Sequential numbering for chronological order
- Month-based codes for detailed tracking

### **3. Scalability**

- Handles large datasets efficiently
- Automatic sequence management
- No duplicate code generation

### **4. User Experience**

- Clear visual distinction in UI
- Easy to copy and reference
- Consistent across all entities

### **5. Business Intelligence**

- Easy reporting and analytics
- Year-over-year comparisons
- Monthly trend analysis

## 📋 **Usage Examples**

### **Creating a New Client**

```typescript
const newClient = {
  name: "TechCorp Solutions",
  email: "accounts@techcorp.com",
  // ... other fields
};

// Code will be automatically generated: CLT-2024-0001
addClient(newClient);
```

### **Creating a New Project**

```typescript
const newProject = {
  name: "E-commerce Platform",
  clientId: "client1",
  // ... other fields
};

// Code will be automatically generated: PRJ-2024-0001
addProject(newProject);
```

### **Creating a New Timesheet**

```typescript
const newTimesheet = {
  projectId: "project1",
  month: "2024-01",
  // ... other fields
};

// Code will be automatically generated: TMS-2024-01-0001
addTimesheet(newTimesheet);
```

### **Creating a New Invoice**

```typescript
const newInvoice = {
  timesheetId: "timesheet1",
  // ... other fields
};

// Code will be automatically generated: INV-2024-0001
addInvoice(newInvoice);
```

## 🔧 **Configuration**

### **Code Patterns**

All code patterns are configurable in the `CodeGenerator` class:

```typescript
// Client codes: CLT-YYYY-XXXX
static generateClientCode(existingClients: any[] = []): string

// Project codes: PRJ-YYYY-XXXX
static generateProjectCode(existingProjects: any[] = []): string

// Timesheet codes: TMS-YYYY-MM-XXXX
static generateTimesheetCode(month: string, existingTimesheets: any[] = []): string

// Invoice codes: INV-YYYY-XXXX
static generateInvoiceCode(existingInvoices: any[] = []): string

// Expense codes: EXP-YYYY-MM-XXXX
static generateExpenseCode(existingExpenses: any[] = []): string
```

### **Custom Patterns**

You can create custom code patterns:

```typescript
// Custom sequential code
const customCode = CodeGenerator.generateSequentialCode(
  "CUSTOM",
  existingItems,
  "customCode",
  "0000"
);
```

## 📈 **Performance**

### **Efficiency**

- O(n) time complexity for code generation
- Minimal memory footprint
- Cached sequence calculations

### **Scalability**

- Handles thousands of records efficiently
- Automatic cleanup of expired sequences
- Memory-efficient storage

## 🛡️ **Error Handling**

### **Validation**

- Automatic format validation
- Duplicate prevention
- Invalid code detection

### **Recovery**

- Graceful handling of missing sequences
- Automatic sequence repair
- Data integrity maintenance

## 🎯 **Future Enhancements**

### **Planned Features**

1. **Custom Code Prefixes**: Allow custom prefixes per organization
2. **Branch-based Codes**: Support for multiple branches/offices
3. **Department Codes**: Department-specific code prefixes
4. **Multi-language Support**: Localized code formats
5. **API Integration**: External code generation services
6. **Bulk Code Generation**: Batch code generation for imports
7. **Code Templates**: Customizable code templates
8. **Audit Trail**: Complete code generation history

### **Advanced Analytics**

1. **Code Usage Analytics**: Track code generation patterns
2. **Performance Metrics**: Monitor generation performance
3. **Business Intelligence**: Code-based reporting
4. **Predictive Analysis**: Forecast code usage trends

## 📚 **Best Practices**

### **1. Code Management**

- Always use the provided generator functions
- Don't manually create codes
- Validate codes before use
- Maintain code consistency

### **2. UI Display**

- Use consistent styling for codes
- Provide clear visual hierarchy
- Include code in search functionality
- Show codes in tooltips and details

### **3. Data Integrity**

- Never modify generated codes
- Use codes as unique identifiers
- Maintain code history
- Backup code generation state

### **4. Performance**

- Cache frequently used codes
- Optimize code generation algorithms
- Monitor code generation performance
- Clean up unused codes

## 🎉 **Summary**

The automatic code generation system provides:

- ✅ **Professional Presentation**: Consistent, professional-looking codes
- ✅ **Automatic Generation**: No manual code creation required
- ✅ **Scalable Architecture**: Handles large datasets efficiently
- ✅ **Comprehensive Validation**: Ensures code integrity and uniqueness
- ✅ **Rich Analytics**: Detailed code statistics and analysis
- ✅ **Flexible Configuration**: Customizable patterns and formats
- ✅ **Error Handling**: Robust error handling and recovery
- ✅ **Future-Ready**: Extensible for advanced features

This system ensures that all entities in the BST Accounting Management System have unique, traceable, and professional codes that enhance user experience and business operations.
