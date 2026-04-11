import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { CourseFile } from '../../constants/types';
import { Txt } from '../ui/Text';

const FILE_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  pdf:   'file-text',
  docx:  'file-text',
  pptx:  'monitor',
  note:  'edit-3',
  image: 'image',
  other: 'file',
};

const FILE_COLORS: Record<string, string> = {
  pdf:   '#C03920',
  docx:  '#4A7C59',
  pptx:  '#2C5F8A',
  note:  '#8B4513',
  image: '#1A7A6E',
  other: '#7A6E5F',
};

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

interface FileItemProps {
  file: CourseFile;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function FileItem({ file, onPress, onLongPress }: FileItemProps) {
  const t = useTheme();
  const icon  = FILE_ICON[file.type]  ?? 'file';
  const color = FILE_COLORS[file.type] ?? t.text3;

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.8}
      style={{ flexDirection:'row', alignItems:'center', gap:12, backgroundColor:t.card, borderWidth:1, borderColor:t.border2, borderRadius:12, padding:14, marginHorizontal:20, marginBottom:8 }}>
      {file.type === 'image' ? (
        <View style={{ width:40, height:40, borderRadius:10, overflow:'hidden' }}>
          <Image source={{ uri: file.uri }} style={{ width:40, height:40 }} contentFit="cover" />
        </View>
      ) : (
        <View style={{ width:40, height:40, borderRadius:10, backgroundColor:color+'18', alignItems:'center', justifyContent:'center' }}>
          <Feather name={icon} size={18} color={color} />
        </View>
      )}
      <View style={{ flex:1, minWidth:0 }}>
        <Txt variant="bodySemi" size={14} numberOfLines={1}>{file.name}</Txt>
        <Txt variant="mono" size={10} color="tertiary" style={{ marginTop:2, textTransform:'uppercase' }}>
          {file.type}{file.size ? ` · ${formatSize(file.size)}` : ''}
        </Txt>
      </View>
      {onLongPress && (
        <TouchableOpacity onPress={onLongPress} style={{ padding:4 }}>
          <Feather name="more-vertical" size={16} color={t.text3} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
