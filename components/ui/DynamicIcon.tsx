import React from 'react';
import * as Lucide from 'lucide-react-native';

export type IconName = 
  | 'book' | 'book-open' | 'database' | 'bar-chart-2' | 'pen-tool' | 'monitor'
  | 'activity' | 'thermometer' | 'home' | 'globe' | 'music' | 'edit-3'
  | 'hash' | 'file-text' | 'search' | 'bar-chart' | 'smile' | 'feather'
  | 'zap' | 'radio' | 'box' | 'target' | 'map-pin' | 'folder'
  | 'gift' | 'award' | 'tool' | 'key' | 'layers' | 'edit'
  | 'briefcase' | 'folder-plus' | 'archive' | 'calendar' | 'clock' | 'watch'
  | 'pie-chart';

const ICON_MAP: Record<string, keyof typeof Lucide> = {
  'book': 'Book',
  'book-open': 'BookOpen',
  'database': 'Database',
  'bar-chart-2': 'BarChart2',
  'pen-tool': 'PenTool',
  'monitor': 'Monitor',
  'activity': 'Activity',
  'thermometer': 'Thermometer',
  'home': 'Home',
  'globe': 'Globe',
  'music': 'Music',
  'edit-3': 'Edit3',
  'hash': 'Hash',
  'file-text': 'FileText',
  'search': 'Search',
  'bar-chart': 'BarChart',
  'smile': 'Smile',
  'feather': 'Feather',
  'zap': 'Zap',
  'radio': 'Radio',
  'box': 'Box',
  'target': 'Target',
  'map-pin': 'MapPin',
  'folder': 'Folder',
  'gift': 'Gift',
  'award': 'Award',
  'tool': 'Hammer', // Lucide usually uses Hammer or Wrench for 'tool'
  'key': 'Key',
  'layers': 'Layers',
  'edit': 'Edit',
  'briefcase': 'Briefcase',
  'folder-plus': 'FolderPlus',
  'archive': 'Archive',
  'calendar': 'Calendar',
  'clock': 'Clock',
  'watch': 'Watch',
  'pie-chart': 'PieChart',
};

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
}

export function DynamicIcon({ name, size = 20, color = '#000' }: DynamicIconProps) {
  const componentName = ICON_MAP[name] || 'Book';
  const IconComponent = (Lucide as any)[componentName];

  if (!IconComponent) {
    return <Lucide.Book size={size} color={color} />;
  }

  return <IconComponent size={size} color={color} />;
}
