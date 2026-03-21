import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db } from './db';

// ─── Backup ───────────────────────────────────────────────────────────────────
export async function exportBackupJSON() {
  const data = {
    exportedAt: new Date().toISOString(),
    courses:    db.getAllSync('SELECT * FROM courses'),
    files:      db.getAllSync('SELECT * FROM course_files'),
    notes:      db.getAllSync('SELECT * FROM notes'),
    todos:      db.getAllSync('SELECT * FROM todos'),
    studySets:  db.getAllSync('SELECT * FROM study_sets'),
    steps:      db.getAllSync('SELECT * FROM study_set_steps'),
    links:      db.getAllSync('SELECT * FROM links'),
    settings:   db.getAllSync('SELECT * FROM settings'),
  };

  const json = JSON.stringify(data, null, 2);
  const path = FileSystem.documentDirectory + `studynest_backup_${Date.now()}.json`;
  await FileSystem.writeAsStringAsync(path, json, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Save StudyNest Backup' });
}

export async function exportBackupCSV() {
  interface TodoRow { id: string; course_id: string; title: string; done: number; priority: string; deadline: number | null; created_at: number }
  interface CourseRow { id: string; name: string }

  const todos   = db.getAllSync<TodoRow>('SELECT * FROM todos');
  const courses = db.getAllSync<CourseRow>('SELECT id, name FROM courses');
  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.name]));

  const rows = [
    ['id', 'course', 'title', 'done', 'priority', 'deadline', 'created_at'],
    ...todos.map((t) => [
      t.id,
      courseMap[t.course_id] ?? t.course_id,
      t.title,
      t.done ? 'yes' : 'no',
      t.priority,
      t.deadline ? new Date(t.deadline).toISOString() : '',
      new Date(t.created_at).toISOString(),
    ]),
  ];

  const csv  = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const path = FileSystem.documentDirectory + `studynest_todos_${Date.now()}.csv`;
  await FileSystem.writeAsStringAsync(path, csv, { encoding: FileSystem.EncodingType.UTF8 });
  await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Save StudyNest CSV' });
}

// ─── Formatters (unchanged, used across screens) ──────────────────────────────
export function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d ago`;
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function formatDeadline(ts: number): string {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function daysUntil(ts: number): number {
  return Math.ceil((ts - Date.now()) / 86400000);
}
