import React, { createContext, useCallback, useContext, useReducer } from 'react';
import 'react-native-get-random-values';
import { v4 as uuid } from 'uuid';
import {
  Bookmark,
  Course, CourseFile,
  Exam,
  FileType, GradeEntry,
  Link,
  Note,
  PomodoroSession,
  Priority,
  StudySet, StudySetStep,
  TodoItem,
  UserProfile,
} from '../constants/types';
import { db } from '../utils/db';

// ─── DB row types ─────────────────────────────────────────────────────────────
interface ProfileRow { id:string;name:string;email:string;university:string|null;major:string|null;year:string|null;avatar_emoji:string;avatar_bg:string;id_card_visible:number }
interface CourseRow  { id:string;name:string;icon:string;color:string;archived:number;created_at:number;updated_at:number }
interface FileRow    { id:string;course_id:string;name:string;uri:string;type:string;size:number|null;added_at:number }
interface NoteRow    { id:string;course_id:string;title:string;content:string;template:string;updated_at:number }
interface TodoRow    { id:string;course_id:string;title:string;done:number;deadline:number|null;priority:string;created_at:number }
interface SetRow     { id:string;course_id:string;title:string;created_at:number }
interface StepRow    { id:string;set_id:string;label:string;done:number;position:number }
interface LinkRow    { id:string;course_id:string;title:string;url:string;added_at:number }
interface BookmarkRow{ id:string;course_id:string;title:string;url:string;note:string|null;added_at:number }
interface GradeRow   { id:string;course_id:string;label:string;score:number;max_score:number;weight:number;created_at:number }
interface ExamRow    { id:string;course_id:string;title:string;date:number;location:string|null;notes:string|null;created_at:number }
interface PomRow     { id:string;course_id:string|null;duration:number;completed_at:number }

// ─── Mappers ──────────────────────────────────────────────────────────────────
const mapProfile = (r:ProfileRow):UserProfile => ({id:r.id,name:r.name,email:r.email,university:r.university??undefined,major:r.major??undefined,year:r.year??undefined,avatarEmoji:r.avatar_emoji,avatarBg:r.avatar_bg,idCardVisible:r.id_card_visible===1});
const mapCourse  = (r:CourseRow):Course     => ({id:r.id,name:r.name,icon:r.icon,color:r.color,archived:r.archived===1,createdAt:r.created_at,updatedAt:r.updated_at});
const mapFile    = (r:FileRow):CourseFile   => ({id:r.id,courseId:r.course_id,name:r.name,uri:r.uri,type:r.type as FileType,size:r.size??undefined,addedAt:r.added_at});
const mapNote    = (r:NoteRow):Note         => ({id:r.id,courseId:r.course_id,title:r.title,content:r.content,template:((r.template as any)||'blank') as Note['template'],updatedAt:r.updated_at});
const mapTodo    = (r:TodoRow):TodoItem     => ({id:r.id,courseId:r.course_id,title:r.title,done:r.done===1,deadline:r.deadline??undefined,priority:r.priority as Priority,createdAt:r.created_at});
const mapLink    = (r:LinkRow):Link         => ({id:r.id,courseId:r.course_id,title:r.title,url:r.url,addedAt:r.added_at});
const mapBookmark= (r:BookmarkRow):Bookmark => ({id:r.id,courseId:r.course_id,title:r.title,url:r.url,note:r.note??undefined,addedAt:r.added_at});
const mapGrade   = (r:GradeRow):GradeEntry  => ({id:r.id,courseId:r.course_id,label:r.label,score:r.score,maxScore:r.max_score,weight:r.weight,createdAt:r.created_at});
const mapExam    = (r:ExamRow):Exam         => ({id:r.id,courseId:r.course_id,title:r.title,date:r.date,location:r.location??undefined,notes:r.notes??undefined,createdAt:r.created_at});
const mapPom     = (r:PomRow):PomodoroSession => ({id:r.id,courseId:r.course_id??undefined,duration:r.duration,completedAt:r.completed_at});
function mapStudySet(row:SetRow,steps:StepRow[]):StudySet {
  return {id:row.id,courseId:row.course_id,title:row.title,createdAt:row.created_at,
    steps:steps.filter(s=>s.set_id===row.id).sort((a,b)=>a.position-b.position).map(s=>({id:s.id,label:s.label,done:s.done===1}))};
}

// ─── State ────────────────────────────────────────────────────────────────────
export interface AppState {
  profile:UserProfile|null;
  courses:Course[];files:CourseFile[];notes:Note[];todos:TodoItem[];
  studySets:StudySet[];links:Link[];bookmarks:Bookmark[];grades:GradeEntry[];
  exams:Exam[];pomodoroSessions:PomodoroSession[];ready:boolean;
}
const initialState:AppState = {
  profile:null,courses:[],files:[],notes:[],todos:[],studySets:[],
  links:[],bookmarks:[],grades:[],exams:[],pomodoroSessions:[],ready:false,
};

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | {type:'LOAD';payload:Omit<AppState,'ready'>}
  | {type:'UPDATE_PROFILE';payload:Partial<UserProfile>}
  | {type:'ADD_COURSE';payload:Course}
  | {type:'UPDATE_COURSE';payload:{id:string;patch:Partial<Course>}}
  | {type:'DELETE_COURSE';payload:string}
  | {type:'ARCHIVE_COURSE';payload:{id:string;archived:boolean}}
  | {type:'ADD_FILE';payload:CourseFile}
  | {type:'DELETE_FILE';payload:string}
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
  | {type:'ADD_POMODORO';payload:PomodoroSession};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state:AppState,action:Action):AppState {
  switch(action.type) {
    case 'LOAD': return {...state,...action.payload,ready:true};
    case 'UPDATE_PROFILE': return {...state,profile:state.profile?{...state.profile,...action.payload}:null};
    case 'ADD_COURSE': return {...state,courses:[action.payload,...state.courses]};
    case 'UPDATE_COURSE': return {...state,courses:state.courses.map(c=>c.id===action.payload.id?{...c,...action.payload.patch}:c)};
    case 'DELETE_COURSE': {const id=action.payload;return {...state,courses:state.courses.filter(c=>c.id!==id),files:state.files.filter(f=>f.courseId!==id),notes:state.notes.filter(n=>n.courseId!==id),todos:state.todos.filter(t=>t.courseId!==id),studySets:state.studySets.filter(ss=>ss.courseId!==id),links:state.links.filter(l=>l.courseId!==id),bookmarks:state.bookmarks.filter(b=>b.courseId!==id),grades:state.grades.filter(g=>g.courseId!==id),exams:state.exams.filter(e=>e.courseId!==id)};}
    case 'ARCHIVE_COURSE': return {...state,courses:state.courses.map(c=>c.id===action.payload.id?{...c,archived:action.payload.archived}:c)};
    case 'ADD_FILE': return {...state,files:[action.payload,...state.files]};
    case 'DELETE_FILE': return {...state,files:state.files.filter(f=>f.id!==action.payload)};
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
    default: return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface AppContextValue {
  state:AppState;
  loadAll:()=>void;
  updateProfile:(patch:Partial<UserProfile>)=>void;
  addCourse:(name:string,icon:string,color:string)=>Course;
  updateCourse:(id:string,patch:Partial<Omit<Course,'id'|'createdAt'>>)=>void;
  deleteCourse:(id:string)=>void;
  archiveCourse:(id:string,archived:boolean)=>void;
  addFile:(file:Omit<CourseFile,'id'|'addedAt'>)=>void;
  deleteFile:(id:string)=>void;
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
}

const AppContext = createContext<AppContextValue|null>(null);

export function AppProvider({children}:{children:React.ReactNode}) {
  const [state,dispatch] = useReducer(reducer,initialState);

  const loadAll = useCallback(()=>{
    const profileRows = db.getAllSync<ProfileRow>('SELECT * FROM user_profile LIMIT 1');
    const profile = profileRows.length ? mapProfile(profileRows[0]) : null;
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
    dispatch({type:'LOAD',payload:{profile,courses,files,notes,todos,studySets,links,bookmarks,grades,exams,pomodoroSessions}});
  },[]);

  const updateProfile = useCallback((patch:Partial<UserProfile>)=>{
    const f = (v:any)=>v??null;
    db.runSync('UPDATE user_profile SET name=COALESCE(?,name),email=COALESCE(?,email),university=COALESCE(?,university),major=COALESCE(?,major),year=COALESCE(?,year),avatar_emoji=COALESCE(?,avatar_emoji),avatar_bg=COALESCE(?,avatar_bg),id_card_visible=COALESCE(?,id_card_visible) WHERE id="me"',
      [f(patch.name),f(patch.email),f(patch.university),f(patch.major),f(patch.year),f(patch.avatarEmoji),f(patch.avatarBg),patch.idCardVisible!==undefined?(patch.idCardVisible?1:0):null]);
    dispatch({type:'UPDATE_PROFILE',payload:patch});
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

  const deleteCourse = useCallback((id:string)=>{db.runSync('DELETE FROM courses WHERE id=?',[id]);dispatch({type:'DELETE_COURSE',payload:id});},[]);

  const archiveCourse = useCallback((id:string,archived:boolean)=>{
    db.runSync('UPDATE courses SET archived=? WHERE id=?',[archived?1:0,id]);
    dispatch({type:'ARCHIVE_COURSE',payload:{id,archived}});
  },[]);

  const addFile = useCallback((file:Omit<CourseFile,'id'|'addedAt'>)=>{
    const id=uuid(),now=Date.now();
    db.runSync('INSERT INTO course_files (id,course_id,name,uri,type,size,added_at) VALUES (?,?,?,?,?,?,?)',[id,file.courseId,file.name,file.uri,file.type,file.size??null,now]);
    dispatch({type:'ADD_FILE',payload:{...file,id,addedAt:now}});
  },[]);

  const deleteFile = useCallback((id:string)=>{db.runSync('DELETE FROM course_files WHERE id=?',[id]);dispatch({type:'DELETE_FILE',payload:id});},[]);

  const addNote = useCallback((courseId:string,title:string,template:Note['template']='blank'):Note=>{
    const id=uuid(),fileId=uuid(),now=Date.now();
    const templates:{[k:string]:string}={blank:`# ${title}\n\n`,lecture:`# ${title}\n\n**Date:** ${new Date().toLocaleDateString()}\n**Lecturer:**\n\n## Objectives\n\n## Key Points\n\n## Summary\n`,meeting:`# ${title}\n\n**Date:** ${new Date().toLocaleDateString()}\n**Attendees:**\n\n## Agenda\n\n## Discussion\n\n## Action Items\n`,summary:`# ${title} — Summary\n\n## Overview\n\n## Main Points\n\n## Conclusion\n`};
    const content=templates[template||'blank']||templates.blank;
    db.runSync('INSERT INTO notes (id,course_id,title,content,template,updated_at) VALUES (?,?,?,?,?,?)',[id,courseId,title,content,template||'blank',now]);
    db.runSync('INSERT INTO course_files (id,course_id,name,uri,type,size,added_at) VALUES (?,?,?,?,?,?,?)',[fileId,courseId,title,id,'note',null,now]);
    const note:Note={id,courseId,title,content,template:template||'blank',updatedAt:now};
    dispatch({type:'ADD_NOTE',payload:{note,file:{id:fileId,courseId,name:title,uri:id,type:'note',addedAt:now}}});
    return note;
  },[]);

  const updateNote = useCallback((id:string,patch:Partial<Pick<Note,'title'|'content'|'template'>>)=>{
    const now=Date.now();
    db.runSync('UPDATE notes SET title=COALESCE(?,title),content=COALESCE(?,content),template=COALESCE(?,template),updated_at=? WHERE id=?',[patch.title??null,patch.content??null,patch.template??null,now,id]);
    if(patch.title)db.runSync('UPDATE course_files SET name=? WHERE uri=? AND type="note"',[patch.title,id]);
    dispatch({type:'UPDATE_NOTE',payload:{id,patch}});
  },[]);

  const deleteNote = useCallback((id:string)=>{
    db.runSync('DELETE FROM notes WHERE id=?',[id]);
    db.runSync('DELETE FROM course_files WHERE uri=? AND type="note"',[id]);
    dispatch({type:'DELETE_NOTE',payload:id});
  },[]);

  const addTodo = useCallback((courseId:string,title:string,priority:Priority='medium',deadline?:number)=>{
    const id=uuid(),now=Date.now();
    db.runSync('INSERT INTO todos (id,course_id,title,done,deadline,priority,created_at) VALUES (?,?,?,0,?,?,?)',[id,courseId,title,deadline??null,priority,now]);
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
      [patch.title??null,patch.done!==undefined?(patch.done?1:0):null,patch.deadline??null,patch.priority??null,id]);
    dispatch({type:'UPDATE_TODO',payload:{id,patch}});
  },[]);

  const deleteTodo = useCallback((id:string)=>{db.runSync('DELETE FROM todos WHERE id=?',[id]);dispatch({type:'DELETE_TODO',payload:id});},[]);

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

  const deleteStudySet = useCallback((id:string)=>{db.runSync('DELETE FROM study_sets WHERE id=?',[id]);dispatch({type:'DELETE_STUDY_SET',payload:id});},[]);

  const addLink = useCallback((courseId:string,title:string,url:string)=>{
    const id=uuid(),now=Date.now();
    db.runSync('INSERT INTO links (id,course_id,title,url,added_at) VALUES (?,?,?,?,?)',[id,courseId,title,url,now]);
    dispatch({type:'ADD_LINK',payload:{id,courseId,title,url,addedAt:now}});
  },[]);

  const deleteLink = useCallback((id:string)=>{db.runSync('DELETE FROM links WHERE id=?',[id]);dispatch({type:'DELETE_LINK',payload:id});},[]);

  const addBookmark = useCallback((courseId:string,title:string,url:string,note?:string)=>{
    const id=uuid(),now=Date.now();
    db.runSync('INSERT INTO bookmarks (id,course_id,title,url,note,added_at) VALUES (?,?,?,?,?,?)',[id,courseId,title,url,note??null,now]);
    dispatch({type:'ADD_BOOKMARK',payload:{id,courseId,title,url,note,addedAt:now}});
  },[]);

  const deleteBookmark = useCallback((id:string)=>{db.runSync('DELETE FROM bookmarks WHERE id=?',[id]);dispatch({type:'DELETE_BOOKMARK',payload:id});},[]);

  const addGrade = useCallback((courseId:string,label:string,score:number,maxScore:number,weight:number)=>{
    const id=uuid(),now=Date.now();
    db.runSync('INSERT INTO grades (id,course_id,label,score,max_score,weight,created_at) VALUES (?,?,?,?,?,?,?)',[id,courseId,label,score,maxScore,weight,now]);
    dispatch({type:'ADD_GRADE',payload:{id,courseId,label,score,maxScore,weight,createdAt:now}});
  },[]);

  const updateGrade = useCallback((id:string,patch:Partial<GradeEntry>)=>{
    db.runSync('UPDATE grades SET label=COALESCE(?,label),score=COALESCE(?,score),max_score=COALESCE(?,max_score),weight=COALESCE(?,weight) WHERE id=?',[patch.label??null,patch.score??null,patch.maxScore??null,patch.weight??null,id]);
    dispatch({type:'UPDATE_GRADE',payload:{id,patch}});
  },[]);

  const deleteGrade = useCallback((id:string)=>{db.runSync('DELETE FROM grades WHERE id=?',[id]);dispatch({type:'DELETE_GRADE',payload:id});},[]);

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

  const deleteExam = useCallback((id:string)=>{db.runSync('DELETE FROM exams WHERE id=?',[id]);dispatch({type:'DELETE_EXAM',payload:id});},[]);

  const addPomodoro = useCallback((duration:number,courseId?:string)=>{
    const id=uuid(),now=Date.now();
    db.runSync('INSERT INTO pomodoro_sessions (id,course_id,duration,completed_at) VALUES (?,?,?,?)',[id,courseId??null,duration,now]);
    dispatch({type:'ADD_POMODORO',payload:{id,courseId,duration,completedAt:now}});
  },[]);

  return (
    <AppContext.Provider value={{state,loadAll,updateProfile,addCourse,updateCourse,deleteCourse,archiveCourse,addFile,deleteFile,addNote,updateNote,deleteNote,addTodo,toggleTodo,updateTodo,deleteTodo,addStudySet,updateStudySet,toggleStep,deleteStudySet,addLink,deleteLink,addBookmark,deleteBookmark,addGrade,updateGrade,deleteGrade,addExam,updateExam,deleteExam,addPomodoro}}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp():AppContextValue {
  const ctx=useContext(AppContext);
  if(!ctx)throw new Error('useApp must be used within AppProvider');
  return ctx;
}