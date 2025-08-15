import { StateCreator } from "zustand";
import { Project } from "@/types";
import { CodeGenerator } from "@/utils/codeGenerator";

export interface ProjectSlice {
  projects: Project[];
  addProject: (
    project: Omit<Project, "id" | "projectCode" | "createdAt" | "updatedAt">
  ) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  getProjectsByClient: (clientId: string) => Project[];
}

export const createProjectSlice: StateCreator<ProjectSlice> = (set, get) => ({
  projects: [],

  addProject: project => {
    const newProject: Project = {
      ...project,
      id: Math.random().toString(36).substr(2, 9),
      projectCode: CodeGenerator.generateProjectCode(get().projects),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set(state => ({ projects: [...state.projects, newProject] }));
  },

  updateProject: (id, project) => {
    set(state => ({
      projects: state.projects.map(p =>
        p.id === id ? { ...p, ...project, updatedAt: new Date() } : p
      ),
    }));
  },

  deleteProject: id => {
    set(state => ({
      projects: state.projects.filter(p => p.id !== id),
    }));
  },

  getProjectById: id => {
    return get().projects.find(project => project.id === id);
  },

  getProjectsByClient: clientId => {
    return get().projects.filter(project => project.clientId === clientId);
  },
});
