# 🏢 BST Accounting Management System

A comprehensive desktop accounting application built with **Electron**, **Next.js**, and **TypeScript** for secure, offline-first business management.

## 🚀 **Quick Start**

```bash
# Install dependencies
npm install

# Start development server with Electron
npm run electron-dev

# Build for production
npm run electron-pack
```

## 📚 **Documentation**

All documentation has been organized in the **[`docs/`](./docs/)** folder for easy access:

- **[📖 Documentation Index](./docs/README.md)** - Complete documentation overview
- **[🚀 Getting Started](./docs/ELECTRON_SETUP.md)** - Development setup guide
- **[🏗️ Architecture](./docs/OPTIMIZATION_COMPLETE.md)** - SOLID & DRY principles
- **[💾 Data Management](./docs/CUSTOM_DATA_STORAGE_SUCCESS.md)** - Storage features
- **[🖥️ Desktop App](./docs/ELECTRON_SUCCESS.md)** - Electron implementation

## ✨ **Key Features**

### **🔒 Security & Privacy**
- ✅ **Local Storage Only** - No internet required
- ✅ **AES-256 Encryption** - All data encrypted
- ✅ **Offline-First** - Works without connection
- ✅ **Cross-Platform** - Windows, macOS, Linux

### **💼 Business Management**
- 👥 **Client Management** - Complete client profiles
- 📊 **Project Tracking** - Project lifecycle management
- ⏰ **Timesheet System** - Work tracking with calculations
- 📄 **Invoice Generation** - Professional invoice creation
- 💰 **Expense Tracking** - Business expense monitoring
- 📈 **Financial Reports** - Comprehensive analytics

### **🛠️ Developer Experience**
- 🏗️ **SOLID Architecture** - Clean, maintainable code
- 🔄 **DRY Principles** - No code duplication
- ⚡ **Performance Optimized** - Fast, responsive UI
- 🧪 **Type-Safe** - Full TypeScript coverage

## 📁 **Project Structure**

```
accounting-ai/
├── app/                    # Next.js app directory
├── components/             # React components
│   └── ui/               # Reusable UI components
├── electron/              # Electron main process
├── store/                 # State management
│   └── slices/           # Store slices (SOLID)
├── utils/                 # Utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
├── docs/                  # �� All documentation
├── data/                  # 📊 Sample data & test files
└── assets/               # Application assets
```

## 🚀 **Development**

### **Prerequisites**
- Node.js 18+
- npm or yarn

### **Installation**
```bash
# Clone the repository
git clone https://github.com/aayushjain-code/accounting-software.git
cd accounting-software

# Install dependencies
npm install

# Install Electron dependencies
npm run postinstall
```

### **Development Commands**
```bash
# Start with hot reload
npm run electron-dev

# Or run separately
npm run dev          # Next.js server
npm run electron     # Electron app

# Build for production
npm run electron-pack

# Build for distribution
npm run electron-dist
```

## 📦 **Distribution**

### **Supported Platforms**
- **Windows**: NSIS installer (.exe)
- **macOS**: DMG installer
- **Linux**: AppImage format

### **Features**
- ✅ **Auto-updates** - Seamless updates
- ✅ **Native menus** - Desktop integration
- ✅ **File associations** - Open files directly
- ✅ **System tray** - Background operation

## 🔧 **Configuration**

### **Environment Variables**
```bash
NODE_ENV=development  # Development mode
NODE_ENV=production   # Production mode
```

### **Data Storage**
- **Location**: `~/Documents/BST Accounting Backups/`
- **Format**: Encrypted JSON files
- **Backup**: Automatic backup functionality

## 📊 **Performance**

### **Optimizations**
- ✅ **Memoized Components** - Prevent unnecessary re-renders
- ✅ **Optimized Computations** - Efficient data processing
- ✅ **Reduced Bundle Size** - Smaller application size
- ✅ **Efficient Data Structures** - Handle large datasets

### **Architecture**
- ✅ **SOLID Principles** - Clean, maintainable code
- ✅ **DRY Principles** - No code duplication
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Component Reusability** - Modular design

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create a feature branch**
3. **Follow the architecture** - Read [OPTIMIZATION_COMPLETE.md](./docs/OPTIMIZATION_COMPLETE.md)
4. **Test thoroughly** - Read [TESTS.md](./docs/TESTS.md)
5. **Submit a pull request**

## 📋 **Requirements**

### **System Requirements**
- **OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB available space
- **Display**: 1200x800 minimum resolution

### **Development Requirements**
- Node.js 18.0.0+
- npm 8.0.0+
- Git

## 🆘 **Support**

### **Documentation**
- **[📚 Complete Documentation](./docs/README.md)** - All guides and references
- **[🚀 Setup Guide](./docs/ELECTRON_SETUP.md)** - Development setup
- **[🛠️ Troubleshooting](./docs/ELECTRON_FIXED.md)** - Common issues

### **Getting Help**
- Create an issue on GitHub
- Check the documentation in `docs/` folder
- Review the troubleshooting guide

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**🏢 Built with ❤️ for secure, offline-first business management**

**📚 [View Complete Documentation](./docs/README.md)** 