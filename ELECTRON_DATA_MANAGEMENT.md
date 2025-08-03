# 📁 Data Storage Management Guide

This guide explains how to manage your data storage location and backup/restore functionality in the BST Accounting System desktop application.

## 🎯 **Key Features**

### **📍 Custom Data Storage Location**

- ✅ **User-Specified Location** - Choose where to store your data
- ✅ **Easy Migration** - Move data between locations seamlessly
- ✅ **Secure Storage** - All data encrypted with AES-256
- ✅ **Cross-Platform** - Works on Windows, macOS, and Linux

### **💾 Backup & Restore**

- ✅ **Export Data** - Save data as JSON file
- ✅ **Import Data** - Load data from backup files
- ✅ **Automatic Backups** - Timestamped backups
- ✅ **Manual Backups** - Create backups on demand
- ✅ **Restore Functionality** - Load data from any backup

## 🚀 **How to Use**

### **1. Change Data Storage Location**

#### **Via Menu:**

1. Go to **File → Change Data Location** (Ctrl+Shift+L)
2. Select your desired folder location
3. Choose a filename (e.g., `my-accounting-data.dat`)
4. Click **Save**
5. Data will be migrated to the new location

#### **Via Dashboard:**

1. Open the **Data Storage Management** section
2. Click **"Change Location"** button
3. Follow the same process as above

### **2. Export Your Data**

#### **Via Menu:**

1. Go to **File → Export Data** (Ctrl+E)
2. Choose save location
3. Data exported as encrypted JSON

#### **Via Dashboard:**

1. Click **"Export Data"** button
2. Select location and filename
3. Data saved as JSON file

### **3. Import Data**

#### **Via Menu:**

1. Go to **File → Import Data** (Ctrl+I)
2. Select backup file
3. Data imported and verified

#### **Via Dashboard:**

1. Click **"Import Data"** button
2. Select backup file
3. Data loaded into application

### **4. Create Backups**

#### **Automatic Backup:**

1. Go to **File → Backup Database**
2. Backup created in Documents folder
3. Timestamped filename

#### **Manual Backup:**

1. Click **"Backup Now"** in dashboard
2. Choose backup location
3. Backup created immediately

### **5. Restore from Backup**

#### **Via Menu:**

1. Go to **File → Restore from Backup**
2. Select backup file
3. Data restored to application

## 📂 **Default Storage Locations**

### **Windows:**

- **Default**: `%APPDATA%\bst-accounting-data.dat`
- **Backups**: `%USERPROFILE%\Documents\BST Accounting Backups\`

### **macOS:**

- **Default**: `~/Library/Application Support/bst-accounting-data.dat`
- **Backups**: `~/Documents/BST Accounting Backups/`

### **Linux:**

- **Default**: `~/.config/bst-accounting-data.dat`
- **Backups**: `~/Documents/BST Accounting Backups/`

## 🔧 **Advanced Features**

### **Data Migration**

When you change the data storage location:

1. **Current data is backed up** automatically
2. **New location is created** with the same data
3. **Encryption is maintained** throughout the process
4. **Verification is performed** to ensure data integrity

### **Backup Strategies**

#### **Local Backups:**

- Stored in Documents folder
- Timestamped filenames
- Encrypted JSON format
- Easy to find and manage

#### **External Backups:**

- Export to external drive
- Cloud storage (Google Drive, Dropbox)
- Network storage
- Multiple backup locations

#### **Scheduled Backups:**

- Manual backup creation
- Regular export reminders
- Version control for data

## 🛡️ **Security Features**

### **Data Encryption:**

- **AES-256 encryption** for all stored data
- **Secure key management**
- **Encrypted backup files**
- **No plain text data**

### **Access Control:**

- **Local-only storage**
- **No internet transmission**
- **User-controlled locations**
- **Secure file operations**

### **Data Integrity:**

- **Automatic verification**
- **Error detection**
- **Backup validation**
- **Recovery procedures**

## 📋 **Best Practices**

### **Regular Backups:**

1. **Weekly backups** of your data
2. **Before system updates** export your data
3. **Multiple backup locations** for redundancy
4. **Test restore functionality** periodically

### **Data Organization:**

1. **Use descriptive filenames** for backups
2. **Organize backup folders** by date
3. **Keep backup files secure**
4. **Document your backup strategy**

### **Location Management:**

1. **Choose accessible locations** for data storage
2. **Consider external drives** for large datasets
3. **Use network storage** for team access
4. **Regular location verification**

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **Data Not Loading:**

- Check file permissions
- Verify file path is correct
- Ensure file is not corrupted
- Try importing from backup

#### **Backup Failed:**

- Check disk space
- Verify write permissions
- Ensure backup location exists
- Try different backup location

#### **Location Change Failed:**

- Check target folder permissions
- Ensure sufficient disk space
- Verify target path is valid
- Try different location

### **Recovery Procedures:**

#### **If Data is Lost:**

1. Check backup locations
2. Look for automatic backups
3. Try importing from recent export
4. Contact support if needed

#### **If App Won't Start:**

1. Check data file permissions
2. Verify data file location
3. Try resetting data location
4. Reinstall application if necessary

## 📊 **Data Management Dashboard**

The dashboard includes a **Data Storage Management** section that shows:

- **Current data location**
- **Quick action buttons**
- **Management instructions**
- **Security notices**

### **Dashboard Features:**

- ✅ **Real-time location display**
- ✅ **One-click location change**
- ✅ **Quick export/import**
- ✅ **Backup creation**
- ✅ **Security information**

## 🎯 **Benefits**

### **User Control:**

- ✅ **Choose your storage location**
- ✅ **Control your data destiny**
- ✅ **No cloud dependencies**
- ✅ **Complete privacy**

### **Flexibility:**

- ✅ **Move data between devices**
- ✅ **Share data securely**
- ✅ **Multiple backup strategies**
- ✅ **Cross-platform compatibility**

### **Security:**

- ✅ **Local-only storage**
- ✅ **Military-grade encryption**
- ✅ **No data mining**
- ✅ **Complete privacy**

---

**🎉 You now have complete control over your data storage and backup strategy!**
