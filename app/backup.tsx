import { Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/Button';
import { Txt } from '../components/ui/Text';
import { useApp } from '../context/AppContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../hooks/useTheme';

const { StorageAccessFramework, EncodingType, documentDirectory, writeAsStringAsync, readAsStringAsync } = FileSystem;

export default function BackupScreen() {
  const tColor = useTheme();
  const router = useRouter();
  const { state, exportBackup, importBackup } = useApp();
  const { t, isRTL } = useSettings();
  const [status, setStatus] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [password, setPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const json = await exportBackup(password.trim() || undefined);
      const filename = `studynest_backup_${new Date().toISOString().slice(0, 10)}.json`;
      // ... same as before but use 'json' variable ...

      if (Platform.OS === 'android') {
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const fileUri = await StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            filename,
            'application/json'
          );
          await writeAsStringAsync(fileUri, json, { encoding: EncodingType.UTF8 });
          setStatus(t('backup_saved'));
        } else {
          setStatus('Permission denied');
        }
      } else {
        const path = (documentDirectory || '') + filename;
        await writeAsStringAsync(path, json, { encoding: EncodingType.UTF8 });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(path, { UTI: 'public.json' });
          setStatus(t('backup_saved'));
        } else {
          setStatus(t('backup_saved'));
        }
      }
    } catch (e) {
      setStatus('Export failed: ' + String(e));
    } finally {
      setBusy(false);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: 'application/json', 
        copyToCacheDirectory: true 
      });
      if (result.canceled || !result.assets?.length) return;
      const text = await readAsStringAsync(result.assets[0].uri, { 
        encoding: EncodingType.UTF8 
      });
      setImportText(text);
    } catch (e) {
      setStatus(t('read_file_error'));
    }
  };

  const handleImport = () => {
    const cleanText = importText.trim();
    if (!cleanText) return;
    setBusy(true);
    try {
      const success = importBackup(cleanText, importPassword.trim() || undefined);
      if (success) {
        setStatus(t('backup_restored_success'));
        setShowImport(false);
        setImportText('');
        setImportPassword('');
      } else {
        setStatus('Invalid password or corrupted backup file.');
      }
    } catch (e) {
      setStatus(t('invalid_json'));
    } finally {
      setBusy(false);
    }
  };

  const stats = [
    { label: t('courses'),    value: state.courses?.length || 0,   icon: 'book-open' },
    { label: 'Notes',         value: state.notes?.length || 0,     icon: 'file-text' },
    { label: 'Tasks',         value: state.todos?.length || 0,     icon: 'check-square' },
    { label: 'Grades',        value: state.grades?.length || 0,    icon: 'bar-chart-2' },
    { label: 'Exams',         value: state.exams?.length || 0,     icon: 'calendar' },
    { label: 'Study Sets',    value: state.studySets?.length || 0, icon: 'target' },
  ] as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
      <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: tColor.border }}>
        <TouchableOpacity onPress={() => router.back()}
          style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={isRTL?"chevron-right":"x"} size={18} color={tColor.text2} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: isRTL?0:12, marginRight: isRTL?12:0 }}>
          <Txt variant="display" size={20} style={{ textAlign:isRTL?'right':'left' }}>{t('backup_restore')}</Txt>
          <Txt variant="mono" size={10} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{t('data_privacy_desc')}</Txt>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {status && (
          <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 10, backgroundColor: tColor.accent + '18', borderRadius: 10, borderWidth: 1, borderColor: tColor.accent + '44', padding: 14, marginBottom: 16 }}>
            <Feather name="check-circle" size={16} color={tColor.accent} />
            <Txt variant="body" size={13} color="accent" style={{ flex: 1, textAlign:isRTL?'right':'left' }}>{status}</Txt>
            <TouchableOpacity onPress={() => setStatus(null)}><Feather name="x" size={14} color={tColor.text3} /></TouchableOpacity>
          </View>
        )}

        <View style={{ backgroundColor: tColor.card, borderRadius: 14, borderWidth: 1, borderColor: tColor.border2, padding: 16, marginBottom: 20 }}>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, textAlign:isRTL?'right':'left' }}>{t('current_data')}</Txt>
          <View style={{ flexDirection: isRTL?'row-reverse':'row', flexWrap: 'wrap', gap: 10 }}>
            {stats.map(s => (
              <View key={s.label} style={{ width: '31%', alignItems: 'center', backgroundColor: tColor.bg2, borderRadius: 10, padding: 10 }}>
                <Feather name={s.icon as any} size={16} color={tColor.accent} style={{ marginBottom: 4 }} />
                <Txt variant="display" size={18} color="accent">{s.value}</Txt>
                <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase', marginTop: 2, textAlign:'center' }}>{s.label}</Txt>
              </View>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: tColor.card, borderRadius: 14, borderWidth: 1, borderColor: tColor.border2, padding: 18, marginBottom: 14 }}>
          <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: tColor.accent + '22', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="upload" size={20} color={tColor.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="display" size={16} style={{ textAlign:isRTL?'right':'left' }}>{t('export_backup')}</Txt>
              <Txt variant="bodyItalic" size={12} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{t('export_backup_desc')}</Txt>
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
             <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, textAlign:isRTL?'right':'left' }}>Backup Password (Optional)</Txt>
             <TextInput 
                value={password} 
                onChangeText={setPassword} 
                placeholder="Empty for no encryption" 
                placeholderTextColor={tColor.text3}
                secureTextEntry
                style={{ backgroundColor: tColor.bg2, borderRadius: 10, borderWidth: 1, borderColor: tColor.border, padding: 12, color: tColor.text, fontFamily: 'JetBrainsMono_400Regular', fontSize: 13 }}
             />
          </View>
          <Button label={busy ? t('exporting_wait') : t('export_backup')} onPress={handleExport} />
        </View>

        <View style={{ backgroundColor: tColor.card, borderRadius: 14, borderWidth: 1, borderColor: tColor.border2, padding: 18, marginBottom: 14 }}>
          <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: tColor.accent3 + '22', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="download" size={20} color={tColor.accent3} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="display" size={16} style={{ textAlign:isRTL?'right':'left' }}>{t('restore_backup')}</Txt>
              <Txt variant="bodyItalic" size={12} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{t('restore_backup_desc')}</Txt>
            </View>
          </View>
          <Button label={t('pick_json_file')} variant="secondary" onPress={() => setShowImport(true)} />
        </View>

        <View style={{ flexDirection: isRTL?'row-reverse':'row', gap: 10, backgroundColor: tColor.red + '10', borderRadius: 10, borderWidth: 1, borderColor: tColor.red + '33', padding: 14 }}>
          <Feather name="alert-triangle" size={16} color={tColor.red} style={{ marginTop: 2 }} />
          <Txt variant="bodyItalic" size={12} style={{ color: tColor.red, flex: 1, lineHeight: 18, textAlign:isRTL?'right':'left' }}>
            {t('warning_restore')}
          </Txt>
        </View>
      </ScrollView>

      <BottomSheet visible={showImport} onClose={() => { setShowImport(false); setImportText(''); }} title={t('restore_backup')} scrollable>
        <Button label={t('pick_json_file')} variant="secondary" onPress={handlePickFile} style={{ marginBottom: 14 }} />
        <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, textAlign:isRTL?'right':'left' }}>{t('paste_json_directly')}</Txt>
        <TextInput
          value={importText}
          onChangeText={setImportText}
          placeholder='{"exportedAt":"...","courses":[...]}'
          placeholderTextColor={tColor.text3}
          multiline
          numberOfLines={6}
          style={{ backgroundColor: tColor.bg2, borderWidth: 1, borderColor: tColor.border, borderRadius: 10, padding: 12, fontFamily: 'JetBrainsMono_400Regular', fontSize: 11, color: tColor.text, minHeight: 100, textAlignVertical: 'top', marginBottom: 16, textAlign:isRTL?'right':'left' }}
        />
        
        {importText.length > 30 && !importText.trim().startsWith('{') && (
           <View style={{ marginBottom: 16 }}>
              <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, textAlign:isRTL?'right':'left' }}>Enter Password to Decrypt</Txt>
              <TextInput 
                 value={importPassword} 
                 onChangeText={setImportPassword} 
                 placeholder="Password used during export" 
                 placeholderTextColor={tColor.text3}
                 secureTextEntry
                 style={{ backgroundColor: tColor.bg3, borderRadius: 10, borderWidth: 1.5, borderColor: tColor.accent, padding: 12, color: tColor.text, fontFamily: 'JetBrainsMono_400Regular', fontSize: 13 }}
              />
           </View>
        )}

        <Button label={busy ? t('restoring_wait') : t('restore_backup')} onPress={handleImport} />
      </BottomSheet>
    </SafeAreaView>
  );
}