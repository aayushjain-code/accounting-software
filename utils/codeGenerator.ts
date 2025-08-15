import { format } from "date-fns";

// Code generation utilities
export class CodeGenerator {
  private static counters = new Map<string, number>();

  // Reset counters (useful for testing)
  static resetCounters() {
    this.counters.clear();
  }

  // Get next counter for a specific type
  private static getNextCounter(type: string): number {
    const current = this.counters.get(type) || 0;
    const next = current + 1;
    this.counters.set(type, next);
    return next;
  }

  // Generate client code: CLT-YYYY-XXXX
  static generateClientCode(existingClients: any[] = []): string {
    const year = new Date().getFullYear();
    const existingCodes = existingClients
      .map(client => client.clientCode)
      .filter(code => code && code.startsWith(`CLT-${year}`));

    let counter = 1;
    if (existingCodes.length > 0) {
      const maxNumber = Math.max(
        ...existingCodes.map(code => {
          const match = code.match(/CLT-\d{4}-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
      );
      counter = maxNumber + 1;
    }

    return `CLT-${year}-${counter.toString().padStart(4, "0")}`;
  }

  // Generate project code: PRJ-YYYY-XXXX
  static generateProjectCode(existingProjects: any[] = []): string {
    const year = new Date().getFullYear();
    const existingCodes = existingProjects
      .map(project => project.projectCode)
      .filter(code => code && code.startsWith(`PRJ-${year}`));

    let counter = 1;
    if (existingCodes.length > 0) {
      const maxNumber = Math.max(
        ...existingCodes.map(code => {
          const match = code.match(/PRJ-\d{4}-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
      );
      counter = maxNumber + 1;
    }

    return `PRJ-${year}-${counter.toString().padStart(4, "0")}`;
  }

  // Generate timesheet code: TMS-YYYY-MM-XXXX
  static generateTimesheetCode(
    month: string,
    existingTimesheets: any[] = []
  ): string {
    const year = new Date().getFullYear();
    const monthCode = month.substring(0, 7); // YYYY-MM format

    const existingCodes = existingTimesheets
      .map(timesheet => timesheet.timesheetCode)
      .filter(code => code && code.startsWith(`TMS-${year}-${monthCode}`));

    let counter = 1;
    if (existingCodes.length > 0) {
      const maxNumber = Math.max(
        ...existingCodes.map(code => {
          const match = code.match(/TMS-\d{4}-\d{2}-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
      );
      counter = maxNumber + 1;
    }

    return `TMS-${year}-${monthCode.substring(5, 7)}-${counter
      .toString()
      .padStart(4, "0")}`;
  }

  // Generate invoice code: INV-YYYY-XXXX
  static generateInvoiceCode(existingInvoices: any[] = []): string {
    const year = new Date().getFullYear();
    const existingCodes = existingInvoices
      .map(invoice => invoice.invoiceNumber)
      .filter(code => code && code.startsWith(`INV-${year}`));

    let counter = 1;
    if (existingCodes.length > 0) {
      const maxNumber = Math.max(
        ...existingCodes.map(code => {
          const match = code.match(/INV-\d{4}-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
      );
      counter = maxNumber + 1;
    }

    return `INV-${year}-${counter.toString().padStart(4, "0")}`;
  }

  // Generate expense code: EXP-YYYY-MM-XXXX
  static generateExpenseCode(existingExpenses: any[] = []): string {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const monthStr = month.toString().padStart(2, "0");

    const existingCodes = existingExpenses
      .map(expense => expense.expenseCode)
      .filter(code => code && code.startsWith(`EXP-${year}-${monthStr}`));

    let counter = 1;
    if (existingCodes.length > 0) {
      const maxNumber = Math.max(
        ...existingCodes.map(code => {
          const match = code.match(/EXP-\d{4}-\d{2}-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
      );
      counter = maxNumber + 1;
    }

    return `EXP-${year}-${monthStr}-${counter.toString().padStart(4, "0")}`;
  }

  // Generate receipt code: RCP-YYYY-MM-XXXX
  static generateReceiptCode(existingReceipts: any[] = []): string {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const monthStr = month.toString().padStart(2, "0");

    const existingCodes = existingReceipts
      .map(receipt => receipt.receiptCode)
      .filter(code => code && code.startsWith(`RCP-${year}-${monthStr}`));

    let counter = 1;
    if (existingCodes.length > 0) {
      const maxNumber = Math.max(
        ...existingCodes.map(code => {
          const match = code.match(/RCP-\d{4}-\d{2}-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
      );
      counter = maxNumber + 1;
    }

    return `RCP-${year}-${monthStr}-${counter.toString().padStart(4, "0")}`;
  }

  // Generate payment code: PAY-YYYY-MM-XXXX
  static generatePaymentCode(existingPayments: any[] = []): string {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const monthStr = month.toString().padStart(2, "0");

    const existingCodes = existingPayments
      .map(payment => payment.paymentCode)
      .filter(code => code && code.startsWith(`PAY-${year}-${monthStr}`));

    let counter = 1;
    if (existingCodes.length > 0) {
      const maxNumber = Math.max(
        ...existingCodes.map(code => {
          const match = code.match(/PAY-\d{4}-\d{2}-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
      );
      counter = maxNumber + 1;
    }

    return `PAY-${year}-${monthStr}-${counter.toString().padStart(4, "0")}`;
  }

  // Generate unique ID with timestamp
  static generateUniqueId(prefix: string = ""): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}${timestamp}-${random}`.toUpperCase();
  }

  // Generate sequential code with custom format
  static generateSequentialCode(
    prefix: string,
    existingItems: any[],
    codeField: string,
    format: string = "0000"
  ): string {
    const year = new Date().getFullYear();
    const existingCodes = existingItems
      .map(item => item[codeField])
      .filter(code => code && code.startsWith(`${prefix}-${year}`));

    let counter = 1;
    if (existingCodes.length > 0) {
      const maxNumber = Math.max(
        ...existingCodes.map(code => {
          const match = new RegExp(`${prefix}-\\d{4}-(\\d+)`).exec(code);
          return match ? parseInt(match[1]) : 0;
        })
      );
      counter = maxNumber + 1;
    }

    const paddedCounter = counter.toString().padStart(format.length, "0");
    return `${prefix}-${year}-${paddedCounter}`;
  }

  // Validate code format
  static validateCode(code: string, pattern: RegExp): boolean {
    return pattern.test(code);
  }

  // Extract information from code
  static extractCodeInfo(code: string): {
    type: string;
    year: number;
    month?: number;
    sequence: number;
  } | null {
    const patterns = {
      client: /^CLT-(\d{4})-(\d+)$/,
      project: /^PRJ-(\d{4})-(\d+)$/,
      timesheet: /^TMS-(\d{4})-(\d{2})-(\d+)$/,
      invoice: /^INV-(\d{4})-(\d+)$/,
      expense: /^EXP-(\d{4})-(\d{2})-(\d+)$/,
      receipt: /^RCP-(\d{4})-(\d{2})-(\d+)$/,
      payment: /^PAY-(\d{4})-(\d{2})-(\d+)$/,
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = code.match(pattern);
      if (match) {
        const year = parseInt(match[1]);
        const sequence = parseInt(match[match.length - 1]);
        const month = match.length > 3 ? parseInt(match[2]) : undefined;

        return {
          type,
          year,
          month,
          sequence,
        };
      }
    }

    return null;
  }

  // Get code statistics
  static getCodeStats(
    items: any[],
    codeField: string
  ): {
    total: number;
    byYear: Record<number, number>;
    byMonth: Record<string, number>;
    latestCode: string | null;
  } {
    const codes = items.map(item => item[codeField]).filter(code => code);

    const byYear: Record<number, number> = {};
    const byMonth: Record<string, number> = {};
    let latestCode: string | null = null;

    codes.forEach(code => {
      const info = this.extractCodeInfo(code);
      if (info) {
        byYear[info.year] = (byYear[info.year] || 0) + 1;

        if (info.month) {
          const monthKey = `${info.year}-${info.month
            .toString()
            .padStart(2, "0")}`;
          byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
        }

        if (!latestCode || code > latestCode) {
          latestCode = code;
        }
      }
    });

    return {
      total: codes.length,
      byYear,
      byMonth,
      latestCode,
    };
  }
}

// Hook for code generation
export const useCodeGenerator = () => {
  const generateClientCode = (existingClients: any[] = []) => {
    return CodeGenerator.generateClientCode(existingClients);
  };

  const generateProjectCode = (existingProjects: any[] = []) => {
    return CodeGenerator.generateProjectCode(existingProjects);
  };

  const generateTimesheetCode = (
    month: string,
    existingTimesheets: any[] = []
  ) => {
    return CodeGenerator.generateTimesheetCode(month, existingTimesheets);
  };

  const generateInvoiceCode = (existingInvoices: any[] = []) => {
    return CodeGenerator.generateInvoiceCode(existingInvoices);
  };

  const generateExpenseCode = (existingExpenses: any[] = []) => {
    return CodeGenerator.generateExpenseCode(existingExpenses);
  };

  const generateReceiptCode = (existingReceipts: any[] = []) => {
    return CodeGenerator.generateReceiptCode(existingReceipts);
  };

  const generatePaymentCode = (existingPayments: any[] = []) => {
    return CodeGenerator.generatePaymentCode(existingPayments);
  };

  const generateUniqueId = (prefix: string = "") => {
    return CodeGenerator.generateUniqueId(prefix);
  };

  const validateCode = (code: string, pattern: RegExp) => {
    return CodeGenerator.validateCode(code, pattern);
  };

  const extractCodeInfo = (code: string) => {
    return CodeGenerator.extractCodeInfo(code);
  };

  const getCodeStats = (items: any[], codeField: string) => {
    return CodeGenerator.getCodeStats(items, codeField);
  };

  return {
    generateClientCode,
    generateProjectCode,
    generateTimesheetCode,
    generateInvoiceCode,
    generateExpenseCode,
    generateReceiptCode,
    generatePaymentCode,
    generateUniqueId,
    validateCode,
    extractCodeInfo,
    getCodeStats,
  };
};
