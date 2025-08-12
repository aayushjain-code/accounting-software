# 📊 Data Files

This folder contains sample data for the BST Accounting System web application.

## 📁 **File Descriptions**

### **Sample Data Files**

- **`sample-data-v2.json`** - Complete sample data with enhanced structure for testing and development

## 🚀 **Usage**

### **Importing Sample Data**

1. **In the Web App:**

   - Go to Profile → Data Management
   - Click "Import Data"
   - Select `sample-data-v2.json`

2. **For Development:**
   - Use this file to test import functionality
   - Verify data structure and validation
   - Test backup and restore features

### **File Structure**

Each sample data file contains:

- **Clients** - Sample client profiles
- **Projects** - Sample project data
- **Timesheets** - Sample work tracking data
- **Invoices** - Sample invoice records
- **Expenses** - Sample expense data
- **Company Profile** - Sample business information

## 📋 **Data Formats**

### **Sample Data Structure**

```json
{
  "clients": [...],
  "projects": [...],
  "timesheets": [...],
  "invoices": [...],
  "expenses": [...],
  "companyProfile": {...}
}
```

### **Backup File Structure**

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "data": {...}
}
```

## 🔧 **Development**

### **Creating New Sample Data**

1. **Export current data** from the app
2. **Modify the structure** as needed
3. **Test import** to verify compatibility
4. **Update this README** with changes

### **Testing Backup/Restore**

1. **Create test data** in the app
2. **Export backup** to test file
3. **Import backup** to verify restore
4. **Compare data** for consistency

## 📚 **Related Documentation**

- **Data Management** - Access via Profile → Data Management in the web app
- **Import/Export** - Use the StorageManager component for data operations

## ⚠️ **Important Notes**

- **Backup files** are for testing only
- **Sample data** should not contain real business information
- **Always test** import/export with sample data first
- **Keep backups** of important data in secure location

---

**📊 This folder contains sample data for the BST Accounting System web application**
