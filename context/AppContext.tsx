import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { db } from '../utils/db';
import CryptoJS from 'crypto-js';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import {
  Course, CourseFile, Note, TodoItem, StudySet, StudySetStep,
  Link, Priority, FileType, GradeEntry, Exam, PomodoroSession,
  UserProfile, Bookmark, StickyNote, DailyIntention, GratitudeEntry,
  StudyStreak, TrashItem,
} from '../constants/types';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';

const LOCAL_KEY = 'studynest_local_v1_secure_key_123';

const encrypt = (val: string | null | undefined) => {
  if (!val) return null;
  return CryptoJS.AES.encrypt(val, LOCAL_KEY).toString();
};

const decrypt = (val: string | null | undefined) => {
  if (!val) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(val, LOCAL_KEY);
    const original = bytes.toString(CryptoJS.enc.Utf8);
    return original || val;
  } catch {
    return val;
  }
};

// ─── Row types ────────────────────────────────────────────────────────────────
interface ProfileRow  { id:string;name:string;email:string;university:string|null;major:string|null;year:string|null;avatar_emoji:string;avatar_bg:string;id_card_visible:number;achievements:string;avatar_uri:string|null;student_id:string|null;phone:string|null;birth_date:string|null }
interface CourseRow   { id:string;name:string;icon:string;color:string;archived:number;created_at:number;updated_at:number }
interface FileRow     { id:string;course_id:string;name:string;uri:string;type:string;size:number|null;added_at:number }
interface NoteRow     { id:string;course_id:string;title:string;content:string;template:string;updated_at:number }
interface TodoRow     { id:string;course_id:string;title:string;done:number;deadline:number|null;priority:string;created_at:number }
interface SetRow      { id:string;course_id:string;title:string;created_at:number }
interface StepRow     { id:string;set_id:string;label:string;done:number;position:number }
interface LinkRow     { id:string;course_id:string;title:string;url:string;added_at:number }
interface BookmarkRow { id:string;course_id:string;title:string;url:string;note:string|null;added_at:number }
interface GradeRow    { id:string;course_id:string;label:string;score:number;max_score:number;weight:number;created_at:number }
interface ExamRow     { id:string;course_id:string;title:string;date:number;location:string|null;notes:string|null;created_at:number }
interface PomRow      { id:string;course_id:string|null;duration:number;completed_at:number }
interface StickyRow   { id:string;content:string;color:string;created_at:number;updated_at:number }
interface IntentionRow{ id:string;date:string;intention:string;mood:string;created_at:number }
interface GratRow     { id:string;course_id:string;content:string;created_at:number }
interface StreakRow    { id:string;last_date:string;current_streak:number;longest_streak:number }
interface TrashRow    { id:string;type:string;title:string;data:string;deleted_at:number }

// ─── Mappers ──────────────────────────────────────────────────────────────────
const mapProfile = (r: ProfileRow): UserProfile => {
  let achievements: UserProfile['achievements'] = [];
  try {
    const decAch = decrypt(r.achievements);
    achievements = JSON.parse(decAch || '[]');
  } catch (_) { achievements = []; }

  return {
    id: r.id,
    name: decrypt(r.name) || 'Student',
    email: decrypt(r.email) || '',
    university: decrypt(r.university) ?? undefined,
    major: decrypt(r.major) ?? undefined,
    year: decrypt(r.year) ?? undefined,
    avatarEmoji: r.avatar_emoji,
    avatarBg: r.avatar_bg,
    avatarUri: r.avatar_uri ?? undefined,
    idCardVisible: r.id_card_visible === 1,
    studentId: decrypt(r.student_id) ?? undefined,
    phone: decrypt(r.phone) ?? undefined,
    birthDate: decrypt(r.birth_date) ?? undefined,
    achievements
  };
};
const mapCourse   = (r:CourseRow):Course         => ({id:r.id,name:r.name,icon:r.icon,color:r.color,archived:r.archived===1,createdAt:r.created_at,updatedAt:r.updated_at});
const mapFile     = (r:FileRow):CourseFile       => ({id:r.id,courseId:r.course_id,name:r.name,uri:r.uri,type:r.type as FileType,size:r.size??undefined,addedAt:r.added_at});
const mapNote     = (r:NoteRow):Note             => ({id:r.id,courseId:r.course_id,title:decrypt(r.title)||(r.title),content:decrypt(r.content)||(r.content),template:((r.template as any)||'blank') as Note['template'],updatedAt:r.updated_at});
const mapTodo     = (r:TodoRow):TodoItem         => ({id:r.id,courseId:r.course_id,title:decrypt(r.title)||(r.title),done:r.done===1,deadline:r.deadline??undefined,priority:r.priority as Priority,createdAt:r.created_at});
const mapLink     = (r:LinkRow):Link             => ({id:r.id,courseId:r.course_id,title:r.title,url:r.url,addedAt:r.added_at});
const mapBookmark = (r:BookmarkRow):Bookmark     => ({id:r.id,courseId:r.course_id,title:r.title,url:r.url,note:r.note??undefined,addedAt:r.added_at});
const mapGrade    = (r:GradeRow):GradeEntry      => ({id:r.id,courseId:r.course_id,label:r.label,score:r.score,maxScore:r.max_score,weight:r.weight,createdAt:r.created_at});
const mapExam     = (r:ExamRow):Exam             => ({id:r.id,courseId:r.course_id,title:r.title,date:r.date,location:r.location??undefined,notes:r.notes??undefined,createdAt:r.created_at});
const mapPom      = (r:PomRow):PomodoroSession   => ({id:r.id,courseId:r.course_id??undefined,duration:r.duration,completedAt:r.completed_at});
const mapSticky   = (r:StickyRow):StickyNote     => ({id:r.id,content:decrypt(r.content)||(r.content),color:r.color,createdAt:r.created_at,updatedAt:r.updated_at});
const mapIntent   = (r:IntentionRow):DailyIntention => ({id:r.id,date:r.date,intention:r.intention,mood:r.mood as any,createdAt:r.created_at});
const mapGrat     = (r:GratRow):GratitudeEntry   => ({id:r.id,courseId:r.course_id,content:r.content,createdAt:r.created_at});
const mapStreak   = (r:StreakRow):StudyStreak    => ({lastDate:r.last_date,currentStreak:r.current_streak,longestStreak:r.longest_streak});
const mapTrash    = (r:TrashRow):TrashItem       => ({id:r.id,type:r.type as any,title:r.title,data:r.data,deletedAt:r.deleted_at});
function mapStudySet(row:SetRow,steps:StepRow[]):StudySet {
  return {id:row.id,courseId:row.course_id,title:row.title,createdAt:row.created_at,
    steps:steps.filter(s=>s.set_id===row.id).sort((a,b)=>a.position-b.position).map(s=>({id:s.id,label:s.label,done:s.done===1}))};
}

// ─── State ────────────────────────────────────────────────────────────────────
export interface AppState {
  profiles:UserProfile[];
  profile:UserProfile|null;
  courses:Course[];files:CourseFile[];notes:Note[];todos:TodoItem[];
  studySets:StudySet[];links:Link[];bookmarks:Bookmark[];grades:GradeEntry[];
  exams:Exam[];pomodoroSessions:PomodoroSession[];
  stickyNotes:StickyNote[];dailyIntentions:DailyIntention[];
  gratitudeEntries:GratitudeEntry[];streak:StudyStreak;trash:TrashItem[];
  ready:boolean;
}

const defaultStreak:StudyStreak = {lastDate:'',currentStreak:0,longestStreak:0};
const initialState: AppState = {
  profiles: [], profile: null,
  courses: [], files: [], notes: [], todos: [],
  studySets: [], links: [], bookmarks: [], grades: [], exams: [], pomodoroSessions: [],
  stickyNotes: [], dailyIntentions: [], gratitudeEntries: [], streak: defaultStreak, trash: [],
  ready: false,
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | {type:'LOAD';payload:Partial<AppState>}
  | {type:'ADD_PROFILE';payload:UserProfile}
  | {type:'UPDATE_PROFILE';payload:{id:string;patch:Partial<UserProfile>}}
  | {type:'DELETE_PROFILE';payload:string}
  | {type:'ADD_COURSE';payload:Course}
  | {type:'UPDATE_COURSE';payload:{id:string;patch:Partial<Course>}}
  | {type:'DELETE_COURSE';payload:string}
  | {type:'ARCHIVE_COURSE';payload:{id:string;archived:boolean}}
  | {type:'ADD_FILE';payload:CourseFile}
  | {type:'DELETE_FILE';payload:string}
  | {type:'RENAME_FILE';payload:{id:string;name:string}}
  | {type:'ADD_NOTE';payload:{note:Note;file:CourseFile}}
  | {type:'UPDATE_NOTE';payload:{id:string;patch:Partial<Note>}}
  | {type:'DELETE_NOTE';payload:string}
  | {type:'ADD_TODO';payload:TodoItem}
  | {type:'TOGGLE_TODO';payload:string}
  | {type:'UPDATE_TODO';payload:{id:string;patch:Partial<TodoItem>}}
  | {type:'DELETE_TODO';payload:string}
  | {type:'ADD_STUDY_SET';payload:StudySet}
  | {type:'UPDATE_STUDY_SET';payload:{id:string;title:string;steps:StudySetStep[]}}
  | {type:'TOGGLE_STEP';payload:{setId:string;stepId:string}}
  | {type:'DELETE_STUDY_SET';payload:string}
  | {type:'ADD_LINK';payload:Link}
  | {type:'DELETE_LINK';payload:string}
  | {type:'ADD_BOOKMARK';payload:Bookmark}
  | {type:'DELETE_BOOKMARK';payload:string}
  | {type:'ADD_GRADE';payload:GradeEntry}
  | {type:'UPDATE_GRADE';payload:{id:string;patch:Partial<GradeEntry>}}
  | {type:'DELETE_GRADE';payload:string}
  | {type:'ADD_EXAM';payload:Exam}
  | {type:'UPDATE_EXAM';payload:{id:string;patch:Partial<Exam>}}
  | {type:'DELETE_EXAM';payload:string}
  | {type:'ADD_POMODORO';payload:PomodoroSession}
  | {type:'ADD_STICKY';payload:StickyNote}
  | {type:'UPDATE_STICKY';payload:{id:string;content:string;color:string}}
  | {type:'DELETE_STICKY';payload:string}
  | {type:'SET_INTENTION';payload:DailyIntention}
  | {type:'ADD_GRATITUDE';payload:GratitudeEntry}
  | {type:'DELETE_GRATITUDE';payload:string}
  | {type:'UPDATE_STREAK';payload:StudyStreak}
  | {type:'ADD_TRASH';payload:TrashItem}
  | {type:'RESTORE_TRASH';payload:string}
  | {type:'DELETE_TRASH';payload:string}
  | {type:'ADD_ACHIEVEMENT';payload:{profileId:string;achievement:any}}
  | {type:'REMOVE_ACHIEVEMENT';payload:{profileId:string;achId:string}};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state:AppState,action:Action):AppState {
  switch(action.type){
    case 'LOAD': return {...state,...action.payload,ready:true};
    case 'ADD_PROFILE': return {...state,profiles:[...state.profiles,action.payload],profile:state.profile||action.payload};
    case 'UPDATE_PROFILE': {const{id,patch}=action.payload;const p=state.profiles.map(pr=>pr.id===id?{...pr,...patch}:pr);return{...state,profiles:p,profile:p.length?p[0]:null};}
    case 'DELETE_PROFILE': {const p=state.profiles.filter(pr=>pr.id!==action.payload);return{...state,profiles:p,profile:p.length?p[0]:null};}
    case 'ADD_COURSE': return {...state,courses:[action.payload,...state.courses]};
    case 'UPDATE_COURSE': return {...state,courses:state.courses.map(c=>c.id===action.payload.id?{...c,...action.payload.patch}:c)};
    case 'DELETE_COURSE': {const id=action.payload;return {...state,courses:state.courses.filter(c=>c.id!==id),files:state.files.filter(f=>f.courseId!==id),notes:state.notes.filter(n=>n.courseId!==id),todos:state.todos.filter(t=>t.courseId!==id),studySets:state.studySets.filter(ss=>ss.courseId!==id),links:state.links.filter(l=>l.courseId!==id),bookmarks:state.bookmarks.filter(b=>b.courseId!==id),grades:state.grades.filter(g=>g.courseId!==id),exams:state.exams.filter(e=>e.courseId!==id)};}
    case 'ARCHIVE_COURSE': return {...state,courses:state.courses.map(c=>c.id===action.payload.id?{...c,archived:action.payload.archived}:c)};
    case 'ADD_FILE': return {...state,files:[action.payload,...state.files]};
    case 'DELETE_FILE': return {...state,files:state.files.filter(f=>f.id!==action.payload)};
    case 'RENAME_FILE': return {...state,files:state.files.map(f=>f.id===action.payload.id?{...f,name:action.payload.name}:f)};
    case 'ADD_NOTE': return {...state,notes:[action.payload.note,...state.notes],files:[action.payload.file,...state.files]};
    case 'UPDATE_NOTE': {const{id,patch}=action.payload;return {...state,notes:state.notes.map(n=>n.id===id?{...n,...patch,updatedAt:Date.now()}:n),files:patch.title?state.files.map(f=>f.uri===id&&f.type==='note'?{...f,name:patch.title!}:f):state.files};}
    case 'DELETE_NOTE': return {...state,notes:state.notes.filter(n=>n.id!==action.payload),files:state.files.filter(f=>!(f.uri===action.payload&&f.type==='note'))};
    case 'ADD_TODO': return {...state,todos:[action.payload,...state.todos]};
    case 'TOGGLE_TODO': return {...state,todos:state.todos.map(t=>t.id===action.payload?{...t,done:!t.done}:t)};
    case 'UPDATE_TODO': return {...state,todos:state.todos.map(t=>t.id===action.payload.id?{...t,...action.payload.patch}:t)};
    case 'DELETE_TODO': return {...state,todos:state.todos.filter(t=>t.id!==action.payload)};
    case 'ADD_STUDY_SET': return {...state,studySets:[action.payload,...state.studySets]};
    case 'UPDATE_STUDY_SET': return {...state,studySets:state.studySets.map(ss=>ss.id===action.payload.id?{...ss,title:action.payload.title,steps:action.payload.steps}:ss)};
    case 'TOGGLE_STEP': return {...state,studySets:state.studySets.map(ss=>ss.id===action.payload.setId?{...ss,steps:ss.steps.map(st=>st.id===action.payload.stepId?{...st,done:!st.done}:st)}:ss)};
    case 'DELETE_STUDY_SET': return {...state,studySets:state.studySets.filter(ss=>ss.id!==action.payload)};
    case 'ADD_LINK': return {...state,links:[action.payload,...state.links]};
    case 'DELETE_LINK': return {...state,links:state.links.filter(l=>l.id!==action.payload)};
    case 'ADD_BOOKMARK': return {...state,bookmarks:[action.payload,...state.bookmarks]};
    case 'DELETE_BOOKMARK': return {...state,bookmarks:state.bookmarks.filter(b=>b.id!==action.payload)};
    case 'ADD_GRADE': return {...state,grades:[action.payload,...state.grades]};
    case 'UPDATE_GRADE': return {...state,grades:state.grades.map(g=>g.id===action.payload.id?{...g,...action.payload.patch}:g)};
    case 'DELETE_GRADE': return {...state,grades:state.grades.filter(g=>g.id!==action.payload)};
    case 'ADD_EXAM': return {...state,exams:[action.payload,...state.exams]};
    case 'UPDATE_EXAM': return {...state,exams:state.exams.map(e=>e.id===action.payload.id?{...e,...action.payload.patch}:e)};
    case 'DELETE_EXAM': return {...state,exams:state.exams.filter(e=>e.id!==action.payload)};
    case 'ADD_POMODORO': return {...state,pomodoroSessions:[action.payload,...state.pomodoroSessions]};
    case 'ADD_STICKY': return {...state,stickyNotes:[action.payload,...state.stickyNotes]};
    case 'UPDATE_STICKY': return {...state,stickyNotes:state.stickyNotes.map(s=>s.id===action.payload.id?{...s,content:action.payload.content,color:action.payload.color,updatedAt:Date.now()}:s)};
    case 'DELETE_STICKY': return {...state,stickyNotes:state.stickyNotes.filter(s=>s.id!==action.payload)};
    case 'SET_INTENTION': return {...state,dailyIntentions:[action.payload,...state.dailyIntentions.filter(i=>i.date!==action.payload.date)]};
    case 'ADD_GRATITUDE': return {...state,gratitudeEntries:[action.payload,...state.gratitudeEntries]};
    case 'DELETE_GRATITUDE': return {...state,gratitudeEntries:state.gratitudeEntries.filter(g=>g.id!==action.payload)};
    case 'UPDATE_STREAK': return {...state,streak:action.payload};
    case 'ADD_TRASH': return {...state,trash:[action.payload,...state.trash]};
    case 'RESTORE_TRASH': return {...state,trash:state.trash.filter(t=>t.id!==action.payload)};
    case 'DELETE_TRASH': return {...state,trash:state.trash.filter(t=>t.id!==action.payload)};
    case 'ADD_ACHIEVEMENT': {
      const {profileId, achievement} = action.payload;
      return {
        ...state,
        profiles: state.profiles.map(p => p.id === profileId ? {...p, achievements: [...(p.achievements || []), achievement]} : p),
        profile: state.profile?.id === profileId ? {...state.profile, achievements: [...(state.profile.achievements || []), achievement]} : state.profile
      };
    }
    case 'REMOVE_ACHIEVEMENT': {
      const {profileId, achId} = action.payload;
      return {
        ...state,
        profiles: state.profiles.map(p => p.id === profileId ? {...p, achievements: (p.achievements || []).filter(a => a.id !== achId)} : p),
        profile: state.profile?.id === profileId ? {...state.profile, achievements: (state.profile.achievements || []).filter(a => a.id !== achId)} : state.profile
      };
    }
    default: return state;
  }
}

// ─── Context interface ────────────────────────────────────────────────────────
interface AppContextValue {
  state:AppState;
  loadAll:()=>void;
  addProfile:(name:string)=>void;
  updateProfile:(id:string,patch:Partial<UserProfile>)=>void;
  deleteProfile:(id:string)=>void;
  addCourse:(name:string,icon:string,color:string)=>Course;
  updateCourse:(id:string,patch:Partial<Omit<Course,'id'|'createdAt'>>)=>void;
  deleteCourse:(id:string)=>void;
  archiveCourse:(id:string,archived:boolean)=>void;
  addFile:(file:Omit<CourseFile,'id'|'addedAt'>)=>void;
  deleteFile:(id:string)=>void;
  renameFile:(id:string,name:string)=>void;
  addNote:(courseId:string,title:string,template?:Note['template'])=>Note;
  updateNote:(id:string,patch:Partial<Pick<Note,'title'|'content'|'template'>>)=>void;
  deleteNote:(id:string)=>void;
  addTodo:(courseId:string,title:string,priority?:Priority,deadline?:number)=>void;
  toggleTodo:(id:string)=>void;
  updateTodo:(id:string,patch:Partial<Omit<TodoItem,'id'|'courseId'|'createdAt'>>)=>void;
  deleteTodo:(id:string)=>void;
  addStudySet:(courseId:string,title:string,steps:string[])=>void;
  updateStudySet:(id:string,title:string,steps:string[])=>void;
  toggleStep:(setId:string,stepId:string)=>void;
  deleteStudySet:(id:string)=>void;
  addLink:(courseId:string,title:string,url:string)=>void;
  deleteLink:(id:string)=>void;
  addBookmark:(courseId:string,title:string,url:string,note?:string)=>void;
  deleteBookmark:(id:string)=>void;
  addGrade:(courseId:string,label:string,score:number,maxScore:number,weight:number)=>void;
  updateGrade:(id:string,patch:Partial<GradeEntry>)=>void;
  deleteGrade:(id:string)=>void;
  addExam:(courseId:string,title:string,date:number,location?:string,notes?:string)=>Exam;
  updateExam:(id:string,patch:Partial<Exam>)=>void;
  deleteExam:(id:string)=>void;
  addPomodoro:(duration:number,courseId?:string)=>void;
  addStickyNote:(content:string,color:string)=>void;
  updateStickyNote:(id:string,content:string,color:string)=>void;
  deleteStickyNote:(id:string)=>void;
  setDailyIntention:(intention:string,mood:DailyIntention['mood'])=>void;
  addGratitude:(courseId:string,content:string)=>void;
  deleteGratitude:(id:string)=>void;
  updateStreak:()=>void;
  moveToTrash:(type:TrashItem['type'],title:string,data:object)=>string;
  restoreFromTrash:(id:string)=>TrashItem|null;
  deleteFromTrash:(id:string)=>void;
  addAchievement:(profileId:string, title:string, icon:string)=>void;
  removeAchievement:(profileId:string, achId:string)=>void;
  exportBackup:(password?:string)=>Promise<boolean>;
  importBackup:(password?:string)=>Promise<boolean>;
}

const AppContext = createContext<AppContextValue|null>(null);

export function AppProvider({children}:{children:React.ReactNode}) {
  const [state,dispatch] = useReducer(reducer,initialState);

  const loadAll = useCallback(()=>{
    const profileRows = db.getAllSync<ProfileRow>('SELECT * FROM user_profile');
    const profiles = profileRows.map(mapProfile);
    const profile = profiles.length ? profiles[0] : null;
    const courses   = db.getAllSync<CourseRow>('SELECT * FROM courses ORDER BY created_at DESC').map(mapCourse);
    const files     = db.getAllSync<FileRow>('SELECT * FROM course_files ORDER BY added_at DESC').map(mapFile);
    const notes     = db.getAllSync<NoteRow>('SELECT * FROM notes ORDER BY updated_at DESC').map(mapNote);
    const todos     = db.getAllSync<TodoRow>('SELECT * FROM todos ORDER BY created_at DESC').map(mapTodo);
    const links     = db.getAllSync<LinkRow>('SELECT * FROM links ORDER BY added_at DESC').map(mapLink);
    const bookmarks = db.getAllSync<BookmarkRow>('SELECT * FROM bookmarks ORDER BY added_at DESC').map(mapBookmark);
    const setRows   = db.getAllSync<SetRow>('SELECT * FROM study_sets ORDER BY created_at DESC');
    const stepRows  = db.getAllSync<StepRow>('SELECT * FROM study_set_steps ORDER BY position ASC');
    const studySets = setRows.map(r=>mapStudySet(r,stepRows));
    const grades    = db.getAllSync<GradeRow>('SELECT * FROM grades ORDER BY created_at DESC').map(mapGrade);
    const exams     = db.getAllSync<ExamRow>('SELECT * FROM exams ORDER BY date ASC').map(mapExam);
    const pomodoroSessions = db.getAllSync<PomRow>('SELECT * FROM pomodoro_sessions ORDER BY completed_at DESC').map(mapPom);
    let stickyNotes:StickyNote[]=[],dailyIntentions:DailyIntention[]=[],gratitudeEntries:GratitudeEntry[]=[],streak=defaultStreak,trash:TrashItem[]=[];
    try { stickyNotes = db.getAllSync<StickyRow>('SELECT * FROM sticky_notes ORDER BY updated_at DESC').map(mapSticky); } catch(_){}
    try { dailyIntentions = db.getAllSync<IntentionRow>('SELECT * FROM daily_intentions ORDER BY created_at DESC').map(mapIntent); } catch(_){}
    try { gratitudeEntries = db.getAllSync<GratRow>('SELECT * FROM gratitude_entries ORDER BY created_at DESC').map(mapGrat); } catch(_){}
    try { const sr=db.getFirstSync<StreakRow>('SELECT * FROM study_streak WHERE id="streak"'); if(sr) streak=mapStreak(sr); } catch(_){}
    try { trash = db.getAllSync<TrashRow>('SELECT * FROM trash ORDER BY deleted_at DESC').map(mapTrash); } catch(_){}
    dispatch({type:'LOAD',payload:{profiles,profile,courses,files,notes,todos,studySets,links,bookmarks,grades,exams,pomodoroSessions,stickyNotes,dailyIntentions,gratitudeEntries,streak,trash}});
  },[]);

  const moveToTrash = useCallback((type:TrashItem['type'],title:string,data:object):string=>{
    const id=uuid(),now=Date.now(),json=JSON.stringify(data);
    try{db.runSync('INSERT INTO trash (id,type,title,data,deleted_at) VALUES (?,?,?,?,?)',[id,type,title,json,now]);}catch(_){}
    dispatch({type:'ADD_TRASH',payload:{id,type,title,data:json,deletedAt:now}});
    return id;
  },[]);

  const restoreFromTrash = useCallback((id:string):TrashItem|null=>{
    const item=state.trash.find(t=>t.id===id)??null;
    if(!item)return null;
    try {
      const data = JSON.parse(item.data);
      db.withTransactionSync(() => {
        switch (item.type) {
          case 'course':
            db.runSync('INSERT INTO courses (id,name,icon,color,archived,created_at,updated_at) VALUES (?,?,?,?,?,?,?)', [data.id, data.name, data.icon, data.color, data.archived?1:0, data.createdAt, data.updatedAt]);
            break;
          case 'file':
            db.runSync('INSERT INTO course_files (id,course_id,name,uri,type,size,added_at) VALUES (?,?,?,?,?,?,?)', [data.id, data.courseId, data.name, data.uri, data.type, data.size??null, data.addedAt]);
            break;
          case 'note':
            db.runSync('INSERT INTO notes (id,course_id,title,content,template,updated_at) VALUES (?,?,?,?,?,?)', [data.id, data.courseId, data.title, data.content, data.template, data.updatedAt]);
            db.runSync('INSERT INTO course_files (id,course_id,name,uri,type,size,added_at) VALUES (?,?,?,?,?,?,?)', [uuid(), data.courseId, data.title, data.id, 'note', null, data.updatedAt]);
            break;
          case 'todo':
            db.runSync('INSERT INTO todos (id,course_id,title,done,deadline,priority,created_at) VALUES (?,?,?,?,?,?,?)', [data.id, data.courseId, data.title, data.done?1:0, data.deadline??null, data.priority, data.createdAt]);
            break;
          case 'studySet':
            db.runSync('INSERT INTO study_sets (id,course_id,title,created_at) VALUES (?,?,?,?)', [data.id, data.courseId, data.title, data.createdAt]);
            data.steps?.forEach((s: any, i: number) => {
              db.runSync('INSERT INTO study_set_steps (id,set_id,label,done,position) VALUES (?,?,?,?,?)', [s.id, data.id, s.label, s.done?1:0, i]);
            });
            break;
          case 'link':
            db.runSync('INSERT INTO links (id,course_id,title,url,added_at) VALUES (?,?,?,?,?)', [data.id, data.courseId, data.title, data.url, data.addedAt]);
            break;
          case 'bookmark':
            db.runSync('INSERT INTO bookmarks (id,course_id,title,url,note,added_at) VALUES (?,?,?,?,?,?)', [data.id, data.courseId, data.title, data.url, data.note??null, data.addedAt]);
            break;
          case 'grade':
            db.runSync('INSERT INTO grades (id,course_id,label,score,max_score,weight,created_at) VALUES (?,?,?,?,?,?,?)', [data.id, data.courseId, data.label, data.score, data.maxScore, data.weight, data.createdAt]);
            break;
          case 'exam':
            db.runSync('INSERT INTO exams (id,course_id,title,date,location,notes,created_at) VALUES (?,?,?,?,?,?,?)', [data.id, data.courseId, data.title, data.date, data.location??null, data.notes??null, data.createdAt]);
            break;
          case 'sticky':
            db.runSync('INSERT INTO sticky_notes (id,content,color,created_at,updated_at) VALUES (?,?,?,?,?)', [data.id, data.content, data.color, data.createdAt, data.updatedAt]);
            break;
          case 'gratitude':
            db.runSync('INSERT INTO gratitude_entries (id,course_id,content,created_at) VALUES (?,?,?,?)', [data.id, data.courseId, data.content, data.createdAt]);
            break;
        }
        db.runSync('DELETE FROM trash WHERE id=?',[id]);
      });
      dispatch({type:'RESTORE_TRASH',payload:id});
      loadAll();
      return item;
    } catch(e) { 
      console.error('Restore failed', e);
      return null; 
    }
  },[state.trash, loadAll]);

  const deleteFromTrash = useCallback((id:string)=>{
    try{db.runSync('DELETE FROM trash WHERE id=?',[id]);}catch(_){}
    dispatch({type:'DELETE_TRASH',payload:id});
  },[]);



  const addProfile = useCallback((name:string)=>{
    const id = uuid();
    db.runSync('INSERT INTO user_profile (id,name,email,avatar_emoji,avatar_bg) VALUES (?,?,?,?,?)',
      [id, encrypt(name), encrypt(''), '🎓', '#8B4513']);
    loadAll();
  },[loadAll]);

  const updateProfile = useCallback((id:string,patch:Partial<UserProfile>)=>{
    db.runSync(`UPDATE user_profile SET 
      name=COALESCE(?,name), email=COALESCE(?,email), university=COALESCE(?,university), 
      major=COALESCE(?,major), year=COALESCE(?,year), avatar_emoji=COALESCE(?,avatar_emoji), 
      avatar_bg=COALESCE(?,avatar_bg), avatar_uri=COALESCE(?,avatar_uri),
      student_id=COALESCE(?,student_id), phone=COALESCE(?,phone), birth_date=COALESCE(?,birth_date)
      WHERE id=?`,
      [
        patch.name !== undefined ? encrypt(patch.name) : null,
        patch.email !== undefined ? encrypt(patch.email) : null,
        patch.university !== undefined ? encrypt(patch.university) : null,
        patch.major !== undefined ? encrypt(patch.major) : null,
        patch.year !== undefined ? encrypt(patch.year) : null,
        patch.avatarEmoji ?? null,
        patch.avatarBg ?? null,
        patch.avatarUri ?? null,
        patch.studentId !== undefined ? encrypt(patch.studentId) : null,
        patch.phone !== undefined ? encrypt(patch.phone) : null,
        patch.birthDate !== undefined ? encrypt(patch.birthDate) : null,
        id
      ]);
    dispatch({type:'UPDATE_PROFILE',payload:{id,patch}});
  },[]);

  const addAchievement = useCallback((profileId:string, title:string, icon:string)=>{
    const p = state.profiles.find(x=>x.id===profileId);
    if(!p) return;
    const newAch = { id: uuid(), title, icon, date: Date.now() };
    const achievements = [...(p.achievements||[]), newAch];
    db.runSync('UPDATE user_profile SET achievements=? WHERE id=?', [encrypt(JSON.stringify(achievements)), profileId]);
    dispatch({type:'UPDATE_PROFILE', payload:{id:profileId, patch:{achievements}}});
  },[state.profiles]);

  const removeAchievement = useCallback((profileId:string, achId:string)=>{
    const profile = state.profiles.find(p => p.id === profileId);
    if (!profile) return;
    const newAchievements = (profile.achievements || []).filter(a => a.id !== achId);
    db.runSync('UPDATE user_profile SET achievements=? WHERE id=?', [JSON.stringify(newAchievements), profileId]);
    dispatch({type:'REMOVE_ACHIEVEMENT', payload: {profileId, achId}});
  },[state.profiles]);

  const deleteProfile = useCallback((id:string)=>{
    db.runSync('DELETE FROM user_profile WHERE id=?',[id]);
    dispatch({type:'DELETE_PROFILE',payload:id});
  },[]);

  const addCourse = useCallback((name:string,icon:string,color:string):Course=>{
    const now=Date.now(),id=uuid();
    db.runSync('INSERT INTO courses (id,name,icon,color,archived,created_at,updated_at) VALUES (?,?,?,?,0,?,?)',[id,name,icon,color,now,now]);
    const c:Course={id,name,icon,color,archived:false,createdAt:now,updatedAt:now};
    dispatch({type:'ADD_COURSE',payload:c});return c;
  },[]);

  const updateCourse = useCallback((id:string,patch:Partial<Omit<Course,'id'|'createdAt'>>)=>{
    const now=Date.now();
    db.runSync('UPDATE courses SET name=COALESCE(?,name),icon=COALESCE(?,icon),color=COALESCE(?,color),updated_at=? WHERE id=?',[patch.name??null,patch.icon??null,patch.color??null,now,id]);
    dispatch({type:'UPDATE_COURSE',payload:{id,patch:{...patch,updatedAt:now}}});
  },[]);

  const deleteCourse = useCallback((id:string)=>{
    const course = state.courses.find(c=>c.id===id);
    if(course) moveToTrash('course', course.name, course);
    db.runSync('DELETE FROM courses WHERE id=?',[id]);
    dispatch({type:'DELETE_COURSE',payload:id});
  },[state.courses, moveToTrash]);
  const archiveCourse = useCallback((id:string,archived:boolean)=>{db.runSync('UPDATE courses SET archived=? WHERE id=?',[archived?1:0,id]);dispatch({type:'ARCHIVE_COURSE',payload:{id,archived}});},[]);

  const addFile = useCallback((file:Omit<CourseFile,'id'|'addedAt'>)=>{
    const id=uuid(),now=Date.now();
    db.runSync('INSERT INTO course_files (id,course_id,name,uri,type,size,added_at) VALUES (?,?,?,?,?,?,?)',[id,file.courseId,file.name,file.uri,file.type,file.size??null,now]);
    dispatch({type:'ADD_FILE',payload:{...file,id,addedAt:now}});
  },[]);

  const deleteFile = useCallback((id:string)=>{
    const file = state.files.find(f=>f.id===id);
    if(file) moveToTrash('file', file.name, file);
    db.runSync('DELETE FROM course_files WHERE id=?',[id]);
    dispatch({type:'DELETE_FILE',payload:id});
  },[state.files, moveToTrash]);

  const renameFile = useCallback((id:string,name:string)=>{
    db.runSync('UPDATE course_files SET name=? WHERE id=?',[name,id]);
    dispatch({type:'RENAME_FILE',payload:{id,name}});
  },[]);

  const addNote = useCallback((courseId:string,title:string,template:Note['template']='blank'):Note=>{
    const id=uuid(),fileId=uuid(),now=Date.now();
    const templates:{[k:string]:string}={blank:`# ${title}\n\n`,lecture:`# ${title}\n\n**Date:** ${new Date().toLocaleDateString()}\n**Lecturer:**\n\n## Objectives\n\n## Key Points\n\n## Summary\n`,meeting:`# ${title}\n\n**Date:** ${new Date().toLocaleDateString()}\n**Attendees:**\n\n## Agenda\n\n## Discussion\n\n## Action Items\n`,summary:`# ${title} — Summary\n\n## Overview\n\n## Main Points\n\n## Conclusion\n`};
    const content=templates[template||'blank']||templates.blank;
    db.runSync('INSERT INTO notes (id,course_id,title,content,template,updated_at) VALUES (?,?,?,?,?,?)',[id,courseId,encrypt(title),encrypt(content),template||'blank',now]);
    db.runSync('INSERT INTO course_files (id,course_id,name,uri,type,size,added_at) VALUES (?,?,?,?,?,?,?)',[fileId,courseId,title,id,'note',null,now]);
    const note:Note={id,courseId,title,content,template:template||'blank',updatedAt:now};
    dispatch({type:'ADD_NOTE',payload:{note,file:{id:fileId,courseId,name:title,uri:id,type:'note',addedAt:now}}});
    return note;
  },[]);

  const updateNote = useCallback((id:string,patch:Partial<Pick<Note,'title'|'content'|'template'>>)=>{
    const now=Date.now();
    db.runSync('UPDATE notes SET title=COALESCE(?,title),content=COALESCE(?,content),template=COALESCE(?,template),updated_at=? WHERE id=?',[patch.title?encrypt(patch.title):null,patch.content?encrypt(patch.content):null,patch.template??null,now,id]);
    if(patch.title)db.runSync('UPDATE course_files SET name=? WHERE uri=? AND type="note"',[patch.title,id]);
    dispatch({type:'UPDATE_NOTE',payload:{id,patch}});
  },[]);

  const deleteNote = useCallback((id:string)=>{
    const note = state.notes.find(n=>n.id===id);
    if(note) moveToTrash('note', note.title, note);
    db.runSync('DELETE FROM notes WHERE id=?',[id]);
    db.runSync('DELETE FROM course_files WHERE uri=? AND type="note"',[id]);
    dispatch({type:'DELETE_NOTE',payload:id});
  },[state.notes, moveToTrash]);

  const addTodo = useCallback((courseId:string,title:string,priority:Priority='medium',deadline?:number)=>{
    const id=uuid(),now=Date.now();
    db.runSync('INSERT INTO todos (id,course_id,title,done,deadline,priority,created_at) VALUES (?,?,?,0,?,?,?)',[id,courseId,encrypt(title),deadline??null,priority,now]);
    dispatch({type:'ADD_TODO',payload:{id,courseId,title,done:false,priority,deadline,createdAt:now}});
  },[]);

  const toggleTodo = useCallback((id:string)=>{
    const row=db.getFirstSync<{done:number}>('SELECT done FROM todos WHERE id=?',[id]);
    if(!row)return;
    db.runSync('UPDATE todos SET done=? WHERE id=?',[row.done?0:1,id]);
    dispatch({type:'TOGGLE_TODO',payload:id});
  },[]);

  const updateTodo = useCallback((id:string,patch:Partial<Omit<TodoItem,'id'|'courseId'|'createdAt'>>)=>{
    db.runSync('UPDATE todos SET title=COALESCE(?,title),done=COALESCE(?,done),deadline=COALESCE(?,deadline),priority=COALESCE(?,priority) WHERE id=?',
      [patch.title?encrypt(patch.title):null,patch.done!==undefined?(patch.done?1:0):null,patch.deadline??null,patch.priority??null,id]);
    dispatch({type:'UPDATE_TODO',payload:{id,patch}});
  },[]);

  const deleteTodo = useCallback((id:string)=>{
    const todo = state.todos.find(t=>t.id===id);
    if(todo) moveToTrash('todo', todo.title, todo);
    db.runSync('DELETE FROM todos WHERE id=?',[id]);
    dispatch({type:'DELETE_TODO',payload:id});
  },[state.todos, moveToTrash]);

  const addStudySet = useCallback((courseId:string,title:string,steps:string[])=>{
    const id=uuid(),now=Date.now();
    db.runSync('INSERT INTO study_sets (id,course_id,title,created_at) VALUES (?,?,?,?)',[id,courseId,title,now]);
    const stepObjects:StudySetStep[]=steps.map((label,i)=>{const sid=uuid();db.runSync('INSERT INTO study_set_steps (id,set_id,label,done,position) VALUES (?,?,?,0,?)',[sid,id,label,i]);return{id:sid,label,done:false};});
    dispatch({type:'ADD_STUDY_SET',payload:{id,courseId,title,steps:stepObjects,createdAt:now}});
  },[]);

  const updateStudySet = useCallback((id:string,title:string,newSteps:string[])=>{
    db.runSync('UPDATE study_sets SET title=? WHERE id=?',[title,id]);
    db.runSync('DELETE FROM study_set_steps WHERE set_id=?',[id]);
    const stepObjects:StudySetStep[]=newSteps.map((label,i)=>{const sid=uuid();db.runSync('INSERT INTO study_set_steps (id,set_id,label,done,position) VALUES (?,?,?,0,?)',[sid,id,label,i]);return{id:sid,label,done:false};});
    dispatch({type:'UPDATE_STUDY_SET',payload:{id,title,steps:stepObjects}});
  },[]);

  const toggleStep = useCallback((setId:string,stepId:string)=>{
    const row=db.getFirstSync<{done:number}>('SELECT done FROM study_set_steps WHERE id=?',[stepId]);
    if(!row)return;
    db.runSync('UPDATE study_set_steps SET done=? WHERE id=?',[row.done?0:1,stepId]);
    dispatch({type:'TOGGLE_STEP',payload:{setId,stepId}});
  },[]);

  const deleteStudySet = useCallback((id:string)=>{
    const set = state.studySets.find(s=>s.id===id);
    if(set) moveToTrash('studySet', set.title, set);
    db.runSync('DELETE FROM study_sets WHERE id=?',[id]);
    dispatch({type:'DELETE_STUDY_SET',payload:id});
  },[state.studySets, moveToTrash]);
  const addLink = useCallback((courseId:string,title:string,url:string)=>{const id=uuid(),now=Date.now();db.runSync('INSERT INTO links (id,course_id,title,url,added_at) VALUES (?,?,?,?,?)',[id,courseId,title,url,now]);dispatch({type:'ADD_LINK',payload:{id,courseId,title,url,addedAt:now}});},[]);
  const deleteLink = useCallback((id:string)=>{
    const link = state.links.find(l=>l.id===id);
    if(link) moveToTrash('link', link.title, link);
    db.runSync('DELETE FROM links WHERE id=?',[id]);
    dispatch({type:'DELETE_LINK',payload:id});
  },[state.links, moveToTrash]);
  const addBookmark = useCallback((courseId:string,title:string,url:string,note?:string)=>{const id=uuid(),now=Date.now();db.runSync('INSERT INTO bookmarks (id,course_id,title,url,note,added_at) VALUES (?,?,?,?,?,?)',[id,courseId,title,url,note??null,now]);dispatch({type:'ADD_BOOKMARK',payload:{id,courseId,title,url,note,addedAt:now}});},[]);
  const deleteBookmark = useCallback((id:string)=>{
    const b = state.bookmarks.find(b=>b.id===id);
    if(b) moveToTrash('bookmark', b.title, b);
    db.runSync('DELETE FROM bookmarks WHERE id=?',[id]);
    dispatch({type:'DELETE_BOOKMARK',payload:id});
  },[state.bookmarks, moveToTrash]);
  const addGrade = useCallback((courseId:string,label:string,score:number,maxScore:number,weight:number)=>{const id=uuid(),now=Date.now();db.runSync('INSERT INTO grades (id,course_id,label,score,max_score,weight,created_at) VALUES (?,?,?,?,?,?,?)',[id,courseId,label,score,maxScore,weight,now]);dispatch({type:'ADD_GRADE',payload:{id,courseId,label,score,maxScore,weight,createdAt:now}});},[]);
  const updateGrade = useCallback((id:string,patch:Partial<GradeEntry>)=>{db.runSync('UPDATE grades SET label=COALESCE(?,label),score=COALESCE(?,score),max_score=COALESCE(?,max_score),weight=COALESCE(?,weight) WHERE id=?',[patch.label??null,patch.score??null,patch.maxScore??null,patch.weight??null,id]);dispatch({type:'UPDATE_GRADE',payload:{id,patch}});},[]);
  const deleteGrade = useCallback((id:string)=>{
    const g = state.grades.find(g=>g.id===id);
    if(g) moveToTrash('grade', g.label, g);
    db.runSync('DELETE FROM grades WHERE id=?',[id]);
    dispatch({type:'DELETE_GRADE',payload:id});
  },[state.grades, moveToTrash]);

  const addExam = useCallback((courseId:string,title:string,date:number,location?:string,notes?:string):Exam=>{
    const id=uuid(),now=Date.now();
    db.runSync('INSERT INTO exams (id,course_id,title,date,location,notes,created_at) VALUES (?,?,?,?,?,?,?)',[id,courseId,title,date,location??null,notes??null,now]);
    const exam:Exam={id,courseId,title,date,location,notes,createdAt:now};
    dispatch({type:'ADD_EXAM',payload:exam});return exam;
  },[]);

  const updateExam = useCallback((id:string,patch:Partial<Exam>)=>{
    db.runSync('UPDATE exams SET title=COALESCE(?,title),date=COALESCE(?,date),location=COALESCE(?,location),notes=COALESCE(?,notes) WHERE id=?',[patch.title??null,patch.date??null,patch.location??null,patch.notes??null,id]);
    dispatch({type:'UPDATE_EXAM',payload:{id,patch}});
  },[]);

  const deleteExam = useCallback((id:string)=>{
    const e = state.exams.find(e=>e.id===id);
    if(e) moveToTrash('exam', e.title, e);
    db.runSync('DELETE FROM exams WHERE id=?',[id]);
    dispatch({type:'DELETE_EXAM',payload:id});
  },[state.exams, moveToTrash]);

  const addPomodoro = useCallback((duration:number,courseId?:string)=>{
    const id=uuid(),now=Date.now();
    db.runSync('INSERT INTO pomodoro_sessions (id,course_id,duration,completed_at) VALUES (?,?,?,?)',[id,courseId??null,duration,now]);
    dispatch({type:'ADD_POMODORO',payload:{id,courseId,duration,completedAt:now}});
  },[]);

  const addStickyNote = useCallback((content:string,color:string)=>{
    const id=uuid(),now=Date.now();
    try{db.runSync('INSERT INTO sticky_notes (id,content,color,created_at,updated_at) VALUES (?,?,?,?,?)',[id,encrypt(content),color,now,now]);}catch(_){}
    dispatch({type:'ADD_STICKY',payload:{id,content,color,createdAt:now,updatedAt:now}});
  },[]);

  const updateStickyNote = useCallback((id:string,content:string,color:string)=>{
    const now=Date.now();
    try{db.runSync('UPDATE sticky_notes SET content=?,color=?,updated_at=? WHERE id=?',[encrypt(content),color,now,id]);}catch(_){}
    dispatch({type:'UPDATE_STICKY',payload:{id,content,color}});
  },[]);

  const deleteStickyNote = useCallback((id:string)=>{
    try{db.runSync('DELETE FROM sticky_notes WHERE id=?',[id]);}catch(_){}
    dispatch({type:'DELETE_STICKY',payload:id});
  },[]);

  const setDailyIntention = useCallback((intention:string,mood:DailyIntention['mood'])=>{
    const id=uuid(),now=Date.now(),date=new Date().toISOString().slice(0,10);
    try{db.runSync('INSERT OR REPLACE INTO daily_intentions (id,date,intention,mood,created_at) VALUES (?,?,?,?,?)',[id,date,intention,mood,now]);}catch(_){}
    dispatch({type:'SET_INTENTION',payload:{id,date,intention,mood,createdAt:now}});
  },[]);

  const addGratitude = useCallback((courseId:string,content:string)=>{
    const id=uuid(),now=Date.now();
    try{db.runSync('INSERT INTO gratitude_entries (id,course_id,content,created_at) VALUES (?,?,?,?)',[id,courseId,content,now]);}catch(_){}
    dispatch({type:'ADD_GRATITUDE',payload:{id,courseId,content,createdAt:now}});
  },[]);

  const deleteGratitude = useCallback((id:string)=>{
    try{db.runSync('DELETE FROM gratitude_entries WHERE id=?',[id]);}catch(_){}
    dispatch({type:'DELETE_GRATITUDE',payload:id});
  },[]);

  const updateStreak = useCallback(()=>{
    const today=new Date().toISOString().slice(0,10);
    try{
      const row=db.getFirstSync<StreakRow>('SELECT * FROM study_streak WHERE id="streak"');
      const last=row?.last_date??'';
      const yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
      let cur=(row?.current_streak??0),lon=(row?.longest_streak??0);
      if(last===today)return;
      cur=last===yesterday?cur+1:1;
      lon=Math.max(lon,cur);
      db.runSync('UPDATE study_streak SET last_date=?,current_streak=?,longest_streak=? WHERE id="streak"',[today,cur,lon]);
      dispatch({type:'UPDATE_STREAK',payload:{lastDate:today,currentStreak:cur,longestStreak:lon}});
    }catch(_){}
  },[]);


  const exportBackup = useCallback(async (password?: string) => {
    try {
      const tables = ['user_profile', 'courses', 'files', 'notes', 'todos', 'study_sets', 'study_set_steps', 'links', 'bookmarks', 'grades', 'exams', 'pomodoro_sessions', 'sticky_notes', 'daily_intentions', 'gratitude_entries'];
      const data: any = {};
      tables.forEach(t => {
        try { data[t] = db.getAllSync(`SELECT * FROM ${t}`); } catch(_) { data[t] = []; }
      });

      const json = JSON.stringify(data);
      const fileName = `studynest_backup_${Date.now()}.json`;
      const filePath = FileSystem.cacheDirectory + fileName;

      const exportObj = {
        version: 1,
        timestamp: Date.now(),
        isEncrypted: !!password,
        data: password ? CryptoJS.AES.encrypt(json, password).toString() : data
      };

      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportObj));
      await Sharing.shareAsync(filePath);
      return true;
    } catch (e) {
      console.error('Export failed', e);
      return false; 
    }
  }, []);

  const importBackup = useCallback(async (password?: string) => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (res.canceled) return false;

      const content = await FileSystem.readAsStringAsync(res.assets[0].uri);
      const data = JSON.parse(content);

      if (data.isEncrypted && !password) throw new Error('PASSWORD_REQUIRED');

      let payload = data.data;
      if (data.isEncrypted && password) {
        try {
          const bytes = CryptoJS.AES.decrypt(data.data, password);
          const decryptedJson = bytes.toString(CryptoJS.enc.Utf8);
          if (!decryptedJson) throw new Error('WRONG_PASSWORD');
          payload = JSON.parse(decryptedJson);
        } catch {
          throw new Error('WRONG_PASSWORD');
        }
      }

      db.withTransactionSync(() => {
        if (payload.user_profile) payload.user_profile.forEach((r: any) => {
          try {
            db.runSync(`INSERT OR REPLACE INTO user_profile (id,name,email,university,major,year,avatar_emoji,avatar_bg,id_card_visible,achievements,avatar_uri,student_id,phone,birth_date) 
              VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, 
              [r.id, r.name, r.email, r.university, r.major, r.year, r.avatar_emoji, r.avatar_bg, r.id_card_visible, r.achievements, r.avatar_uri, r.student_id, r.phone, r.birth_date]);
          } catch (_) {}
        });
        if (payload.courses)    payload.courses.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO courses VALUES (?,?,?,?,?,?,?)',[r.id,r.name,r.icon,r.color,r.archived??0,r.created_at,r.updated_at]);}catch(_){} });
        if (payload.notes)      payload.notes.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO notes VALUES (?,?,?,?,?,?)',[r.id,r.course_id,r.title,r.content,r.template??'blank',r.updated_at]);}catch(_){} });
        if (payload.todos)      payload.todos.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO todos VALUES (?,?,?,?,?,?,?)',[r.id,r.course_id,r.title,r.done,r.deadline,r.priority,r.created_at]);}catch(_){} });
        if (payload.files)      payload.files.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO files VALUES (?,?,?,?,?,?,?)',[r.id,r.course_id,r.name,r.uri,r.type,r.size,r.added_at]);}catch(_){} });
        if (payload.study_sets) payload.study_sets.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO study_sets VALUES (?,?,?,?,?)',[r.id,r.course_id,r.title,r.description,r.created_at]);}catch(_){} });
        if (payload.study_set_steps) payload.study_set_steps.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO study_set_steps VALUES (?,?,?,?,?)',[r.id,r.set_id,r.question,r.answer,r.order_num]);}catch(_){} });
        if (payload.links)      payload.links.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO links VALUES (?,?,?,?,?)',[r.id,r.course_id,r.title,r.url,r.added_at]);}catch(_){} });
        if (payload.bookmarks)  payload.bookmarks.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO bookmarks VALUES (?,?,?,?)',[r.id,r.title,r.url,r.added_at]);}catch(_){} });
        if (payload.grades)     payload.grades.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO grades VALUES (?,?,?,?,?,?)',[r.id,r.course_id,r.title,r.grade,r.weight,r.date]);}catch(_){} });
        if (payload.exams)      payload.exams.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO exams VALUES (?,?,?,?,?,?)',[r.id,r.course_id,r.title,r.date,r.location,r.reminder_id]);}catch(_){} });
        if (payload.pomodoro_sessions) payload.pomodoro_sessions.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO pomodoro_sessions VALUES (?,?,?,?,?)',[r.id,r.course_id,r.duration_min,r.completed_at,r.type]);}catch(_){} });
        if (payload.sticky_notes) payload.sticky_notes.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO sticky_notes VALUES (?,?,?,?,?)',[r.id,r.content,r.color,r.x,r.y]);}catch(_){} });
        if (payload.daily_intentions) payload.daily_intentions.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO daily_intentions VALUES (?,?,?,?)',[r.id,r.content,r.done,r.date]);}catch(_){} });
        if (payload.gratitude_entries) payload.gratitude_entries.forEach((r:any)=>{ try{db.runSync('INSERT OR REPLACE INTO gratitude_entries VALUES (?,?,?)',[r.id,r.content,r.date]);}catch(_){} });
      });

      loadAll();
      return true;
    } catch (e: any) {
      if (e.message === 'PASSWORD_REQUIRED' || e.message === 'WRONG_PASSWORD') throw e;
      console.error('Import failed', e);
      return false;
    }
  }, [loadAll]);

  return (
    <AppContext.Provider value={{
      state, loadAll, addProfile, updateProfile, deleteProfile,
      addCourse, updateCourse, deleteCourse, archiveCourse,
      addFile, deleteFile, renameFile, addNote, updateNote, deleteNote,
      addTodo, toggleTodo, updateTodo, deleteTodo,
      addStudySet, updateStudySet, toggleStep, deleteStudySet,
      addLink, deleteLink, addBookmark, deleteBookmark,
      addGrade, updateGrade, deleteGrade,
      addExam, updateExam, deleteExam,
      addPomodoro, addStickyNote, updateStickyNote, deleteStickyNote,
      setDailyIntention, addGratitude, deleteGratitude, updateStreak,
      moveToTrash, restoreFromTrash, deleteFromTrash,
      addAchievement, removeAchievement,
      exportBackup, importBackup
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
