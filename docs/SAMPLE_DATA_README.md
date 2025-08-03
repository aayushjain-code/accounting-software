# Sample Data for BST Accounting Application

This directory contains sample data that can be imported to test the full functionality of the BST Accounting application.

## Files

- `sample-data.json` - Comprehensive sample data with all entities
- `SAMPLE_DATA_README.md` - This documentation file

## Sample Data Contents

The `sample-data.json` file includes:

### 📊 **Company Profile**
- Complete company information for BST
- Bank details, contact person, social media links
- Business metrics and company details

### 👥 **Clients (3)**
1. **TechCorp Solutions** - Technology company (Premium client)
2. **Digital Innovations** - Digital Marketing startup
3. **Global Systems** - Enterprise software company

### 📁 **Projects (3)**
1. **E-commerce Platform Development** - ₹25L budget, 400 hours
2. **Mobile App Development** - ₹18L budget, 300 hours  
3. **Cloud Migration Project** - ₹32L budget, enterprise project

### ⏰ **Timesheets (3)**
1. **January 2024** - Invoiced, 20 days worked, ₹1.6L amount
2. **February 2024** - Invoiced, 18 days worked, ₹1.73L amount
3. **March 2024** - Draft status, 15 days worked, ₹1.8L amount

### 📝 **Timesheet Entries (6)**
- Detailed daily entries for each timesheet
- Various tasks: development, testing, design, research
- Different approval statuses

### 🧾 **Invoices (2)**
1. **INV-2024-001** - Paid invoice for January services
2. **INV-2024-002** - Sent invoice for February services

### 💰 **Expenses (6)**
- Office rent, software licenses, travel, marketing, equipment
- Mix of approved and pending statuses
- Various categories and amounts

### 📅 **Daily Logs (5)**
- GST filing, client onboarding, rent payments
- Project milestones, bank reconciliation
- Different categories and priorities

## How to Import Sample Data

### Method 1: Electron App (Recommended)
1. Open the BST Accounting Electron app
2. Go to **Storage Management** tab
3. Click **"Import Data"** button
4. Select the `sample-data.json` file
5. Confirm the import

### Method 2: Web App
1. Open the web application
2. Use browser developer tools
3. Access the store and manually import data
4. Or use the import functionality if available

### Method 3: Programmatic Import
```javascript
// Load the sample data
const sampleData = require('./sample-data.json');

// Import into store
const { useAccountingStore } = require('./store');
const store = useAccountingStore.getState();

// Set the data
store.clients = sampleData.clients;
store.projects = sampleData.projects;
store.timesheets = sampleData.timesheets;
store.invoices = sampleData.invoices;
store.expenses = sampleData.expenses;
store.dailyLogs = sampleData.dailyLogs;
store.companyProfile = sampleData.companyProfile;
```

## Data Relationships

The sample data demonstrates proper relationships:

- **Clients** → **Projects** (1:many)
- **Projects** → **Timesheets** (1:many)
- **Timesheets** → **Invoices** (1:1)
- **Projects** → **Expenses** (1:many)
- **Timesheets** → **Timesheet Entries** (1:many)

## Testing Scenarios

With this sample data, you can test:

### 📊 **Dashboard Features**
- Financial reports and statistics
- Revenue analysis and expense tracking
- Project performance metrics
- Recent activity displays

### 👥 **Client Management**
- View client details and projects
- Edit client information
- Add new clients
- Filter and search clients

### 📁 **Project Management**
- View project details and budgets
- Track project status
- Manage project expenses
- Link projects to clients

### ⏰ **Timesheet Features**
- View timesheet entries
- Approve/reject entries
- Generate invoices from timesheets
- Track billing rates and amounts

### 🧾 **Invoice Management**
- View invoice details
- Track payment status
- Generate new invoices
- Manage invoice items

### 💰 **Expense Tracking**
- View expense categories
- Track approval status
- Filter by project
- Calculate totals

### 📅 **Daily Logs**
- View activity logs
- Filter by category
- Track priorities
- Manage tags

## Data Validation

The sample data includes:
- ✅ Valid GST numbers
- ✅ Proper date formats (ISO strings)
- ✅ Consistent ID relationships
- ✅ Realistic financial amounts
- ✅ Proper status values
- ✅ Complete required fields

## Reset to Clean State

To clear all data and start fresh:
1. Go to **Storage Management**
2. Use the **"Clear All Data"** function
3. Or manually reset the store to empty arrays

## File Format

The JSON file uses:
- **ISO Date Strings** for all date fields
- **Consistent ID References** for relationships
- **Proper TypeScript Types** matching the application
- **Realistic Business Data** for testing

## Version Information

- **Version**: 1.0.0
- **Created**: 2024-01-01
- **Compatibility**: BST Accounting v1.0+
- **Data Structure**: Matches current application schema

---

**Note**: This sample data is for testing purposes only. Replace with real business data for production use. 