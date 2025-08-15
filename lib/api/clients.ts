import { supabase } from "@/lib/supabase";
import { BaseFilters, Client } from "@/types";

export interface CreateClientData {
  name: string;
  company_name?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  contact_person?: string;
  billing_address?: string;
  billing_city?: string;
  billing_state?: string;
  billing_country?: string;
  billing_pincode?: string;
  payment_terms?: string;
  credit_limit?: number;
  status?: string;
  notes?: string;
  tags?: string[];
}

export interface UpdateClientData extends Partial<CreateClientData> {
  // Add client-specific update fields here when needed
}

// Extend this interface for additional client-specific filters
export interface ClientFilters extends BaseFilters {
  search?: string;
  status?: string;
  city?: string;
  state?: string;
  tags?: string[];
}

export class ClientService {
  // Get all clients with optional filtering and pagination
  static async getClients(
    filters: ClientFilters = {},
    page = 1,
    limit = 20
  ): Promise<{
    data: Client[];
    totalPages: number;
    page: number;
    limit: number;
  }> {
    try {
      let query = supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.city) {
        query = query.eq("city", filters.city);
      }

      if (filters.state) {
        query = query.eq("state", filters.state);
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
      console.error("Error fetching clients:", error);
      throw error;
    }
  }

  // Get client by ID
  static async getClientById(id: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching client:", error);
      throw error;
    }
  }

  // Get client by client code
  static async getClientByCode(clientCode: string): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("client_code", clientCode)
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error fetching client by code:", error);
      throw error;
    }
  }

  // Create new client
  static async createClient(
    clientData: CreateClientData
  ): Promise<Client | null> {
    try {
      // Generate client code
      const clientCode = await this.generateClientCode();

      const { data, error } = await supabase
        .from("clients")
        .insert([{ ...clientData, client_code: clientCode }])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  }

  // Update existing client
  static async updateClient(
    id: string,
    clientData: UpdateClientData
  ): Promise<Client | null> {
    try {
      const { data, error } = await supabase
        .from("clients")
        .update(clientData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  }

  // Delete client
  static async deleteClient(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", id);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  }

  // Get client statistics
  static async getClientStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    try {
      const { data, error } = await supabase.from("clients").select("status");

      if (error) {
        throw error;
      }

      const total = data?.length ?? 0;
      const active = data?.filter(c => c.status === "active").length ?? 0;
      const inactive = data?.filter(c => c.status === "inactive").length ?? 0;

      return { total, active, inactive };
    } catch (error) {
      console.error("Error fetching client stats:", error);
      throw error;
    }
  }

  // Get clients by status
  static async getClientsByStatus(status: string): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error fetching clients by status:", error);
      throw error;
    }
  }

  // Get clients by location
  static async getClientsByLocation(
    city?: string,
    state?: string
  ): Promise<Client[]> {
    try {
      let query = supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (city) {
        query = query.eq("city", city);
      }

      if (state) {
        query = query.eq("state", state);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error fetching clients by location:", error);
      throw error;
    }
  }

  // Search clients
  static async searchClients(searchTerm: string): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .or(
          `name.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error searching clients:", error);
      throw error;
    }
  }

  // Generate unique client code
  private static async generateClientCode(): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("client_code")
        .order("client_code", { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      let nextNumber = 1;
      if (data && data.length > 0) {
        const lastCode = data[0]?.client_code;
        if (lastCode) {
          const match = lastCode.match(/CLI-(\d+)/);
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
          }
        }
      }

      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      return `CLI-${year}${month}-${String(nextNumber).padStart(4, "0")}`;
    } catch (error) {
      console.error("Error generating client code:", error);
      // Fallback to timestamp-based code
      return `CLI-${Date.now()}`;
    }
  }

  // Bulk operations
  static async bulkUpdateClients(
    updates: Array<{ id: string; data: UpdateClientData }>
  ): Promise<Client[]> {
    try {
      const { data, error } = await supabase
        .from("clients")
        .upsert(updates.map(({ id, data }) => ({ id, ...data })))
        .select();

      if (error) {
        throw error;
      }
      return data ?? [];
    } catch (error) {
      console.error("Error bulk updating clients:", error);
      throw error;
    }
  }

  static async bulkDeleteClients(ids: string[]): Promise<boolean> {
    try {
      const { error } = await supabase.from("clients").delete().in("id", ids);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Error bulk deleting clients:", error);
      throw error;
    }
  }
}
