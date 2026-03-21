export type ThemeName = 'oxford' | 'night' | 'garden' | 'space' | 'cozy' | 'slate' | 'rose' | 'forest' | 'dusk';
export type FontFamily = 'lora' | 'crimson' | 'spectral' | 'merriweather' | 'eb_garamond' | 'cormorant';
export type Priority = 'low' | 'medium' | 'high';
export type FileType = 'pdf' | 'docx' | 'pptx' | 'note' | 'other';
export type Language = 'en' | 'ar';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university?: string;
  major?: string;
  year?: string;
  avatarEmoji: string;
  avatarBg: string;
  idCardVisible: boolean;
}

export interface Course {
  id: string;
  name: string;
  icon: string;
  color: string;
  archived: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CourseFile {
  id: string;
  courseId: string;
  name: string;
  uri: string;
  type: FileType;
  size?: number;
  addedAt: number;
}

export interface Note {
  id: string;
  courseId: string;
  title: string;
  content: string;
  template?: 'blank' | 'lecture' | 'meeting' | 'summary';
  updatedAt: number;
}

export interface TodoItem {
  id: string;
  courseId: string;
  title: string;
  done: boolean;
  deadline?: number;
  priority: Priority;
  createdAt: number;
}

export interface StudySetStep {
  id: string;
  label: string;
  done: boolean;
}

export interface StudySet {
  id: string;
  courseId: string;
  title: string;
  steps: StudySetStep[];
  createdAt: number;
}

export interface Link {
  id: string;
  courseId: string;
  title: string;
  url: string;
  addedAt: number;
}

export interface GradeEntry {
  id: string;
  courseId: string;
  label: string;
  score: number;
  maxScore: number;
  weight: number;
  createdAt: number;
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  date: number;
  location?: string;
  notes?: string;
  createdAt: number;
}

export interface PomodoroSession {
  id: string;
  courseId?: string;
  duration: number;
  completedAt: number;
}

export interface Bookmark {
  id: string;
  courseId: string;
  title: string;
  url: string;
  note?: string;
  addedAt: number;
}

export interface ThemeColors {
  bg: string;
  bg2: string;
  bg3: string;
  card: string;
  card2: string;
  text: string;
  text2: string;
  text3: string;
  accent: string;
  accent2: string;
  accent3: string;
  border: string;
  border2: string;
  red: string;
  blue: string;
}
