import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { CourseFile } from '../../constants/types';
import { FILE_TYPE_COLORS } from '../../constants/icons';
import { Txt } from '../ui/Text';
import { formatBytes, formatRelativeTime } from '../../utils/storage';

interface FileItemProps {
  file: CourseFile;
  onPress: () => void;
  onLongPress?: () => void;
}

const FILE_ICONS: Record<string, string> = {
  pdf: '📄', docx: '📋', pptx: '📊', note: '📝', other: '📁',
};

export function FileItem({ file, onPress, onLongPress }: FileItemProps) {
  const t = useTheme();
  const colors = FILE_TYPE_COLORS[file.type] ?? FILE_TYPE_COLORS.other;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: t.card, borderWidth: 1, borderColor: t.border2, borderRadius: 10, padding: 12, marginHorizontal: 20, marginBottom: 8 }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Txt style={{ fontSize: 16 }}>{FILE_ICONS[file.type]}</Txt>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt variant="bodySemi" size={13} style={{ marginBottom: 2 }} numberOfLines={1}>{file.name}</Txt>
        <Txt variant="mono" size={10} color="tertiary">{file.size ? formatBytes(file.size) + ' · ' : ''}Added {formatRelativeTime(file.addedAt)}</Txt>
      </View>
      <View style={{ backgroundColor: colors.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 }}>
        <Txt variant="mono" size={9} style={{ color: colors.text, textTransform: 'uppercase' }}>{file.type}</Txt>
      </View>
    </TouchableOpacity>
  );
}
