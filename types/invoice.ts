import { BaseEntity, StatusOptions, TaxType, FileAttachment } from "./common";

export interface Invoice extends BaseEntity {
  invoiceNumber: string;
  timesheetId?: string; // Optional - for backward compatibility
  clientId: string;
  projectId: string;
  issueDate: Date;
  dueDate: Date;
  status:
    | StatusOptions["draft"]
    | StatusOptions["sent"]
    | StatusOptions["paid"];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  poNumber?: string;
  deliveryNote?: string;
  paymentTerms: string;
  items: InvoiceItem[];
  files?: InvoiceFile[];

  // Legacy properties for backward compatibility
  notes?: string;
  referenceNo?: string;
  buyerOrderNo?: string;
  buyerOrderDate?: string;
  purchaseOrderNo?: string;
  purchaseOrderDate?: string;
  dispatchDocNo?: string;
  deliveryNoteDate?: string;
  dispatchedThrough?: string;
  destination?: string;
  termsOfDelivery?: string;
}

export interface InvoiceItem extends BaseEntity {
  invoiceId: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  hsnCode: string;
  unit: string;
}

export interface InvoiceItemFormData {
  title: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  hsnCode: string;
  unit: string;
}

export interface InvoiceFile extends FileAttachment {
  invoiceId: string;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  clientId: string;
  projectId: string;
  issueDate: string;
  dueDate: string;
  status: Invoice["status"];
  poNumber: string;
  deliveryNote: string;
  paymentTerms: string;
  items: Omit<InvoiceItem, "id" | "invoiceId" | "createdAt" | "updatedAt">[];
}

export interface InvoiceFilters {
  status?: Invoice["status"];
  clientId?: string;
  projectId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  searchQuery?: string;
}

export interface InvoiceStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  outstandingAmount: number;
  averageInvoiceValue: number;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  settings: InvoiceTemplateSettings;
}

export interface InvoiceTemplateSettings {
  companyInfo: CompanyInfo;
  taxType: TaxType[keyof TaxType];
  currency: string;
  language: string;
  includeLogo: boolean;
  includeSignature: boolean;
  footerText?: string;
}

export interface CompanyInfo {
  name: string;
  address: string;
  state: string;
  gstin: string;
  stateCode: string;
  email: string;
  website: string;
  logo?: string;
}
