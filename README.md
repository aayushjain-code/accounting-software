# BST Accounting Management System

A comprehensive accounting and project management system for BST (Business Solutions Tech) with integrated workflows for clients, projects, timesheets, and invoices.

## 🚀 Features

- **Client Management**: Complete client lifecycle management
- **Project Tracking**: Project creation with costing and GST
- **Timesheet System**: Day-based work calculations with file uploads
- **Invoice Generation**: Automated invoice creation from timesheets
- **File Management**: Upload and manage documents for all entities
- **Dark Mode**: Full dark mode support
- **Responsive Design**: Works on all devices

## 📋 System Flows

### 1. Client Creation Flow

#### Step-by-Step Process:

1. **Navigate to Clients**
   - Go to the sidebar and click on "Clients"
   - You'll see the clients list with card view

2. **Create New Client**
   - Click the "Add New Client" button
   - Fill in the required information:
     - **Basic Info**: Name, Email, Phone
     - **Company Details**: Company name, Address, GST ID
     - **Business Info**: Industry, Company size, Annual revenue
     - **Contact Person**: POC name, email, contact
     - **Additional Info**: Notes, tags, source

3. **Save Client**
   - Click "Add Client" to save
   - Client will appear in the clients list

#### Data Relationships:
- Clients are the foundation of the system
- All projects must be associated with a client
- Client data is used for invoice generation

---

### 2. Project Creation Flow

#### Step-by-Step Process:

1. **Navigate to Projects**
   - Go to the sidebar and click on "Projects"
   - You'll see projects filtered by status (All/Active/Inactive)

2. **Create New Project**
   - Click the "Add New Project" button
   - Fill in the required information:
     - **Project Info**: Project code, Name, Description
     - **Client Selection**: Choose from existing clients (required)
     - **Timeline**: Start date, Status
     - **Budget**: Total budget amount
     - **Billing**: Billing terms, Rate per hour
     - **Estimated Hours**: Optional field for project duration
     - **GST Settings**: GST rate, Inclusive/Exclusive

3. **Save Project**
   - Click "Add Project" to save
   - Project will appear in the projects list

#### Data Relationships:
- Projects must be associated with a client
- Project billing rate is used for timesheet calculations
- Project data is used for invoice generation

#### Costing Calculation:
- **Subtotal**: Budget amount
- **GST Amount**: Budget × GST Rate
- **Total Cost**: Subtotal + GST Amount

---

### 3. Timesheet Creation Flow

#### Step-by-Step Process:

1. **Navigate to Timesheets**
   - Go to the sidebar and click on "Timesheets"
   - You'll see all timesheets with their status

2. **Create New Timesheet**
   - Click the "Add New Timesheet" button
   - Fill in the required information:
     - **Project Selection**: Choose from existing projects (required)
     - **Time Period**: Month and Year
     - **Work Details**: 
       - Total working days in month
       - Days worked
       - Days on leave
       - Hours per day (optional)
     - **Status**: Draft/Submitted/Approved/Rejected/Invoiced

3. **Upload Files** (Optional)
   - Use the file upload section to attach supporting documents
   - Supported formats: PDF, DOC, XLS, Images
   - Maximum 5 files, 10MB each

4. **Save Timesheet**
   - Click "Create Timesheet" to save
   - Timesheet will appear in the list

#### Automatic Calculations:
- **Total Hours**: Days worked × Hours per day
- **Total Amount**: Total hours × Project billing rate
- **Costing**: Derived from associated project

#### Status Workflow:
1. **Draft**: Initial state
2. **Submitted**: Ready for review
3. **Approved**: Approved by manager
4. **Rejected**: Requires changes
5. **Invoiced**: Invoice generated

---

### 4. Invoice Creation Flow

#### Step-by-Step Process:

1. **Navigate to Invoices**
   - Go to the sidebar and click on "Invoices"
   - You'll see all invoices with their status

2. **Create New Invoice**
   - Click the "Create New Invoice" button
   - Fill in the required information:
     - **Timesheet Selection**: Choose from approved timesheets (required)
     - **Invoice Details**: Issue date, Due date
     - **Status**: Draft/Sent/Paid

3. **Automatic Data Population**
   - **Client**: Automatically derived from timesheet → project → client
   - **Project**: Automatically derived from timesheet
   - **Amount**: Automatically calculated from timesheet total amount
   - **Tax**: 18% GST automatically applied

4. **Upload Files** (Optional)
   - Use the file upload section to attach invoice documents
   - Supported formats: PDF, DOC, XLS, Images
   - Maximum 5 files, 10MB each

5. **Save Invoice**
   - Click "Create Invoice" to save
   - Invoice will appear in the list

#### Data Derivation:
- **Client**: Timesheet → Project → Client
- **Project**: Timesheet → Project
- **Amount**: Timesheet total amount
- **Tax Calculation**: Amount × 18% GST

#### Invoice Numbering:
- Format: `INV-YYYY-XXX` (e.g., INV-2024-001)
- Auto-generated based on invoice count

---

## 🔄 Data Relationships

### Hierarchical Structure:
```
Clients
├── Projects
│   ├── Timesheets
│   │   └── Invoices
│   └── Expenses
└── Files
```

### Relationship Rules:
1. **Projects** must belong to a **Client**
2. **Timesheets** must belong to a **Project**
3. **Invoices** must be generated from a **Timesheet**
4. **Expenses** can be associated with a **Project**

### Data Flow:
1. **Client Creation** → Foundation for all other entities
2. **Project Creation** → Links to client, defines billing rates
3. **Timesheet Creation** → Links to project, calculates work done
4. **Invoice Creation** → Links to timesheet, generates bill

---

## 📁 File Management

### Supported File Types:
- **Documents**: PDF, DOC, DOCX
- **Spreadsheets**: XLS, XLSX
- **Images**: JPG, JPEG, PNG

### File Limits:
- **Maximum Files**: 5 per entity
- **File Size**: 10MB per file
- **Storage**: Local file system

### File Upload Locations:
- **Timesheets**: `/uploads/timesheets/`
- **Invoices**: `/uploads/invoices/`
- **Expenses**: `/uploads/expenses/`

---

## 🎨 User Interface

### Navigation:
- **Sidebar**: Main navigation with all sections
- **Top Navbar**: Profile, theme toggle, logout
- **Breadcrumbs**: Current page location

### Views:
- **Card View**: Clients display as cards
- **Table View**: Projects, timesheets, invoices
- **Detail View**: Individual entity details
- **Modal Forms**: Create/edit forms

### Theme:
- **Light Mode**: Default theme
- **Dark Mode**: Toggle in profile dropdown
- **Responsive**: Works on mobile and desktop

---

## 🔧 Technical Details

### Technology Stack:
- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Heroicons
- **Date Handling**: date-fns

### Data Persistence:
- **Local Storage**: Zustand persist middleware
- **File Storage**: Local file system
- **Backup**: Manual export/import

### Performance:
- **Code Splitting**: Automatic by Next.js
- **Lazy Loading**: Components loaded on demand
- **Optimization**: Build-time optimization

---

## 🚨 Important Notes

### Data Integrity:
- **Required Fields**: Client, Project, Timesheet relationships are mandatory
- **Validation**: All forms include client-side validation
- **Error Handling**: Comprehensive error messages

### Workflow Rules:
- **Timesheet Status**: Must be approved before invoice generation
- **Invoice Status**: Can be draft, sent, or paid
- **File Uploads**: Optional but recommended for audit trail

### Best Practices:
- **Client First**: Always create client before projects
- **Project Planning**: Set accurate billing rates and budgets
- **Regular Updates**: Keep timesheets and invoices current
- **File Organization**: Upload relevant documents for each entity

---

## 📞 Support

For technical support or feature requests, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintained by**: BST Development Team
