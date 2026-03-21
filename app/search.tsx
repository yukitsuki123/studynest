import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../components/ui/Text';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';

type ResultKind = 'course' | 'file' | 'note' | 'todo' | 'link' | 'exam';
interface SearchResult { id:string; kind:ResultKind; title:string; subtitle:string; icon:string; navTarget:string; }
const KIND_ICONS: Record<ResultKind,string> = { course:'📚',file:'📄',note:'📝',todo:'✅',link:'🔗',exam:'📅' };

export default function SearchScreen() {
  const t = useTheme();
  const router = useRouter();
  const { state } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const results = useMemo<SearchResult[]>(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const cm = Object.fromEntries(state.courses.map(c=>[c.id,c]));
    const out: SearchResult[] = [];
    state.courses.filter(c=>c.name.toLowerCase().includes(q)).forEach(c=>out.push({id:c.id,kind:'course',title:c.name,subtitle:'Course',icon:c.icon,navTarget:`/course/${c.id}`}));
    state.files.filter(f=>f.name.toLowerCase().includes(q)).forEach(f=>out.push({id:f.id,kind:'file',title:f.name,subtitle:cm[f.courseId]?.name??'',icon:KIND_ICONS.file,navTarget:`/course/${f.courseId}`}));
    state.notes.filter(n=>n.title.toLowerCase().includes(q)||n.content.toLowerCase().includes(q)).forEach(n=>out.push({id:n.id,kind:'note',title:n.title,subtitle:cm[n.courseId]?.name??'',icon:KIND_ICONS.note,navTarget:`/note/${n.id}`}));
    state.todos.filter(td=>td.title.toLowerCase().includes(q)).forEach(td=>out.push({id:td.id,kind:'todo',title:td.title,subtitle:(td.done?'✓ Done · ':'')+( cm[td.courseId]?.name??''),icon:KIND_ICONS.todo,navTarget:`/course/${td.courseId}`}));
    state.links.filter(l=>l.title.toLowerCase().includes(q)||l.url.toLowerCase().includes(q)).forEach(l=>out.push({id:l.id,kind:'link',title:l.title,subtitle:l.url,icon:KIND_ICONS.link,navTarget:`/course/${l.courseId}`}));
    state.exams.filter(e=>e.title.toLowerCase().includes(q)).forEach(e=>out.push({id:e.id,kind:'exam',title:e.title,subtitle:`${cm[e.courseId]?.name??''} · ${new Date(e.date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}`,icon:KIND_ICONS.exam,navTarget:`/course/${e.courseId}`}));
    return out.slice(0, 50);
  }, [query, state]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: t.border }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={t.text2} />
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}>
          <Feather name="search" size={16} color={t.text3} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search everything…"
            placeholderTextColor={t.text3}
            autoFocus
            style={{ flex: 1, fontFamily: 'CrimsonPro_400Regular', fontSize: 15, color: t.text }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={14} color={t.text3} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={i => i.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            {query.length < 2
              ? <><Txt style={{ fontSize: 44, marginBottom: 14 }}>🔍</Txt><Txt variant="display" size={18} color="tertiary">Search everything</Txt><Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginTop: 6, textAlign: 'center', paddingHorizontal: 40 }}>Courses, notes, files, tasks, links & exams</Txt></>
              : <><Txt style={{ fontSize: 44, marginBottom: 14 }}>😕</Txt><Txt variant="display" size={18} color="tertiary">No results for "{query}"</Txt></>
            }
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(item.navTarget as any)} activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: t.border2 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: t.bg2, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontSize: 18 }}>{item.icon}</Txt>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt variant="bodySemi" size={14} numberOfLines={1}>{item.title}</Txt>
              <Txt variant="mono" size={10} color="tertiary" numberOfLines={1} style={{ marginTop: 2 }}>{item.subtitle}</Txt>
            </View>
            <View style={{ backgroundColor: t.bg2, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase' }}>{item.kind}</Txt>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
