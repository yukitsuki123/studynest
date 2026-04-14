import { ChevronRight, X, CheckCircle, Upload, Download, AlertTriangle, BookOpen, FileText, CheckSquare, BarChart2, Calendar, Target } from 'lucide-react-native';
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
    setStatus(null);
    try {
      const success = await exportBackup(password.trim() || undefined);
      if (success) {
        setStatus(t('backup_saved'));
      } else {
        setStatus(t('export_failed'));
      }
    } catch (e) {
      setStatus(t('export_error').replace('{error}', String(e)));
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    setBusy(true);
    setStatus(null);
    try {
      const success = await importBackup(importPassword.trim() || undefined);
      if (success) {
        setStatus(t('backup_restored_success'));
        setShowImport(false);
        setImportPassword('');
      } else {
        setStatus(t('import_failed'));
      }
    } catch (e: any) {
      if (e.message === 'PASSWORD_REQUIRED') {
        setStatus(t('backup_encrypted_notice'));
      } else if (e.message === 'WRONG_PASSWORD') {
        setStatus(t('wrong_password_notice'));
      } else {
        setStatus(t('import_error').replace('{error}', String(e)));
      }
    } finally {
      setBusy(false);
    }
  };

  const stats = [
    { label: t('courses'),    value: state.courses?.length || 0,   icon: BookOpen },
    { label: t('files'),      value: state.files?.length || 0,     icon: FileText },
    { label: t('tasks'),      value: state.todos?.length || 0,     icon: CheckSquare },
    { label: t('grades'),     value: state.grades?.length || 0,    icon: BarChart2 },
    { label: t('exams'),      value: state.exams?.length || 0,     icon: Calendar },
    { label: t('sets'),       value: state.studySets?.length || 0, icon: Target },
  ] as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
      <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: tColor.border }}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/settings')}
          style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
          {isRTL ? <ChevronRight size={18} color={tColor.text2} /> : <X size={18} color={tColor.text2} />}
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: isRTL?0:12, marginRight: isRTL?12:0 }}>
          <Txt variant="display" size={20} style={{ textAlign:isRTL?'right':'left' }}>{t('backup_restore')}</Txt>
          <Txt variant="mono" size={10} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{t('data_privacy_desc')}</Txt>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {status && (
          <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 10, backgroundColor: tColor.accent + '18', borderRadius: 10, borderWidth: 1, borderColor: tColor.accent + '44', padding: 14, marginBottom: 16 }}>
            <CheckCircle size={16} color={tColor.accent} />
            <Txt variant="body" size={13} color="accent" style={{ flex: 1, textAlign:isRTL?'right':'left' }}>{status}</Txt>
            <TouchableOpacity onPress={() => setStatus(null)}><X size={14} color={tColor.text3} /></TouchableOpacity>
          </View>
        )}

        <View style={{ backgroundColor: tColor.card, borderRadius: 14, borderWidth: 1, borderColor: tColor.border2, padding: 16, marginBottom: 20 }}>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, textAlign:isRTL?'right':'left' }}>{t('current_data')}</Txt>
          <View style={{ flexDirection: isRTL?'row-reverse':'row', flexWrap: 'wrap', gap: 10 }}>
            {stats.map(s => (
              <View key={s.label} style={{ width: '31%', alignItems: 'center', backgroundColor: tColor.bg2, borderRadius: 10, padding: 10 }}>
                <s.icon size={16} color={tColor.accent} style={{ marginBottom: 4 } as any} />
                <Txt variant="display" size={18} color="accent">{s.value}</Txt>
                <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase', marginTop: 2, textAlign:'center' }}>{s.label}</Txt>
              </View>
            ))}
          </View>
        </View>

        <View style={{ backgroundColor: tColor.card, borderRadius: 14, borderWidth: 1, borderColor: tColor.border2, padding: 18, marginBottom: 14 }}>
          <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <View style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: tColor.accent + '22', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={20} color={tColor.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="display" size={16} style={{ textAlign:isRTL?'right':'left' }}>{t('export_backup')}</Txt>
              <Txt variant="bodyItalic" size={12} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{t('export_backup_desc')}</Txt>
            </View>
          </View>

          <View style={{ marginBottom: 16 }}>
             <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, textAlign:isRTL?'right':'left' }}>{t('backup_password_label')} ({t('optional')})</Txt>
             <TextInput 
                value={password} 
                onChangeText={setPassword} 
                placeholder={t('backup_password_placeholder')} 
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
              <Download size={20} color={tColor.accent3} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="display" size={16} style={{ textAlign:isRTL?'right':'left' }}>{t('restore_backup')}</Txt>
              <Txt variant="bodyItalic" size={12} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{t('restore_backup_desc')}</Txt>
            </View>
          </View>
          <Button label={t('pick_json_file')} variant="secondary" onPress={() => setShowImport(true)} />
        </View>

        <View style={{ flexDirection: isRTL?'row-reverse':'row', gap: 10, backgroundColor: tColor.red + '10', borderRadius: 10, borderWidth: 1, borderColor: tColor.red + '33', padding: 14 }}>
          <AlertTriangle size={16} color={tColor.red} style={{ marginTop: 2 }} />
          <Txt variant="bodyItalic" size={12} style={{ color: tColor.red, flex: 1, lineHeight: 18, textAlign:isRTL?'right':'left' }}>
            {t('warning_restore')}
          </Txt>
        </View>
      </ScrollView>

      <BottomSheet visible={showImport} onClose={() => { setShowImport(false); }} title={t('restore_backup')} scrollable>
        <Txt variant="bodyItalic" size={13} color="secondary" style={{ marginBottom: 20, textAlign:isRTL?'right':'left' }}>
          Choose a previously exported .json file to restore your study data. If the backup was password-protected, you will be prompted to enter it.
        </Txt>

        <View style={{ marginBottom: 20 }}>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, textAlign:isRTL?'right':'left' }}>{t('backup_password_label')}</Txt>
          <TextInput 
            value={importPassword} 
            onChangeText={setImportPassword} 
            placeholder={t('enter_password')} 
            placeholderTextColor={tColor.text3}
            secureTextEntry
            style={{ backgroundColor: tColor.bg2, borderRadius: 10, borderWidth: 1, borderColor: tColor.border, padding: 12, color: tColor.text, fontFamily: 'JetBrainsMono_400Regular', fontSize: 13 }}
          />
        </View>

        <Button 
          label={busy ? t('restoring_wait') : t('select_file_and_restore')} 
          onPress={handleImport} 
          disabled={busy}
        />
        
        <TouchableOpacity onPress={() => setShowImport(false)} style={{ marginTop: 14, alignSelf: 'center' }}>
          <Txt variant="bodySemi" size={13} color="tertiary">{t('cancel')}</Txt>
        </TouchableOpacity>
      </BottomSheet>
    </SafeAreaView>
  );
}