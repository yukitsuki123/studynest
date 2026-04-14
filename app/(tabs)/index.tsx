import { 
  Search, BarChart2, Clock, Zap, Sun, Edit2, FileText, ChevronRight, 
  Plus, Folder, Calendar, HardDrive, CreditCard, Book, File, CheckSquare 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, TextInput, TouchableOpacity, View, Image as RNImage } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DeadlineCard } from '../../components/schedule/DeadlineCard';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';
import { Txt } from '../../components/ui/Text';
import { FILE_TYPE_COLORS } from '../../constants/icons';
import { getDailyQuote } from '../../constants/quotes';
import { useApp } from '../../context/AppContext';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../hooks/useTheme';
import { daysUntil, formatRelativeTime } from '../../utils/storage';
import { getHijriDate, formatHijri } from '../../utils/hijri';

const MOODS = [
  { key:'great',   label:'Great',   emoji:'😄' },
  { key:'good',    label:'Good',    emoji:'🙂' },
  { key:'okay',    label:'Okay',    emoji:'😐' },
  { key:'tired',   label:'Tired',   emoji:'😴' },
  { key:'stressed',label:'Stressed',emoji:'😤' },
] as const;

const STICKY_COLORS = ['#FFF9C4','#C8E6C9','#BBDEFB','#F8BBD0','#E1BEE7','#FFE0B2'];

// ── Time of day ───────────────────────────────────────────────────────────────
function getTimeOfDay(): 'morning'|'afternoon'|'evening'|'night' {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

const TIME_CONFIG = {
  morning:   { label:'Good morning',   emoji:'🌅', bg:'#FFF8E1', accent:'#F59E0B', labelAr:'صباح الخير' },
  afternoon: { label:'Good afternoon', emoji:'☀️', bg:'#FFF3E0', accent:'#EA580C', labelAr:'مساء الخير' },
  evening:   { label:'Good evening',   emoji:'🌆', bg:'#F3E8FF', accent:'#7C3AED', labelAr:'مساء النور' },
  night:     { label:'Good night',     emoji:'🌙', bg:'#E0F2FE', accent:'#0284C7', labelAr:'تصبح على خير' },
};

// ── Sparkle particle ──────────────────────────────────────────────────────────
function Sparkle({ x, y, onDone }: { x:number; y:number; onDone:()=>void }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue:1, duration:700, useNativeDriver:true }).start(onDone);
  }, []);
  const opacity   = anim.interpolate({ inputRange:[0,0.5,1], outputRange:[0,1,0] });
  const scale     = anim.interpolate({ inputRange:[0,0.3,1], outputRange:[0.4,1.4,0.6] });
  const translateY= anim.interpolate({ inputRange:[0,1],     outputRange:[0,-40] });
  return (
    <Animated.View style={{ position:'absolute', left:x-12, top:y-12, opacity, transform:[{scale},{translateY}], zIndex:999, pointerEvents:'none' }}>
      <Txt style={{ fontSize:22 }}>✨</Txt>
    </Animated.View>
  );
}

// ── Paper texture background ──────────────────────────────────────────────────
function PaperTexture({ color }: { color:string }) {
  return (
    <View style={{ position:'absolute', top:0, left:0, right:0, bottom:0, opacity:0.03, overflow:'hidden' }} pointerEvents="none">
      {Array.from({length:20}).map((_,i)=>(
        <View key={i} style={{ height:1, backgroundColor:color, marginTop: 18 + (i%3)*2 }} />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const tColor = useTheme();
  const { language, isRTL, homeSections, t, activeProfileId } = useSettings();
  const router  = useRouter();
  const { state, setDailyIntention, addStickyNote, updateStickyNote, deleteStickyNote, deleteFromTrash } = useApp();
  const { courses, todos, exams, pomodoroSessions, stickyNotes, dailyIntentions, streak, profiles } = state;
  const profile = useMemo(() => profiles.find(p => p.id === activeProfileId) || (profiles.length > 0 ? profiles[0] : null), [profiles, activeProfileId]);

  const quote      = getDailyQuote();
  const timeOfDay  = getTimeOfDay();
  const timeCfg    = TIME_CONFIG[timeOfDay];
  const userName   = profile?.name?.split(' ')[0] ?? 'Student';
  const now        = Date.now();
  const today      = new Date().toISOString().slice(0,10);
  const todayIntention = useMemo(() => dailyIntentions.find(i => i.date === today), [dailyIntentions, today]);

  const [sparkles,       setSparkles]       = useState<{id:number;x:number;y:number}[]>([]);
  const [showIntention,  setShowIntention]  = useState(false);
  const [showEndOfDay,   setShowEndOfDay]   = useState(false);
  const [intentionText,  setIntentionText]  = useState('');
  const [selectedMood,   setSelectedMood]   = useState<typeof MOODS[number]['key']>('good');
  const [showStickyEdit, setShowStickyEdit] = useState<string|null>(null);
  const [stickyContent,  setStickyContent]  = useState('');
  const [stickyColor,    setStickyColor]    = useState(STICKY_COLORS[0]);
  const sparkleCounter = useRef(0);

  // Show intention check-in if not set today
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!todayIntention) setShowIntention(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [todayIntention]);

  // End of day summary at 9 PM
  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 21) {
      const shown = state.dailyIntentions.find(i => i.date === today);
      if (shown) setShowEndOfDay(true);
    }
  }, []);

  const addSparkle = (x=80, y=200) => {
    const id = sparkleCounter.current++;
    setSparkles(s => [...s, {id,x,y}]);
    setTimeout(() => setSparkles(s => s.filter(sp => sp.id !== id)), 800);
  };

  const dueSoon     = useMemo(() => todos.filter(td=>!td.done&&td.deadline&&td.deadline>now&&td.deadline<now+7*86400000), [todos]);
  const upcoming    = useMemo(() => [...todos].filter(td=>!td.done&&td.deadline).sort((a,b)=>a.deadline!-b.deadline!).slice(0,3), [todos]);
  const recentFiles = useMemo(() => [...state.files].sort((a,b)=>b.addedAt-a.addedAt).slice(0,4), [state.files]);
  const nextExam    = useMemo(() => [...exams].filter(e=>e.date>=now).sort((a,b)=>a.date-b.date)[0], [exams]);
  const todayPomos  = useMemo(() => pomodoroSessions.filter(s=>new Date(s.completedAt).toDateString()===new Date().toDateString()).length, [pomodoroSessions]);
  const doneTodos   = todos.filter(td=>td.done).length;
  const overallPct  = todos.length ? doneTodos/todos.length : 0;
  const activeCourses = useMemo(() => courses.filter(c=>!c.archived), [courses]);
  
  const todayDate = useMemo(() => {
    if (language === 'ar') {
      const h = getHijriDate(new Date());
      return formatHijri(h);
    }
    return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  }, [language]);

  const handleSaveIntention = () => {
    if (!intentionText.trim()) return;
    setDailyIntention(intentionText.trim(), selectedMood);
    setIntentionText('');
    setShowIntention(false);
  };

  const openNewSticky = () => {
    setShowStickyEdit('new');
    setStickyContent('');
    setStickyColor(STICKY_COLORS[Math.floor(Math.random()*STICKY_COLORS.length)]);
  };

  const openEditSticky = (id:string) => {
    const note = stickyNotes.find(s=>s.id===id);
    if (!note) return;
    setShowStickyEdit(id);
    setStickyContent(note.content);
    setStickyColor(note.color);
  };

  const saveSticky = () => {
    if (!stickyContent.trim()) { if(showStickyEdit!=='new'&&showStickyEdit) deleteStickyNote(showStickyEdit); setShowStickyEdit(null); return; }
    if (showStickyEdit==='new') addStickyNote(stickyContent.trim(), stickyColor);
    else if (showStickyEdit)    updateStickyNote(showStickyEdit, stickyContent.trim(), stickyColor);
    setShowStickyEdit(null);
  };

  // Weekly tasks done summary
  const weekStart   = Date.now() - 7*86400000;
  const weekTasks   = todos.filter(td=>td.done&&td.createdAt>=weekStart).length;
  const weekPomos   = pomodoroSessions.filter(s=>s.completedAt>=weekStart).length;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:tColor.bg }} edges={['top']}>
      {/* Paper texture */}
      {/* <PaperTexture color={tColor.text} /> */}

      {/* Sparkles layer */}
      {sparkles.map(sp => <Sparkle key={sp.id} x={sp.x} y={sp.y} onDone={() => setSparkles(s=>s.filter(x=>x.id!==sp.id))} />)}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:32 }}>

        {/* ── Time-of-day header ── */}
        {homeSections.greeting && (
          <View style={{ paddingHorizontal:20, paddingTop:16, paddingBottom:12 }}>
            <View style={{ flexDirection:isRTL?'row-reverse':'row', alignItems:'center', gap:12 }}>
              <TouchableOpacity onPress={() => router.push('/idcard' as any)}
                style={{ width:44, height:44, borderRadius:22, backgroundColor:profile?.avatarBg??tColor.accent, alignItems:'center', justifyContent:'center', borderWidth:2, borderColor:timeCfg.accent+'44', overflow: 'hidden' }}>
                {profile?.avatarUri ? (
                  <RNImage source={{ uri: profile.avatarUri }} style={{ width: 44, height: 44 }} />
                ) : (
                  <Txt style={{ fontSize:22 }}>{profile?.avatarEmoji??'🎓'}</Txt>
                )}
              </TouchableOpacity>
              <View style={{ flex:1 }}>
                <Txt variant="display" size={20} style={{ lineHeight:26, textAlign:isRTL?'right':'left' }}>
                  {t(`greeting_${timeOfDay}` as any)}, {userName}
                </Txt>
                <Txt variant="mono" size={9} color="tertiary" style={{ marginTop:2, textAlign:isRTL?'right':'left' }}>{todayDate}</Txt>
              </View>
              <View style={{ flexDirection:'row', gap:6 }}>
                <TouchableOpacity onPress={() => router.push('/search' as any)} style={{ width:34, height:34, borderRadius:9, backgroundColor:tColor.card, borderWidth:1, borderColor:tColor.border, alignItems:'center', justifyContent:'center' }}>
                  <Search size={15} color={tColor.text2} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/report' as any)} style={{ width:34, height:34, borderRadius:9, backgroundColor:tColor.card, borderWidth:1, borderColor:tColor.border, alignItems:'center', justifyContent:'center' }}>
                  <BarChart2 size={15} color={tColor.text2} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/pomodoro' as any)} style={{ width:34, height:34, borderRadius:9, backgroundColor:tColor.accent, alignItems:'center', justifyContent:'center' }}>
                  <Clock size={15} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Streak badge */}
            {homeSections.streak && streak.currentStreak > 0 && (
              <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginTop:10, alignSelf:'flex-start', backgroundColor:tColor.accent2, paddingHorizontal:12, paddingVertical:6, borderRadius:20, shadowColor: tColor.accent2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3 }}>
                <Zap size={12} color={tColor.getContrastColor(tColor.accent2)} />
                <Txt variant="mono" size={11} style={{ color: tColor.getContrastColor(tColor.accent2) }}>{streak.currentStreak} day streak</Txt>
                {streak.longestStreak > 0 && <Txt variant="mono" size={9} style={{ color: tColor.getContrastColor(tColor.accent2) + 'aa' }}>· best {streak.longestStreak}</Txt>}
              </View>
            )}
          </View>
        )}

        {/* ── Today's intention ── */}
        {homeSections.intention && (
          todayIntention ? (
            <TouchableOpacity onPress={() => setShowIntention(true)}
              style={{ marginHorizontal:20, marginBottom:14, backgroundColor:timeCfg.bg, borderRadius:12, borderWidth:1, borderColor:timeCfg.accent+'33', padding:14, flexDirection:'row', gap:10, alignItems:'flex-start' }}>
              <Txt style={{ fontSize:18 }}>{MOODS.find(m=>m.key===todayIntention.mood)?.emoji??'🙂'}</Txt>
              <View style={{ flex:1 }}>
                <Txt variant="mono" size={9} style={{ color:timeCfg.accent, textTransform:'uppercase', letterSpacing:0.8, marginBottom:3, textAlign:isRTL?'right':'left' }}>{t('todays_intention')}</Txt>
                <Txt variant="displayItalic" size={13} style={{ color:tColor.text2, lineHeight:20, textAlign:isRTL?'right':'left' }}>"{todayIntention.intention}"</Txt>
              </View>
              <Edit2 size={12} color={tColor.text3} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setShowIntention(true)}
              style={{ marginHorizontal:20, marginBottom:14, borderWidth:1, borderColor:timeCfg.accent+'44', borderRadius:12, borderStyle:'dashed', padding:14, flexDirection:'row', gap:10, alignItems:'center' }}>
              <Sun size={16} color={timeCfg.accent} />
              <Txt variant="bodyItalic" size={13} style={{ color:timeCfg.accent }}>Set today's intention…</Txt>
            </TouchableOpacity>
          )
        )}

        {/* ── Stats chips ── */}
        {homeSections.stats && (
          <View style={{ flexDirection:'row', gap:8, paddingHorizontal:20, marginBottom:14 }}>
            {[
              {label:t('courses'),   value:activeCourses.length, color:tColor.accent},
              {label:language==='ar'?'قريباً':'Due Soon', value:dueSoon.length, color:dueSoon.length>0?tColor.red:tColor.accent3},
              {label:'Pomodoros', value:todayPomos, color:'#C0622A'},
              {label:'Tasks %',   value:`${Math.round(overallPct*100)}%`, color:tColor.accent2},
            ].map(s=>(
              <View key={s.label} style={{ flex:1, backgroundColor:tColor.card, borderRadius:10, borderWidth:1, borderColor:tColor.border2, padding:10, alignItems:'center' }}>
                <Txt variant="display" size={18} style={{ color:s.color, lineHeight:22 }}>{s.value}</Txt>
                <Txt variant="mono" size={8} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:0.4, marginTop:2, textAlign:'center' }}>{s.label}</Txt>
              </View>
            ))}
          </View>
        )}

        {/* ── Next exam banner ── */}
        {homeSections.exams && nextExam && (
          <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}
            style={{ marginHorizontal:20, marginBottom:14, padding:14, backgroundColor:tColor.red+'12', borderRadius:12, borderWidth:1, borderColor:tColor.red+'44', flexDirection:'row', alignItems:'center', gap:12 }}>
            <View style={{ width:38, height:38, borderRadius:10, backgroundColor:tColor.red+'22', alignItems:'center', justifyContent:'center' }}>
              <FileText size={18} color={tColor.red} />
            </View>
            <View style={{ flex:1 }}>
              <Txt variant="mono" size={9} style={{ color:tColor.red, textTransform:'uppercase', letterSpacing:0.8, marginBottom:2 }}>Next Exam</Txt>
              <Txt variant="bodySemi" size={14}>{nextExam.title}</Txt>
              <Txt variant="mono" size={10} style={{ color:tColor.red, marginTop:2 }}>{new Date(nextExam.date).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})} · {daysUntil(nextExam.date)}d</Txt>
            </View>
            <ChevronRight size={16} color={tColor.red} />
          </TouchableOpacity>
        )}

        {/* ── Daily quote ── */}
        {homeSections.quote && (
          <View style={{ marginHorizontal:20, marginBottom:14, borderLeftWidth:3, borderLeftColor:tColor.accent, paddingLeft:14, paddingVertical:10, backgroundColor:tColor.card, borderRadius:10 }}>
            <Txt variant="displayItalic" size={13} color="secondary" style={{ lineHeight:22 }}>"{quote.text}"</Txt>
            <Txt variant="mono" size={10} color="tertiary" style={{ marginTop:4 }}>— {quote.author}</Txt>
          </View>
        )}

        {/* ── Sticky notes ── */}
        {homeSections.stickyNotes && (
          <>
            <View style={{ flexDirection:isRTL?'row-reverse':'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:20, marginBottom:10 }}>
              <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:1.2, textAlign:isRTL?'right':'left' }}>— {t('quick_notes')}</Txt>
              <TouchableOpacity onPress={openNewSticky} style={{ flexDirection:isRTL?'row-reverse':'row', alignItems:'center', gap:4 }}>
                <Plus size={12} color={tColor.accent} />
                <Txt variant="mono" size={10} color="accent">{language==='ar'?'إضافة':'Add'}</Txt>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:20, gap:10, paddingBottom:4 }}>
              {stickyNotes.slice(0,10).map(note => (
                <TouchableOpacity key={note.id} onPress={() => openEditSticky(note.id)} activeOpacity={0.85}
                  style={{ width:140, minHeight:120, backgroundColor:note.color, borderRadius:12, padding:14, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:6, elevation:2 }}>
                  <Txt style={{ fontSize:9, fontFamily:'JetBrainsMono_400Regular', color:'#333', lineHeight:16 }} numberOfLines={7}>{note.content}</Txt>
                </TouchableOpacity>
              ))}
              {stickyNotes.length === 0 && (
                <TouchableOpacity onPress={openNewSticky}
                  style={{ width:140, height:120, backgroundColor:STICKY_COLORS[0], borderRadius:12, padding:14, borderWidth:1.5, borderColor:'#E0E0E0', borderStyle:'dashed', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <Plus size={22} color="#888" />
                  <Txt style={{ fontSize:11, color:'#888', textAlign:'center' }}>Add a quick note</Txt>
                </TouchableOpacity>
              )}
            </ScrollView>
          </>
        )}

        {/* ── Quick actions ── */}
        {homeSections.actions && (
          <>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:1.2, paddingHorizontal:20, marginTop:18, marginBottom:10, textAlign:isRTL?'right':'left' }}>— {t('quick_actions')}</Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:20, gap:10, flexDirection:isRTL?'row-reverse':'row' }}>
              {[
                {label:t('courses'),                           icon:'folder',     color:tColor.accent,   onPress:()=>router.push('/(tabs)/courses')},
                {label:'Pomodoro',                             icon:'clock',      color:'#C0622A',  onPress:()=>router.push('/pomodoro' as any)},
                {label:t('schedule'),                          icon:'calendar',   color:tColor.blue,     onPress:()=>router.push('/(tabs)/schedule')},
                {label:language==='ar'?'بحث':'Search',         icon:'search',     color:tColor.accent3,  onPress:()=>router.push('/search' as any)},
                {label:language==='ar'?'تقرير':'Report',        icon:'bar-chart-2',color:tColor.accent2, onPress:()=>router.push('/report' as any)},
                {label:'ID Card',                              icon:'credit-card',color:tColor.accent,   onPress:()=>router.push('/idcard' as any)},
                {label:'Backup',                               icon:'hard-drive', color:tColor.accent3,  onPress:()=>router.push('/backup' as any)},
              ].map(a=>(
                <TouchableOpacity key={a.label} onPress={a.onPress}
                  style={{ flexDirection:isRTL?'row-reverse':'row', alignItems:'center', gap:8, paddingHorizontal:14, paddingVertical:10, borderRadius:20, backgroundColor:a.color+'22', borderWidth:1, borderColor:a.color+'44' }}>
                  {a.icon === 'folder' && <Folder size={13} color={a.color} />}
                  {a.icon === 'clock' && <Clock size={13} color={a.color} />}
                  {a.icon === 'calendar' && <Calendar size={13} color={a.color} />}
                  {a.icon === 'search' && <Search size={13} color={a.color} />}
                  {a.icon === 'bar-chart-2' && <BarChart2 size={13} color={a.color} />}
                  {a.icon === 'credit-card' && <CreditCard size={13} color={a.color} />}
                  {a.icon === 'hard-drive' && <HardDrive size={13} color={a.color} />}
                  <Txt variant="mono" size={11} style={{ color:a.color }}>{a.label}</Txt>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Course cards ── */}
        {homeSections.courses && activeCourses.length > 0 && (
          <>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:1.2, paddingHorizontal:20, marginTop:18, marginBottom:10, textAlign:isRTL?'right':'left' }}>— {t('courses')}</Txt>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:20, gap:10, flexDirection:isRTL?'row-reverse':'row' }}>
              {activeCourses.map(course=>{
                const cTodos=todos.filter(td=>td.courseId===course.id);
                const cDone=cTodos.filter(td=>td.done).length;
                const pct=cTodos.length?cDone/cTodos.length:0;
                const cExams=exams.filter(e=>e.courseId===course.id&&e.date>=now);
                return (
                  <TouchableOpacity key={course.id} onPress={()=>router.push(`/course/${course.id}` as any)} activeOpacity={0.8}
                    style={{ width:140, backgroundColor:tColor.card, borderRadius:14, borderWidth:1, borderColor:tColor.border2, borderTopWidth:3, borderTopColor:course.color, padding:14, gap:6 }}>
                    <Book size={20} color={course.color} />
                    <Txt variant="bodySemi" size={13} numberOfLines={1}>{course.name}</Txt>
                    <View style={{ height:4, backgroundColor:tColor.bg3, borderRadius:2, overflow:'hidden' }}>
                      <View style={{ height:4, width:`${Math.round(pct*100)}%`, backgroundColor:course.color, borderRadius:2 }} />
                    </View>
                    <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
                      <Txt variant="mono" size={9} color="tertiary">{Math.round(pct*100)}%</Txt>
                      {cExams.length>0&&<Txt variant="mono" size={9} style={{ color:tColor.red }}>{cExams.length} exam{cExams.length>1?'s':''}</Txt>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* ── Recent activity ── */}
        {homeSections.recentActivity && (
          <>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:1.2, paddingHorizontal:20, marginTop:18, marginBottom:10, textAlign:isRTL?'right':'left' }}>— {t('recent_activity')}</Txt>
            {recentFiles.map(item=>{
              const course=courses.find(c=>c.id===item.courseId);
              const colors=FILE_TYPE_COLORS[item.type.toLowerCase()]??FILE_TYPE_COLORS.other;
              return (
                <TouchableOpacity key={item.id} onPress={()=>router.push(`/course/${item.courseId}` as any)} activeOpacity={0.8}
                  style={{ flexDirection:'row', alignItems:'center', gap:12, backgroundColor:tColor.card, borderWidth:1, borderColor:tColor.border2, borderRadius:12, padding:14, marginHorizontal:20, marginBottom:8 }}>
                  <View style={{ width:36, height:36, borderRadius:9, backgroundColor:course?course.color+'22':tColor.bg2, alignItems:'center', justifyContent:'center' }}>
                    <File size={16} color={course?.color??tColor.text3} />
                  </View>
                  <View style={{ flex:1, minWidth:0 }}>
                    <Txt variant="bodySemi" size={13} numberOfLines={1}>{item.name}</Txt>
                    <Txt variant="mono" size={10} color="tertiary" style={{ marginTop:2 }}>{formatRelativeTime(item.addedAt)} · {course?.name??''}</Txt>
                  </View>
                  <View style={{ backgroundColor:colors.bg, paddingHorizontal:7, paddingVertical:2, borderRadius:20 }}>
                    <Txt variant="mono" size={9} style={{ color:colors.text }}>{item.type.toUpperCase()}</Txt>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── Upcoming deadlines ── */}
        {homeSections.deadlines && upcoming.length>0&&(
          <>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:1.2, paddingHorizontal:20, marginTop:18, marginBottom:10, textAlign:isRTL?'right':'left' }}>— {t('upcoming_deadlines')}</Txt>
            {upcoming.map(todo=>(
              <DeadlineCard key={todo.id} todo={todo} course={courses.find(c=>c.id===todo.courseId)} onPress={()=>router.push('/(tabs)/schedule')} />
            ))}
          </>
        )}

      </ScrollView>

      {/* ── Daily intention modal ── */}
      <BottomSheet visible={showIntention} onClose={() => setShowIntention(false)} title={todayIntention?'Update Intention':'Set Today\'s Intention'} scrollable>
        <Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginBottom:14, lineHeight:20 }}>
          How do you want to show up today? A clear intention sets the tone for your whole study session.
        </Txt>
        <TextInput
          value={intentionText}
          onChangeText={setIntentionText}
          placeholder={todayIntention?todayIntention.intention:'e.g. I will focus deeply on one subject at a time…'}
          placeholderTextColor={tColor.text3}
          multiline
          numberOfLines={3}
          style={{ backgroundColor:tColor.bg2, borderRadius:10, borderWidth:1, borderColor:tColor.border2, padding:14, fontFamily:'CrimsonPro_400Regular', fontSize:15, color:tColor.text, minHeight:80, textAlignVertical:'top', marginBottom:16 }}
        />
        <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:1.2, marginBottom:10 }}>How are you feeling?</Txt>
        <View style={{ flexDirection:'row', gap:8, marginBottom:20 }}>
          {MOODS.map(m=>(
            <TouchableOpacity key={m.key} onPress={()=>setSelectedMood(m.key)}
              style={{ flex:1, alignItems:'center', paddingVertical:10, borderRadius:10, borderWidth:1.5,
                borderColor:selectedMood===m.key?tColor.accent:tColor.border2,
                backgroundColor:selectedMood===m.key?tColor.accent+'22':tColor.bg2 }}>
              <Txt style={{ fontSize:20 }}>{m.emoji}</Txt>
              <Txt variant="mono" size={8} style={{ color:selectedMood===m.key?tColor.accent:tColor.text3, marginTop:3 }}>{m.label}</Txt>
            </TouchableOpacity>
          ))}
        </View>
        <Button label="Set Intention" onPress={handleSaveIntention} />
      </BottomSheet>

      {/* ── Sticky note editor ── */}
      <BottomSheet visible={!!showStickyEdit} onClose={() => setShowStickyEdit(null)} title="Quick Note" scrollable>
        <TextInput
          value={stickyContent}
          onChangeText={setStickyContent}
          placeholder="Write anything on your mind…"
          placeholderTextColor={tColor.text3}
          multiline
          numberOfLines={5}
          autoFocus
          style={{ backgroundColor:stickyColor, borderRadius:10, borderWidth:1, borderColor:'#00000018', padding:14, fontFamily:'CrimsonPro_400Regular', fontSize:15, color:'#333', minHeight:120, textAlignVertical:'top', marginBottom:14 }}
        />
        <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>Color</Txt>
        <View style={{ flexDirection:'row', gap:10, marginBottom:20 }}>
          {STICKY_COLORS.map(c=>(
            <TouchableOpacity key={c} onPress={()=>setStickyColor(c)}
              style={{ width:32, height:32, borderRadius:16, backgroundColor:c, borderWidth:2.5, borderColor:stickyColor===c?tColor.text:'transparent' }} />
          ))}
        </View>
        <View style={{ flexDirection:'row', gap:10 }}>
          {showStickyEdit && showStickyEdit !== 'new' && (
            <Button label="Delete" variant="danger" onPress={()=>{ deleteStickyNote(showStickyEdit!); setShowStickyEdit(null); }} style={{ flex:1 }} />
          )}
          <Button label="Save" onPress={saveSticky} style={{ flex:2 }} />
        </View>
      </BottomSheet>

      {/* ── End of day summary ── */}
      <BottomSheet visible={showEndOfDay} onClose={() => setShowEndOfDay(false)} title="End of Day 🌙" scrollable>
        <Txt variant="bodyItalic" size={13} color="secondary" style={{ marginBottom:16, lineHeight:22 }}>
          Here's what you accomplished today. Be proud of every step forward.
        </Txt>
        <View style={{ gap:10, marginBottom:20 }}>
          {[
            {icon:'check-square', label:'Tasks completed this week', value:weekTasks, color:tColor.accent3},
            {icon:'clock',        label:'Pomodoro sessions this week', value:weekPomos, color:'#C0622A'},
            {icon:'zap',          label:'Study streak', value:`${streak.currentStreak} days`, color:tColor.accent2},
          ].map(s=>(
            <View key={s.label} style={{ flexDirection:'row', alignItems:'center', gap:12, backgroundColor:tColor.bg2, borderRadius:10, padding:14 }}>
              {s.icon === 'check-square' && <CheckSquare size={18} color={s.color} />}
              {s.icon === 'clock' && <Clock size={18} color={s.color} />}
              {s.icon === 'zap' && <Zap size={18} color={s.color} />}
              <Txt variant="body" size={13} style={{ flex:1 }}>{s.label}</Txt>
              <Txt variant="display" size={16} style={{ color:s.color }}>{s.value}</Txt>
            </View>
          ))}
        </View>
        {todayIntention && (
          <View style={{ backgroundColor:tColor.card, borderRadius:10, padding:14, marginBottom:16, borderLeftWidth:3, borderLeftColor:tColor.accent }}>
            <Txt variant="mono" size={9} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:0.8, marginBottom:4 }}>Today's Intention</Txt>
            <Txt variant="displayItalic" size={13} color="secondary">"{todayIntention.intention}"</Txt>
          </View>
        )}
        <Button label="Great day! 🎉" onPress={() => { addSparkle(180, 300); setShowEndOfDay(false); }} />
      </BottomSheet>

    </SafeAreaView>
  );
}
