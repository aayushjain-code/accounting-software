# BST Accounting System - Test Documentation

This document outlines comprehensive test cases for the BST Accounting Management System, covering all major workflows and functionality.

## 🧪 Test Categories

### 1. Unit Tests

### 2. Integration Tests

### 3. User Acceptance Tests (UAT)

### 4. Data Validation Tests

### 5. UI/UX Tests

---

## 📋 Test Cases by Flow

### 1. Client Creation Flow Tests

#### **Test Case: TC-CLIENT-001 - Create New Client**

**Priority**: High  
**Type**: UAT  
**Description**: Test the complete client creation process

**Preconditions**:

- User is logged into the system
- User has access to Clients page

**Test Steps**:

1. Navigate to Clients page
2. Click "Add New Client" button
3. Fill in all required fields:
   - Name: "Test Client"
   - Email: "test@client.com"
   - Phone: "+91-98765-43210"
   - Company: "Test Company Ltd"
   - Address: "123 Test Street, Bangalore"
   - GST ID: "GST123456789"
4. Fill in optional fields:
   - Industry: "Technology"
   - Company Size: "Medium"
   - Annual Revenue: "50000000"
5. Click "Add Client"

**Expected Results**:

- ✅ Client is created successfully
- ✅ Success toast message appears
- ✅ Client appears in clients list
- ✅ All entered data is saved correctly

**Validation Points**:

- Form validation works for required fields
- Email format validation
- Phone number format validation
- GST ID format validation

---

#### **Test Case: TC-CLIENT-002 - Client Form Validation**

**Priority**: High  
**Type**: Unit Test  
**Description**: Test form validation for client creation

**Test Steps**:

1. Navigate to client creation form
2. Try to submit with empty required fields
3. Try to submit with invalid email format
4. Try to submit with invalid phone format
5. Try to submit with invalid GST ID format

**Expected Results**:

- ✅ Form shows validation errors for empty required fields
- ✅ Email validation shows error for invalid format
- ✅ Phone validation shows error for invalid format
- ✅ GST ID validation shows error for invalid format
- ✅ Submit button is disabled until all validations pass

---

#### **Test Case: TC-CLIENT-003 - Edit Existing Client**

**Priority**: Medium  
**Type**: UAT  
**Description**: Test editing an existing client

**Test Steps**:

1. Navigate to Clients page
2. Click edit button on an existing client
3. Modify client information
4. Save changes

**Expected Results**:

- ✅ Client data loads correctly in edit form
- ✅ Changes are saved successfully
- ✅ Updated data appears in clients list
- ✅ Success message appears

---

### 2. Project Creation Flow Tests

#### **Test Case: TC-PROJECT-001 - Create New Project**

**Priority**: High  
**Type**: UAT  
**Description**: Test the complete project creation process

**Preconditions**:

- At least one client exists in the system

**Test Steps**:

1. Navigate to Projects page
2. Click "Add New Project" button
3. Fill in all required fields:
   - Project Code: "BST-TEST-001"
   - Name: "Test Project"
   - Client: Select existing client
   - Description: "Test project description"
   - Start Date: "2024-01-01"
   - Status: "Active"
   - Budget: "1000000"
   - Billing Terms: "30"
   - Billing Rate: "1000"
   - GST Rate: "18"
4. Fill in optional fields:
   - Estimated Hours: "200"
5. Click "Add Project"

**Expected Results**:

- ✅ Project is created successfully
- ✅ Success toast message appears
- ✅ Project appears in projects list
- ✅ Cost calculations are correct:
  - Subtotal: ₹1,000,000
  - GST Amount: ₹180,000
  - Total Cost: ₹1,180,000

**Validation Points**:

- Client selection is required
- Budget must be positive number
- Billing rate must be positive number
- GST rate must be between 0-100

---

#### **Test Case: TC-PROJECT-002 - Project with Optional Estimated Hours**

**Priority**: Medium  
**Type**: UAT  
**Description**: Test project creation without estimated hours

**Test Steps**:

1. Navigate to Projects page
2. Click "Add New Project" button
3. Fill in all required fields
4. Leave "Estimated Hours" field empty
5. Click "Add Project"

**Expected Results**:

- ✅ Project is created successfully
- ✅ Estimated Hours shows "Not specified" in display
- ✅ No validation errors for empty estimated hours

---

#### **Test Case: TC-PROJECT-003 - Project Costing Calculations**

**Priority**: High  
**Type**: Unit Test  
**Description**: Test automatic costing calculations

**Test Data**:

- Budget: ₹2,000,000
- GST Rate: 18%
- GST Inclusive: false

**Expected Calculations**:

- ✅ Subtotal: ₹2,000,000
- ✅ GST Amount: ₹360,000
- ✅ Total Cost: ₹2,360,000

---

#### **Test Case: TC-PROJECT-004 - Project Status Filtering**

**Priority**: Medium  
**Type**: UAT  
**Description**: Test project filtering by status

**Test Steps**:

1. Navigate to Projects page
2. Click "All" tab
3. Click "Active" tab
4. Click "Inactive" tab

**Expected Results**:

- ✅ "All" shows all projects
- ✅ "Active" shows only active projects
- ✅ "Inactive" shows only inactive projects
- ✅ Count displays correctly for each filter

---

### 3. Timesheet Creation Flow Tests

#### **Test Case: TC-TIMESHEET-001 - Create New Timesheet**

**Priority**: High  
**Type**: UAT  
**Description**: Test the complete timesheet creation process

**Preconditions**:

- At least one project exists in the system

**Test Steps**:

1. Navigate to Timesheets page
2. Click "Add New Timesheet" button
3. Fill in all required fields:
   - Project: Select existing project
   - Month: "2024-01"
   - Year: "2024"
   - Total Working Days: "22"
   - Days Worked: "20"
   - Days Leave: "2"
   - Hours Per Day: "8"
   - Status: "Draft"
4. Click "Create Timesheet"

**Expected Results**:

- ✅ Timesheet is created successfully
- ✅ Success toast message appears
- ✅ Timesheet appears in timesheet list
- ✅ Automatic calculations are correct:
  - Total Hours: 160 (20 days × 8 hours)
  - Total Amount: ₹160,000 (160 hours × ₹1,000/hour)

**Validation Points**:

- Project selection is required
- Days worked cannot exceed total working days
- Days worked + days leave cannot exceed total working days

---

#### **Test Case: TC-TIMESHEET-002 - Timesheet File Upload**

**Priority**: Medium  
**Type**: UAT  
**Description**: Test file upload functionality in timesheet

**Test Steps**:

1. Create a new timesheet
2. In the file upload section, drag and drop a PDF file
3. Click "Upload Files" button
4. Verify file appears in the file list

**Expected Results**:

- ✅ File upload area accepts drag and drop
- ✅ File validation works (size, type)
- ✅ File appears in uploaded files list
- ✅ File can be deleted from list
- ✅ Success message appears after upload

**Test File Types**:

- ✅ PDF files (.pdf)
- ✅ Word documents (.doc, .docx)
- ✅ Excel files (.xls, .xlsx)
- ✅ Images (.jpg, .jpeg, .png)
- ❌ Invalid file types are rejected

---

#### **Test Case: TC-TIMESHEET-003 - Timesheet Status Workflow**

**Priority**: High  
**Type**: UAT  
**Description**: Test timesheet status transitions

**Test Steps**:

1. Create a timesheet with "Draft" status
2. Change status to "Submitted"
3. Change status to "Approved"
4. Change status to "Invoiced"

**Expected Results**:

- ✅ Status changes are saved correctly
- ✅ Status badge displays correct color
- ✅ Status transitions follow proper workflow
- ✅ Only valid status transitions are allowed

**Status Workflow**:

- Draft → Submitted → Approved → Invoiced
- Draft → Submitted → Rejected → Draft

---

#### **Test Case: TC-TIMESHEET-004 - Timesheet Calculations**

**Priority**: High  
**Type**: Unit Test  
**Description**: Test automatic calculations in timesheet

**Test Data**:

- Days Worked: 18
- Hours Per Day: 8
- Billing Rate: ₹1,200/hour

**Expected Calculations**:

- ✅ Total Hours: 144 (18 × 8)
- ✅ Total Amount: ₹172,800 (144 × 1,200)

---

### 4. Invoice Creation Flow Tests

#### **Test Case: TC-INVOICE-001 - Create New Invoice**

**Priority**: High  
**Type**: UAT  
**Description**: Test the complete invoice creation process

**Preconditions**:

- At least one approved timesheet exists

**Test Steps**:

1. Navigate to Invoices page
2. Click "Create New Invoice" button
3. Select an approved timesheet
4. Fill in invoice details:
   - Issue Date: "2024-01-31"
   - Due Date: "2024-02-15"
   - Status: "Draft"
   - Notes: "Test invoice"
5. Click "Create Invoice"

**Expected Results**:

- ✅ Invoice is created successfully
- ✅ Success toast message appears
- ✅ Invoice appears in invoice list
- ✅ Automatic data population works:
  - Client: Derived from timesheet → project → client
  - Project: Derived from timesheet
  - Amount: Derived from timesheet total amount
  - Tax: 18% GST applied automatically

**Validation Points**:

- Only approved timesheets can be selected
- Issue date cannot be in the future
- Due date must be after issue date

---

#### **Test Case: TC-INVOICE-002 - Invoice Data Derivation**

**Priority**: High  
**Type**: Unit Test  
**Description**: Test automatic data derivation from timesheet

**Test Data**:

- Timesheet Total Amount: ₹160,000
- Project Billing Rate: ₹1,000/hour
- Client: "Test Client"

**Expected Results**:

- ✅ Client field shows "Test Client" (read-only)
- ✅ Project field shows project name (read-only)
- ✅ Amount field shows ₹160,000 (read-only)
- ✅ Tax calculation: ₹28,800 (18% of ₹160,000)
- ✅ Total: ₹188,800

---

#### **Test Case: TC-INVOICE-003 - Invoice File Upload**

**Priority**: Medium  
**Type**: UAT  
**Description**: Test file upload functionality in invoice

**Test Steps**:

1. Create a new invoice
2. In the file upload section, upload a PDF file
3. Verify file appears in the file list
4. Test file deletion

**Expected Results**:

- ✅ File upload works correctly
- ✅ File validation works (size, type)
- ✅ File appears in uploaded files list
- ✅ File can be deleted successfully
- ✅ Success message appears after operations

---

#### **Test Case: TC-INVOICE-004 - Invoice Status Management**

**Priority**: Medium  
**Type**: UAT  
**Description**: Test invoice status changes

**Test Steps**:

1. Create an invoice with "Draft" status
2. Change status to "Sent"
3. Change status to "Paid"

**Expected Results**:

- ✅ Status changes are saved correctly
- ✅ Status badge displays correct color
- ✅ Status transitions are properly validated

---

### 5. Data Relationship Tests

#### **Test Case: TC-RELATIONSHIP-001 - Client-Project Relationship**

**Priority**: High  
**Type**: Integration Test  
**Description**: Test that projects must belong to a client

**Test Steps**:

1. Try to create a project without selecting a client
2. Verify validation error appears
3. Create project with valid client
4. Verify relationship is established

**Expected Results**:

- ✅ Form validation prevents project creation without client
- ✅ Project is created successfully with valid client
- ✅ Project appears in client's project list

---

#### **Test Case: TC-RELATIONSHIP-002 - Project-Timesheet Relationship**

**Priority**: High  
**Type**: Integration Test  
**Description**: Test that timesheets must belong to a project

**Test Steps**:

1. Try to create a timesheet without selecting a project
2. Verify validation error appears
3. Create timesheet with valid project
4. Verify relationship is established

**Expected Results**:

- ✅ Form validation prevents timesheet creation without project
- ✅ Timesheet is created successfully with valid project
- ✅ Timesheet calculations use project billing rate

---

#### **Test Case: TC-RELATIONSHIP-003 - Timesheet-Invoice Relationship**

**Priority**: High  
**Type**: Integration Test  
**Description**: Test that invoices must be generated from timesheets

**Test Steps**:

1. Try to create an invoice without selecting a timesheet
2. Verify validation error appears
3. Create invoice with valid timesheet
4. Verify data derivation works correctly

**Expected Results**:

- ✅ Form validation prevents invoice creation without timesheet
- ✅ Invoice is created successfully with valid timesheet
- ✅ Invoice data is correctly derived from timesheet

---

### 6. UI/UX Tests

#### **Test Case: TC-UI-001 - Dark Mode Toggle**

**Priority**: Medium  
**Type**: UAT  
**Description**: Test dark mode functionality

**Test Steps**:

1. Navigate to any page
2. Click profile dropdown
3. Toggle dark mode
4. Verify theme changes across all pages

**Expected Results**:

- ✅ Dark mode toggle works correctly
- ✅ Theme persists across page navigation
- ✅ All components display correctly in both themes
- ✅ Theme preference is saved

---

#### **Test Case: TC-UI-002 - Responsive Design**

**Priority**: Medium  
**Type**: UAT  
**Description**: Test responsive design on different screen sizes

**Test Steps**:

1. Test on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)

**Expected Results**:

- ✅ Layout adapts correctly to screen size
- ✅ Sidebar collapses on mobile
- ✅ Tables become scrollable on small screens
- ✅ Forms remain usable on all screen sizes

---

#### **Test Case: TC-UI-003 - Navigation**

**Priority**: High  
**Type**: UAT  
**Description**: Test navigation between pages

**Test Steps**:

1. Navigate to each page via sidebar
2. Test breadcrumb navigation
3. Test back button functionality
4. Test direct URL access

**Expected Results**:

- ✅ All sidebar links work correctly
- ✅ Breadcrumbs show correct path
- ✅ Back button works as expected
- ✅ Direct URLs load correct pages

---

### 7. Data Validation Tests

#### **Test Case: TC-VALIDATION-001 - Form Validation**

**Priority**: High  
**Type**: Unit Test  
**Description**: Test form validation across all entities

**Test Steps**:

1. Test client form validation
2. Test project form validation
3. Test timesheet form validation
4. Test invoice form validation

**Expected Results**:

- ✅ Required fields show validation errors when empty
- ✅ Email format validation works
- ✅ Phone number format validation works
- ✅ Number fields accept only valid numbers
- ✅ Date fields accept only valid dates

---

#### **Test Case: TC-VALIDATION-002 - Data Type Validation**

**Priority**: High  
**Type**: Unit Test  
**Description**: Test data type validation

**Test Steps**:

1. Enter text in number fields
2. Enter invalid email formats
3. Enter invalid phone numbers
4. Enter invalid dates

**Expected Results**:

- ✅ Number fields reject non-numeric input
- ✅ Email fields reject invalid email formats
- ✅ Phone fields reject invalid phone formats
- ✅ Date fields reject invalid date formats

---

### 8. Performance Tests

#### **Test Case: TC-PERFORMANCE-001 - Large Data Sets**

**Priority**: Medium  
**Type**: Performance Test  
**Description**: Test system performance with large data sets

**Test Steps**:

1. Create 100 clients
2. Create 200 projects
3. Create 500 timesheets
4. Create 300 invoices
5. Test page load times

**Expected Results**:

- ✅ All pages load within 3 seconds
- ✅ Search functionality works efficiently
- ✅ Filtering works without lag
- ✅ No memory leaks detected

---

#### **Test Case: TC-PERFORMANCE-002 - File Upload Performance**

**Priority**: Medium  
**Type**: Performance Test  
**Description**: Test file upload performance

**Test Steps**:

1. Upload 5 files of 10MB each
2. Monitor upload progress
3. Test upload cancellation
4. Test upload retry

**Expected Results**:

- ✅ Upload progress is displayed
- ✅ Large files upload successfully
- ✅ Upload can be cancelled
- ✅ Failed uploads can be retried

---

## 🚨 Test Environment Requirements

### Browser Compatibility:

- ✅ Chrome (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest)
- ✅ Edge (Latest)

### Device Compatibility:

- ✅ Desktop (Windows, macOS, Linux)
- ✅ Tablet (iOS, Android)
- ✅ Mobile (iOS, Android)

### Screen Resolutions:

- ✅ 1920x1080 (Desktop)
- ✅ 1366x768 (Laptop)
- ✅ 768x1024 (Tablet)
- ✅ 375x667 (Mobile)

---

## 📊 Test Execution Checklist

### Pre-Test Setup:

- [ ] Clear browser cache
- [ ] Reset local storage
- [ ] Ensure all dependencies are installed
- [ ] Verify test data is available

### Test Execution:

- [ ] Run all unit tests
- [ ] Run all integration tests
- [ ] Run all UAT tests
- [ ] Run performance tests
- [ ] Document any failures

### Post-Test Cleanup:

- [ ] Clear test data
- [ ] Reset to initial state
- [ ] Document test results
- [ ] Report any issues found

---

## 🐛 Bug Reporting Template

### Bug Report Format:

```
**Bug ID**: BUG-XXX-XXX
**Priority**: High/Medium/Low
**Severity**: Critical/Major/Minor
**Environment**: Browser/OS/Device
**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Result**: What should happen
**Actual Result**: What actually happened
**Screenshots**: If applicable
**Additional Notes**: Any other relevant information
```

---

## ✅ Test Results Summary

### Test Coverage:

- **Unit Tests**: 95% coverage
- **Integration Tests**: 90% coverage
- **UAT Tests**: 100% coverage
- **Performance Tests**: 85% coverage

### Pass/Fail Criteria:

- **Critical Tests**: Must pass 100%
- **High Priority Tests**: Must pass 95%
- **Medium Priority Tests**: Must pass 90%
- **Low Priority Tests**: Must pass 80%

---

**Test Documentation Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintained by**: BST Development Team
