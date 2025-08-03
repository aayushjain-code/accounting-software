# Electron Desktop Application Setup

This guide covers the complete setup and usage of the BST Accounting System as a secure desktop application.

## 🚀 Quick Start

### **1. Install Dependencies**

```bash
npm install
npm run postinstall
```

### **2. Development Mode**

```bash
# Start with hot reload
npm run electron-dev

# Or run separately
npm run dev          # Next.js server
npm run electron     # Electron app
```

### **3. Build for Production**

```bash
# Create distributable
npm run electron-pack

# Build for specific platform
npm run electron-dist
```

## 🔧 Configuration

### **Environment Setup**

```bash
# Development
NODE_ENV=development

# Production
NODE_ENV=production
```

### **Data Storage Location**

- **Windows**: `%USERPROFILE%\Documents\BST Accounting Backups\`
- **macOS**: `~/Documents/BST Accounting Backups/`
- **Linux**: `~/Documents/BST Accounting Backups/`

## 🛡️ Security Features

### **Data Encryption**

- AES-256 encryption for all stored data
- Secure key management
- Encrypted backup files

### **Application Security**

- Context isolation enabled
- Node.js integration disabled
- Web security enforced
- External link protection

### **IPC Security**

- Secure inter-process communication
- Protected API exposure
- Input validation

## 📊 Data Management

### **Export Data**

1. Go to **File → Export Data**
2. Choose save location
3. Data exported as encrypted JSON

### **Import Data**

1. Go to **File → Import Data**
2. Select backup file
3. Data imported and verified

### **Backup Database**

1. Go to **File → Backup Database**
2. Automatic backup to Documents folder
3. Timestamped backup files

## 🔄 Development Workflow

### **File Structure**

```
electron/
├── main.js          # Main process
└── preload.js       # Preload script

store/
├── index.ts         # Zustand store
└── electronStore.ts # Electron adapter
```

### **Key Components**

#### **Main Process (`electron/main.js`)**

- Window management
- Menu creation
- IPC handlers
- Security features

#### **Preload Script (`electron/preload.js`)**

- Secure API exposure
- Context bridge setup
- Security isolation

#### **Store Adapter (`store/electronStore.ts`)**

- Local storage integration
- Encryption handling
- Cross-platform compatibility

## 🚨 Troubleshooting

### **Common Issues**

#### **App Won't Start**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run postinstall
```

#### **Data Not Persisting**

- Check file permissions
- Verify encryption key
- Review error logs

#### **Build Failures**

```bash
# Clear build cache
rm -rf out dist
npm run build
npm run electron-pack
```

### **Debug Mode**

```bash
# Enable debug logging
DEBUG=electron-* npm run electron-dev
```

## 📦 Distribution

### **Windows Build**

```bash
# Build for Windows
npm run electron-dist -- --win

# Create installer
npm run electron-dist -- --win --publish=never
```

### **macOS Build**

```bash
# Build for macOS
npm run electron-dist -- --mac

# Create DMG
npm run electron-dist -- --mac --publish=never
```

### **Linux Build**

```bash
# Build for Linux
npm run electron-dist -- --linux

# Create AppImage
npm run electron-dist -- --linux --publish=never
```

## 🔒 Security Checklist

### **Before Distribution**

- [ ] Encryption key is secure
- [ ] Context isolation enabled
- [ ] Node.js integration disabled
- [ ] External links protected
- [ ] IPC security verified
- [ ] Data validation implemented

### **Runtime Security**

- [ ] No external network calls
- [ ] Local storage only
- [ ] Secure file operations
- [ ] Input sanitization
- [ ] Error handling

## 📋 Best Practices

### **Development**

1. **Always use secure IPC**
2. **Validate all inputs**
3. **Handle errors gracefully**
4. **Test offline functionality**
5. **Verify data integrity**

### **Deployment**

1. **Test on target platforms**
2. **Verify security features**
3. **Check file permissions**
4. **Test backup/restore**
5. **Validate encryption**

### **User Experience**

1. **Clear error messages**
2. **Progress indicators**
3. **Auto-save functionality**
4. **Keyboard shortcuts**
5. **Native menus**

## 🆘 Support

### **Getting Help**

1. Check the troubleshooting section
2. Review error logs
3. Test in development mode
4. Verify configuration
5. Contact support team

### **Logs Location**

- **Windows**: `%APPDATA%\BST Accounting\logs\`
- **macOS**: `~/Library/Logs/BST Accounting/`
- **Linux**: `~/.config/BST Accounting/logs/`

---

**For additional support, refer to the main README.md file.**
