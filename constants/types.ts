export type ThemeName = 'oxford' | 'night' | 'garden' | 'space' | 'cozy' | 'slate' | 'rose' | 'forest' | 'dusk' | 'nebula';
export type FontFamily = 'lora' | 'crimson' | 'spectral' | 'merriweather' | 'eb_garamond' | 'cormorant';
export type Priority = 'low' | 'medium' | 'high';
export type FileType = 'pdf' | 'docx' | 'pptx' | 'note' | 'image' | 'other';
export type Language = 'en' | 'ar';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university?: string;
  major?: string;
  year?: string;
  studentId?: string;
  phone?: string;
  birthDate?: string;
  avatarEmoji: string;
  avatarBg: string;
  avatarUri?: string;
  achievements?: { id: string; title: string; date: number; icon: string }[];
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

export interface StickyNote {
  id: string;
  content: string;
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface DailyIntention {
  id: string;
  date: string; // YYYY-MM-DD
  intention: string;
  mood: 'great' | 'good' | 'okay' | 'tired' | 'stressed';
  createdAt: number;
}

export interface GratitudeEntry {
  id: string;
  courseId: string;
  content: string;
  createdAt: number;
}

export interface StudyStreak {
  lastDate: string; // YYYY-MM-DD
  currentStreak: number;
  longestStreak: number;
}

export interface TrashItem {
  id: string;
  type: 'course' | 'note' | 'todo' | 'file' | 'studySet' | 'link' | 'bookmark' | 'grade' | 'exam' | 'sticky' | 'gratitude';
  title: string;
  data: string; // JSON serialized
  deletedAt: number;
}
