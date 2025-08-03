import { StateCreator } from "zustand";
import { Client } from "@/types";
import { CodeGenerator } from "@/utils/codeGenerator";

export interface ClientSlice {
  clients: Client[];
  addClient: (client: Omit<Client, "id" | "clientCode" | "createdAt" | "updatedAt">) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  getProjectsByClient: (clientId: string) => Project[];
}

export const createClientSlice: StateCreator<ClientSlice> = (set, get) => ({
  clients: [],
  
  addClient: (client) => {
    const newClient: Client = {
      ...client,
      id: Math.random().toString(36).substr(2, 9),
      clientCode: CodeGenerator.generateClientCode(get().clients),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ clients: [...state.clients, newClient] }));
  },

  updateClient: (id, client) => {
    set((state) => ({
      clients: state.clients.map((c) =>
        c.id === id ? { ...c, ...client, updatedAt: new Date() } : c
      ),
    }));
  },

  deleteClient: (id) => {
    set((state) => ({
      clients: state.clients.filter((c) => c.id !== id),
    }));
  },

  getClientById: (id) => {
    return get().clients.find((client) => client.id === id);
  },

  getProjectsByClient: (clientId) => {
    // This will be implemented when we have access to projects
    return [];
  },
}); 