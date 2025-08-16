import { getSupabaseClient } from "@/lib/supabase";
import { BaseFilters } from "@/types";

export interface CreateProjectData {
  name: string;
  description?: string;
  client_id: string;
  start_date?: string;
  end_date?: string;
  status?: "active" | "completed" | "on-hold" | "cancelled";
  budget?: number;
  billing_rate?: number;
  project_manager_id?: string;
  team_members?: string[];
  tags?: string[];
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

// Extend this interface for additional project-specific filters
export interface ProjectFilters extends BaseFilters {
  search?: string;
  status?: string;
  client_id?: string;
  project_manager_id?: string;
  start_date_from?: string;
  start_date_to?: string;
  tags?: string[];
}

export class ProjectService {
  // Get all projects with optional filtering and pagination
  static async getProjects(
    filters: ProjectFilters = {},
    page = 1,
    limit = 20
  ): Promise<{ data: any[]; totalPages: number; page: number; limit: number }> {
    try {
      let query = getSupabaseClient()
        .from("projects")
        .select(
          `
          *,
          client:clients(name, company_name, email),
          project_manager:user_profiles!project_manager_id(first_name, last_name, email)
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.client_id) {
        query = query.eq("client_id", filters.client_id);
      }

      if (filters.project_manager_id) {
        query = query.eq("project_manager_id", filters.project_manager_id);
      }

      if (filters.start_date_from) {
        query = query.gte("start_date", filters.start_date_from);
      }

      if (filters.start_date_to) {
        query = query.lte("start_date", filters.start_date_to);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps("tags", filters.tags);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data ?? [],
        page,
        limit,
        totalPages: Math.ceil((count ?? 0) / limit),
      };
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  }

  // Get project by ID
  static async getProjectById(id: string): Promise<any> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("projects")
        .select(
          `
          *,
          client:clients(*),
          project_manager:user_profiles!project_manager_id(*),
          team_members:user_profiles(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching project:", error);
      throw error;
    }
  }

  // Get project by project code
  static async getProjectByCode(projectCode: string): Promise<any> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("projects")
        .select(
          `
          *,
          client:clients(*),
          project_manager:user_profiles!project_manager_id(*)
        `
        )
        .eq("project_code", projectCode)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching project by code:", error);
      throw error;
    }
  }

  // Create new project
  static async createProject(projectData: CreateProjectData): Promise<any> {
    try {
      // Generate project code
      const projectCode = await this.generateProjectCode();

      const { data, error } = await getSupabaseClient()
        .from("projects")
        .insert([{ ...projectData, project_code: projectCode }])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  }

  // Update existing project
  static async updateProject(
    id: string,
    projectData: UpdateProjectData
  ): Promise<any> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("projects")
        .update(projectData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  }

  // Delete project
  static async deleteProject(id: string): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient().from("projects").delete().eq("id", id);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }

  // Get projects by client
  static async getProjectsByClient(clientId: string): Promise<any[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("projects")
        .select(
          `
          *,
          project_manager:user_profiles!project_manager_id(first_name, last_name, email)
        `
        )
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error fetching projects by client:", error);
      throw error;
    }
  }

  // Get projects by status
  static async getProjectsByStatus(status: string): Promise<any[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("projects")
        .select(
          `
          *,
          client:clients(name, company_name, email)
        `
        )
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error fetching projects by status:", error);
      throw error;
    }
  }

  // Get projects by manager
  static async getProjectsByManager(managerId: string): Promise<any[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("projects")
        .select(
          `
          *,
          client:clients(name, company_name, email)
        `
        )
        .eq("project_manager_id", managerId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error fetching projects by manager:", error);
      throw error;
    }
  }

  // Get active projects
  static async getActiveProjects(): Promise<any[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("projects")
        .select(
          `
          *,
          client:clients(name, company_name, email)
        `
        )
        .eq("status", "active")
        .order("start_date", { ascending: true });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error fetching active projects:", error);
      throw error;
    }
  }

  // Get project statistics
  static async getProjectStats(): Promise<{
    total: number;
    active: number;
    completed: number;
    onHold: number;
    cancelled: number;
    totalBudget: number;
  }> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("projects")
        .select("status, budget");

      if (error) {
        throw error;
      }

      const total = data?.length ?? 0;
      const active = data?.filter((p: any) => p.status === "active").length ?? 0;
      const completed = data?.filter((p: any) => p.status === "completed").length ?? 0;
      const onHold = data?.filter((p: any) => p.status === "on-hold").length ?? 0;
      const cancelled = data?.filter((p: any) => p.status === "cancelled").length ?? 0;
      const totalBudget =
        data?.reduce((sum: number, p: any) => sum + (p.budget ?? 0), 0) ?? 0;

      return {
        total,
        active,
        completed,
        onHold,
        cancelled,
        totalBudget,
      };
    } catch (error) {
      console.error("Error fetching project stats:", error);
      throw error;
    }
  }

  // Search projects
  static async searchProjects(searchTerm: string): Promise<any[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("projects")
        .select(
          `
          *,
          client:clients(name, company_name, email)
        `
        )
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error searching projects:", error);
      throw error;
    }
  }

  // Add team member to project
  static async addTeamMember(projectId: string, userId: string): Promise<any> {
    try {
      const project = await this.getProjectById(projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      const currentMembers = project.team_members ?? [];
      if (currentMembers.includes(userId)) {
        throw new Error("User is already a team member");
      }

      const { data, error } = await getSupabaseClient()
        .from("projects")
        .update({ team_members: [...currentMembers, userId] })
        .eq("id", projectId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error adding team member:", error);
      throw error;
    }
  }

  // Remove team member from project
  static async removeTeamMember(
    projectId: string,
    userId: string
  ): Promise<any> {
    try {
      const project = await this.getProjectById(projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      const currentMembers = project.team_members ?? [];
      const updatedMembers = currentMembers.filter(
        (id: string) => id !== userId
      );

      const { data, error } = await getSupabaseClient()
        .from("projects")
        .update({ team_members: updatedMembers })
        .eq("id", projectId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error removing team member:", error);
      throw error;
    }
  }

  // Update project status
  static async updateProjectStatus(
    projectId: string,
    status: "active" | "completed" | "on-hold" | "cancelled"
  ): Promise<any> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("projects")
        .update({ status })
        .eq("id", projectId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error updating project status:", error);
      throw error;
    }
  }

  // Generate unique project code
  private static async generateProjectCode(): Promise<string> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("projects")
        .select("project_code")
        .order("project_code", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastCode = data[0]?.project_code;
        if (lastCode) {
          const match = lastCode.match(/PRJ-(\d+)/);
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }
      }

      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      return `PRJ-${year}${month}-${String(nextNumber).padStart(4, "0")}`;
    } catch (error) {
      console.error("Error generating project code:", error);
      // Fallback to timestamp-based code
      return `PRJ-${Date.now()}`;
    }
  }

  // Bulk operations
  static async bulkUpdateProjects(
    updates: Array<{ id: string; data: UpdateProjectData }>
  ): Promise<any[]> {
    try {
      const { data, error } = await getSupabaseClient()
        .from("projects")
        .upsert(updates.map(({ id, data }) => ({ id, ...data })))
        .select();

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error bulk updating projects:", error);
      throw error;
    }
  }

  static async bulkDeleteProjects(ids: string[]): Promise<boolean> {
    try {
      const { error } = await getSupabaseClient().from("projects").delete().in("id", ids);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error bulk deleting projects:", error);
      throw error;
    }
  }
}
