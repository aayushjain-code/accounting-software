# BST Accounting Management System

A comprehensive desktop accounting application built with **Electron**, **Next.js**, and **TypeScript** for secure, offline-first business management.

## 🚀 Features

### **Desktop Application**

- ✅ **Secure Local Storage** - All data stored locally with encryption
- ✅ **Offline-First** - Works without internet connection
- ✅ **Cross-Platform** - Windows, macOS, and Linux support
- ✅ **Data Export/Import** - Backup and restore functionality
- ✅ **Native Menus** - Desktop-native application menus

### **Business Management**

- 👥 **Client Management** - Complete client profiles and relationships
- 📊 **Project Tracking** - Project lifecycle and cost management
- ⏰ **Timesheet System** - Work tracking with automatic calculations
- 📄 **Invoice Generation** - Professional invoice creation and management
- 💰 **Expense Tracking** - Business expense monitoring
- 📈 **Financial Reports** - Comprehensive reporting and analytics
- 🏢 **Company Profile** - Complete business information management

### **Security & Performance**

- 🔒 **Encrypted Storage** - Local data with AES encryption
- 🚫 **No Internet Required** - Complete offline functionality
- ⚡ **Fast Performance** - Native desktop performance
- 🛡️ **Secure IPC** - Protected inter-process communication

## 🛠️ Development

### **Prerequisites**

- Node.js 18+
- npm or yarn

### **Installation**

```bash
# Clone the repository
git clone https://github.com/your-username/accounting-software.git
cd accounting-software

# Install dependencies
npm install

# Install Electron dependencies
npm run postinstall
```

### **Development Mode**

```bash
# Start development server with Electron
npm run electron-dev

# Or run separately
npm run dev          # Next.js development server
npm run electron     # Electron app
```

### **Building for Production**

```bash
# Build the application
npm run electron-pack

# Build for distribution
npm run electron-dist
```

## 📦 Distribution

### **Windows**

- NSIS installer (.exe)
- Portable version available

### **macOS**

- DMG installer
- App Store ready

### **Linux**

- AppImage format
- DEB/RPM packages

## 🔧 Configuration

### **Environment Variables**

```bash
NODE_ENV=development  # Development mode
NODE_ENV=production   # Production mode
```

### **Data Storage**

- **Location**: `~/Documents/BST Accounting Backups/`
- **Format**: Encrypted JSON files
- **Backup**: Automatic backup functionality

## 📁 Project Structure

```
accounting-ai/
├── app/                    # Next.js app directory
├── components/             # React components
├── electron/              # Electron main process
│   ├── main.js           # Main process
│   └── preload.js        # Preload script
├── store/                 # State management
│   ├── index.ts          # Zustand store
│   └── electronStore.ts  # Electron storage adapter
├── types/                 # TypeScript definitions
├── utils/                 # Utility functions
└── assets/               # Application assets
```

## 🔒 Security Features

### **Data Protection**

- AES-256 encryption for local storage
- Secure IPC communication
- No external data transmission
- Local-only data processing

### **Application Security**

- Context isolation enabled
- Node.js integration disabled
- Web security enforced
- External link protection

## 📊 Data Management

### **Export/Import**

- JSON format for data portability
- Encrypted backup files
- Cross-platform compatibility
- Version control support

### **Backup Strategy**

- Automatic backup creation
- Manual backup triggers
- Backup verification
- Restore functionality

## 🚀 Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development**

   ```bash
   npm run electron-dev
   ```

3. **Build for Production**
   ```bash
   npm run electron-pack
   ```

## 📋 Requirements

### **System Requirements**

- **OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB available space
- **Display**: 1200x800 minimum resolution

### **Development Requirements**

- Node.js 18.0.0+
- npm 8.0.0+
- Git

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**Built with ❤️ for secure, offline-first business management**
