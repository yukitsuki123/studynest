import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, ScrollView,
  TextInput, TouchableOpacity, View, Share, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../../components/ui/Text';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';

// ─── Simple markdown-to-RN renderer ─────────────────────────────────────────
function renderMarkdown(text: string, t: any) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (line.startsWith('# '))
      return <Txt key={i} variant="display" size={22} style={{ marginBottom: 8, marginTop: i > 0 ? 16 : 0, lineHeight: 28 }}>{line.slice(2)}</Txt>;
    if (line.startsWith('## '))
      return <Txt key={i} variant="display" size={17} style={{ marginBottom: 6, marginTop: 14, lineHeight: 22 }}>{line.slice(3)}</Txt>;
    if (line.startsWith('### '))
      return <Txt key={i} variant="bodySemi" size={15} style={{ marginBottom: 4, marginTop: 10 }}>{line.slice(4)}</Txt>;
    if (line.startsWith('- ') || line.startsWith('* '))
      return (
        <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 4, paddingLeft: 8 }}>
          <Txt color="accent" size={15} style={{ marginTop: 1 }}>•</Txt>
          <Txt size={15} color="secondary" style={{ flex: 1, lineHeight: 24 }}>{renderInline(line.slice(2), t)}</Txt>
        </View>
      );
    if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)\. /)?.[1];
      return (
        <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 4, paddingLeft: 8 }}>
          <Txt variant="mono" size={13} color="accent" style={{ marginTop: 2, minWidth: 20 }}>{num}.</Txt>
          <Txt size={15} color="secondary" style={{ flex: 1, lineHeight: 24 }}>{renderInline(line.slice((num?.length ?? 0) + 2), t)}</Txt>
        </View>
      );
    }
    if (line.startsWith('> '))
      return (
        <View key={i} style={{ borderLeftWidth: 3, borderLeftColor: t.accent, paddingLeft: 12, marginVertical: 4, backgroundColor: t.bg2, borderRadius: 4, paddingVertical: 6 }}>
          <Txt key={i} variant="bodyItalic" size={14} color="secondary">{line.slice(2)}</Txt>
        </View>
      );
    if (line === '' || line === '---')
      return <View key={i} style={{ height: line === '---' ? 1 : 10, backgroundColor: line === '---' ? t.border : 'transparent', marginVertical: line === '---' ? 12 : 0 }} />;
    return (
      <Txt key={i} size={15} color="secondary" style={{ lineHeight: 26, marginBottom: 2 }}>
        {renderInline(line, t)}
      </Txt>
    );
  });
}

function renderInline(text: string, _t: any): string {
  // Strip markdown markers for inline display (RN can't do mixed styles in one Text easily)
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
  { label: 'H2', insert: '## Heading\n' },
  { label: '•',  insert: '- Item\n' },
  { label: '1.', insert: '1. Item\n' },
  { label: '>',  insert: '> Quote\n' },
  { label: '`',  insert: '`code`' },
  { label: '—',  insert: '\n---\n' },
];

// ─── Word count ───────────────────────────────────────────────────────────────
function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function NoteEditorScreen() {
  const t = useTheme();
  const router = useRouter();
  const { noteId: noteIdParam } = useLocalSearchParams<{ noteId: string }>();
  const noteId = Array.isArray(noteIdParam) ? noteIdParam[0] : noteIdParam;
  const { state, updateNote, deleteNote } = useApp();

  const note = state.notes.find((n) => n.id === noteId) ?? null;
  const [title,    setTitle]    = useState(note?.title   ?? '');
  const [content,  setContent]  = useState(note?.content ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [saved,    setSaved]    = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save 1.5s after last keystroke
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
    Alert.alert('Delete Note', 'Delete this note permanently?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteNote(noteId!); router.back(); } },
    ]);
  };

  const handleShare = async () => {
    await Share.share({ title, message: `${title}\n\n${content}` });
  };

  const insertSnippet = (snippet: string) => {
    setContent((c) => c + snippet);
    markDirty();
  };

  if (!state.ready) {
    return <SafeAreaView style={{ flex:1, backgroundColor:t.bg }} edges={['top']}><View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><Txt variant="bodyItalic" size={14} color="tertiary">Loading…</Txt></View></SafeAreaView>;
  }
  if (!note) {
    return <SafeAreaView style={{ flex:1, backgroundColor:t.bg }} edges={['top']}><View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><Txt variant="display" size={18} color="tertiary">Note not found</Txt></View></SafeAreaView>;
  }

  const words = wordCount(content);
  const chars = content.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.border, backgroundColor: t.card }}>
          <TouchableOpacity onPress={() => { handleSave(); router.back(); }}
            style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: t.bg, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="chevron-left" size={18} color={t.text2} />
          </TouchableOpacity>

          {/* Title — always editable */}
          <TextInput
            value={title}
            onChangeText={(v) => { setTitle(v); markDirty(); }}
            style={{ flex: 1, fontFamily: 'Lora_600SemiBold', fontSize: 16, color: t.text }}
            placeholderTextColor={t.text3}
            placeholder="Note title…"
          />

          {/* View / Edit toggle */}
          <TouchableOpacity
            onPress={() => { if (isEditing) handleSave(); setIsEditing((v) => !v); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
              backgroundColor: isEditing ? t.accent : t.bg2, borderWidth: 1, borderColor: isEditing ? t.accent : t.border }}>
            <Feather name={isEditing ? 'eye' : 'edit-2'} size={13} color={isEditing ? '#fff' : t.text2} />
            <Txt variant="mono" size={11} style={{ color: isEditing ? '#fff' : t.text2 }}>{isEditing ? 'Preview' : 'Edit'}</Txt>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleShare} style={{ padding: 4 }}>
            <Feather name="share" size={16} color={t.text3} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={{ padding: 4 }}>
            <Feather name="trash-2" size={16} color={t.text3} />
          </TouchableOpacity>
        </View>

        {/* ── Status bar (word count + save state) ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 5, backgroundColor: t.bg2, borderBottomWidth: 1, borderBottomColor: t.border }}>
          <Txt variant="mono" size={10} color="tertiary">{words} words · {chars} chars</Txt>
          <Txt variant="mono" size={10} style={{ color: saved ? t.accent3 : t.accent2 }}>{saved ? '✓ Saved' : '● Unsaved'}</Txt>
        </View>

        {/* ── Markdown toolbar (edit mode only) ── */}
        {isEditing && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, gap: 6, paddingVertical: 8 }}
            style={{ backgroundColor: t.card, borderBottomWidth: 1, borderBottomColor: t.border, flexGrow: 0 }}
            keyboardShouldPersistTaps="always">
            {TOOLBAR.map((btn) => (
              <TouchableOpacity key={btn.label} onPress={() => insertSnippet(btn.insert)}
                style={{ minWidth: 34, height: 32, borderRadius: 7, borderWidth: 1, borderColor: t.border2, backgroundColor: t.bg2, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}>
                <Txt variant="mono" size={12} color="secondary">{btn.label}</Txt>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Content area ── */}
        {isEditing ? (
          /* Edit mode — raw textarea */
          <TextInput
            value={content}
            onChangeText={(v) => { setContent(v); markDirty(); }}
            multiline
            textAlignVertical="top"
            style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, fontFamily: 'CrimsonPro_400Regular', fontSize: 16, color: t.text, lineHeight: 28 }}
            placeholderTextColor={t.text3}
            placeholder={"Start writing…\n\nMarkdown is supported:\n# Heading\n**bold**, *italic*\n- list item"}
            scrollEnabled
            autoFocus
          />
        ) : (
          /* View mode — rendered markdown */
          <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
            {content.trim()
              ? renderMarkdown(content, t)
              : (
                <View style={{ alignItems: 'center', paddingTop: 60 }}>
                  <Txt style={{ fontSize: 40, marginBottom: 12 }}>📝</Txt>
                  <Txt variant="display" size={18} color="tertiary">Empty note</Txt>
                  <Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginTop: 6 }}>Tap Edit to start writing</Txt>
                </View>
              )
            }
          </ScrollView>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
