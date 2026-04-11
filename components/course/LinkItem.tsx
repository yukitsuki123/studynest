import React from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';
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
  const domain = (() => { try { return new URL(link.url).hostname.replace('www.',''); } catch { return link.url; } })();
  return (
    <TouchableOpacity onPress={() => Linking.openURL(link.url)} onLongPress={onLongPress} activeOpacity={0.8}
      style={{ flexDirection:'row', alignItems:'center', gap:12, backgroundColor:t.card, borderWidth:1, borderColor:t.border2, borderRadius:12, padding:14, marginHorizontal:20, marginBottom:8 }}>
      <View style={{ width:40, height:40, borderRadius:10, backgroundColor:t.blue+'18', alignItems:'center', justifyContent:'center' }}>
        <Feather name="link-2" size={18} color={t.blue} />
      </View>
      <View style={{ flex:1, minWidth:0 }}>
        <Txt variant="bodySemi" size={14} numberOfLines={1}>{link.title}</Txt>
        <Txt variant="mono" size={10} color="tertiary" numberOfLines={1} style={{ marginTop:2 }}>{domain}</Txt>
      </View>
      <Feather name="external-link" size={14} color={t.text3} />
    </TouchableOpacity>
  );
}
