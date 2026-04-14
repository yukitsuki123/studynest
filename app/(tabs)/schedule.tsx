import React, { useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Calendar, Edit2, X } from 'lucide-react-native';
import { DeadlineCard } from '../../components/schedule/DeadlineCard';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { FAB } from '../../components/ui/FAB';
import { Input } from '../../components/ui/Input';
import { Txt } from '../../components/ui/Text';
import { useApp } from '../../context/AppContext';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../hooks/useTheme';
import { daysUntil } from '../../utils/storage';

// ─── Inline Calendar Picker ───────────────────────────────────────────────────
function CalendarPicker({ selectedDate, onSelect, onClose, todos, exams }: {
  selectedDate: number;
  onSelect: (ts: number) => void;
  onClose: () => void;
  todos: any[];
  exams: any[];
}) {
  const t = useTheme();
  const [viewYear,  setViewYear]  = useState(() => new Date(selectedDate).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date(selectedDate).getMonth());

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay    = new Date(viewYear, viewMonth, 1).getDay();
  const cells       = Array.from({ length: Math.ceil((firstDay + daysInMonth) / 7) * 7 }, (_, i) => {
    const day = i - firstDay + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0);  setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const selectedD = new Date(selectedDate);
  const today     = new Date(); today.setHours(0,0,0,0);

  return (
    <View style={{ backgroundColor: t.card, borderRadius: 18, padding: 18, margin: 20, borderWidth: 1, borderColor: t.border2 }}>
      {/* Month nav */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
        <TouchableOpacity onPress={prevMonth} style={{ padding: 8 }}>
          <ChevronLeft size={20} color={t.text2} />
        </TouchableOpacity>
        <Txt variant="display" size={17} style={{ flex: 1, textAlign: 'center' }}>{MONTHS[viewMonth]} {viewYear}</Txt>
        <TouchableOpacity onPress={nextMonth} style={{ padding: 8 }}>
          <ChevronRight size={20} color={t.text2} />
        </TouchableOpacity>
      </View>

      {/* Day labels */}
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {DAYS.map(d => (
          <Txt key={d} variant="mono" size={9} color="tertiary" style={{ flex: 1, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>{d}</Txt>
        ))}
      </View>

      {/* Grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((day, i) => {
          if (!day) return <View key={i} style={{ width: '14.28%', height: 38 }} />;
          const date      = new Date(viewYear, viewMonth, day); date.setHours(0,0,0,0);
          const ts        = date.getTime();
          const isToday   = date.toDateString() === today.toDateString();
          const isSelected= date.toDateString() === selectedD.toDateString();
          const hasTodo   = todos.some(td => td.deadline && new Date(td.deadline).toDateString() === date.toDateString());
          const hasExam   = exams.some(e => new Date(e.date).toDateString() === date.toDateString());
          return (
            <TouchableOpacity key={i} onPress={() => { onSelect(ts); onClose(); }}
              style={{ width: '14.28%', height: 38, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
                backgroundColor: isSelected ? t.accent : isToday ? t.bg2 : 'transparent',
                borderWidth: isToday && !isSelected ? 1 : 0, borderColor: t.accent }}>
                <Txt variant={isSelected ? 'bodySemi' : 'body'} size={13} style={{ color: isSelected ? '#fff' : isToday ? t.accent : t.text }}>{day}</Txt>
              </View>
              {(hasTodo || hasExam) && !isSelected && (
                <View style={{ flexDirection: 'row', gap: 2, marginTop: 1 }}>
                  {hasTodo && <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: t.accent2 }} />}
                  {hasExam  && <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: t.red }} />}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity onPress={onClose} style={{ marginTop: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: t.bg2, alignItems: 'center' }}>
        <Txt variant="mono" size={11} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>Close</Txt>
      </TouchableOpacity>
    </View>
  );
}

// ─── Horizontal date strip (3 weeks) ─────────────────────────────────────────
function CalStrip({ selectedDate, onSelect, todos, exams, onOpenCalendar }: {
  selectedDate: number; onSelect: (ts: number) => void;
  todos: any[]; exams: any[]; onOpenCalendar: () => void;
}) {
  const t = useTheme();
  const today = new Date(); today.setHours(0,0,0,0);
  const days  = Array.from({ length: 21 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() - 3 + i); return d; });

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingBottom: 4 }}>
        {/* Calendar icon to open full picker */}
        <TouchableOpacity onPress={onOpenCalendar}
          style={{ width: 48, height: 68, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0, backgroundColor: t.card, borderWidth: 1, borderColor: t.border2 }}>
          <Calendar size={18} color={t.accent} />
          <Txt variant="mono" size={8} color="accent" style={{ textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 4 }}>Any</Txt>
        </TouchableOpacity>

        {days.map(d => {
          const isToday    = d.toDateString() === new Date().toDateString();
          const isSelected = new Date(selectedDate).toDateString() === d.toDateString();
          const hasTodo    = todos.some(td => td.deadline && new Date(td.deadline).toDateString() === d.toDateString());
          const hasExam    = exams.some(e => new Date(e.date).toDateString() === d.toDateString());
          return (
            <TouchableOpacity key={d.getTime()} onPress={() => onSelect(d.getTime())}
              style={{ width: 48, height: 68, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 2, flexShrink: 0,
                backgroundColor: isSelected ? t.accent : isToday ? t.bg2 : t.card,
                borderWidth: 1, borderColor: isSelected ? t.accent : hasExam ? t.red : hasTodo ? t.accent2 : t.border2 }}>
              <Txt variant="mono" size={9} style={{ color: isSelected ? '#fff' : t.text3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {d.toLocaleString('en-GB', { weekday: 'short' }).slice(0, 3)}
              </Txt>
              <Txt variant="display" size={18} style={{ color: isSelected ? '#fff' : t.text, lineHeight: 22 }}>{d.getDate()}</Txt>
              <View style={{ flexDirection: 'row', gap: 3 }}>
                {hasTodo && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? '#fff' : t.accent2 }} />}
                {hasExam  && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: isSelected ? '#fff' : t.red }} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Show selected date if outside strip range */}
      {(() => {
        const sel     = new Date(selectedDate); sel.setHours(0,0,0,0);
        const strip0  = new Date(today); strip0.setDate(today.getDate() - 3);
        const strip20 = new Date(today); strip20.setDate(today.getDate() + 17);
        if (sel < strip0 || sel > strip20) {
          return (
            <TouchableOpacity onPress={onOpenCalendar} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, marginTop: 6 }}>
              <Calendar size={12} color={t.accent} />
              <Txt variant="mono" size={10} color="accent">
                Selected: {sel.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </Txt>
              <Edit2 size={10} color={t.accent} />
            </TouchableOpacity>
          );
        }
        return null;
      })()}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ScheduleScreen() {
  const t = useTheme();
  const { language } = useSettings();
  const { state, addTodo, addExam, deleteExam, deleteTodo } = useApp();
  const { courses, todos, exams } = state;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const [selectedDate,   setSelectedDate]   = useState(today.getTime());
  const [showCalendar,   setShowCalendar]   = useState(false);
  const [showAdd,        setShowAdd]        = useState(false);
  const [addMode,        setAddMode]        = useState<'todo'|'exam'>('todo');
  const [newTitle,       setNewTitle]       = useState('');
  const [newCourseId,    setNewCourseId]    = useState('');
  const [examLocation,   setExamLocation]   = useState('');
  const [examNotes,      setExamNotes]      = useState('');
  const [newPriority,    setNewPriority]    = useState<'low'|'medium'|'high'>('medium');

  const withDeadline  = useMemo(() => todos.filter(td => td.deadline).sort((a, b) => a.deadline! - b.deadline!), [todos]);
  const upcoming      = useMemo(() => withDeadline.filter(td => !td.done && td.deadline! >= Date.now()), [withDeadline]);
  const completed     = useMemo(() => withDeadline.filter(td => td.done), [withDeadline]);
  const upcomingExams = useMemo(() => [...exams].filter(e => e.date >= Date.now()).sort((a, b) => a.date - b.date), [exams]);
  const selectedTodos = useMemo(() => withDeadline.filter(td => td.deadline && new Date(td.deadline).toDateString() === new Date(selectedDate).toDateString()), [withDeadline, selectedDate]);
  const selectedExams = useMemo(() => exams.filter(e => new Date(e.date).toDateString() === new Date(selectedDate).toDateString()), [exams, selectedDate]);

  const handleAdd = () => {
    if (!newTitle.trim() || !newCourseId) return;
    const ts = selectedDate + 9 * 3600000;
    if (addMode === 'todo') addTodo(newCourseId, newTitle.trim(), newPriority, ts);
    else addExam(newCourseId, newTitle.trim(), ts, examLocation.trim() || undefined, examNotes.trim() || undefined);
    setNewTitle(''); setNewCourseId(''); setExamLocation(''); setExamNotes(''); setShowAdd(false);
  };

  const selLabel = new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Txt variant="display" size={26} style={{ letterSpacing: -0.5 }}>
          {language === 'ar' ? 'الجدول الزمني' : 'Schedule'}
        </Txt>
        <Txt variant="bodyItalic" size={12} color="tertiary" style={{ marginTop: 2 }}>
          {language === 'ar' ? 'المواعيد والاختبارات' : 'Deadlines, tasks & exams'}
        </Txt>
      </View>

      {/* Month label */}
      <Txt variant="mono" size={11} color="secondary" style={{ paddingHorizontal: 20, marginBottom: 8, letterSpacing: 0.3 }}>
        {new Date(selectedDate).toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
      </Txt>

      {/* Calendar strip + any-date button */}
      <View style={{ marginBottom: 12 }}>
        <CalStrip
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          todos={todos}
          exams={exams}
          onOpenCalendar={() => setShowCalendar(true)}
        />
      </View>

      {/* Full calendar modal */}
      <Modal visible={showCalendar} transparent animationType="fade" onRequestClose={() => setShowCalendar(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center' }} activeOpacity={1} onPress={() => setShowCalendar(false)}>
          <TouchableOpacity activeOpacity={1}>
            <CalendarPicker
              selectedDate={selectedDate}
              onSelect={ts => { setSelectedDate(ts); }}
              onClose={() => setShowCalendar(false)}
              todos={todos}
              exams={exams}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Selected day events */}
        {(selectedTodos.length > 0 || selectedExams.length > 0) && (
          <>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 20, marginBottom: 10 }}>— {selLabel}</Txt>

            {selectedExams.map(e => (
              <TouchableOpacity key={e.id} onLongPress={() => Alert.alert('Delete Exam', `Remove "${e.title}"?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteExam(e.id) }])}
                style={{ flexDirection: 'row', gap: 12, backgroundColor: t.red + '12', borderWidth: 1, borderColor: t.red + '44', borderRadius: 14, padding: 14, marginHorizontal: 20, marginBottom: 8 }}>
                <View style={{ width: 48, alignItems: 'center' }}>
                  <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase' }}>{new Date(e.date).toLocaleString('en-GB', { month: 'short' })}</Txt>
                  <Txt variant="display" size={28} style={{ color: t.red, lineHeight: 32 }}>{new Date(e.date).getDate()}</Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <View style={{ backgroundColor: t.red, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <Txt variant="mono" size={9} style={{ color: '#fff', textTransform: 'uppercase' }}>EXAM</Txt>
                    </View>
                  </View>
                  <Txt variant="bodySemi" size={14}>{e.title}</Txt>
                  {e.location && <Txt variant="mono" size={10} color="tertiary" style={{ marginTop: 2 }}>📍 {e.location}</Txt>}
                  {e.notes && <Txt variant="bodyItalic" size={12} color="tertiary" style={{ marginTop: 4 }}>{e.notes}</Txt>}
                </View>
                <Txt variant="mono" size={10} style={{ color: t.red }}>{daysUntil(e.date)}d</Txt>
              </TouchableOpacity>
            ))}

            {selectedTodos.map(td => (
              <DeadlineCard key={td.id} todo={td} course={courses.find(c => c.id === td.courseId)}
                onPress={() => Alert.alert(td.title, td.done ? 'Completed' : 'Pending', [
                  { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(td.id) },
                  { text: 'Close', style: 'cancel' }
                ])} />
            ))}
          </>
        )}

        {/* Upcoming exams */}
        {upcomingExams.length > 0 && (
          <>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 20, marginTop: 8, marginBottom: 10 }}>— Upcoming Exams</Txt>
            {upcomingExams.map(e => (
              <TouchableOpacity key={e.id} onLongPress={() => Alert.alert('Delete Exam', `Remove "${e.title}"?`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: () => deleteExam(e.id) }])}
                style={{ flexDirection: 'row', gap: 12, backgroundColor: t.card, borderWidth: 1, borderColor: t.border2, borderRadius: 14, padding: 14, marginHorizontal: 20, marginBottom: 8 }}>
                <View style={{ width: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: t.red + '12', borderRadius: 10, paddingVertical: 6 }}>
                  <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase' }}>{new Date(e.date).toLocaleString('en-GB', { month: 'short' })}</Txt>
                  <Txt variant="display" size={24} style={{ color: t.red, lineHeight: 28 }}>{new Date(e.date).getDate()}</Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt variant="bodySemi" size={14}>{e.title}</Txt>
                  <Txt variant="bodyItalic" size={12} color="tertiary">{courses.find(c => c.id === e.courseId)?.icon} {courses.find(c => c.id === e.courseId)?.name}</Txt>
                  {e.location && <Txt variant="mono" size={10} color="tertiary" style={{ marginTop: 3 }}>📍 {e.location}</Txt>}
                  <Txt variant="mono" size={10} style={{ color: daysUntil(e.date) <= 7 ? t.red : t.accent2, marginTop: 4 }}>{daysUntil(e.date)} days left</Txt>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* All tasks with deadline */}
        {upcoming.length > 0 && (
          <>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 20, marginTop: 8, marginBottom: 10 }}>— All Tasks</Txt>
            {upcoming.map(td => <DeadlineCard key={td.id} todo={td} course={courses.find(c => c.id === td.courseId)} />)}
          </>
        )}

        {completed.length > 0 && (
          <>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 20, marginTop: 8, marginBottom: 10 }}>— Completed</Txt>
            {completed.map(td => <DeadlineCard key={td.id} todo={td} course={courses.find(c => c.id === td.courseId)} />)}
          </>
        )}

        {upcoming.length === 0 && completed.length === 0 && upcomingExams.length === 0 && (
          <EmptyState icon={Calendar} title="Nothing scheduled" subtitle="Tap + to add a deadline or exam." />
        )}

      </ScrollView>

      <FAB onPress={() => setShowAdd(true)} />

      {/* Add sheet */}
      <BottomSheet visible={showAdd} onClose={() => setShowAdd(false)} title="Add to Schedule" scrollable>
        {/* Todo / Exam toggle */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {(['todo', 'exam'] as const).map(m => (
            <TouchableOpacity key={m} onPress={() => setAddMode(m)}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
                borderColor: addMode === m ? t.accent : t.border2, backgroundColor: addMode === m ? t.accent + '22' : t.bg2, alignItems: 'center' }}>
              <Txt variant="mono" size={11} style={{ color: addMode === m ? t.accent : t.text3, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {m === 'todo' ? 'Task' : 'Exam'}
              </Txt>
            </TouchableOpacity>
          ))}
        </View>

        <Input label={addMode === 'todo' ? 'Task Title' : 'Exam Title'} value={newTitle} onChangeText={setNewTitle}
          placeholder={addMode === 'todo' ? 'e.g. Submit report' : 'e.g. Calculus Final'} autoFocus />

        {addMode === 'exam' && (
          <>
            <Input label="Location (optional)" value={examLocation} onChangeText={setExamLocation} placeholder="e.g. Hall A, Room 201" />
            <Input label="Notes (optional)" value={examNotes} onChangeText={setExamNotes} placeholder="e.g. Open book" />
          </>
        )}

        {addMode === 'todo' && (
          <>
            <Txt variant="mono" size={11} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Priority</Txt>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {(['low','medium','high'] as const).map(p => (
                <TouchableOpacity key={p} onPress={() => setNewPriority(p)}
                  style={{ flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5,
                    borderColor: newPriority === p ? { low:'#4A7C59', medium:'#C5813A', high:'#C0392B' }[p] : t.border2,
                    backgroundColor: newPriority === p ? { low:'#4A7C5922', medium:'#C5813A22', high:'#C0392B22' }[p] : t.bg2,
                    alignItems: 'center' }}>
                  <Txt variant="bodySemi" size={12} style={{ color: newPriority === p ? { low:'#4A7C59', medium:'#C5813A', high:'#C0392B' }[p] : t.text3, textTransform: 'capitalize' }}>{p}</Txt>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Date display + change */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <View style={{ flex: 1, backgroundColor: t.bg2, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: t.border2 }}>
            <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>Date</Txt>
            <Txt variant="bodySemi" size={14}>
              {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </Txt>
          </View>
          <TouchableOpacity onPress={() => { setShowAdd(false); setTimeout(() => setShowCalendar(true), 300); }}
            style={{ paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, backgroundColor: t.accent + '22', borderWidth: 1, borderColor: t.accent + '44' }}>
            <Txt variant="mono" size={11} color="accent">Change</Txt>
          </TouchableOpacity>
        </View>

        {/* Course picker */}
        <Txt variant="mono" size={11} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>Course</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {courses.filter(c => !c.archived).map(c => (
            <TouchableOpacity key={c.id} onPress={() => setNewCourseId(c.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
                borderWidth: 1.5, borderColor: newCourseId === c.id ? c.color : t.border2,
                backgroundColor: newCourseId === c.id ? c.color + '22' : t.bg2 }}>
              <Txt size={14}>{c.icon}</Txt>
              <Txt variant="body" size={13} style={{ color: newCourseId === c.id ? c.color : t.text2 }}>{c.name}</Txt>
            </TouchableOpacity>
          ))}
        </View>

        <Button label={addMode === 'todo' ? 'Add Task' : 'Add Exam'} onPress={handleAdd} />
      </BottomSheet>
    </SafeAreaView>
  );
}
