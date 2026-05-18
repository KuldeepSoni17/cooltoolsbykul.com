import type { SongProject } from "./types";

const STORAGE_KEY = "songwriter_projects";

export function loadProjects(): SongProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SongProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveProjects(projects: SongProject[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function upsertProject(project: SongProject, projects: SongProject[]) {
  const idx = projects.findIndex((p) => p.id === project.id);
  const next = [...projects];
  if (idx === -1) next.unshift(project);
  else next[idx] = project;
  saveProjects(next);
  return next;
}

export function deleteProject(id: string, projects: SongProject[]) {
  const next = projects.filter((p) => p.id !== id);
  saveProjects(next);
  return next;
}
