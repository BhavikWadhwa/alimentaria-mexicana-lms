/** Persistent pilot entities. Demo models deliberately remain separate. */
export type AppRole = "ADMIN" | "MANAGER" | "EMPLOYEE";
export type ItemKind = "TRAINING" | "SOP";
export type ItemStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AssignmentStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
export type BlockType =
  "heading" | "text" | "callout" | "image" | "document" | "video";
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  app_role: AppRole;
  job_role_id: string | null;
  active: boolean;
  station: string | null;
  created_at: string;
}
export interface JobRole {
  id: string;
  name: string;
}
export interface LearningItem {
  id: string;
  kind: ItemKind;
  title: string;
  description: string;
  category: string;
  status: ItemStatus;
  restricted: boolean;
  duration_minutes: number | null;
  pass_mark: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}
export interface ContentBlock {
  id: string;
  item_id: string;
  type: BlockType;
  body: string;
  sort_order: number;
}
export interface QuizQuestion {
  id: string;
  item_id: string;
  prompt: string;
  options: string[];
  sort_order: number;
}
export interface Assignment {
  id: string;
  employee_id: string;
  module_id: string;
  module_title: string;
  assigned_by: string;
  assigned_at: string;
  status: AssignmentStatus;
  started_at: string | null;
  content_completed_at: string | null;
  completed_at: string | null;
}
export interface QuizAttempt {
  id: string;
  assignment_id: string;
  employee_id: string;
  score: number;
  passed: boolean;
  attempted_at: string;
}
export interface EditorBlock {
  type: BlockType;
  body: string;
}
export interface EditorQuestion {
  prompt: string;
  options: string[];
  correct_index: number;
}
export interface ItemDraft {
  id: string;
  title: string;
  description: string;
  category: string;
  restricted: boolean;
  duration_minutes: number | null;
  pass_mark: number;
  role_ids: string[];
  blocks: EditorBlock[];
  questions: EditorQuestion[];
}
