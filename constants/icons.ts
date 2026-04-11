export const FOLDER_ICONS = [
  'book', 'book-open', 'database', 'bar-chart-2', 'pen-tool', 'monitor',
  'activity', 'thermometer', 'home', 'globe', 'music', 'edit-3',
  'hash', 'file-text', 'search', 'scale', 'smile', 'feather',
  'zap', 'radio', 'box', 'target', 'map-pin', 'folder',
  'gift', 'award', 'award', 'tool', 'key', 'layers', 'edit',
  'briefcase', 'folder', 'folder-plus', 'archive', 'calendar', 'clock', 'watch',
  'hourglass'
];

export const FOLDER_COLORS = [
  '#8B4513', '#2C5F8A', '#4A7C59', '#6B4C8A',
  '#C5813A', '#C0392B', '#1A7A6E', '#7A5A2A',
  '#4A6A8A', '#8A4A6A', '#3A6A4A', '#6A3A8A',
];

export const PRIORITY_COLORS = {
  low:    '#4A7C59',
  medium: '#C5813A',
  high:   '#C0392B',
};

export const FILE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  pdf:   { bg: '#C039201A', text: '#C03920' },
  docx:  { bg: '#4A7C591A', text: '#4A7C59' },
  pptx:  { bg: '#2C5F8A1A', text: '#2C5F8A' },
  note:  { bg: '#8B45131A', text: '#8B4513' },
  image: { bg: '#1A7A6E1A', text: '#1A7A6E' },
  other: { bg: '#7A6E5F1A', text: '#7A6E5F' },
};
