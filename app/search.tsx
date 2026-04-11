import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { FlatList, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../components/ui/Text';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../context/SettingsContext';
import { TranslationKey } from '../constants/translations';

type ResultKind = 'course' | 'file' | 'note' | 'todo' | 'link' | 'exam';
interface SearchResult { id:string; kind:ResultKind; title:string; subtitle:string; icon:string; navTarget:string; }
const KIND_ICONS: Record<ResultKind,string> = { course:'📚',file:'📄',note:'📝',todo:'✅',link:'🔗',exam:'📅' };

const KIND_LABELS: Record<ResultKind, TranslationKey> = {
  course: 'courses',
  file: 'dashboard_content', // closest one if 'file' missing, but I should maybe add 'file'
  note: 'quick_notes',
  todo: 'courses', // should probably add 'task'
  link: 'dashboard_desc',
  exam: 'exam_alerts'
};

export default function SearchScreen() {
  const tColor = useTheme();
  const router = useRouter();
  const { state } = useApp();
  const { t, isRTL } = useSettings();
  const [query, setQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  const results = useMemo<SearchResult[]>(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const cm = Object.fromEntries(state.courses.map(c=>[c.id,c]));
    const out: SearchResult[] = [];
    
    const dateLocale = isRTL ? 'ar-EG' : 'en-GB';

    state.courses.filter(c=>c.name.toLowerCase().includes(q)).forEach(c=>out.push({id:c.id,kind:'course',title:c.name,subtitle:t('courses'),icon:c.icon,navTarget:`/course/${c.id}`}));
    state.files.filter(f=>f.name.toLowerCase().includes(q)).forEach(f=>out.push({id:f.id,kind:'file',title:f.name,subtitle:cm[f.courseId]?.name??'',icon:KIND_ICONS.file,navTarget:`/course/${f.courseId}`}));
    state.notes.filter(n=>n.title.toLowerCase().includes(q)||n.content.toLowerCase().includes(q)).forEach(n=>out.push({id:n.id,kind:'note',title:n.title,subtitle:cm[n.courseId]?.name??'',icon:KIND_ICONS.note,navTarget:`/note/${n.id}`}));
    state.todos.filter(td=>td.title.toLowerCase().includes(q)).forEach(td=>out.push({id:td.id,kind:'todo',title:td.title,subtitle:(td.done ? '✓ ' : '') + ( cm[td.courseId]?.name??''),icon:KIND_ICONS.todo,navTarget:`/course/${td.courseId}`}));
    state.links.filter(l=>l.title.toLowerCase().includes(q)||l.url.toLowerCase().includes(q)).forEach(l=>out.push({id:l.id,kind:'link',title:l.title,subtitle:l.url,icon:KIND_ICONS.link,navTarget:`/course/${l.courseId}`}));
    state.exams.filter(e=>e.title.toLowerCase().includes(q)).forEach(e=>out.push({id:e.id,kind:'exam',title:e.title,subtitle:`${cm[e.courseId]?.name??''} · ${new Date(e.date).toLocaleDateString(dateLocale,{day:'numeric',month:'short'})}`,icon:KIND_ICONS.exam,navTarget:`/course/${e.courseId}`}));
    return out.slice(0, 50);
  }, [query, state, t, isRTL]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: tColor.border }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name={isRTL?"arrow-right":"arrow-left"} size={20} color={tColor.text2} />
        </TouchableOpacity>
        <View style={{ flex: 1, flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 8, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 }}>
          <Feather name="search" size={16} color={tColor.text3} />
          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder={t('search_placeholder')}
            placeholderTextColor={tColor.text3}
            autoFocus
            style={{ flex: 1, fontFamily: 'CrimsonPro_400Regular', fontSize: 15, color: tColor.text, textAlign:isRTL?'right':'left' }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={14} color={tColor.text3} />
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
              ? <>
                  <Txt style={{ fontSize: 44, marginBottom: 14 }}>🔍</Txt>
                  <Txt variant="display" size={18} color="tertiary">{t('search_everything')}</Txt>
                  <Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginTop: 6, textAlign: 'center', paddingHorizontal: 40 }}>
                    {t('search_desc_hint')}
                  </Txt>
                </>
              : <>
                  <Txt style={{ fontSize: 44, marginBottom: 14 }}>😕</Txt>
                  <Txt variant="display" size={18} color="tertiary">{t('no_results_for')} "{query}"</Txt>
                </>
            }
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(item.navTarget as any)} activeOpacity={0.8}
            style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: tColor.border2 }}>
            <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: tColor.bg2, alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontSize: 18 }}>{item.icon}</Txt>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Txt variant="bodySemi" size={14} numberOfLines={1} style={{ textAlign:isRTL?'right':'left' }}>{item.title}</Txt>
              <Txt variant="mono" size={10} color="tertiary" numberOfLines={1} style={{ marginTop: 2, textAlign:isRTL?'right':'left' }}>{item.subtitle}</Txt>
            </View>
            <View style={{ backgroundColor: tColor.bg2, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase' }}>{item.kind}</Txt>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
