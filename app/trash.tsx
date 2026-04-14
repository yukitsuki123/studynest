import { ChevronRight, ArrowLeft, Trash2, FileText, CheckSquare, Package, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../context/SettingsContext';

export default function TrashScreen() {
  const tColor = useTheme();
  const router = useRouter();
  const { state, restoreFromTrash, deleteFromTrash } = useApp();
  const { t, isRTL } = useSettings();

  const handleRestore = (id: string, title: string) => {
    Alert.alert(t('restore_item'), `${t('restore')} "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: t('restore'), onPress: () => {
        const item = restoreFromTrash(id);
        if (item) {
          Alert.alert('Restored', `"${title}" has been restored.`);
        }
      }}
    ]);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(t('delete_permanently'), t('delete_permanently_confirm'), [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFromTrash(id) }
    ]);
  };

  const handleEmptyTrash = () => {
     if (state.trash.length === 0) return;
     Alert.alert('Empty Trash?', 'All items will be permanently deleted.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Empty', style: 'destructive', onPress: () => {
            state.trash.forEach(t => deleteFromTrash(t.id));
        }}
     ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
      <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: tColor.border }}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}
          style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
          {isRTL ? <ChevronRight size={18} color={tColor.text2} /> : <ArrowLeft size={18} color={tColor.text2} />}
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: isRTL?0:12, marginRight: isRTL?12:0 }}>
           <Txt variant="display" size={20} style={{ textAlign:isRTL?'right':'left' }}>{t('trash_bin')}</Txt>
           <Txt variant="mono" size={10} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{state.trash.length} {t('items')}</Txt>
        </View>
        <TouchableOpacity onPress={handleEmptyTrash} disabled={state.trash.length === 0}
            style={{ opacity: state.trash.length === 0 ? 0.3 : 1 }}>
            <Txt variant="bodySemi" size={13} style={{ color: tColor.red }}>{t('empty')}</Txt>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {state.trash.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Trash2 size={48} color={tColor.border2} style={{ marginBottom: 16 }} />
            <Txt variant="display" size={18} color="tertiary">{t('trash_empty')}</Txt>
            <Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginTop: 8 }}>Deleted items appear here</Txt>
          </View>
        ) : (
          state.trash.map((item) => (
            <View key={item.id} style={{ backgroundColor: tColor.card, borderRadius: 16, borderWidth: 1, borderColor: tColor.border2, padding: 16, marginBottom: 12, flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: tColor.bg2, alignItems: 'center', justifyContent: 'center' }}>
                {item.type === 'note' ? <FileText size={18} color={tColor.text3} /> : (item.type === 'todo' ? <CheckSquare size={18} color={tColor.text3} /> : <Package size={18} color={tColor.text3} />)}
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="bodySemi" size={15} style={{ marginBottom: 2, textAlign:isRTL?'right':'left' }}>{item.title}</Txt>
                <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase', textAlign:isRTL?'right':'left' }}>
                  {item.type} • {new Date(item.deletedAt).toLocaleDateString()}
                </Txt>
              </View>

              <View style={{ flexDirection: isRTL?'row-reverse':'row', gap: 8 }}>
                <TouchableOpacity onPress={() => handleRestore(item.id, item.title)}
                  style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: tColor.accent + '15', alignItems: 'center', justifyContent: 'center' }}>
                  <RefreshCw size={14} color={tColor.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id, item.title)}
                  style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: tColor.red + '15', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={14} color={tColor.red} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
