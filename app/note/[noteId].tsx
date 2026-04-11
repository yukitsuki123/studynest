import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  TextInput, TouchableOpacity, View, Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../../components/ui/Text';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../context/SettingsContext';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

const { documentDirectory, writeAsStringAsync } = FileSystem;

// ─── Simple markdown-to-RN renderer ─────────────────────────────────────────
function renderMarkdown(text: string, tColor: any, isRTL: boolean) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('# '))
      return <Txt key={i} variant="display" size={22} style={{ marginBottom: 8, marginTop: i > 0 ? 16 : 0, lineHeight: 28, textAlign: isRTL?'right':'left' }}>{line.slice(2)}</Txt>;
    if (line.startsWith('## '))
      return <Txt key={i} variant="display" size={17} style={{ marginBottom: 6, marginTop: 14, lineHeight: 22, textAlign: isRTL?'right':'left' }}>{line.slice(3)}</Txt>;
    if (line.startsWith('### '))
      return <Txt key={i} variant="bodySemi" size={15} style={{ marginBottom: 4, marginTop: 10, textAlign: isRTL?'right':'left' }}>{line.slice(4)}</Txt>;
    if (line.startsWith('- ') || line.startsWith('* '))
      return (
        <View key={i} style={{ flexDirection: isRTL?'row-reverse':'row', gap: 8, marginBottom: 4, paddingHorizontal: 8 }}>
          <Txt color="accent" size={15} style={{ marginTop: 1 }}>•</Txt>
          <Txt size={15} color="secondary" style={{ flex: 1, lineHeight: 24, textAlign: isRTL?'right':'left' }}>{renderInline(line.slice(2))}</Txt>
        </View>
      );
    if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\. /)?.[1];
      return (
        <View key={i} style={{ flexDirection: isRTL?'row-reverse':'row', gap: 8, marginBottom: 4, paddingHorizontal: 8 }}>
          <Txt variant="mono" size={13} color="accent" style={{ marginTop: 2, minWidth: 20, textAlign: isRTL?'left':'right' }}>{num}.</Txt>
          <Txt size={15} color="secondary" style={{ flex: 1, lineHeight: 24, textAlign: isRTL?'right':'left' }}>{renderInline(line.slice((num?.length ?? 0) + 2))}</Txt>
        </View>
      );
    }
    if (line.startsWith('> '))
      return (
        <View key={i} style={{ borderLeftWidth: isRTL?0:3, borderRightWidth: isRTL?3:0, borderLeftColor: tColor.accent, borderRightColor: tColor.accent, paddingHorizontal: 12, marginVertical: 4, backgroundColor: tColor.bg2, borderRadius: 4, paddingVertical: 6 }}>
          <Txt key={i} variant="bodyItalic" size={14} color="secondary" style={{ textAlign: isRTL?'right':'left' }}>{line.slice(2)}</Txt>
        </View>
      );
    if (line === '' || line === '---')
      return <View key={i} style={{ height: line === '---' ? 1 : 10, backgroundColor: line === '---' ? tColor.border : 'transparent', marginVertical: line === '---' ? 12 : 0 }} />;
    return (
      <Txt key={i} size={15} color="secondary" style={{ lineHeight: 26, marginBottom: 2, textAlign: isRTL?'right':'left' }}>
        {renderInline(line)}
      </Txt>
    );
  });
}

function renderInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1');
}

// ─── Toolbar buttons ─────────────────────────────────────────────────────────
const TOOLBAR = [
  { label: 'B',  insert: '**bold**' },
  { label: 'I',  insert: '*italic*' },
  { label: 'H1', insert: '# Heading\n' },
  { label: '##', insert: '## Heading\n' },
  { label: '•',  insert: '- Item\n' },
  { label: '1.', insert: '1. Item\n' },
  { label: '>',  insert: '> Quote\n' },
  { label: '`',  insert: '`code`' },
  { label: '—',  insert: '\n---\n' },
];

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function NoteEditorScreen() {
  const tColor = useTheme();
  const router = useRouter();
  const { noteId: noteIdParam } = useLocalSearchParams<{ noteId: string }>();
  const noteId = Array.isArray(noteIdParam) ? noteIdParam[0] : noteIdParam;
  const { state, updateNote, deleteNote } = useApp();
  const { t, isRTL } = useSettings();

  const note = state.notes.find((n) => n.id === noteId) ?? null;
  const [title,    setTitle]    = useState(note?.title   ?? '');
  const [content,  setContent]  = useState(note?.content ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [saved,    setSaved]    = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (saved) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (noteId) { updateNote(noteId, { title, content }); setSaved(true); }
    }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [title, content]);

  const markDirty = useCallback(() => setSaved(false), []);

  const handleSave = () => {
    if (noteId) { updateNote(noteId, { title, content }); setSaved(true); }
  };

  const handleDelete = () => {
    Alert.alert(t('delete_note'), t('delete_note_confirm'), [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteNote(noteId!); router.back(); } },
    ]);
  };

  const handleShare = async () => {
    await Share.share({ title, message: `${title}\n\n${content}` });
  };

  const handleExportPDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: sans-serif; padding: 40px; }
              h1 { color: ${tColor.accent}; text-align: ${isRTL?'right':'left'}; }
              p { font-size: 14px; line-height: 1.6; color: #333; text-align: ${isRTL?'right':'left'}; }
              .markdown { white-space: pre-wrap; }
            </style>
          </head>
          <body dir="${isRTL?'rtl':'ltr'}">
            <h1>${title}</h1>
            <div class="markdown">${content}</div>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      console.error(e);
      Alert.alert('Export Failed', 'Could not generate PDF');
    }
  };

  const handleExportDOCX = async () => {
    try {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><meta charset='utf-8'><title>${title}</title></head>
          <body dir="${isRTL?'rtl':'ltr'}">
            <h1>${title}</h1>
            <p>${content.replace(/\n/g, '<br>')}</p>
          </body>
        </html>
      `;
      const fileUri = `${documentDirectory}${title.replace(/\s+/g, '_')}.doc`;
      await writeAsStringAsync(fileUri, htmlContent, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri);
    } catch (e) {
      console.error(e);
      Alert.alert('Export Failed', 'Could not generate document');
    }
  };

  const showExportMenu = () => {
    Alert.alert(t('share'), '', [
      { text: t('share') + ' (' + t('in_app') + ')', onPress: handleShare },
      { text: t('export_pdf'), onPress: handleExportPDF },
      { text: t('export_docx'), onPress: handleExportDOCX },
      { text: 'Cancel', style: 'cancel' }
    ]);
  };

  const insertSnippet = (snippet: string) => {
    setContent((c) => c + snippet);
    markDirty();
  };

  if (!state.ready) {
    return <SafeAreaView style={{ flex:1, backgroundColor:tColor.bg }} edges={['top']}><View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><Txt variant="bodyItalic" size={14} color="tertiary">Loading…</Txt></View></SafeAreaView>;
  }
  if (!note) {
    return <SafeAreaView style={{ flex:1, backgroundColor:tColor.bg }} edges={['top']}><View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><Txt variant="display" size={18} color="tertiary">Note not found</Txt></View></SafeAreaView>;
  }

  const words = wordCount(content);
  const chars = content.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── Header ── */}
        <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tColor.border, backgroundColor: tColor.card }}>
          <TouchableOpacity onPress={() => { handleSave(); router.back(); }}
            style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: tColor.bg, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={isRTL?"chevron-right":"chevron-left"} size={18} color={tColor.text2} />
          </TouchableOpacity>

          <TextInput
            value={title}
            onChangeText={(v) => { setTitle(v); markDirty(); }}
            style={{ flex: 1, fontFamily: 'Lora_600SemiBold', fontSize: 16, color: tColor.text, textAlign: isRTL?'right':'left' }}
            placeholderTextColor={tColor.text3}
            placeholder={t('note_title') + "…"}
          />

          <TouchableOpacity
            onPress={() => { if (isEditing) handleSave(); setIsEditing((v) => !v); }}
            style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
              backgroundColor: isEditing ? tColor.accent : tColor.bg2, borderWidth: 1, borderColor: isEditing ? tColor.accent : tColor.border }}>
            <Feather name={isEditing ? 'eye' : 'edit-2'} size={13} color={isEditing ? '#fff' : tColor.text2} />
            <Txt variant="mono" size={11} style={{ color: isEditing ? '#fff' : tColor.text2 }}>{isEditing ? t('preview') : t('edit')}</Txt>
          </TouchableOpacity>

          <TouchableOpacity onPress={showExportMenu} style={{ padding: 4 }}>
            <Feather name="share" size={16} color={tColor.text3} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={{ padding: 4 }}>
            <Feather name="trash-2" size={16} color={tColor.text3} />
          </TouchableOpacity>
        </View>

        {/* ── Status bar (word count + save state) ── */}
        <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 5, backgroundColor: tColor.bg2, borderBottomWidth: 1, borderBottomColor: tColor.border }}>
          <Txt variant="mono" size={10} color="tertiary">{words} {t('words')} · {chars} {t('chars')}</Txt>
          <Txt variant="mono" size={10} style={{ color: saved ? tColor.accent3 : tColor.accent2 }}>{saved ? `✓ ${t('last_saved')}` : `● ${t('unsaved')}`}</Txt>
        </View>

        {/* ── Markdown toolbar (edit mode only) ── */}
        {isEditing && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 6, paddingVertical: 8, flexDirection: isRTL?'row-reverse':'row' }}
            style={{ backgroundColor: tColor.card, borderBottomWidth: 1, borderBottomColor: tColor.border, flexGrow: 0 }}
            keyboardShouldPersistTaps="always">
            {TOOLBAR.map((btn) => (
              <TouchableOpacity key={btn.label} onPress={() => insertSnippet(btn.insert)}
                style={{ minWidth: 34, height: 32, borderRadius: 7, borderWidth: 1, borderColor: tColor.border2, backgroundColor: tColor.bg2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}>
                <Txt variant="mono" size={12} color="secondary">{btn.label}</Txt>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Content area ── */}
        {isEditing ? (
          <TextInput
            value={content}
            onChangeText={(v) => { setContent(v); markDirty(); }}
            multiline
            textAlignVertical="top"
            style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, fontFamily: 'CrimsonPro_400Regular', fontSize: 16, color: tColor.text, lineHeight: 28, textAlign: isRTL?'right':'left' }}
            placeholderTextColor={tColor.text3}
            placeholder={t('start_writing')}
            scrollEnabled
            autoFocus
          />
        ) : (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {content.trim()
              ? renderMarkdown(content, tColor, isRTL)
              : (
                <View style={{ alignItems: 'center', paddingTop: 60 }}>
                  <Txt style={{ fontSize: 40, marginBottom: 12 }}>📝</Txt>
                  <Txt variant="display" size={18} color="tertiary">{t('empty_note')}</Txt>
                  <Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginTop: 6 }}>{t('tap_edit_to_start')}</Txt>
                </View>
              )
            }
          </ScrollView>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
