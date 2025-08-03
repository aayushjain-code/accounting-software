const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

class SQLiteManager {
  constructor(config) {
    this.dbPath = config.dbPath;
    this.initializeDatabase();
  }

  initializeDatabase() {
    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(this.dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");

    this.createTables();
  }

  createTables() {
    // Clients table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clientCode TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        gstNumber TEXT,
        annualRevenue REAL DEFAULT 0,
        industry TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectCode TEXT UNIQUE NOT NULL,
        clientId INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        budget REAL DEFAULT 0,
        billingRate REAL DEFAULT 0,
        billingTerms TEXT,
        startDate DATE,
        endDate DATE,
        status TEXT DEFAULT 'active',
        costBreakdown TEXT,
        totalCost REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (clientId) REFERENCES clients (id) ON DELETE CASCADE
      )
    `);

    // Timesheets table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS timesheets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timesheetCode TEXT UNIQUE NOT NULL,
        projectId INTEGER,
        clientId INTEGER,
        date DATE NOT NULL,
        daysWorked INTEGER DEFAULT 0,
        hoursPerDay REAL DEFAULT 8,
        totalHours REAL DEFAULT 0,
        billingRate REAL DEFAULT 0,
        totalAmount REAL DEFAULT 0,
        description TEXT,
        status TEXT DEFAULT 'pending',
        attachments TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (clientId) REFERENCES clients (id) ON DELETE CASCADE
      )
    `);

    // Invoices table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceNumber TEXT UNIQUE NOT NULL,
        clientId INTEGER,
        projectId INTEGER,
        timesheetId INTEGER,
        issueDate DATE NOT NULL,
        dueDate DATE NOT NULL,
        subtotal REAL DEFAULT 0,
        taxRate REAL DEFAULT 0,
        taxAmount REAL DEFAULT 0,
        total REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        paymentDate DATE,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (clientId) REFERENCES clients (id) ON DELETE CASCADE,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (timesheetId) REFERENCES timesheets (id) ON DELETE CASCADE
      )
    `);

    // Expenses table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expenseCode TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        date DATE NOT NULL,
        receipt TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Daily Logs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS daily_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT,
        priority TEXT,
        tags TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Company Profile table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS company_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        gstNumber TEXT,
        panNumber TEXT,
        bankDetails TEXT,
        logo TEXT,
        annualRevenue REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_clients_code ON clients (clientCode);
      CREATE INDEX IF NOT EXISTS idx_projects_code ON projects (projectCode);
      CREATE INDEX IF NOT EXISTS idx_timesheets_code ON timesheets (timesheetCode);
      CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices (invoiceNumber);
      CREATE INDEX IF NOT EXISTS idx_expenses_code ON expenses (expenseCode);
      CREATE INDEX IF NOT EXISTS idx_timesheets_project ON timesheets (projectId);
      CREATE INDEX IF NOT EXISTS idx_timesheets_client ON timesheets (clientId);
      CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices (clientId);
      CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices (projectId);
      CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs (date);
    `);
  }

  // Client operations
  getClients() {
    return this.db
      .prepare("SELECT * FROM clients ORDER BY createdAt DESC")
      .all();
  }

  getClient(id) {
    return this.db.prepare("SELECT * FROM clients WHERE id = ?").get(id);
  }

  createClient(client) {
    const stmt = this.db.prepare(`
      INSERT INTO clients (clientCode, name, email, phone, address, gstNumber, annualRevenue, industry, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      client.clientCode,
      client.name,
      client.email,
      client.phone,
      client.address,
      client.gstNumber,
      client.annualRevenue,
      client.industry,
      client.notes
    );
  }

  updateClient(id, client) {
    const fields = Object.keys(client).filter((key) => key !== "id");
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => client[field]);

    const stmt = this.db.prepare(`
      UPDATE clients SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(...values, id);
  }

  deleteClient(id) {
    return this.db.prepare("DELETE FROM clients WHERE id = ?").run(id);
  }

  // Project operations
  getProjects() {
    return this.db
      .prepare(
        `
      SELECT p.*, c.name as clientName 
      FROM projects p 
      LEFT JOIN clients c ON p.clientId = c.id 
      ORDER BY p.createdAt DESC
    `
      )
      .all();
  }

  getProject(id) {
    return this.db
      .prepare(
        `
      SELECT p.*, c.name as clientName 
      FROM projects p 
      LEFT JOIN clients c ON p.clientId = c.id 
      WHERE p.id = ?
    `
      )
      .get(id);
  }

  createProject(project) {
    const stmt = this.db.prepare(`
      INSERT INTO projects (projectCode, clientId, name, description, budget, billingRate, billingTerms, startDate, endDate, status, costBreakdown, totalCost)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      project.projectCode,
      project.clientId,
      project.name,
      project.description,
      project.budget,
      project.billingRate,
      project.billingTerms,
      project.startDate,
      project.endDate,
      project.status,
      project.costBreakdown,
      project.totalCost
    );
  }

  updateProject(id, project) {
    const fields = Object.keys(project).filter((key) => key !== "id");
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => project[field]);

    const stmt = this.db.prepare(`
      UPDATE projects SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(...values, id);
  }

  deleteProject(id) {
    return this.db.prepare("DELETE FROM projects WHERE id = ?").run(id);
  }

  // Timesheet operations
  getTimesheets() {
    return this.db
      .prepare(
        `
      SELECT t.*, p.name as projectName, p.projectCode, c.name as clientName
      FROM timesheets t 
      LEFT JOIN projects p ON t.projectId = p.id 
      LEFT JOIN clients c ON t.clientId = c.id 
      ORDER BY t.date DESC
    `
      )
      .all();
  }

  getTimesheet(id) {
    return this.db
      .prepare(
        `
      SELECT t.*, p.name as projectName, p.projectCode, c.name as clientName
      FROM timesheets t 
      LEFT JOIN projects p ON t.projectId = p.id 
      LEFT JOIN clients c ON t.clientId = c.id 
      WHERE t.id = ?
    `
      )
      .get(id);
  }

  createTimesheet(timesheet) {
    const stmt = this.db.prepare(`
      INSERT INTO timesheets (timesheetCode, projectId, clientId, date, daysWorked, hoursPerDay, totalHours, billingRate, totalAmount, description, status, attachments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      timesheet.timesheetCode,
      timesheet.projectId,
      timesheet.clientId,
      timesheet.date,
      timesheet.daysWorked,
      timesheet.hoursPerDay,
      timesheet.totalHours,
      timesheet.billingRate,
      timesheet.totalAmount,
      timesheet.description,
      timesheet.status,
      timesheet.attachments
    );
  }

  updateTimesheet(id, timesheet) {
    const fields = Object.keys(timesheet).filter((key) => key !== "id");
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => timesheet[field]);

    const stmt = this.db.prepare(`
      UPDATE timesheets SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(...values, id);
  }

  deleteTimesheet(id) {
    return this.db.prepare("DELETE FROM timesheets WHERE id = ?").run(id);
  }

  // Invoice operations
  getInvoices() {
    return this.db
      .prepare(
        `
      SELECT i.*, c.name as clientName, p.name as projectName
      FROM invoices i 
      LEFT JOIN clients c ON i.clientId = c.id 
      LEFT JOIN projects p ON i.projectId = p.id 
      ORDER BY i.issueDate DESC
    `
      )
      .all();
  }

  getInvoice(id) {
    return this.db
      .prepare(
        `
      SELECT i.*, c.name as clientName, p.name as projectName
      FROM invoices i 
      LEFT JOIN clients c ON i.clientId = c.id 
      LEFT JOIN projects p ON i.projectId = p.id 
      WHERE i.id = ?
    `
      )
      .get(id);
  }

  createInvoice(invoice) {
    const stmt = this.db.prepare(`
      INSERT INTO invoices (invoiceNumber, clientId, projectId, timesheetId, issueDate, dueDate, subtotal, taxRate, taxAmount, total, status, paymentDate, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      invoice.invoiceNumber,
      invoice.clientId,
      invoice.projectId,
      invoice.timesheetId,
      invoice.issueDate,
      invoice.dueDate,
      invoice.subtotal,
      invoice.taxRate,
      invoice.taxAmount,
      invoice.total,
      invoice.status,
      invoice.paymentDate,
      invoice.notes
    );
  }

  updateInvoice(id, invoice) {
    const fields = Object.keys(invoice).filter((key) => key !== "id");
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => invoice[field]);

    const stmt = this.db.prepare(`
      UPDATE invoices SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(...values, id);
  }

  deleteInvoice(id) {
    return this.db.prepare("DELETE FROM invoices WHERE id = ?").run(id);
  }

  // Expense operations
  getExpenses() {
    return this.db.prepare("SELECT * FROM expenses ORDER BY date DESC").all();
  }

  getExpense(id) {
    return this.db.prepare("SELECT * FROM expenses WHERE id = ?").get(id);
  }

  createExpense(expense) {
    const stmt = this.db.prepare(`
      INSERT INTO expenses (expenseCode, category, description, amount, date, receipt, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      expense.expenseCode,
      expense.category,
      expense.description,
      expense.amount,
      expense.date,
      expense.receipt,
      expense.notes
    );
  }

  updateExpense(id, expense) {
    const fields = Object.keys(expense).filter((key) => key !== "id");
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => expense[field]);

    const stmt = this.db.prepare(`
      UPDATE expenses SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(...values, id);
  }

  deleteExpense(id) {
    return this.db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
  }

  // Daily Log operations
  getDailyLogs() {
    return this.db.prepare("SELECT * FROM daily_logs ORDER BY date DESC").all();
  }

  getDailyLog(id) {
    return this.db.prepare("SELECT * FROM daily_logs WHERE id = ?").get(id);
  }

  createDailyLog(log) {
    const stmt = this.db.prepare(`
      INSERT INTO daily_logs (date, title, description, category, priority, tags)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      log.date,
      log.title,
      log.description,
      log.category,
      log.priority,
      JSON.stringify(log.tags)
    );
  }

  updateDailyLog(id, log) {
    const fields = Object.keys(log).filter((key) => key !== "id");
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => {
      if (field === "tags") {
        return JSON.stringify(log[field]);
      }
      return log[field];
    });

    const stmt = this.db.prepare(`
      UPDATE daily_logs SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
    `);
    return stmt.run(...values, id);
  }

  deleteDailyLog(id) {
    return this.db.prepare("DELETE FROM daily_logs WHERE id = ?").run(id);
  }

  // Company Profile operations
  getCompanyProfile() {
    return this.db.prepare("SELECT * FROM company_profile LIMIT 1").get();
  }

  updateCompanyProfile(profile) {
    const existing = this.getCompanyProfile();
    if (existing && existing.id) {
      const fields = Object.keys(profile);
      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = fields.map((field) => profile[field]);

      const stmt = this.db.prepare(`
        UPDATE company_profile SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
      `);
      return stmt.run(...values, existing.id);
    } else {
      const stmt = this.db.prepare(`
        INSERT INTO company_profile (name, email, phone, address, gstNumber, panNumber, bankDetails, logo, annualRevenue)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        profile.name,
        profile.email,
        profile.phone,
        profile.address,
        profile.gstNumber,
        profile.panNumber,
        profile.bankDetails,
        profile.logo,
        profile.annualRevenue
      );
    }
  }

  // Backup and Restore operations
  exportData() {
    const data = {
      clients: this.getClients(),
      projects: this.getProjects(),
      timesheets: this.getTimesheets(),
      invoices: this.getInvoices(),
      expenses: this.getExpenses(),
      dailyLogs: this.getDailyLogs(),
      companyProfile: this.getCompanyProfile(),
      exportDate: new Date().toISOString(),
      version: "1.0.0",
    };
    return data;
  }

  importData(data) {
    this.db.exec("BEGIN TRANSACTION");

    try {
      // Clear existing data
      this.db.exec(`
        DELETE FROM expenses;
        DELETE FROM invoices;
        DELETE FROM timesheets;
        DELETE FROM projects;
        DELETE FROM clients;
        DELETE FROM company_profile;
        DELETE FROM daily_logs;
      `);

      // Import clients
      if (data.clients) {
        const clientStmt = this.db.prepare(`
          INSERT INTO clients (id, clientCode, name, email, phone, address, gstNumber, annualRevenue, industry, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        data.clients.forEach((client) => {
          clientStmt.run(
            client.id,
            client.clientCode,
            client.name,
            client.email,
            client.phone,
            client.address,
            client.gstNumber,
            client.annualRevenue,
            client.industry,
            client.notes,
            client.createdAt,
            client.updatedAt
          );
        });
      }

      // Import projects
      if (data.projects) {
        const projectStmt = this.db.prepare(`
          INSERT INTO projects (id, projectCode, clientId, name, description, budget, billingRate, billingTerms, startDate, endDate, status, costBreakdown, totalCost, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        data.projects.forEach((project) => {
          projectStmt.run(
            project.id,
            project.projectCode,
            project.clientId,
            project.name,
            project.description,
            project.budget,
            project.billingRate,
            project.billingTerms,
            project.startDate,
            project.endDate,
            project.status,
            project.costBreakdown,
            project.totalCost,
            project.createdAt,
            project.updatedAt
          );
        });
      }

      // Import timesheets
      if (data.timesheets) {
        const timesheetStmt = this.db.prepare(`
          INSERT INTO timesheets (id, timesheetCode, projectId, clientId, date, daysWorked, hoursPerDay, totalHours, billingRate, totalAmount, description, status, attachments, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        data.timesheets.forEach((timesheet) => {
          timesheetStmt.run(
            timesheet.id,
            timesheet.timesheetCode,
            timesheet.projectId,
            timesheet.clientId,
            timesheet.date,
            timesheet.daysWorked,
            timesheet.hoursPerDay,
            timesheet.totalHours,
            timesheet.billingRate,
            timesheet.totalAmount,
            timesheet.description,
            timesheet.status,
            timesheet.attachments,
            timesheet.createdAt,
            timesheet.updatedAt
          );
        });
      }

      // Import invoices
      if (data.invoices) {
        const invoiceStmt = this.db.prepare(`
          INSERT INTO invoices (id, invoiceNumber, clientId, projectId, timesheetId, issueDate, dueDate, subtotal, taxRate, taxAmount, total, status, paymentDate, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        data.invoices.forEach((invoice) => {
          invoiceStmt.run(
            invoice.id,
            invoice.invoiceNumber,
            invoice.clientId,
            invoice.projectId,
            invoice.timesheetId,
            invoice.issueDate,
            invoice.dueDate,
            invoice.subtotal,
            invoice.taxRate,
            invoice.taxAmount,
            invoice.total,
            invoice.status,
            invoice.paymentDate,
            invoice.notes,
            invoice.createdAt,
            invoice.updatedAt
          );
        });
      }

      // Import expenses
      if (data.expenses) {
        const expenseStmt = this.db.prepare(`
          INSERT INTO expenses (id, expenseCode, category, description, amount, date, receipt, notes, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        data.expenses.forEach((expense) => {
          expenseStmt.run(
            expense.id,
            expense.expenseCode,
            expense.category,
            expense.description,
            expense.amount,
            expense.date,
            expense.receipt,
            expense.notes,
            expense.createdAt,
            expense.updatedAt
          );
        });
      }

      // Import daily logs
      if (data.dailyLogs) {
        const logStmt = this.db.prepare(`
          INSERT INTO daily_logs (id, date, title, description, category, priority, tags, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        data.dailyLogs.forEach((log) => {
          logStmt.run(
            log.id,
            log.date,
            log.title,
            log.description,
            log.category,
            log.priority,
            JSON.stringify(log.tags),
            log.createdAt,
            log.updatedAt
          );
        });
      }

      // Import company profile
      if (data.companyProfile) {
        const profileStmt = this.db.prepare(`
          INSERT INTO company_profile (id, name, email, phone, address, gstNumber, panNumber, bankDetails, logo, annualRevenue, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        profileStmt.run(
          data.companyProfile.id,
          data.companyProfile.name,
          data.companyProfile.email,
          data.companyProfile.phone,
          data.companyProfile.address,
          data.companyProfile.gstNumber,
          data.companyProfile.panNumber,
          data.companyProfile.bankDetails,
          data.companyProfile.logo,
          data.companyProfile.annualRevenue,
          data.companyProfile.createdAt,
          data.companyProfile.updatedAt
        );
      }

      this.db.exec("COMMIT");
      return true;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  // Database management
  backupDatabase(backupPath) {
    this.db.backup(backupPath);
  }

  close() {
    this.db.close();
  }

  // Statistics and reporting
  getStatistics() {
    const stats = {
      totalClients: this.db
        .prepare("SELECT COUNT(*) as count FROM clients")
        .get().count,
      totalProjects: this.db
        .prepare("SELECT COUNT(*) as count FROM projects")
        .get().count,
      totalTimesheets: this.db
        .prepare("SELECT COUNT(*) as count FROM timesheets")
        .get().count,
      totalInvoices: this.db
        .prepare("SELECT COUNT(*) as count FROM invoices")
        .get().count,
      totalExpensesCount: this.db
        .prepare("SELECT COUNT(*) as count FROM expenses")
        .get().count,
      totalDailyLogsCount: this.db
        .prepare("SELECT COUNT(*) as count FROM daily_logs")
        .get().count,
      totalRevenue:
        this.db
          .prepare(
            'SELECT SUM(total) as total FROM invoices WHERE status = "paid"'
          )
          .get().total || 0,
      totalExpensesAmount:
        this.db.prepare("SELECT SUM(amount) as total FROM expenses").get()
          .total || 0,
      outstandingAmount:
        this.db
          .prepare(
            'SELECT SUM(total) as total FROM invoices WHERE status = "pending"'
          )
          .get().total || 0,
    };

    stats.netProfit = stats.totalRevenue - stats.totalExpensesAmount;
    return stats;
  }
}

module.exports = { SQLiteManager };
