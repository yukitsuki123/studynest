import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourseCard } from '../../components/course/CourseCard';
import { EditCourseSheet } from '../../components/course/EditCourseSheet';
import { EmptyState } from '../../components/ui/EmptyState';
import { Txt } from '../../components/ui/Text';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';

export default function CoursesScreen() {
  const t = useTheme();
  const router = useRouter();
  const { state, deleteCourse, archiveCourse } = useApp();
  const courses = state.courses;

  const [query,       setQuery]       = useState('');
  const [showAdd,     setShowAdd]     = useState(false);
  const [showArchived,setShowArchived]= useState(false);
  const [selecting,   setSelecting]   = useState(false);
  const [selected,    setSelected]    = useState<Set<string>>(new Set());

  const active   = useMemo(() => courses.filter(c => !c.archived && c.name.toLowerCase().includes(query.toLowerCase())), [courses, query]);
  const archived = useMemo(() => courses.filter(c => c.archived  && c.name.toLowerCase().includes(query.toLowerCase())), [courses, query]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleBatchDelete = () => {
    if (selected.size === 0) return;
    Alert.alert('Delete Courses', `Delete ${selected.size} course${selected.size > 1 ? 's' : ''}? All data will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        selected.forEach(id => deleteCourse(id));
        setSelected(new Set());
        setSelecting(false);
      }},
    ]);
  };

  const handleBatchArchive = () => {
    if (selected.size === 0) return;
    selected.forEach(id => archiveCourse(id, true));
    setSelected(new Set());
    setSelecting(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Txt variant="display" size={26} style={{ letterSpacing: -0.5 }}>Courses</Txt>
            <Txt variant="bodyItalic" size={12} color="tertiary" style={{ marginTop: 2 }}>{active.length} active{archived.length > 0 ? ` · ${archived.length} archived` : ''}</Txt>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {selecting ? (
              <>
                <TouchableOpacity onPress={() => { setSelecting(false); setSelected(new Set()); }}
                  style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: t.bg2, borderWidth: 1, borderColor: t.border }}>
                  <Txt variant="mono" size={11} color="secondary">Cancel</Txt>
                </TouchableOpacity>
                {selected.size > 0 && (
                  <>
                    <TouchableOpacity onPress={handleBatchArchive}
                      style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: t.accent2 + '22', borderWidth: 1, borderColor: t.accent2 }}>
                      <Txt variant="mono" size={11} style={{ color: t.accent2 }}>Archive {selected.size}</Txt>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleBatchDelete}
                      style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: t.red + '22', borderWidth: 1, borderColor: t.red }}>
                      <Txt variant="mono" size={11} style={{ color: t.red }}>Delete {selected.size}</Txt>
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => setSelecting(true)}
                  style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="check-square" size={16} color={t.text2} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowAdd(true)}
                  style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="plus" size={18} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginHorizontal: 20, marginBottom: 14 }}>
        <Feather name="search" size={16} color={t.text3} />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search courses…" placeholderTextColor={t.text3}
          style={{ flex: 1, fontFamily: 'CrimsonPro_400Regular', fontSize: 15, color: t.text }} />
        {query.length > 0 && <TouchableOpacity onPress={() => setQuery('')}><Feather name="x" size={14} color={t.text3} /></TouchableOpacity>}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        {active.length === 0 && query.length === 0 && <EmptyState icon="🗂️" title="No courses yet" subtitle="Tap + to create your first course." />}
        {active.length === 0 && query.length > 0  && <EmptyState icon="🔍" title="No results" subtitle={`No courses match "${query}"`} />}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {active.map(course => (
            <View key={course.id} style={{ width: '47%', position: 'relative' }}>
              {selecting && (
                <View style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, width: 22, height: 22, borderRadius: 11,
                  backgroundColor: selected.has(course.id) ? t.accent : t.card, borderWidth: 2, borderColor: selected.has(course.id) ? t.accent : t.border,
                  alignItems: 'center', justifyContent: 'center' }}>
                  {selected.has(course.id) && <Feather name="check" size={12} color="#fff" />}
                </View>
              )}
              <CourseCard course={course}
                onPress={() => selecting ? toggleSelect(course.id) : router.push(`/course/${course.id}` as any)} />
            </View>
          ))}
        </View>

        {/* Archived section */}
        {archived.length > 0 && (
          <>
            <TouchableOpacity onPress={() => setShowArchived(v => !v)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 10 }}>
              <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, flex: 1 }}>— Archived ({archived.length})</Txt>
              <Feather name={showArchived ? 'chevron-up' : 'chevron-down'} size={14} color={t.text3} />
            </TouchableOpacity>
            {showArchived && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {archived.map(course => (
                  <View key={course.id} style={{ width: '47%' }}>
                    <TouchableOpacity
                      onLongPress={() => Alert.alert(course.name, 'What would you like to do?', [
                        { text: 'Unarchive', onPress: () => archiveCourse(course.id, false) },
                        { text: 'Delete',   style: 'destructive', onPress: () => deleteCourse(course.id) },
                        { text: 'Cancel',   style: 'cancel' },
                      ])}
                      style={{ backgroundColor: t.card, borderRadius: 14, borderWidth: 1, borderColor: t.border2, borderTopWidth: 3, borderTopColor: course.color + '88', padding: 14, opacity: 0.6 }}>
                      <Txt style={{ fontSize: 22, marginBottom: 6 }}>{course.icon}</Txt>
                      <Txt variant="bodySemi" size={13} style={{ color: t.text3 }}>{course.name}</Txt>
                      <Txt variant="mono" size={9} color="tertiary" style={{ marginTop: 4 }}>Archived</Txt>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <EditCourseSheet visible={showAdd} onClose={() => setShowAdd(false)} />
    </SafeAreaView>
  );
}
