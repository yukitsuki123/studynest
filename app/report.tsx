import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../components/ui/Text';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now); mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1)); mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6); sun.setHours(23, 59, 59, 999);
  return { start: mon.getTime(), end: sun.getTime() };
}

export default function WeeklyReportScreen() {
  const t = useTheme();
  const router = useRouter();
  const { state } = useApp();
  const { courses, todos, pomodoroSessions, grades, exams } = state;

  const { start, end } = getWeekRange();

  const weekPomos   = useMemo(() => pomodoroSessions.filter(s => s.completedAt >= start && s.completedAt <= end), [pomodoroSessions]);
  const weekMinutes = useMemo(() => weekPomos.reduce((acc, s) => acc + Math.floor(s.duration / 60), 0), [weekPomos]);
  const weekTodos   = useMemo(() => todos.filter(t => t.done && t.createdAt >= start), [todos]);
  const pending     = useMemo(() => todos.filter(t => !t.done && t.deadline && t.deadline >= Date.now()), [todos]);
  const overdue     = useMemo(() => todos.filter(t => !t.done && t.deadline && t.deadline < Date.now()), [todos]);
  const nextExams   = useMemo(() => [...exams].filter(e => e.date >= Date.now()).sort((a, b) => a.date - b.date).slice(0, 3), [exams]);

  const totalTodos  = todos.length;
  const doneTodos   = todos.filter(t => t.done).length;
  const overallPct  = totalTodos ? doneTodos / totalTodos : 0;

  // Per-course stats
  const courseStats = useMemo(() => courses.filter(c => !c.archived).map(course => {
    const cTodos   = todos.filter(t => t.courseId === course.id);
    const cDone    = cTodos.filter(t => t.done).length;
    const cGrades  = grades.filter(g => g.courseId === course.id);
    const gpa      = cGrades.length ? (cGrades.reduce((s, g) => s + (g.score / g.maxScore) * g.weight, 0) / Math.max(cGrades.reduce((s, g) => s + g.weight, 0), 1)) * 100 : null;
    const cPomos   = weekPomos.filter(p => p.courseId === course.id);
    return { course, done: cDone, total: cTodos.length, gpa, pomosThisWeek: cPomos.length };
  }), [courses, todos, grades, weekPomos]);

  const mon = new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const sun = new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="x" size={18} color={t.text2} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Txt variant="display" size={20}>Weekly Report</Txt>
          <Txt variant="mono" size={10} color="tertiary">{mon} — {sun}</Txt>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* Summary cards */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Focus Min', value: weekMinutes, icon: '⏱', color: t.accent },
            { label: 'Sessions', value: weekPomos.length, icon: '🍅', color: '#C0622A' },
            { label: 'Tasks Done', value: weekTodos.length, icon: '✅', color: t.accent3 },
            { label: 'Overdue', value: overdue.length, icon: '⚡', color: overdue.length > 0 ? t.red : t.accent3 },
          ].map(s => (
            <View key={s.label} style={{ flex: 1, backgroundColor: t.card, borderRadius: 12, borderWidth: 1, borderColor: t.border2, padding: 12, alignItems: 'center', gap: 4 }}>
              <Txt style={{ fontSize: 20 }}>{s.icon}</Txt>
              <Txt variant="display" size={22} style={{ color: s.color, lineHeight: 26 }}>{s.value}</Txt>
              <Txt variant="mono" size={8} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center' }}>{s.label}</Txt>
            </View>
          ))}
        </View>

        {/* Overall progress */}
        <View style={{ backgroundColor: t.card, borderRadius: 14, borderWidth: 1, borderColor: t.border2, padding: 18, marginBottom: 16 }}>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Overall Task Progress</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 10 }}>
            <Txt variant="display" size={36} color="accent">{Math.round(overallPct * 100)}%</Txt>
            <View>
              <Txt variant="body" size={13} color="secondary">{doneTodos} of {totalTodos} tasks done</Txt>
              <Txt variant="mono" size={11} style={{ color: pending.length > 0 ? t.accent2 : t.accent3, marginTop: 2 }}>{pending.length} pending · {overdue.length} overdue</Txt>
            </View>
          </View>
          <ProgressBar progress={overallPct} height={8} />
        </View>

        {/* Per-course breakdown */}
        <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>— Course Breakdown</Txt>
        {courseStats.map(({ course, done, total, gpa, pomosThisWeek }) => (
          <View key={course.id} style={{ backgroundColor: t.card, borderRadius: 12, borderWidth: 1, borderLeftWidth: 4, borderColor: t.border2, borderLeftColor: course.color, padding: 14, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Txt style={{ fontSize: 20 }}>{course.icon}</Txt>
              <Txt variant="display" size={15} style={{ flex: 1 }}>{course.name}</Txt>
              {gpa !== null && (
                <View style={{ backgroundColor: (gpa >= 70 ? t.accent3 : gpa >= 50 ? t.accent2 : t.red) + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                  <Txt variant="mono" size={10} style={{ color: gpa >= 70 ? t.accent3 : gpa >= 50 ? t.accent2 : t.red }}>{gpa.toFixed(0)}% avg</Txt>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 8 }}>
              <Txt variant="mono" size={10} color="tertiary">Tasks: {done}/{total}</Txt>
              <Txt variant="mono" size={10} color="tertiary">🍅 {pomosThisWeek} this week</Txt>
            </View>
            {total > 0 && <ProgressBar progress={total ? done / total : 0} color={course.color} height={4} />}
          </View>
        ))}

        {/* Upcoming exams */}
        {nextExams.length > 0 && (
          <>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, marginTop: 8 }}>— Upcoming Exams</Txt>
            {nextExams.map(e => {
              const course = courses.find(c => c.id === e.courseId);
              const days   = Math.ceil((e.date - Date.now()) / 86400000);
              return (
                <View key={e.id} style={{ flexDirection: 'row', gap: 12, backgroundColor: t.card, borderRadius: 12, borderWidth: 1, borderColor: days <= 7 ? t.red + '44' : t.border2, padding: 14, marginBottom: 8 }}>
                  <View style={{ width: 42, height: 42, borderRadius: 10, backgroundColor: t.red + '15', alignItems: 'center', justifyContent: 'center' }}>
                    <Txt style={{ fontSize: 20 }}>📝</Txt>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt variant="bodySemi" size={14}>{e.title}</Txt>
                    <Txt variant="bodyItalic" size={12} color="tertiary">{course?.icon} {course?.name}</Txt>
                    <Txt variant="mono" size={10} style={{ color: days <= 7 ? t.red : t.text3, marginTop: 4 }}>{days}d away · {new Date(e.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</Txt>
                  </View>
                </View>
              );
            })}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
