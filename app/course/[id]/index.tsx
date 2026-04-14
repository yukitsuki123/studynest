import { 
  ChevronLeft, ChevronRight, Edit2, Plus, FileText, Image as ImageIcon, Camera, 
  Edit3, Calendar, X, ExternalLink, Share2, Trash2, ChevronUp, ChevronDown, Book,
  FolderOpen, CheckCircle2, Link, Target, BarChart2, Smile, Bookmark as BookmarkIcon
} from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Alert, Animated, Dimensions, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EditCourseSheet } from '../../../components/course/EditCourseSheet';
import { FileItem } from '../../../components/course/FileItem';
import { LinkItem } from '../../../components/course/LinkItem';
import { MilestoneCard } from '../../../components/course/MilestoneCard';
import { TodoItem } from '../../../components/course/TodoItem';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import * as Sharing from 'expo-sharing';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Input } from '../../../components/ui/Input';
import { Txt } from '../../../components/ui/Text';
import { PRIORITY_COLORS } from '../../../constants/icons';
import { Bookmark, GradeEntry, StudySet, TodoItem as TodoType, CourseFile } from '../../../constants/types';
import { useApp } from '../../../context/AppContext';
import { useSettings } from '../../../context/SettingsContext';
import { useTheme } from '../../../hooks/useTheme';
import { openFileExternal, pickFiles, pickImages, takePhoto } from '../../../utils/fileHelper';

const SCREEN_W = Dimensions.get('window').width;
const IMAGE_GAP = 3;
const IMAGE_COLS = 3;
const IMAGE_SIZE = (SCREEN_W - 40 - IMAGE_GAP * (IMAGE_COLS - 1)) / IMAGE_COLS;

type InnerTab = 'files' | 'todo' | 'links' | 'sets' | 'grades' | 'bookmarks' | 'gratitude';

function calcGPA(grades: GradeEntry[]): number {
  if (!grades.length) return 0;
  const totalWeight = grades.reduce((s, g) => s + g.weight, 0);
  if (!totalWeight) return 0;
  const weighted = grades.reduce((s, g) => s + (g.score / g.maxScore) * g.weight, 0);
  return (weighted / totalWeight) * 100;
}

export default function CourseDetailScreen() {
  const tColor = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state, addFile, addTodo, updateTodo, deleteTodo, addLink, deleteLink,
          addStudySet, updateStudySet, deleteStudySet, addNote, deleteFile, renameFile,
          addGrade, deleteGrade, addBookmark, deleteBookmark, addGratitude, deleteGratitude } = useApp();
  const { t, isRTL, pdfReader, imageReader } = useSettings();
  const id = params?.id;
  const courseId = Array.isArray(id) ? id[0] : id;

  const dateLocale = isRTL ? 'ar-EG' : 'en-GB';

  if (!courseId) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: tColor.bg }}>
        <Txt>No course ID provided</Txt>
      </SafeAreaView>
    );
  }

  const course  = useMemo(() => state.courses.find(c => c.id === courseId) ?? null, [state.courses, courseId]);
  const files   = useMemo(() => course ? state.files.filter(f => f.courseId === courseId) : [], [state.files, courseId, course]);
  const imageFiles = useMemo(() => files.filter(f => f.type === 'image'), [files]);
  const docFiles   = useMemo(() => files.filter(f => f.type !== 'image'), [files]);
  const todos   = useMemo(() => course ? state.todos.filter(td => td.courseId === courseId) : [], [state.todos, courseId, course]);
  const links   = useMemo(() => course ? state.links.filter(l => l.courseId === courseId) : [], [state.links, courseId, course]);
  const sets    = useMemo(() => course ? state.studySets.filter(ss => ss.courseId === courseId) : [], [state.studySets, courseId, course]);
  const grades    = useMemo(() => course ? state.grades.filter(g => g.courseId === courseId) : [], [state.grades, courseId, course]);
  const bookmarks  = useMemo(() => course ? state.bookmarks.filter(b => b.courseId === courseId) : [], [state.bookmarks, courseId, course]);
  const gratitudes  = useMemo(() => course ? state.gratitudeEntries.filter(g => g.courseId === courseId) : [], [state.gratitudeEntries, courseId, course]);

  const [activeTab, setActiveTab] = useState<InnerTab>('files');
  const [showEdit, setShowEdit]   = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
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
  const [showAddGrat, setShowAddGrat] = useState(false);
  const [gratContent, setGratContent] = useState('');
  const [fileMenuTarget, setFileMenuTarget] = useState<CourseFile|null>(null);
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [renameName,   setRenameName]   = useState('');
  const [bkTitle,     setBkTitle]     = useState('');
  const [bkUrl,       setBkUrl]       = useState('');
  const [bkNote,      setBkNote]      = useState('');

  const menuAnim = useRef(new Animated.Value(0)).current;
  const fabRotation = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(menuAnim, { toValue: showAddMenu ? 1 : 0, useNativeDriver: true, friction: 7, tension: 65 }),
      Animated.spring(fabRotation, { toValue: showAddMenu ? 1 : 0, useNativeDriver: true, friction: 7, tension: 65 }),
    ]).start();
  }, [showAddMenu]);

  if (!state.ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Txt variant="bodyItalic" size={14} color="tertiary">Loading…</Txt>
        </View>
      </SafeAreaView>
    );
  }
  if (!course) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
        <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
            {isRTL ? <ChevronRight size={18} color={tColor.text2} /> : <ChevronLeft size={18} color={tColor.text2} />}
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Txt style={{ fontSize: 40, marginBottom: 12 }}>😕</Txt>
          <Txt variant="display" size={18} color="tertiary">{t('course_not_found')}</Txt>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Txt variant="mono" size={12} color="accent">← {t('go_back')}</Txt>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tabs: { key: InnerTab; label: string; count: number }[] = [
    { key: 'files',     label: t('files'),   count: files.length },
    { key: 'todo',      label: t('tasks'),   count: todos.filter(t => !t.done).length },
    { key: 'links',     label: t('links'),   count: links.length },
    { key: 'sets',      label: t('sets'),    count: sets.length },
    { key: 'grades',    label: t('grades'),  count: grades.length },
    { key: 'bookmarks', label: t('saved'),   count: bookmarks.length },
    { key: 'gratitude', label: t('journal'),  count: gratitudes.length },
  ];

  const handlePickPhotos = async () => {
    try {
      const picked = await pickImages();
      if (picked.length) picked.forEach(f => addFile({courseId:courseId!,name:f.name,uri:f.uri,type:f.type,size:f.size}));
    } catch(e:any){ Alert.alert('Error',e?.message??'Could not pick photos'); }
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await takePhoto();
      if (photo) addFile({courseId:courseId!,name:photo.name,uri:photo.uri,type:photo.type,size:photo.size});
    } catch(e:any){ Alert.alert('Error',e?.message??'Could not take photo'); }
  };

  const handleOpenFile = (f: CourseFile) => {
    if (f.type === 'note') { router.push(`/note/${f.uri}` as any); }
    else if (f.type === 'image') {
      if (imageReader === 'builtin') router.push({ pathname: '/imageviewer', params: { fileId: f.id, courseId: courseId! } } as any);
      else openFileExternal(f.uri, f.type);
    }
    else if (f.type === 'pdf') {
      if (pdfReader === 'builtin') router.push({ pathname: '/pdfviewer', params: { fileId: f.id } } as any);
      else openFileExternal(f.uri, f.type);
    }
    else { openFileExternal(f.uri, f.type); }
  };

  const handlePickDocs = async () => {
    setShowAddMenu(false);
    try {
      const picked = await pickFiles();
      if (picked.length) picked.forEach(f => addFile({courseId:courseId!,name:f.name,uri:f.uri,type:f.type,size:f.size}));
    } catch(e:any){ Alert.alert('Error',e?.message??'Could not pick file'); }
  };

  const handleFAB = async () => {
    if      (activeTab === 'files')  {
      setShowAddMenu(prev => !prev);
    }
    else if (activeTab === 'todo')   { setTodoTitle(''); setTodoPriority('medium'); setTodoDeadline(undefined); setDeadlineYear(''); setDeadlineMonth(''); setDeadlineDay(''); setShowAddTodo(true); }
    else if (activeTab === 'links')  { setLinkTitle(''); setLinkUrl(''); setShowAddLink(true); }
    else if (activeTab === 'sets')   { setSetTitle(''); setSetSteps(''); setEditSet(null); setShowAddSet(true); }
    else if (activeTab === 'grades')    setShowAddGrade(true);
    else if (activeTab === 'bookmarks') { setBkTitle(''); setBkUrl(''); setBkNote(''); setShowAddBk(true); }
    else if (activeTab === 'gratitude')  { setGratContent(''); setShowAddGrat(true); }
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
  const handleAddGratitude = () => {
    if (!gratContent.trim()) return;
    addGratitude(courseId!, gratContent.trim());
    setGratContent('');
    setShowAddGrat(false);
  };
  const handleAddBookmark = () => {
    if (!bkTitle.trim() || !bkUrl.trim()) return;
    addBookmark(courseId!, bkTitle.trim(), bkUrl.startsWith('http') ? bkUrl.trim() : 'https://'+bkUrl.trim(), bkNote.trim()||undefined);
    setBkTitle(''); setBkUrl(''); setBkNote('');
    setShowAddBk(false);
  };

  const gpa = calcGPA(grades);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
      <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:12, paddingHorizontal:20, paddingVertical:14, backgroundColor:tColor.bg2, borderBottomWidth:1, borderBottomColor:tColor.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width:34,height:34,borderRadius:9,backgroundColor:tColor.card,borderWidth:1,borderColor:tColor.border,alignItems:'center',justifyContent:'center' }}>
          {isRTL ? <ChevronRight size={18} color={tColor.text2} /> : <ChevronLeft size={18} color={tColor.text2} />}
        </TouchableOpacity>
        <View style={{ flex:1 }}>
          <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:10 }}>
            <View style={{ width:42, height:42, borderRadius:12, backgroundColor:course.color+'18', alignItems:'center', justifyContent:'center' }}>
               <Book size={24} color={course.color} />
            </View>
            <Txt variant="display" size={20} style={{ flex:1, textAlign: isRTL?'right':'left' }}>{course.name}</Txt>
          </View>
          <Txt variant="mono" size={10} color="tertiary" style={{ textAlign: isRTL?'right':'left' }}>{files.length} {t('files')} · {todos.filter(td=>!td.done).length} {t('tasks')}</Txt>
        </View>
        <TouchableOpacity onPress={() => setShowEdit(true)} style={{ padding:4 }}>
          <Edit2 size={18} color={tColor.text3} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor:tColor.card,borderBottomWidth:1,borderBottomColor:tColor.border,flexGrow:0 }} contentContainerStyle={{ paddingHorizontal:4, flexDirection: isRTL?'row-reverse':'row' }}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.key} onPress={() => { setShowAddMenu(false); setActiveTab(tab.key); }}
            style={{ paddingHorizontal:14,paddingVertical:12,borderBottomWidth:2,borderBottomColor:activeTab===tab.key?tColor.accent:'transparent' }}>
            <Txt variant="mono" size={10} style={{ textTransform:'uppercase',letterSpacing:0.6,color:activeTab===tab.key?tColor.accent:tColor.text3 }}>{tab.label}{tab.count>0?` (${tab.count})`:''}</Txt>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop:12,paddingBottom:100 }}>
        {activeTab==='files' && (<>
          <View style={{ flexDirection: isRTL?'row-reverse':'row', justifyContent:'space-between', alignItems:'center', paddingHorizontal:20, marginBottom:10 }}>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1 }}>{files.length} {t('files')}</Txt>
            <View style={{ flexDirection: isRTL?'row-reverse':'row', gap:14 }}>
              <TouchableOpacity onPress={handlePickPhotos}>
                <Txt variant="mono" size={10} color="accent">📸 {t('add_photos')}</Txt>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { const n=addNote(courseId!,'New Note'); router.push(`/note/${n.id}` as any); }}>
                <Txt variant="mono" size={10} color="accent">+ {t('new_note')}</Txt>
              </TouchableOpacity>
            </View>
          </View>
          {files.length===0 && <EmptyState icon={FolderOpen} title={t('no_files_yet')} subtitle="Tap + to add files, photos, or create a note." />}

          {/* Image gallery grid */}
          {imageFiles.length > 0 && (
            <View style={{ paddingHorizontal:20,marginBottom:16 }}>
              <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:6, marginBottom:10 }}>
                <ImageIcon size={13} color={tColor.text3} />
                <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:1 }}>{imageFiles.length} {t('add_photos')}</Txt>
              </View>
              <View style={{ flexDirection: isRTL?'row-reverse':'row', flexWrap:'wrap', gap:IMAGE_GAP, borderRadius:14, overflow:'hidden', alignSelf: isRTL?'flex-end':'flex-start' }}>
                {imageFiles.map((img, idx) => (
                  <TouchableOpacity key={img.id} activeOpacity={0.85}
                    onPress={() => handleOpenFile(img)}
                    onLongPress={() => { setFileMenuTarget(img); setRenameName(img.name); setShowRenameInput(false); }}
                    style={{ width:IMAGE_SIZE, height:IMAGE_SIZE, borderRadius: idx===0?14:4, overflow:'hidden' }}>
                    <Image source={{ uri:img.uri }} style={{ width:'100%',height:'100%' }} contentFit="cover" transition={150} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Document files list */}
          {docFiles.length > 0 && imageFiles.length > 0 && (
            <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:6, paddingHorizontal:20, marginBottom:8 }}>
              <FileText size={13} color={tColor.text3} />
              <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:1 }}>{docFiles.length} {t('files')}</Txt>
            </View>
          )}
          {docFiles.map(f => (
            <FileItem key={f.id} file={f}
              onPress={() => handleOpenFile(f)}
              onLongPress={() => { setFileMenuTarget(f); setRenameName(f.name); setShowRenameInput(false); }} />
          ))}
        </>)}

        {activeTab==='todo' && (<>
          <View style={{ flexDirection: isRTL?'row-reverse':'row', justifyContent:'space-between', paddingHorizontal:20, marginBottom:10 }}>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:1 }}>{todos.length} {t('tasks')}</Txt>
            <Txt variant="mono" size={10} color="accent3">{todos.filter(t=>t.done).length} {t('tasks_done')}</Txt>
          </View>
          {todos.length===0 && <EmptyState icon={CheckCircle2} title={t('no_tasks')} subtitle="Tap + to add a to-do item for this course." />}
          {todos.filter(td=>!td.done).map(todo => (
            <TodoItem key={todo.id} todo={todo} onPress={() => openEditTodo(todo)}
              onLongPress={() => Alert.alert('Task',todo.title,[{text:'Edit',onPress:()=>openEditTodo(todo)},{text:'Delete',style:'destructive',onPress:()=>deleteTodo(todo.id)},{text:'Cancel',style:'cancel'}])} />
          ))}
          {todos.filter(td=>td.done).length>0 && (<>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,paddingHorizontal:20,marginTop:12,marginBottom:8, textAlign:isRTL?'right':'left' }}>— {t('tasks_done')}</Txt>
            {todos.filter(td=>td.done).map(todo => <TodoItem key={todo.id} todo={todo} onLongPress={() => deleteTodo(todo.id)} />)}
          </>)}
        </>)}

        {activeTab==='links' && (<>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,paddingHorizontal:20,marginBottom:10, textAlign:isRTL?'right':'left' }}>{links.length} {t('links')}</Txt>
          {links.length===0 && <EmptyState icon={Link} title={t('no_links')} subtitle="Tap + to save a useful website or resource." />}
          {links.map(l => (
            <LinkItem key={l.id} link={l} onLongPress={() => Alert.alert('Delete Link',`Remove "${l.title}"?`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>deleteLink(l.id)}])} />
          ))}
        </>)}

        {activeTab==='sets' && (<>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,paddingHorizontal:20,marginBottom:10, textAlign:isRTL?'right':'left' }}>{sets.length} {t('sets')}</Txt>
          {sets.length===0 && <EmptyState icon={Target} title={t('no_study_sets')} subtitle="Create flashcards and study paths." />}
          {sets.map(set => (
            <MilestoneCard key={set.id} set={set}
              onEdit={() => openEditSet(set)}
              onDelete={() => Alert.alert('Delete Set',`Delete "${set.title}"?`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>deleteStudySet(set.id)}])} />
          ))}
        </>)}

        {activeTab==='grades' && (<>
          {grades.length > 0 && (
            <View style={{ margin:20,padding:16,backgroundColor:tColor.card,borderRadius:14,borderWidth:1,borderColor:tColor.border2,marginBottom:12 }}>
              <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,marginBottom:6, textAlign:isRTL?'right':'left' }}>{t('overall_average')}</Txt>
              <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'flex-end', gap:8 }}>
                <Txt variant="display" size={40} style={{ color:gpa>=70?tColor.accent3:gpa>=50?tColor.accent2:tColor.red,lineHeight:46 }}>{gpa.toFixed(1)}%</Txt>
                <Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginBottom:6 }}>{grades.length} {t('grades')}</Txt>
              </View>
              <View style={{ height:6,backgroundColor:tColor.bg3,borderRadius:3,marginTop:8,overflow:'hidden' }}>
                <View style={{ height:6,borderRadius:3,width:`${Math.min(gpa,100)}%`,backgroundColor:gpa>=70?tColor.accent3:gpa>=50?tColor.accent2:tColor.red }} />
              </View>
            </View>
          )}
          {grades.length===0 && <EmptyState icon={BarChart2} title={t('no_grades')} subtitle="Add your assignment or exam results." />}
          {grades.map(g => (
            <TouchableOpacity key={g.id}
              onLongPress={() => Alert.alert('Delete Grade',`Remove "${g.label}"?`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>deleteGrade(g.id)}])}
              style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:12, backgroundColor:tColor.card, borderWidth:1, borderColor:tColor.border2, borderRadius:10, padding:14, marginHorizontal:20, marginBottom:8 }}>
              <View style={{ flex:1 }}>
                <Txt variant="bodySemi" size={14} style={{ textAlign:isRTL?'right':'left' }}>{g.label}</Txt>
                <Txt variant="mono" size={10} color="tertiary" style={{ marginTop:2, textAlign:isRTL?'right':'left' }}>{t('weight')}: {g.weight}x</Txt>
              </View>
              <View style={{ alignItems: isRTL?'flex-start':'flex-end' }}>
                <Txt variant="display" size={18} style={{ color:(g.score/g.maxScore)>=0.7?tColor.accent3:(g.score/g.maxScore)>=0.5?tColor.accent2:tColor.red }}>{g.score}/{g.maxScore}</Txt>
                <Txt variant="mono" size={10} color="tertiary">{((g.score/g.maxScore)*100).toFixed(1)}%</Txt>
              </View>
            </TouchableOpacity>
          ))}
        </>)}
        {activeTab==='gratitude' && (<>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,paddingHorizontal:20,marginBottom:6, textAlign:isRTL?'right':'left' }}>{gratitudes.length} {t('journal')}</Txt>
          <Txt variant="bodyItalic" size={12} color="tertiary" style={{ paddingHorizontal:20,marginBottom:14,lineHeight:18, textAlign:isRTL?'right':'left' }}>
            What are you grateful for in this course? Small wins count.
          </Txt>
          {gratitudes.length===0 && <EmptyState icon={Smile} title={t('no_entries_yet')} subtitle="Tap + to write your first gratitude note." />}
          {gratitudes.map(g => (
            <TouchableOpacity key={g.id}
              onLongPress={() => deleteGratitude(g.id)}
              style={{ backgroundColor:tColor.card,borderWidth:1,borderColor:tColor.border2,borderRadius:12,padding:16,marginHorizontal:20,marginBottom:10,borderLeftWidth:isRTL?1:3,borderLeftColor:isRTL?tColor.border2:tColor.accent3, borderRightWidth:isRTL?3:1, borderRightColor:isRTL?tColor.accent3:tColor.border2 }}>
              <Txt variant="body" size={14} style={{ lineHeight:22,color:tColor.text2, textAlign:isRTL?'right':'left' }}>{g.content}</Txt>
              <Txt variant="mono" size={9} color="tertiary" style={{ marginTop:8, textAlign:isRTL?'right':'left' }}>{new Date(g.createdAt).toLocaleDateString(dateLocale,{day:'numeric',month:'short',year:'numeric'})}</Txt>
            </TouchableOpacity>
          ))}
        </>)}

        {activeTab==='bookmarks' && (<>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,paddingHorizontal:20,marginBottom:10, textAlign:isRTL?'right':'left' }}>{bookmarks.length} {t('saved')}</Txt>
          {bookmarks.length===0 && <EmptyState icon={BookmarkIcon} title={t('no_saved_resources')} subtitle="Tap + to bookmark an article, paper or site." />}
          {bookmarks.map(b => (
            <TouchableOpacity key={b.id}
              onLongPress={() => Alert.alert('Delete Bookmark',`Remove "${b.title}"?`,[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>deleteBookmark(b.id)}])}
              style={{ backgroundColor:tColor.card,borderWidth:1,borderColor:tColor.border2,borderRadius:12,padding:14,marginHorizontal:20,marginBottom:8 }}>
              <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'flex-start', gap:10 }}>
                <View style={{ width:36,height:36,borderRadius:9,backgroundColor:tColor.accent+'22',alignItems:'center',justifyContent:'center' }}>
                  <Txt style={{ fontSize:16 }}>🔖</Txt>
                </View>
                <View style={{ flex:1 }}>
                  <Txt variant="bodySemi" size={14} numberOfLines={1} style={{ textAlign:isRTL?'right':'left' }}>{b.title}</Txt>
                  <Txt variant="mono" size={10} color="tertiary" numberOfLines={1} style={{ marginTop:2, textAlign:isRTL?'right':'left' }}>{b.url}</Txt>
                  {b.note && <Txt variant="bodyItalic" size={12} color="secondary" style={{ marginTop:6,lineHeight:18, textAlign:isRTL?'right':'left' }}>{b.note}</Txt>}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>)}
      </ScrollView>

      {/* Elegant popup menu overlay */}
      <Animated.View
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.35)',
          zIndex: 90,
          opacity: menuAnim,
        }}
        pointerEvents={showAddMenu ? 'auto' : 'none'}
      >
        <Pressable
          onPress={() => setShowAddMenu(false)}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* Popup menu items */}
      <View
        style={{ position: 'absolute', bottom: 100, right: isRTL?undefined:20, left:isRTL?20:undefined, zIndex: 100, alignItems: isRTL?'flex-start':'flex-end', gap: 10 }}
        pointerEvents={showAddMenu ? 'auto' : 'none'}
      >
          {[
            { icon: FileText,   label: 'Add Document', color: '#4A7C59', action: handlePickDocs },
            { icon: ImageIcon,  label: t('add_photos'),    color: '#1A7A6E', action: () => { setShowAddMenu(false); handlePickPhotos(); } },
            { icon: Camera,     label: t('take_photo'),     color: '#2C5F8A', action: () => { setShowAddMenu(false); handleTakePhoto(); } },
            { icon: Edit3,      label: t('new_note'),       color: '#8B4513', action: () => { setShowAddMenu(false); const n=addNote(courseId!,'New Note'); router.push(`/note/${n.id}` as any); } },
          ].map((item, i) => (
              <Animated.View key={item.label} style={{
                opacity: menuAnim,
                transform: [
                  { translateY: menuAnim.interpolate({ inputRange:[0,1], outputRange:[30 + i*10, 0] }) },
                  { scale: menuAnim.interpolate({ inputRange:[0,1], outputRange:[0.6, 1] }) },
                ],
              }}>
                <TouchableOpacity
                  onPress={item.action}
                  activeOpacity={0.85}
                  style={{
                    flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:10,
                    backgroundColor:tColor.card, borderWidth:1, borderColor:tColor.border2,
                    borderRadius:14, paddingVertical:12, paddingHorizontal:16,
                    shadowColor:'#000', shadowOffset:{width:0,height:3}, shadowOpacity:0.12, shadowRadius:8, elevation:4,
                    minWidth:175,
                  }}
                >
                  <View style={{ width:34, height:34, borderRadius:10, backgroundColor:item.color+'18', alignItems:'center', justifyContent:'center' }}>
                    {React.createElement(item.icon, { size: 16, color: item.color })}
                  </View>
                  <Txt variant="bodySemi" size={14}>{item.label}</Txt>
                </TouchableOpacity>
              </Animated.View>
            ))}
        </View>

      {/* FAB with rotation */}
      <TouchableOpacity
        onPress={handleFAB}
        activeOpacity={0.85}
        style={{
          position:'absolute', bottom:36, right: isRTL?undefined:20, left:isRTL?20:undefined, width:52, height:52, borderRadius:26,
          backgroundColor:tColor.accent, alignItems:'center', justifyContent:'center', zIndex:100,
          shadowColor:tColor.accent, shadowOffset:{width:0,height:4}, shadowOpacity:0.4, shadowRadius:10, elevation:6,
        }}
      >
        <Animated.View style={{
          transform:[{ rotate: fabRotation.interpolate({ inputRange:[0,1], outputRange:['0deg','45deg'] }) }],
        }}>
          <Plus size={22} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
      <EditCourseSheet course={course} visible={showEdit} onClose={() => setShowEdit(false)} onDelete={() => router.back()} />

      <BottomSheet visible={showAddTodo} onClose={() => setShowAddTodo(false)} title={t('tasks')}>
        <Input label={t('task_title')} value={todoTitle} onChangeText={setTodoTitle} placeholder="e.g. Complete problem set" autoFocus />
        {/* Deadline picker */}
        <Txt variant="mono" size={11} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.2,marginBottom:8, textAlign:isRTL?'right':'left' }}>{t('due_date')} (optional)</Txt>
        {!showDeadlinePick && !todoDeadline && (
          <TouchableOpacity onPress={() => setShowDeadlinePick(true)}
            style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:8, paddingVertical:12, paddingHorizontal:14, borderRadius:10, borderWidth:1, borderColor:tColor.border2, backgroundColor:tColor.bg2, marginBottom:16 }}>
            <Calendar size={15} color={tColor.text3} />
            <Txt variant="bodyItalic" size={14} color="tertiary">{t('set_due_date')}…</Txt>
          </TouchableOpacity>
        )}
        {todoDeadline ? (
          <View style={{ flexDirection:isRTL?'row-reverse':'row', alignItems:'center', gap:10, backgroundColor:tColor.accent+'18', borderRadius:10, borderWidth:1, borderColor:tColor.accent+'44', paddingHorizontal:14, paddingVertical:10, marginBottom:16 }}>
            <Calendar size={14} color={tColor.accent} />
            <Txt variant="bodySemi" size={13} color="accent" style={{ flex:1, textAlign:isRTL?'right':'left' }}>{new Date(todoDeadline).toLocaleDateString(dateLocale,{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</Txt>
            <TouchableOpacity onPress={clearDeadline}><X size={14} color={tColor.text3} /></TouchableOpacity>
          </View>
        ) : showDeadlinePick ? (
          <View style={{ backgroundColor:tColor.bg2,borderRadius:12,borderWidth:1,borderColor:tColor.border2,padding:14,marginBottom:16 }}>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,marginBottom:10, textAlign:isRTL?'right':'left' }}>Enter Date</Txt>
            <View style={{ flexDirection: isRTL?'row-reverse':'row', gap:8, alignItems:'center', marginBottom:12 }}>
              <View style={{ flex:2 }}>
                <Txt variant="mono" size={9} color="tertiary" style={{ marginBottom:4, textAlign:isRTL?'right':'left' }}>YEAR</Txt>
                <Input value={deadlineYear} onChangeText={setDeadlineYear} placeholder="2026" keyboardType="numeric" maxLength={4} style={{ marginBottom:0 }} />
              </View>
              <View style={{ flex:1 }}>
                <Txt variant="mono" size={9} color="tertiary" style={{ marginBottom:4, textAlign:isRTL?'right':'left' }}>MONTH</Txt>
                <Input value={deadlineMonth} onChangeText={setDeadlineMonth} placeholder="04" keyboardType="numeric" maxLength={2} style={{ marginBottom:0 }} />
              </View>
              <View style={{ flex:1 }}>
                <Txt variant="mono" size={9} color="tertiary" style={{ marginBottom:4, textAlign:isRTL?'right':'left' }}>DAY</Txt>
                <Input value={deadlineDay} onChangeText={setDeadlineDay} placeholder="15" keyboardType="numeric" maxLength={2} style={{ marginBottom:0 }} />
              </View>
            </View>
            <View style={{ flexDirection: isRTL?'row-reverse':'row', gap:6, flexWrap:'wrap', marginBottom:10 }}>
              {[1,2,3,7,14,30].map(days => {
                const d = new Date(); d.setDate(d.getDate()+days);
                return (
                  <TouchableOpacity key={days}
                    onPress={() => { setTodoDeadline(d.getTime()); setShowDeadlinePick(false); }}
                    style={{ paddingHorizontal:10,paddingVertical:6,borderRadius:20,backgroundColor:tColor.card,borderWidth:1,borderColor:tColor.border2 }}>
                    <Txt variant="mono" size={10} color="secondary">
                      {days===1?'Tomorrow':days===7?'1 week':days===14?'2 weeks':days===30?'1 month':`${days}d`}
                    </Txt>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ flexDirection: isRTL?'row-reverse':'row', gap:8 }}>
              <TouchableOpacity onPress={() => setShowDeadlinePick(false)}
                style={{ flex:1,paddingVertical:10,borderRadius:10,backgroundColor:tColor.bg3,alignItems:'center' }}>
                <Txt variant="mono" size={11} color="tertiary">Cancel</Txt>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyDeadline}
                style={{ flex:2,paddingVertical:10,borderRadius:10,backgroundColor:tColor.accent,alignItems:'center' }}>
                <Txt variant="mono" size={11} style={{ color:'#fff' }}>Set Date</Txt>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <Txt variant="mono" size={11} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.2,marginBottom:8, textAlign:isRTL?'right':'left' }}>{t('priority')}</Txt>
        <View style={{ flexDirection: isRTL?'row-reverse':'row', gap:8, marginBottom:20 }}>
          {(['low','medium','high'] as const).map(p => (
            <TouchableOpacity key={p} onPress={() => setTodoPriority(p)}
              style={{ flex:1,paddingVertical:10,borderRadius:10,borderWidth:1.5,borderColor:todoPriority===p?PRIORITY_COLORS[p]:tColor.border2,backgroundColor:todoPriority===p?PRIORITY_COLORS[p]+'22':tColor.bg2,alignItems:'center' }}>
              <Txt variant="bodySemi" size={13} style={{ color:todoPriority===p?PRIORITY_COLORS[p]:tColor.text3,textTransform:'capitalize' }}>{t(p)}</Txt>
            </TouchableOpacity>
          ))}
        </View>
        <Button label={t('tasks')} onPress={handleAddTodo} />
      </BottomSheet>

      {editTodo !== null && (
        <BottomSheet visible={!!editTodo} onClose={() => setEditTodo(null)} title={t('tasks')}>
          <Input label={t('task_title')} value={editTodoTitle} onChangeText={setEditTodoTitle} autoFocus />
          <Txt variant="mono" size={11} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.2,marginBottom:8, textAlign:isRTL?'right':'left' }}>{t('priority')}</Txt>
          <View style={{ flexDirection: isRTL?'row-reverse':'row', gap:8, marginBottom:20 }}>
            {(['low','medium','high'] as const).map(p => (
              <TouchableOpacity key={p} onPress={() => setEditTodoPri(p)}
                style={{ flex:1,paddingVertical:10,borderRadius:10,borderWidth:1.5,borderColor:editTodoPri===p?PRIORITY_COLORS[p]:tColor.border2,backgroundColor:editTodoPri===p?PRIORITY_COLORS[p]+'22':tColor.bg2,alignItems:'center' }}>
                <Txt variant="bodySemi" size={13} style={{ color:editTodoPri===p?PRIORITY_COLORS[p]:tColor.text3,textTransform:'capitalize' }}>{t(p)}</Txt>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: isRTL?'row-reverse':'row', gap:10 }}>
            <Button label="Delete" variant="danger" onPress={() => { if(editTodo){deleteTodo(editTodo.id);setEditTodo(null);} }} style={{ flex:1 }} />
            <Button label="Save" onPress={handleSaveTodo} style={{ flex:2 }} />
          </View>
        </BottomSheet>
      )}

      <BottomSheet visible={showAddLink} onClose={() => setShowAddLink(false)} title={t('links')}>
        <Input label={t('home')} value={linkTitle} onChangeText={setLinkTitle} placeholder="e.g. Khan Academy" autoFocus />
        <Input label="URL" value={linkUrl} onChangeText={setLinkUrl} placeholder="https://..." keyboardType="url" autoCapitalize="none" />
        <Button label={t('save_changes')} onPress={handleAddLink} style={{ marginTop:8 }} />
      </BottomSheet>

      <BottomSheet visible={showAddSet} onClose={() => { setShowAddSet(false); setEditSet(null); }} title={editSet ? t('edit_card') : t('sets')} scrollable>
        <Input label={t('home')} value={setTitle} onChangeText={setSetTitle} placeholder="e.g. Exam Preparation" autoFocus />
        <Input label="Steps" value={setSteps} onChangeText={setSetSteps} placeholder={"Read notes\nPractice problems\nReview formulas"} multiline numberOfLines={6} style={{ minHeight:120,textAlignVertical:'top', textAlign:isRTL?'right':'left' }} />
        <Txt variant="bodyItalic" size={12} color="tertiary" style={{ marginBottom:16, textAlign:isRTL?'right':'left' }}>Each line becomes one checklist step.</Txt>
        {editSet && (
          <Button label="Delete Set" variant="danger" onPress={() => { if(editSet){deleteStudySet(editSet.id);setShowAddSet(false);setEditSet(null);} }} style={{ marginBottom:10 }} />
        )}
        <Button label={editSet ? t('save_changes') : t('sets')} onPress={handleSaveSet} />
      </BottomSheet>

      <BottomSheet visible={showAddGrade} onClose={() => setShowAddGrade(false)} title={t('grades')} scrollable>
        <Input label={t('assessment_name')} value={gradeLabel} onChangeText={setGradeLabel} placeholder="e.g. Midterm Exam" autoFocus />
        <View style={{ flexDirection: isRTL?'row-reverse':'row', gap:10 }}>
          <View style={{ flex:1 }}><Input label={t('score')} value={gradeScore} onChangeText={setGradeScore} placeholder="85" keyboardType="decimal-pad" /></View>
          <View style={{ flex:1 }}><Input label={t('out_of')} value={gradeMax} onChangeText={setGradeMax} placeholder="100" keyboardType="decimal-pad" /></View>
        </View>
        <Input label={t('weight')} value={gradeWeight} onChangeText={setGradeWeight} placeholder="1" keyboardType="decimal-pad" />
        <Button label={t('grades')} onPress={handleAddGrade} style={{ marginTop:4 }} />
      </BottomSheet>

      {/* Add Gratitude */}
      <BottomSheet visible={showAddGrat} onClose={() => setShowAddGrat(false)} title={t('journal')}>
        <Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginBottom:12, lineHeight:20, textAlign:isRTL?'right':'left' }}>
          What went well in this course? What are you grateful for?
        </Txt>
        <Input label={t('new_note')} value={gratContent} onChangeText={setGratContent}
          placeholder="e.g. I finally understood integration by parts today!" multiline numberOfLines={4}
          style={{ minHeight:90, textAlignVertical:'top', textAlign:isRTL?'right':'left' }} autoFocus />
        <Button label="Save" onPress={handleAddGratitude} style={{ marginTop:8 }} />
      </BottomSheet>

      {/* Rename / Delete file */}
      {/* File Options Menu */}
      {fileMenuTarget !== null && (
        <BottomSheet visible={!!fileMenuTarget} onClose={() => setFileMenuTarget(null)} title="File Options" scrollable>
          {showRenameInput ? (
            <View>
              <Input label={t('rename_file')} value={renameName} onChangeText={setRenameName} autoFocus />
              <View style={{ flexDirection: isRTL?'row-reverse':'row', gap:10, marginTop:10 }}>
                <Button label="Cancel" variant="secondary" onPress={() => setShowRenameInput(false)} style={{ flex:1 }} />
                <Button label="Save" onPress={() => { renameFile(fileMenuTarget.id, renameName.trim()||fileMenuTarget.name); setFileMenuTarget(null); }} style={{ flex:1 }} />
              </View>
            </View>
          ) : (
            <View style={{ gap:8 }}>
              <Txt variant="bodySemi" size={15} style={{ marginBottom:10, textAlign:'center' }}>{fileMenuTarget.name}</Txt>

              <TouchableOpacity onPress={() => { setFileMenuTarget(null); handleOpenFile(fileMenuTarget); }}
                style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:12, padding:14, backgroundColor:tColor.bg2, borderRadius:12 }}>
                <ExternalLink size={18} color={tColor.text} />
                <Txt variant="bodySemi" size={14}>{t('open_file')}</Txt>
              </TouchableOpacity>

              <TouchableOpacity onPress={async () => { const canShare=await Sharing.isAvailableAsync(); if(canShare) Sharing.shareAsync(fileMenuTarget.uri); else Alert.alert('Error','Sharing not available'); setFileMenuTarget(null); }}
                style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:12, padding:14, backgroundColor:tColor.bg2, borderRadius:12 }}>
                <Share2 size={18} color={tColor.text} />
                <Txt variant="bodySemi" size={14}>{t('share')}</Txt>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowRenameInput(true)}
                style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:12, padding:14, backgroundColor:tColor.bg2, borderRadius:12 }}>
                <Edit2 size={18} color={tColor.text} />
                <Txt variant="bodySemi" size={14}>{t('rename_file')}</Txt>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { deleteFile(fileMenuTarget.id); setFileMenuTarget(null); }}
                style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:12, padding:14, backgroundColor:tColor.red+'22', borderRadius:12, marginTop:8 }}>
                <Trash2 size={18} color={tColor.red} />
                <Txt variant="bodySemi" size={14} style={{ color:tColor.red }}>{t('delete_file')}</Txt>
              </TouchableOpacity>
            </View>
          )}
        </BottomSheet>
      )}

      <BottomSheet visible={showAddBk} onClose={() => setShowAddBk(false)} title={t('saved')}>
        <Input label={t('home')} value={bkTitle} onChangeText={setBkTitle} placeholder="e.g. MIT OpenCourseWare" autoFocus />
        <Input label="URL" value={bkUrl} onChangeText={setBkUrl} placeholder="https://..." keyboardType="url" autoCapitalize="none" />
        <Input label={t('new_note')} value={bkNote} onChangeText={setBkNote} placeholder="e.g. Great for exam prep" />
        <Button label={t('save_changes')} onPress={handleAddBookmark} style={{ marginTop:8 }} />
      </BottomSheet>
    </SafeAreaView>
  );
}
