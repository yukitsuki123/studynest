import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DeadlineCard } from '../../components/schedule/DeadlineCard';
import { Txt } from '../../components/ui/Text';
import { FILE_TYPE_COLORS } from '../../constants/icons';
import { getDailyQuote } from '../../constants/quotes';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import { formatRelativeTime, daysUntil } from '../../utils/storage';

function getGreeting(name: string, lang: string) {
  const h = new Date().getHours();
  if (lang === 'ar') {
    if (h < 12) return `صباح الخير، ${name}`;
    if (h < 18) return `مساء الخير، ${name}`;
    return `مساء النور، ${name}`;
  }
  if (h < 12) return `Good morning, ${name}`;
  if (h < 18) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export default function HomeScreen() {
  const t = useTheme();
  const { language, isRTL } = useSettings();
  const router = useRouter();
  const { state } = useApp();
  const { courses, files, todos, exams, pomodoroSessions, profile } = state;
  const quote = getDailyQuote();

  const userName = profile?.name?.split(' ')[0] ?? 'Student';
  const now      = Date.now();

  const dueSoon  = useMemo(() => todos.filter(td => !td.done && td.deadline && td.deadline > now && td.deadline < now + 7 * 86400000), [todos]);
  const upcoming = useMemo(() => [...todos].filter(td => !td.done && td.deadline).sort((a, b) => a.deadline! - b.deadline!).slice(0, 3), [todos]);
  const recentFiles = useMemo(() => [...files].sort((a, b) => b.addedAt - a.addedAt).slice(0, 4).map(f => ({
    id: f.id, name: f.name, meta: formatRelativeTime(f.addedAt), type: f.type.toUpperCase(), courseId: f.courseId, fileType: f.type,
  })), [files]);
  const nextExam    = useMemo(() => [...exams].filter(e => e.date >= now).sort((a, b) => a.date - b.date)[0], [exams]);
  const todayPomos  = useMemo(() => pomodoroSessions.filter(s => new Date(s.completedAt).toDateString() === new Date().toDateString()).length, [pomodoroSessions]);
  const totalTodos  = todos.length;
  const doneTodos   = todos.filter(td => td.done).length;
  const overallPct  = totalTodos ? doneTodos / totalTodos : 0;
  const activeCourses = useMemo(() => courses.filter(c => !c.archived), [courses]);

  const today = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
          {/* Avatar */}
          <TouchableOpacity onPress={() => router.push('/idcard' as any)}
            style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: profile?.avatarBg ?? t.accent, alignItems: 'center', justifyContent: 'center', marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }}>
            <Txt style={{ fontSize: 20 }}>{profile?.avatarEmoji ?? '🎓'}</Txt>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 2, textAlign: isRTL ? 'right' : 'left' }}>{today}</Txt>
            <Txt variant="display" size={20} style={{ lineHeight: 26, textAlign: isRTL ? 'right' : 'left' }}>{getGreeting(userName, language)}</Txt>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={() => router.push('/search' as any)}
              style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="search" size={16} color={t.text2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/report' as any)}
              style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="bar-chart-2" size={16} color={t.text2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/pomodoro' as any)}
              style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="clock" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 }}>
          {[
            { label: language === 'ar' ? 'مواد' : 'Courses', value: activeCourses.length, color: t.accent },
            { label: language === 'ar' ? 'قريباً' : 'Due Soon', value: dueSoon.length, color: dueSoon.length > 0 ? t.red : t.accent3 },
            { label: language === 'ar' ? 'بومودورو' : 'Pomodoros', value: todayPomos, color: '#C0622A' },
            { label: language === 'ar' ? 'المهام' : 'Tasks %', value: `${Math.round(overallPct * 100)}%`, color: t.accent2 },
          ].map(s => (
            <View key={s.label} style={{ flex: 1, backgroundColor: t.card, borderRadius: 10, borderWidth: 1, borderColor: t.border2, padding: 10, alignItems: 'center' }}>
              <Txt variant="display" size={18} style={{ color: s.color, lineHeight: 22 }}>{s.value}</Txt>
              <Txt variant="mono" size={8} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2, textAlign: 'center' }}>{s.label}</Txt>
            </View>
          ))}
        </View>

        {/* Next exam banner */}
        {nextExam && (
          <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}
            style={{ marginHorizontal: 20, marginTop: 12, padding: 14, backgroundColor: t.red + '15', borderRadius: 12, borderWidth: 1, borderColor: t.red + '44', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: t.red + '22', alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontSize: 18 }}>📝</Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="mono" size={9} style={{ color: t.red, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>{language === 'ar' ? 'الاختبار القادم' : 'Next Exam'}</Txt>
              <Txt variant="bodySemi" size={14}>{nextExam.title}</Txt>
              <Txt variant="mono" size={10} style={{ color: t.red, marginTop: 2 }}>
                {new Date(nextExam.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · {daysUntil(nextExam.date)}d
              </Txt>
            </View>
            <Feather name="chevron-right" size={16} color={t.red} />
          </TouchableOpacity>
        )}

        {/* Quote */}
        <View style={{ marginHorizontal: 20, marginTop: 12, borderLeftWidth: 3, borderLeftColor: t.accent, paddingLeft: 14, paddingVertical: 10, backgroundColor: t.card, borderRadius: 10 }}>
          <Txt variant="displayItalic" size={13} color="secondary" style={{ lineHeight: 22 }}>"{quote.text}"</Txt>
          <Txt variant="mono" size={10} color="tertiary" style={{ marginTop: 4 }}>— {quote.author}</Txt>
        </View>

        {/* Quick actions */}
        <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 20, marginTop: 18, marginBottom: 10 }}>
          {language === 'ar' ? '— إجراءات سريعة' : '— Quick Actions'}
        </Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
          {/* New Note — opens course picker */}
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/courses')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: t.accent + '22', borderWidth: 1, borderColor: t.accent + '44' }}>
            <Feather name="file-text" size={14} color={t.accent} />
            <Txt variant="mono" size={11} style={{ color: t.accent }}>{language === 'ar' ? 'ملاحظة جديدة' : 'New Note'}</Txt>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/pomodoro' as any)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#C0622A22', borderWidth: 1, borderColor: '#C0622A44' }}>
            <Feather name="clock" size={14} color="#C0622A" />
            <Txt variant="mono" size={11} style={{ color: '#C0622A' }}>{language === 'ar' ? 'مؤقت' : 'Pomodoro'}</Txt>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: t.blue + '22', borderWidth: 1, borderColor: t.blue + '44' }}>
            <Feather name="calendar" size={14} color={t.blue} />
            <Txt variant="mono" size={11} style={{ color: t.blue }}>{language === 'ar' ? 'الجدول' : 'Schedule'}</Txt>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/search' as any)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: t.accent3 + '22', borderWidth: 1, borderColor: t.accent3 + '44' }}>
            <Feather name="search" size={14} color={t.accent3} />
            <Txt variant="mono" size={11} style={{ color: t.accent3 }}>{language === 'ar' ? 'بحث' : 'Search'}</Txt>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/report' as any)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: t.accent2 + '22', borderWidth: 1, borderColor: t.accent2 + '44' }}>
            <Feather name="bar-chart-2" size={14} color={t.accent2} />
            <Txt variant="mono" size={11} style={{ color: t.accent2 }}>{language === 'ar' ? 'تقرير' : 'Report'}</Txt>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/idcard' as any)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: t.accent + '15', borderWidth: 1, borderColor: t.accent + '33' }}>
            <Feather name="credit-card" size={14} color={t.accent} />
            <Txt variant="mono" size={11} style={{ color: t.accent }}>{language === 'ar' ? 'الهوية' : 'ID Card'}</Txt>
          </TouchableOpacity>
        </ScrollView>

        {/* Courses */}
        {activeCourses.length > 0 && (
          <>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 20, marginTop: 18, marginBottom: 10 }}>
              {language === 'ar' ? '— المواد' : '— Courses'}
            </Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
              {activeCourses.map(course => {
                const cTodos = todos.filter(td => td.courseId === course.id);
                const cDone  = cTodos.filter(td => td.done).length;
                const pct    = cTodos.length ? cDone / cTodos.length : 0;
                const cExams = exams.filter(e => e.courseId === course.id && e.date >= now);
                return (
                  <TouchableOpacity key={course.id} onPress={() => router.push(`/course/${course.id}` as any)} activeOpacity={0.8}
                    style={{ width: 138, backgroundColor: t.card, borderRadius: 14, borderWidth: 1, borderColor: t.border2, borderTopWidth: 3, borderTopColor: course.color, padding: 14, gap: 6 }}>
                    <Txt style={{ fontSize: 22 }}>{course.icon}</Txt>
                    <Txt variant="bodySemi" size={13} numberOfLines={1}>{course.name}</Txt>
                    <View style={{ height: 4, backgroundColor: t.bg3, borderRadius: 2, overflow: 'hidden' }}>
                      <View style={{ height: 4, width: `${Math.round(pct * 100)}%`, backgroundColor: course.color, borderRadius: 2 }} />
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Txt variant="mono" size={9} color="tertiary">{Math.round(pct * 100)}%</Txt>
                      {cExams.length > 0 && <Txt variant="mono" size={9} style={{ color: t.red }}>{cExams.length} exam{cExams.length > 1 ? 's' : ''}</Txt>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* Recent activity */}
        <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 20, marginTop: 18, marginBottom: 10 }}>
          {language === 'ar' ? '— النشاط الأخير' : '— Recent Activity'}
        </Txt>
        {recentFiles.length === 0 && <Txt variant="bodyItalic" size={13} color="tertiary" style={{ paddingHorizontal: 20 }}>No recent activity yet.</Txt>}
        {recentFiles.map(item => {
          const course = courses.find(c => c.id === item.courseId);
          const colors = FILE_TYPE_COLORS[item.type.toLowerCase()] ?? FILE_TYPE_COLORS.other;
          return (
            <TouchableOpacity key={item.id} onPress={() => router.push(`/course/${item.courseId}` as any)} activeOpacity={0.8}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: t.card, borderWidth: 1, borderColor: t.border2, borderRadius: 12, padding: 14, marginHorizontal: 20, marginBottom: 8 }}>
              <View style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: course ? course.color + '22' : t.bg2, alignItems: 'center', justifyContent: 'center' }}>
                <Txt style={{ fontSize: 16 }}>{course?.icon ?? '📁'}</Txt>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt variant="bodySemi" size={13} numberOfLines={1}>{item.name}</Txt>
                <Txt variant="mono" size={10} color="tertiary" style={{ marginTop: 2 }}>{item.meta} · {course?.name ?? ''}</Txt>
              </View>
              <View style={{ backgroundColor: colors.bg, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 }}>
                <Txt variant="mono" size={9} style={{ color: colors.text }}>{item.type}</Txt>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Upcoming deadlines */}
        {upcoming.length > 0 && (
          <>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 20, marginTop: 18, marginBottom: 10 }}>
              {language === 'ar' ? '— المواعيد القادمة' : '— Upcoming Deadlines'}
            </Txt>
            {upcoming.map(todo => (
              <DeadlineCard key={todo.id} todo={todo} course={courses.find(c => c.id === todo.courseId)} onPress={() => router.push('/(tabs)/schedule')} />
            ))}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
