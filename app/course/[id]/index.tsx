import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EditCourseSheet } from '../../../components/course/EditCourseSheet';
import { FileItem } from '../../../components/course/FileItem';
import { LinkItem } from '../../../components/course/LinkItem';
import { MilestoneCard } from '../../../components/course/MilestoneCard';
import { TodoItem } from '../../../components/course/TodoItem';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { FAB } from '../../../components/ui/FAB';
import { Input } from '../../../components/ui/Input';
import { Txt } from '../../../components/ui/Text';
import { PRIORITY_COLORS } from '../../../constants/icons';
import { GradeEntry, StudySet, TodoItem as TodoType } from '../../../constants/types';
import { useApp } from '../../../context/AppContext';
import { useTheme } from '../../../hooks/useTheme';
import { openFileExternal, pickFile } from '../../../utils/fileHelper';

type InnerTab = 'files' | 'todo' | 'links' | 'sets' | 'grades' | 'bookmarks';

function calcGPA(grades: GradeEntry[]): number {
  if (!grades.length) return 0;
  const totalWeight = grades.reduce((s, g) => s + g.weight, 0);
  if (!totalWeight) return 0;
  const weighted = grades.reduce((s, g) => s + (g.score / g.maxScore) * g.weight, 0);
  return (weighted / totalWeight) * 100;
}

export default function CourseDetailScreen() {
  const t = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state, addFile, addTodo, updateTodo, deleteTodo, addLink, deleteLink,
          addStudySet, updateStudySet, deleteStudySet, addNote, deleteFile,
          addGrade, deleteGrade, addBookmark, deleteBookmark } = useApp();
  const id = params?.id;
  const courseId = Array.isArray(id) ? id[0] : id;

  if (!courseId) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Txt>No course ID provided</Txt>
      </SafeAreaView>
    );
  }

  const course  = useMemo(() => state.courses.find(c => c.id === courseId) ?? null, [state.courses, courseId]);
  const files   = useMemo(() => course ? state.files.filter(f => f.courseId === courseId) : [], [state.files, courseId, course]);
  const todos   = useMemo(() => course ? state.todos.filter(td => td.courseId === courseId) : [], [state.todos, courseId, course]);
  const links   = useMemo(() => course ? state.links.filter(l => l.courseId === courseId) : [], [state.links, courseId, course]);
  const sets    = useMemo(() => course ? state.studySets.filter(ss => ss.courseId === courseId) : [], [state.studySets, courseId, course]);
  const grades    = useMemo(() => course ? state.grades.filter(g => g.courseId === courseId) : [], [state.grades, courseId, course]);
  const bookmarks = useMemo(() => course ? state.bookmarks.filter(b => b.courseId === courseId) : [], [state.bookmarks, courseId, course]);

  const [activeTab, setActiveTab] = useState<InnerTab>('files');
  const [showEdit, setShowEdit]   = useState(false);
  const [showAddTodo,  setShowAddTodo]  = useState(false);
  const [todoTitle,    setTodoTitle]    = useState('');
  const [todoPriority, setTodoPriority] = useState<'low'|'medium'|'high'>('medium');
  const [todoDeadline,    setTodoDeadline]    = useState<number | undefined>(undefined);
  const [showDeadlinePick,setShowDeadlinePick]= useState(false);
  const [deadlineYear,    setDeadlineYear]    = useState('');
  const [deadlineMonth,   setDeadlineMonth]   = useState('');
  const [deadlineDay,     setDeadlineDay]     = useState('');
  const [editTodo,     setEditTodo]     = useState<TodoType | null>(null);
  const [editTodoTitle,setEditTodoTitle]= useState('');
  const [editTodoPri,  setEditTodoPri]  = useState<'low'|'medium'|'high'>('medium');
  const [showAddLink, setShowAddLink] = useState(false);
  const [linkTitle,   setLinkTitle]   = useState('');
  const [linkUrl,     setLinkUrl]     = useState('');
  const [showAddSet,  setShowAddSet]  = useState(false);
  const [editSet,     setEditSet]     = useState<StudySet | null>(null);
  const [setTitle,    setSetTitle]    = useState('');
  const [setSteps,    setSetSteps]    = useState('');
  const [showAddGrade,setShowAddGrade]= useState(false);
  const [gradeLabel,  setGradeLabel]  = useState('');
  const [gradeScore,  setGradeScore]  = useState('');
  const [gradeMax,    setGradeMax]    = useState('100');
  const [gradeWeight, setGradeWeight] = useState('1');
  const [showAddBk,   setShowAddBk]   = useState(false);
  const [bkTitle,     setBkTitle]     = useState('');
  const [bkUrl,       setBkUrl]       = useState('');
  const [bkNote,      setBkNote]      = useState('');

  if (!state.ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Txt variant="bodyItalic" size={14} color="tertiary">Loading…</Txt>
        </View>
      </SafeAreaView>
    );
  }
  if (!course) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="chevron-left" size={18} color={t.text2} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontSize: 40, marginBottom: 12 }}>😕</Txt>
          <Txt variant="display" size={18} color="tertiary">Course not found</Txt>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Txt variant="mono" size={12} color="accent">← Go back</Txt>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tabs: { key: InnerTab; label: string; count: number }[] = [
    { key: 'files',     label: 'Files',   count: files.length },
    { key: 'todo',      label: 'To-Do',   count: todos.filter(t => !t.done).length },
    { key: 'links',     label: 'Links',   count: links.length },
    { key: 'sets',      label: 'Sets',    count: sets.length },
    { key: 'grades',    label: 'Grades',  count: grades.length },
    { key: 'bookmarks', label: 'Saved',   count: bookmarks.length },
  ];

  const handleFAB = async () => {
    if      (activeTab === 'files')  { try { const f = await pickFile(); if(f) addFile({courseId:courseId!,name:f.name,uri:f.uri,type:f.type,size:f.size}); } catch(e:any){Alert.alert('Error',e?.message??'Could not pick file');} }
    else if (activeTab === 'todo')   { setTodoTitle(''); setTodoPriority('medium'); setTodoDeadline(undefined); setDeadlineYear(''); setDeadlineMonth(''); setDeadlineDay(''); setShowAddTodo(true); }
    else if (activeTab === 'links')  { setLinkTitle(''); setLinkUrl(''); setShowAddLink(true); }
    else if (activeTab === 'sets')   { setSetTitle(''); setSetSteps(''); setEditSet(null); setShowAddSet(true); }
    else if (activeTab === 'grades')    setShowAddGrade(true);
    else if (activeTab === 'bookmarks') { setBkTitle(''); setBkUrl(''); setBkNote(''); setShowAddBk(true); }
  };

  const handleAddTodo = () => {
    if (!todoTitle.trim()) return;
    addTodo(courseId!, todoTitle.trim(), todoPriority, todoDeadline);
    setShowAddTodo(false);
  };
  const applyDeadline = () => {
    const y = parseInt(deadlineYear), m = parseInt(deadlineMonth)-1, d = parseInt(deadlineDay);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d) && y > 2000 && m >= 0 && m <= 11 && d >= 1 && d <= 31) {
      const date = new Date(y, m, d); date.setHours(23, 59, 0, 0);
      setTodoDeadline(date.getTime());
      setShowDeadlinePick(false);
    }
  };
  const clearDeadline = () => { setTodoDeadline(undefined); setDeadlineYear(''); setDeadlineMonth(''); setDeadlineDay(''); };
  const openEditTodo = (todo: TodoType) => { setEditTodo(todo); setEditTodoTitle(todo.title); setEditTodoPri(todo.priority); };
  const handleSaveTodo = () => {
    if (!editTodo || !editTodoTitle.trim()) return;
    updateTodo(editTodo.id, { title: editTodoTitle.trim(), priority: editTodoPri });
    setEditTodo(null);
  };
  const handleAddLink = () => {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    addLink(courseId!, linkTitle.trim(), linkUrl.startsWith('http') ? linkUrl.trim() : 'https://'+linkUrl.trim());
    setShowAddLink(false);
  };
  const openEditSet = (set: StudySet) => { setEditSet(set); setSetTitle(set.title); setSetSteps(set.steps.map(s=>s.label).join('\n')); setShowAddSet(true); };
  const handleSaveSet = () => {
    if (!setTitle.trim() || !setSteps.trim()) return;
    const steps = setSteps.split('\n').map(s=>s.trim()).filter(Boolean);
    if (!steps.length) return;
    if (editSet) updateStudySet(editSet.id, setTitle.trim(), steps);
    else         addStudySet(courseId!, setTitle.trim(), steps);
    setShowAddSet(false); setEditSet(null);
  };
  const handleAddGrade = () => {
    const score = parseFloat(gradeScore), max = parseFloat(gradeMax), weight = parseFloat(gradeWeight);
    if (!gradeLabel.trim() || isNaN(score) || isNaN(max) || max <= 0) return;
    addGrade(courseId!, gradeLabel.trim(), score, max, isNaN(weight) ? 1 : weight);
    setGradeLabel(''); setGradeScore(''); setGradeMax('100'); setGradeWeight('1');
    setShowAddGrade(false);
  };
  const handleAddBookmark = () => {
    if (!bkTitle.trim() || !bkUrl.trim()) return;
    addBookmark(courseId!, bkTitle.trim(), bkUrl.startsWith('http') ? bkUrl.trim() : 'https://'+bkUrl.trim(), bkNote.trim()||undefined);
    setBkTitle(''); setBkUrl(''); setBkNote('');
    setShowAddBk(false);
  };

  const gpa = calcGPA(grades);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <View style={{ flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:20,paddingVertical:14,backgroundColor:t.bg2,borderBottomWidth:1,borderBottomColor:t.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width:34,height:34,borderRadius:9,backgroundColor:t.card,borderWidth:1,borderColor:t.border,alignItems:'center',justifyContent:'center' }}>
          <Feather name="chevron-left" size={18} color={t.text2} />
        </TouchableOpacity>
        <View style={{ flex:1 }}>
          <Txt style={{ fontSize:28 }}>{course.icon}</Txt>
          <Txt variant="display" size={18}>{course.name}</Txt>
          <Txt variant="mono" size={10} color="tertiary">{files.length} files · {todos.filter(td=>!td.done).length} tasks</Txt>
        </View>
        <TouchableOpacity onPress={() => setShowEdit(true)} style={{ padding:4 }}>
          <Feather name="edit-2" size={18} color={t.text3} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor:t.card,borderBottomWidth:1,borderBottomColor:t.border,flexGrow:0 }} contentContainerStyle={{ paddingHorizontal:4 }}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)}
            style={{ paddingHorizontal:14,paddingVertical:12,borderBottomWidth:2,borderBottomColor:activeTab===tab.key?t.accent:'transparent' }}>
            <Txt variant="mono" size={10} style={{ textTransform:'uppercase',letterSpacing:0.6,color:activeTab===tab.key?t.accent:t.text3 }}>{tab.label}{tab.count>0?` (${tab.count})`:''}</Txt>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop:12,paddingBottom:100 }}>
        {activeTab==='files' && (<>
          <View style={{ flexDirection:'row',justifyContent:'space-between',paddingHorizontal:20,marginBottom:10 }}>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1 }}>{files.length} Files</Txt>
            <TouchableOpacity onPress={() => { const n=addNote(courseId!,'New Note'); router.push(`/note/${n.id}` as any); }}>
              <Txt variant="mono" size={10} color="accent">+ New Note</Txt>
            </TouchableOpacity>
          </View>
          {files.length===0 && <EmptyState icon="📁" title="No files yet" subtitle="Tap + to add a PDF, DOCX, PPTX or create a note." />}
          {files.map(f => (
            <FileItem key={f.id} file={f}
              onPress={() => f.type==='note' ? router.push(`/note/${f.uri}` as any) : openFileExternal(f.uri, f.type)}
              onLongPress={() => Alert.alert('Delete File',`Remove "${f.name}"?`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>deleteFile(f.id)}])} />
          ))}
        </>)}

        {activeTab==='todo' && (<>
          <View style={{ flexDirection:'row',justifyContent:'space-between',paddingHorizontal:20,marginBottom:10 }}>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1 }}>{todos.length} Tasks</Txt>
            <Txt variant="mono" size={10} color="accent3">{todos.filter(t=>t.done).length} done</Txt>
          </View>
          {todos.length===0 && <EmptyState icon="✅" title="No tasks yet" subtitle="Tap + to add a task." />}
          {todos.filter(td=>!td.done).map(todo => (
            <TodoItem key={todo.id} todo={todo} onPress={() => openEditTodo(todo)}
              onLongPress={() => Alert.alert('Task',todo.title,[{text:'Edit',onPress:()=>openEditTodo(todo)},{text:'Delete',style:'destructive',onPress:()=>deleteTodo(todo.id)},{text:'Cancel',style:'cancel'}])} />
          ))}
          {todos.filter(td=>td.done).length>0 && (<>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,paddingHorizontal:20,marginTop:12,marginBottom:8 }}>— Completed</Txt>
            {todos.filter(td=>td.done).map(todo => <TodoItem key={todo.id} todo={todo} onLongPress={() => deleteTodo(todo.id)} />)}
          </>)}
        </>)}

        {activeTab==='links' && (<>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,paddingHorizontal:20,marginBottom:10 }}>{links.length} Links</Txt>
          {links.length===0 && <EmptyState icon="🔗" title="No links yet" subtitle="Tap + to save a URL." />}
          {links.map(l => (
            <LinkItem key={l.id} link={l} onLongPress={() => Alert.alert('Delete Link',`Remove "${l.title}"?`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>deleteLink(l.id)}])} />
          ))}
        </>)}

        {activeTab==='sets' && (<>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,paddingHorizontal:20,marginBottom:10 }}>{sets.length} Study Sets</Txt>
          {sets.length===0 && <EmptyState icon="🎯" title="No study sets yet" subtitle="Tap + to create a milestone checklist." />}
          {sets.map(set => (
            <MilestoneCard key={set.id} set={set}
              onEdit={() => openEditSet(set)}
              onDelete={() => Alert.alert('Delete Set',`Delete "${set.title}"?`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>deleteStudySet(set.id)}])} />
          ))}
        </>)}

        {activeTab==='grades' && (<>
          {grades.length > 0 && (
            <View style={{ margin:20,padding:16,backgroundColor:t.card,borderRadius:14,borderWidth:1,borderColor:t.border2,marginBottom:12 }}>
              <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,marginBottom:6 }}>Overall Average</Txt>
              <View style={{ flexDirection:'row',alignItems:'flex-end',gap:8 }}>
                <Txt variant="display" size={40} style={{ color:gpa>=70?t.accent3:gpa>=50?t.accent2:t.red,lineHeight:46 }}>{gpa.toFixed(1)}%</Txt>
                <Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginBottom:6 }}>{grades.length} entries</Txt>
              </View>
              <View style={{ height:6,backgroundColor:t.bg3,borderRadius:3,marginTop:8,overflow:'hidden' }}>
                <View style={{ height:6,borderRadius:3,width:`${Math.min(gpa,100)}%`,backgroundColor:gpa>=70?t.accent3:gpa>=50?t.accent2:t.red }} />
              </View>
            </View>
          )}
          {grades.length===0 && <EmptyState icon="📊" title="No grades yet" subtitle="Tap + to add an assessment." />}
          {grades.map(g => (
            <TouchableOpacity key={g.id}
              onLongPress={() => Alert.alert('Delete Grade',`Remove "${g.label}"?`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>deleteGrade(g.id)}])}
              style={{ flexDirection:'row',alignItems:'center',gap:12,backgroundColor:t.card,borderWidth:1,borderColor:t.border2,borderRadius:10,padding:14,marginHorizontal:20,marginBottom:8 }}>
              <View style={{ flex:1 }}>
                <Txt variant="bodySemi" size={14}>{g.label}</Txt>
                <Txt variant="mono" size={10} color="tertiary" style={{ marginTop:2 }}>Weight: {g.weight}x</Txt>
              </View>
              <View style={{ alignItems:'flex-end' }}>
                <Txt variant="display" size={18} style={{ color:(g.score/g.maxScore)>=0.7?t.accent3:(g.score/g.maxScore)>=0.5?t.accent2:t.red }}>{g.score}/{g.maxScore}</Txt>
                <Txt variant="mono" size={10} color="tertiary">{((g.score/g.maxScore)*100).toFixed(1)}%</Txt>
              </View>
            </TouchableOpacity>
          ))}
        </>)}
        {activeTab==='bookmarks' && (<>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,paddingHorizontal:20,marginBottom:10 }}>{bookmarks.length} Saved Resources</Txt>
          {bookmarks.length===0 && <EmptyState icon="🔖" title="No saved resources" subtitle="Tap + to bookmark an article, paper or site." />}
          {bookmarks.map(b => (
            <TouchableOpacity key={b.id}
              onLongPress={() => Alert.alert('Delete Bookmark',`Remove "${b.title}"?`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>deleteBookmark(b.id)}])}
              style={{ backgroundColor:t.card,borderWidth:1,borderColor:t.border2,borderRadius:12,padding:14,marginHorizontal:20,marginBottom:8 }}>
              <View style={{ flexDirection:'row',alignItems:'flex-start',gap:10 }}>
                <View style={{ width:36,height:36,borderRadius:9,backgroundColor:t.accent+'22',alignItems:'center',justifyContent:'center' }}>
                  <Txt style={{ fontSize:16 }}>🔖</Txt>
                </View>
                <View style={{ flex:1 }}>
                  <Txt variant="bodySemi" size={14} numberOfLines={1}>{b.title}</Txt>
                  <Txt variant="mono" size={10} color="tertiary" numberOfLines={1} style={{ marginTop:2 }}>{b.url}</Txt>
                  {b.note && <Txt variant="bodyItalic" size={12} color="secondary" style={{ marginTop:6,lineHeight:18 }}>{b.note}</Txt>}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>)}
      </ScrollView>

      <FAB onPress={handleFAB} />
      <EditCourseSheet course={course} visible={showEdit} onClose={() => setShowEdit(false)} onDelete={() => router.back()} />

      <BottomSheet visible={showAddTodo} onClose={() => setShowAddTodo(false)} title="Add Task">
        <Input label="Task Title" value={todoTitle} onChangeText={setTodoTitle} placeholder="e.g. Complete problem set" autoFocus />
        {/* Deadline picker */}
        <Txt variant="mono" size={11} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.2,marginBottom:8 }}>Due Date (optional)</Txt>
        {!showDeadlinePick && !todoDeadline && (
          <TouchableOpacity onPress={() => setShowDeadlinePick(true)}
            style={{ flexDirection:'row',alignItems:'center',gap:8,paddingVertical:12,paddingHorizontal:14,borderRadius:10,borderWidth:1,borderColor:t.border2,backgroundColor:t.bg2,marginBottom:16 }}>
            <Feather name="calendar" size={15} color={t.text3} />
            <Txt variant="bodyItalic" size={14} color="tertiary">Set due date…</Txt>
          </TouchableOpacity>
        )}
        {todoDeadline ? (
          <View style={{ flexDirection:'row',alignItems:'center',gap:10,backgroundColor:t.accent+'18',borderRadius:10,borderWidth:1,borderColor:t.accent+'44',paddingHorizontal:14,paddingVertical:10,marginBottom:16 }}>
            <Feather name="calendar" size={14} color={t.accent} />
            <Txt variant="bodySemi" size={13} color="accent" style={{ flex:1 }}>{new Date(todoDeadline).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</Txt>
            <TouchableOpacity onPress={clearDeadline}><Feather name="x" size={14} color={t.text3} /></TouchableOpacity>
          </View>
        ) : showDeadlinePick ? (
          <View style={{ backgroundColor:t.bg2,borderRadius:12,borderWidth:1,borderColor:t.border2,padding:14,marginBottom:16 }}>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,marginBottom:10 }}>Enter Date</Txt>
            <View style={{ flexDirection:'row',gap:8,alignItems:'center',marginBottom:12 }}>
              <View style={{ flex:2 }}>
                <Txt variant="mono" size={9} color="tertiary" style={{ marginBottom:4 }}>YEAR</Txt>
                <Input value={deadlineYear} onChangeText={setDeadlineYear} placeholder="2026" keyboardType="numeric" maxLength={4} style={{ marginBottom:0 }} />
              </View>
              <View style={{ flex:1 }}>
                <Txt variant="mono" size={9} color="tertiary" style={{ marginBottom:4 }}>MONTH</Txt>
                <Input value={deadlineMonth} onChangeText={setDeadlineMonth} placeholder="04" keyboardType="numeric" maxLength={2} style={{ marginBottom:0 }} />
              </View>
              <View style={{ flex:1 }}>
                <Txt variant="mono" size={9} color="tertiary" style={{ marginBottom:4 }}>DAY</Txt>
                <Input value={deadlineDay} onChangeText={setDeadlineDay} placeholder="15" keyboardType="numeric" maxLength={2} style={{ marginBottom:0 }} />
              </View>
            </View>
            {/* Quick shortcuts */}
            <View style={{ flexDirection:'row',gap:6,flexWrap:'wrap',marginBottom:10 }}>
              {[1,2,3,7,14,30].map(days => {
                const d = new Date(); d.setDate(d.getDate()+days);
                return (
                  <TouchableOpacity key={days}
                    onPress={() => { setTodoDeadline(d.getTime()); setShowDeadlinePick(false); }}
                    style={{ paddingHorizontal:10,paddingVertical:6,borderRadius:20,backgroundColor:t.card,borderWidth:1,borderColor:t.border2 }}>
                    <Txt variant="mono" size={10} color="secondary">
                      {days===1?'Tomorrow':days===7?'1 week':days===14?'2 weeks':days===30?'1 month':`${days}d`}
                    </Txt>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ flexDirection:'row',gap:8 }}>
              <TouchableOpacity onPress={() => setShowDeadlinePick(false)}
                style={{ flex:1,paddingVertical:10,borderRadius:10,backgroundColor:t.bg3,alignItems:'center' }}>
                <Txt variant="mono" size={11} color="tertiary">Cancel</Txt>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyDeadline}
                style={{ flex:2,paddingVertical:10,borderRadius:10,backgroundColor:t.accent,alignItems:'center' }}>
                <Txt variant="mono" size={11} style={{ color:'#fff' }}>Set Date</Txt>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <Txt variant="mono" size={11} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.2,marginBottom:8 }}>Priority</Txt>
        <View style={{ flexDirection:'row',gap:8,marginBottom:20 }}>
          {(['low','medium','high'] as const).map(p => (
            <TouchableOpacity key={p} onPress={() => setTodoPriority(p)}
              style={{ flex:1,paddingVertical:10,borderRadius:10,borderWidth:1.5,borderColor:todoPriority===p?PRIORITY_COLORS[p]:t.border2,backgroundColor:todoPriority===p?PRIORITY_COLORS[p]+'22':t.bg2,alignItems:'center' }}>
              <Txt variant="bodySemi" size={13} style={{ color:todoPriority===p?PRIORITY_COLORS[p]:t.text3,textTransform:'capitalize' }}>{p}</Txt>
            </TouchableOpacity>
          ))}
        </View>
        <Button label="Add Task" onPress={handleAddTodo} />
      </BottomSheet>

      {editTodo !== null && (
        <BottomSheet visible={!!editTodo} onClose={() => setEditTodo(null)} title="Edit Task">
          <Input label="Task Title" value={editTodoTitle} onChangeText={setEditTodoTitle} autoFocus />
          <Txt variant="mono" size={11} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.2,marginBottom:8 }}>Priority</Txt>
          <View style={{ flexDirection:'row',gap:8,marginBottom:20 }}>
            {(['low','medium','high'] as const).map(p => (
              <TouchableOpacity key={p} onPress={() => setEditTodoPri(p)}
                style={{ flex:1,paddingVertical:10,borderRadius:10,borderWidth:1.5,borderColor:editTodoPri===p?PRIORITY_COLORS[p]:t.border2,backgroundColor:editTodoPri===p?PRIORITY_COLORS[p]+'22':t.bg2,alignItems:'center' }}>
                <Txt variant="bodySemi" size={13} style={{ color:editTodoPri===p?PRIORITY_COLORS[p]:t.text3,textTransform:'capitalize' }}>{p}</Txt>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection:'row',gap:10 }}>
            <Button label="Delete" variant="danger" onPress={() => { if(editTodo){deleteTodo(editTodo.id);setEditTodo(null);} }} style={{ flex:1 }} />
            <Button label="Save" onPress={handleSaveTodo} style={{ flex:2 }} />
          </View>
        </BottomSheet>
      )}

      <BottomSheet visible={showAddLink} onClose={() => setShowAddLink(false)} title="Add Link">
        <Input label="Title" value={linkTitle} onChangeText={setLinkTitle} placeholder="e.g. Khan Academy" autoFocus />
        <Input label="URL" value={linkUrl} onChangeText={setLinkUrl} placeholder="https://..." keyboardType="url" autoCapitalize="none" />
        <Button label="Save Link" onPress={handleAddLink} style={{ marginTop:8 }} />
      </BottomSheet>

      <BottomSheet visible={showAddSet} onClose={() => { setShowAddSet(false); setEditSet(null); }} title={editSet ? 'Edit Study Set' : 'New Study Set'} scrollable>
        <Input label="Set Title" value={setTitle} onChangeText={setSetTitle} placeholder="e.g. Exam Preparation" autoFocus />
        <Input label="Steps — one per line" value={setSteps} onChangeText={setSetSteps} placeholder={"Read notes\nPractice problems\nReview formulas"} multiline numberOfLines={6} style={{ minHeight:120,textAlignVertical:'top' }} />
        <Txt variant="bodyItalic" size={12} color="tertiary" style={{ marginBottom:16 }}>Each line becomes one checklist step.</Txt>
        {editSet && (
          <Button label="Delete Set" variant="danger" onPress={() => { if(editSet){deleteStudySet(editSet.id);setShowAddSet(false);setEditSet(null);} }} style={{ marginBottom:10 }} />
        )}
        <Button label={editSet ? 'Save Changes' : 'Create Study Set'} onPress={handleSaveSet} />
      </BottomSheet>

      <BottomSheet visible={showAddGrade} onClose={() => setShowAddGrade(false)} title="Add Grade" scrollable>
        <Input label="Assessment Name" value={gradeLabel} onChangeText={setGradeLabel} placeholder="e.g. Midterm Exam" autoFocus />
        <View style={{ flexDirection:'row',gap:10 }}>
          <View style={{ flex:1 }}><Input label="Score" value={gradeScore} onChangeText={setGradeScore} placeholder="85" keyboardType="decimal-pad" /></View>
          <View style={{ flex:1 }}><Input label="Out of" value={gradeMax} onChangeText={setGradeMax} placeholder="100" keyboardType="decimal-pad" /></View>
        </View>
        <Input label="Weight (e.g. 0.4 = 40%)" value={gradeWeight} onChangeText={setGradeWeight} placeholder="1" keyboardType="decimal-pad" />
        <Button label="Add Grade" onPress={handleAddGrade} style={{ marginTop:4 }} />
      </BottomSheet>

      <BottomSheet visible={showAddBk} onClose={() => setShowAddBk(false)} title="Save Resource">
        <Input label="Title" value={bkTitle} onChangeText={setBkTitle} placeholder="e.g. MIT OpenCourseWare" autoFocus />
        <Input label="URL" value={bkUrl} onChangeText={setBkUrl} placeholder="https://..." keyboardType="url" autoCapitalize="none" />
        <Input label="Note (optional)" value={bkNote} onChangeText={setBkNote} placeholder="e.g. Great for exam prep" />
        <Button label="Save Bookmark" onPress={handleAddBookmark} style={{ marginTop:8 }} />
      </BottomSheet>
    </SafeAreaView>
  );
}