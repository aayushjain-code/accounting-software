import { BaseEntity, CompanySize, ClientStatus } from "./common";

export interface Client extends BaseEntity {
  clientCode: string; // CLT-YYYY-XXXX format
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  gstId: string;
  companyAddress: string;
  companyWebsite: string;
  companyLinkedin: string;
  companyOwner: string;
  pocName: string;
  pocEmail: string;
  pocContact: string;
  companyLogo: string;
  poNumber?: string; // Purchase Order Number
  industry: string;
  companySize: CompanySize[keyof CompanySize];
  status: ClientStatus[keyof ClientStatus];
  source: string; // How the client was acquired
  notes: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  gstId: string;
  companyAddress: string;
  companyWebsite: string;
  companyLinkedin: string;
  companyOwner: string;
  pocName: string;
  pocEmail: string;
  pocContact: string;
  companyLogo: string;
  poNumber?: string;
  industry: string;
  companySize: CompanySize[keyof CompanySize];
  status: ClientStatus[keyof ClientStatus];
  source: string;
  notes: string;
}

export interface ClientFilters {
  status?: ClientStatus[keyof ClientStatus];
  companySize?: CompanySize[keyof CompanySize];
  industry?: string;
  source?: string;
  searchQuery?: string;
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  totalRevenue: number;
  averageProjectValue: number;
}
