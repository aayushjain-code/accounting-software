import { BaseEntity, StatusOptions, TaxType } from "./common";

export interface Project extends BaseEntity {
  projectCode: string; // PRJ-YYYY-XXXX format
  name: string;
  clientId: string; // Required - Project derives from Client
  description: string;
  startDate: Date;
  status: StatusOptions["active"] | StatusOptions["inactive"] | StatusOptions["completed"] | StatusOptions["onHold"] | StatusOptions["archived"];
  budget: number;
  billingTerms: number; // Days
  billingRate: number; // Per hour rate
  estimatedHours?: number; // Made optional
  personAssigned?: string; // Optional - Person assigned to the project
  gstRate: number;
  gstInclusive: boolean;
  totalCost: number;
  costBreakdown: ProjectCostBreakdown;
}

export interface ProjectCostBreakdown {
  subtotal: number;
  gstAmount: number;
  total: number;
}

export interface ProjectFormData {
  name: string;
  clientId: string;
  description: string;
  startDate: string;
  status: Project["status"];
  budget: string;
  billingTerms: string;
  billingRate: string;
  estimatedHours: string;
  personAssigned: string;
  gstRate: string;
  gstInclusive: boolean;
}

export interface ProjectFilters {
  status?: Project["status"];
  clientId?: string;
  personAssigned?: string;
  startDateRange?: {
    start: Date;
    end: Date;
  };
  budgetRange?: {
    min: number;
    max: number;
  };
  searchQuery?: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBudget: number;
  averageProjectDuration: number;
  projectsByStatus: Record<Project["status"], number>;
}

export interface ProjectTimeline {
  startDate: Date;
  endDate?: Date;
  milestones: ProjectMilestone[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  status: "pending" | "in-progress" | "completed" | "delayed";
  completedDate?: Date;
}
