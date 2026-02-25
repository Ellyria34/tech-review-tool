// categories.ts — Single source of truth for thematic categories
//
// Centralizes ALL category-related data (labels, icons, colors).
// Used by: projects (icon, color picker) AND sources (category field).
// DRY principle: one place to update when adding a new category.

import { SourceCategory } from '../models';

// All info for a single category grouped together
export interface CategoryInfo {
  label: string;
  icon: string;
  color: string;
}

// Single source of truth for all categories
// Record<SourceCategory, CategoryInfo> ensures EVERY category
// from the union type has an entry — otherwise compilation error
export const CATEGORIES: Record<SourceCategory, CategoryInfo> = {
  cybersecurity: { label: 'Cybersécurité',    icon: '🛡️', color: '#EF4444' },
  ai:           { label: 'IA & LLMs',         icon: '🤖', color: '#8B5CF6' },
  frontend:     { label: 'Frontend & Design', icon: '🎨', color: '#0EA5E9' },
  backend:      { label: 'Backend & .NET',    icon: '⚡', color: '#6366F1' },
  devops:       { label: 'DevOps',            icon: '☁️', color: '#F59E0B' },
  cloud:        { label: 'Cloud',             icon: '📊', color: '#14B8A6' },
  general:      { label: 'Veille générale',   icon: '🔬', color: '#6B7280' },
};

/** Returns the display label for a category */
export function getCategoryLabel(cat: SourceCategory): string {
  return CATEGORIES[cat].label;
}

/** Returns the hex color for a category */
export function getCategoryColor(cat: SourceCategory): string {
  return CATEGORIES[cat].color;
}

/** Returns the emoji icon for a category */
export function getCategoryIcon(cat: SourceCategory): string {
  return CATEGORIES[cat].icon;
}

// Category list as array (for @for loops in templates)
export const CATEGORY_LIST = Object.entries(CATEGORIES) as [SourceCategory, CategoryInfo][];