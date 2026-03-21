import React from 'react';
import { TouchableOpacity, View, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Link } from '../../constants/types';
import { Txt } from '../ui/Text';

interface LinkItemProps {
  link: Link;
  onLongPress?: () => void;
}

export function LinkItem({ link, onLongPress }: LinkItemProps) {
  const t = useTheme();
  const host = (() => { try { return new URL(link.url).hostname.replace('www.', ''); } catch { return link.url; } })();

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(link.url)}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: t.card, borderWidth: 1, borderColor: t.border2, borderRadius: 10, padding: 12, marginHorizontal: 20, marginBottom: 8 }}
    >
      <View style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: t.bg2, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name="globe" size={16} color={t.accent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt variant="bodySemi" size={13} numberOfLines={1}>{link.title}</Txt>
        <Txt variant="mono" size={10} color="tertiary" numberOfLines={1}>{host}</Txt>
      </View>
      <Feather name="external-link" size={14} color={t.text3} />
    </TouchableOpacity>
  );
}
