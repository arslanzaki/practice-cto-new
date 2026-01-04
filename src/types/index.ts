export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  created_at: Date;
  updated_at: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  user_id: string;
  workspace_id: string | null;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface NoteWithTags extends Note {
  tags: string[];
}

export interface Tag {
  id: string;
  name: string;
  user_id: string;
  created_at: Date;
}

export interface NoteTag {
  note_id: string;
  tag_id: string;
  created_at: Date;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface SharedNote {
  id: string;
  note_id: string;
  shared_with_user_id: string;
  shared_by_user_id: string;
  permission: 'read' | 'edit';
  created_at: Date;
}

export interface SharedNoteWithDetails extends SharedNote {
  note_title: string;
  note_content: string;
  shared_by_username: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  tags?: string[];
  startDate?: string;
  endDate?: string;
  workspaceId?: string;
  query?: string;
}

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  workspace_id?: string;
  tags?: string[];
}

export interface UpdateNoteDto {
  title?: string;
  content?: string;
  workspace_id?: string;
}

export interface CreateWorkspaceDto {
  name: string;
  description?: string;
}

export interface ShareNoteDto {
  user_id: string;
  permission: 'read' | 'edit';
}
