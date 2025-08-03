const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  ipcMain,
  shell,
} = require("electron");
const path = require("path");
const fs = require("fs");
const Store = require("electron-store");
const { JSONStoreManager } = require("../database/jsonStore.js");

// Initialize JSON database with user-specified location
let dbManager;
let dbPath;

// Function to initialize database with custom path
function initializeDatabase(customPath = null) {
  const defaultPath = path.join(app.getPath("userData"), "bst-accounting.json");
  dbPath = customPath || defaultPath;

  dbManager = new JSONStoreManager({ dbPath });
}

// Initialize with default path
initializeDatabase();

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Security: Prevent navigation to external URLs
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (
      parsedUrl.origin !== "http://localhost:3000" &&
      parsedUrl.origin !== "file://"
    ) {
      event.preventDefault();
    }
  });
});

let mainWindow;

function createWindow() {
  // Create the browser window with security features
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../assets/icon.png"),
    titleBarStyle: "default",
    show: false,
    autoHideMenuBar: true,
  });

  // Load the app
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../out/index.html"));
  }

  // Show window when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Security: Prevent external links from opening in app
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// Create menu
function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Change Data Location",
          accelerator: "CmdOrCtrl+Shift+L",
          click: () => {
            changeDataLocation();
          },
        },
        { type: "separator" },
        {
          label: "Export Data",
          accelerator: "CmdOrCtrl+E",
          click: () => {
            exportData();
          },
        },
        {
          label: "Import Data",
          accelerator: "CmdOrCtrl+I",
          click: () => {
            importData();
          },
        },
        { type: "separator" },
        {
          label: "Backup Database",
          click: () => {
            backupDatabase();
          },
        },
        {
          label: "Restore from Backup",
          click: () => {
            restoreFromBackup();
          },
        },
        { type: "separator" },
        {
          label: "Show Data Location",
          click: () => {
            showDataLocation();
          },
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About BST Accounting System",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About BST Accounting System",
              message: "BST Accounting Management System",
              detail:
                "Version 1.0.0\nA secure desktop accounting application for business management.",
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Change data storage location
async function changeDataLocation() {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: "Select New Data Storage Location",
      defaultPath: path.join(app.getPath("documents"), "bst-accounting.json"),
      filters: [
        { name: "JSON Database", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (!canceled && filePath) {
      // Backup current data
      const currentData = dbManager.exportData();

      // Create new database with new location
      initializeDatabase(filePath);

      // Migrate data to new location
      dbManager.importData(currentData);

      dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "Data Location Changed",
        message: "Database location has been changed successfully!",
        detail: `New location: ${filePath}`,
      });
    }
  } catch (error) {
    dialog.showErrorBox(
      "Error",
      `Failed to change data location: ${error.message}`
    );
  }
}

// Show current data location
function showDataLocation() {
  dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "Current Database Location",
    message: "Your database is stored at:",
    detail: dbPath,
  });
}

// Data export function
async function exportData() {
  try {
    const data = dbManager.exportData();
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: "Export Database",
      defaultPath: `bst-accounting-backup-${
        new Date().toISOString().split("T")[0]
      }.json`,
      filters: [
        { name: "JSON Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      dialog.showMessageBox(mainWindow, {
        type: "info",
        title: "Export Successful",
        message: "Database exported successfully!",
        detail: `Exported to: ${filePath}`,
      });
    }
  } catch (error) {
    dialog.showErrorBox("Export Error", error.message);
  }
}

// Data import function
async function importData() {
  try {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: "Import Database",
      properties: ["openFile"],
      filters: [
        { name: "JSON Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (filePaths.length > 0) {
      try {
        const data = JSON.parse(fs.readFileSync(filePaths[0], "utf8"));
        console.log("Importing data:", JSON.stringify(data, null, 2));

        const success = dbManager.importData(data);
        console.log("Import result:", success);

        if (success) {
          // Clear localStorage to force store to reload from database
          mainWindow.webContents.executeJavaScript(`
            localStorage.removeItem('bst-accounting-store');
          `);

          // Verify the data was actually imported by reading it back
          const importedData = dbManager.loadData();
          console.log(
            "Verification - imported data:",
            JSON.stringify(importedData, null, 2)
          );

          dialog.showMessageBox(mainWindow, {
            type: "info",
            title: "Import Successful",
            message: "Database imported successfully!",
            detail: "The application will refresh to show the imported data.",
          });

          // Reload the renderer process to reflect changes
          setTimeout(() => {
            mainWindow.reload();
          }, 1000);
        } else {
          dialog.showErrorBox(
            "Import Error",
            "Failed to import database. Invalid data format."
          );
        }
      } catch (error) {
        console.error("Import error:", error);
        dialog.showErrorBox(
          "Import Error",
          `Failed to import database: ${error.message}`
        );
      }
    }
  } catch (error) {
    dialog.showErrorBox("Import Error", error.message);
  }
}

// Backup database function
async function backupDatabase() {
  try {
    const data = dbManager.exportData();
    const backupPath = path.join(
      app.getPath("documents"),
      "BST Accounting Backups"
    );

    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    const backupFile = path.join(
      backupPath,
      `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    );
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));

    dialog.showMessageBox(mainWindow, {
      type: "info",
      title: "Backup Successful",
      message: "Database backed up successfully!",
      detail: `Backup location: ${backupFile}`,
    });
  } catch (error) {
    dialog.showErrorBox("Backup Error", error.message);
  }
}

// Restore from backup function
async function restoreFromBackup() {
  try {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: "Restore from Backup",
      properties: ["openFile"],
      filters: [
        { name: "Backup Files", extensions: ["json"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (filePaths.length > 0) {
      const filePath = filePaths[0];
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const success = dbManager.importData(data);

      if (success) {
        // Clear localStorage to force store to reload from database
        mainWindow.webContents.executeJavaScript(`
          localStorage.removeItem('bst-accounting-store');
        `);

        dialog.showMessageBox(mainWindow, {
          type: "info",
          title: "Restore Successful",
          message: "Database restored successfully!",
          detail: "The application will refresh to show the restored data.",
        });

        // Reload the renderer process to reflect changes
        setTimeout(() => {
          mainWindow.reload();
        }, 1000);
      } else {
        dialog.showErrorBox(
          "Restore Error",
          "Failed to restore database. Invalid data format."
        );
      }
    }
  } catch (error) {
    dialog.showErrorBox("Restore Error", error.message);
  }
}

// IPC handlers for SQLite database operations
ipcMain.handle("get-clients", () => {
  return dbManager.getClients();
});

ipcMain.handle("get-client", (event, id) => {
  return dbManager.getClient(id);
});

ipcMain.handle("create-client", (event, client) => {
  return dbManager.createClient(client);
});

ipcMain.handle("update-client", (event, id, client) => {
  return dbManager.updateClient(id, client);
});

ipcMain.handle("delete-client", (event, id) => {
  return dbManager.deleteClient(id);
});

ipcMain.handle("get-projects", () => {
  return dbManager.getProjects();
});

ipcMain.handle("get-project", (event, id) => {
  return dbManager.getProject(id);
});

ipcMain.handle("create-project", (event, project) => {
  return dbManager.createProject(project);
});

ipcMain.handle("update-project", (event, id, project) => {
  return dbManager.updateProject(id, project);
});

ipcMain.handle("delete-project", (event, id) => {
  return dbManager.deleteProject(id);
});

ipcMain.handle("get-timesheets", () => {
  return dbManager.getTimesheets();
});

ipcMain.handle("get-timesheet", (event, id) => {
  return dbManager.getTimesheet(id);
});

ipcMain.handle("create-timesheet", (event, timesheet) => {
  return dbManager.createTimesheet(timesheet);
});

ipcMain.handle("update-timesheet", (event, id, timesheet) => {
  return dbManager.updateTimesheet(id, timesheet);
});

ipcMain.handle("delete-timesheet", (event, id) => {
  return dbManager.deleteTimesheet(id);
});

ipcMain.handle("get-invoices", () => {
  return dbManager.getInvoices();
});

ipcMain.handle("get-invoice", (event, id) => {
  return dbManager.getInvoice(id);
});

ipcMain.handle("create-invoice", (event, invoice) => {
  return dbManager.createInvoice(invoice);
});

ipcMain.handle("update-invoice", (event, id, invoice) => {
  return dbManager.updateInvoice(id, invoice);
});

ipcMain.handle("delete-invoice", (event, id) => {
  return dbManager.deleteInvoice(id);
});

ipcMain.handle("get-expenses", () => {
  return dbManager.getExpenses();
});

ipcMain.handle("get-expense", (event, id) => {
  return dbManager.getExpense(id);
});

ipcMain.handle("create-expense", (event, expense) => {
  return dbManager.createExpense(expense);
});

ipcMain.handle("update-expense", (event, id, expense) => {
  return dbManager.updateExpense(id, expense);
});

ipcMain.handle("delete-expense", (event, id) => {
  return dbManager.deleteExpense(id);
});

ipcMain.handle("get-company-profile", () => {
  return dbManager.getCompanyProfile();
});

ipcMain.handle("update-company-profile", (event, profile) => {
  return dbManager.updateCompanyProfile(profile);
});

ipcMain.handle("get-statistics", () => {
  return dbManager.getStatistics();
});

ipcMain.handle("get-all-data", () => {
  return dbManager.loadData();
});

ipcMain.handle("export-data", async () => {
  await exportData();
});

ipcMain.handle("import-data", async () => {
  await importData();
});

ipcMain.handle("backup-database", async () => {
  await backupDatabase();
});

ipcMain.handle("get-database-location", () => {
  return dbPath;
});

ipcMain.handle("change-database-location", async () => {
  await changeDataLocation();
});

ipcMain.handle("clear-all-data", async () => {
  try {
    // Clear all data from the store
    if (dbManager) {
      // Clear all data arrays
      const emptyData = {
        clients: [],
        projects: [],
        timesheets: [],
        invoices: [],
        expenses: [],
        dailyLogs: [],
        companyProfile: {
          id: "",
          name: "",
          legalName: "",
          email: "",
          phone: "",
          website: "",
          address: "",
          city: "",
          state: "",
          pincode: "",
          country: "",
          gstNumber: "",
          panNumber: "",
          cinNumber: "",
          logo: "",
          description: "",
          foundedYear: 0,
          industry: "",
          companySize: "startup",
          annualRevenue: 0,
          employeeCount: 0,
          bankDetails: {
            accountNumber: "",
            ifscCode: "",
            bankName: "",
            branch: "",
          },
          contactPerson: {
            name: "",
            email: "",
            phone: "",
            designation: "",
          },
          socialMedia: {
            linkedin: "",
            twitter: "",
            facebook: "",
            instagram: "",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date().toISOString(),
        version: "1.0.0",
      };

      // Save the empty data
      dbManager.saveData(emptyData);

      return { success: true, message: "All data cleared successfully" };
    }
    return { success: false, error: "Database manager not initialized" };
  } catch (error) {
    console.error("Error clearing all data:", error);
    return { success: false, error: error.message };
  }
});

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Security: Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
