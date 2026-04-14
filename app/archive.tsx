import { ChevronRight, ArrowLeft, Archive, RefreshCw, BookOpen } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../components/ui/Text';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../context/SettingsContext';

export default function ArchiveScreen() {
  const tColor = useTheme();
  const router = useRouter();
  const { state, archiveCourse } = useApp();
  const { t, isRTL } = useSettings();

  const archivedCourses = state.courses.filter(c => c.archived);

  const handleUnarchive = (id: string, title: string) => {
    Alert.alert('Restore', `Restore "${title}" to your active courses?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', onPress: () => archiveCourse(id, false) }
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
           <Txt variant="display" size={20} style={{ textAlign:isRTL?'right':'left' }}>{t('archive')}</Txt>
           <Txt variant="mono" size={10} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{archivedCourses.length} items</Txt>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {archivedCourses.length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 100 }}>
            <Archive size={48} color={tColor.border2} style={{ marginBottom: 16 }} />
            <Txt variant="display" size={18} color="tertiary">Archive is Empty</Txt>
            <Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginTop: 8 }}>Courses you hide will appear here</Txt>
          </View>
        ) : (
          archivedCourses.map((course) => (
            <View key={course.id} style={{ backgroundColor: tColor.card, borderRadius: 16, borderWidth: 1, borderColor: tColor.border2, padding: 16, marginBottom: 12, flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: course.color + '22', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={18} color={course.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="bodySemi" size={15} style={{ marginBottom: 2, textAlign:isRTL?'right':'left' }}>{course.name}</Txt>
                <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase', textAlign:isRTL?'right':'left' }}>
                  Archived Course
                </Txt>
              </View>

              <TouchableOpacity onPress={() => handleUnarchive(course.id, course.name)}
                style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: tColor.accent + '15', alignItems: 'center', justifyContent: 'center' }}>
                <RefreshCw size={14} color={tColor.accent} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
