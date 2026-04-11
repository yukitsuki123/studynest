import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Appearance } from 'react-native';
import { db } from '../utils/db';
import { ThemeName, FontFamily, Language, ThemeColors } from '../constants/types';
import { THEMES } from '../constants/themes';
import { generateThemeFromColor } from '../utils/themeGenerator';
import { TRANSLATIONS, TranslationKey } from '../constants/translations';

export type HomeSection = 'greeting' | 'streak' | 'intention' | 'stats' | 'exams' | 'quote' | 'stickyNotes' | 'actions' | 'courses' | 'recentActivity' | 'deadlines';

export interface HomeSections {
  greeting: boolean;
  streak: boolean;
  intention: boolean;
  stats: boolean;
  exams: boolean;
  quote: boolean;
  stickyNotes: boolean;
  actions: boolean;
  courses: boolean;
  recentActivity: boolean;
  deadlines: boolean;
}

interface SettingsState {
  theme: ThemeName;
  isDark: boolean;
  autoDark: boolean;
  fontFamily: FontFamily;
  language: Language;
  pdfReader: 'builtin' | 'external';
  imageReader: 'builtin' | 'external';
  primaryColor: string; // Hex code for custom branding
  themeMode: 'standard' | 'custom';
  animations: boolean;
  homeSections: HomeSections;
  customPalette: Partial<ThemeColors>;
}

type Action =
  | { type: 'SET_THEME'; payload: ThemeName }
  | { type: 'TOGGLE_DARK' }
  | { type: 'SET_DARK'; payload: boolean }
  | { type: 'SET_AUTO_DARK'; payload: boolean }
  | { type: 'SET_FONT'; payload: FontFamily }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_PDF_READER'; payload: 'builtin' | 'external' }
  | { type: 'SET_IMAGE_READER'; payload: 'builtin' | 'external' }
  | { type: 'SET_PRIMARY_COLOR'; payload: string }
  | { type: 'SET_THEME_MODE'; payload: 'standard' | 'custom' }
  | { type: 'SET_ANIMATIONS'; payload: boolean }
  | { type: 'SET_HOME_SECTIONS'; payload: HomeSections }
  | { type: 'SET_CUSTOM_COLOR'; payload: { key: keyof ThemeColors; value: string } }
  | { type: 'LOAD'; payload: SettingsState };

function reducer(state: SettingsState, action: Action): SettingsState {
  switch (action.type) {
    case 'LOAD':          return action.payload;
    case 'SET_THEME':     return { ...state, theme: action.payload };
    case 'TOGGLE_DARK':   return { ...state, isDark: !state.isDark };
    case 'SET_DARK':      return { ...state, isDark: action.payload };
    case 'SET_AUTO_DARK': return { ...state, autoDark: action.payload };
    case 'SET_FONT':         return { ...state, fontFamily: action.payload };
    case 'SET_LANGUAGE':     return { ...state, language: action.payload };
    case 'SET_PDF_READER':   return { ...state, pdfReader: action.payload };
    case 'SET_IMAGE_READER': return { ...state, imageReader: action.payload };
    case 'SET_PRIMARY_COLOR':return { ...state, primaryColor: action.payload };
    case 'SET_THEME_MODE':   return { ...state, themeMode: action.payload };
    case 'SET_ANIMATIONS':   return { ...state, animations: action.payload };
    case 'SET_HOME_SECTIONS':return { ...state, homeSections: action.payload };
    case 'SET_CUSTOM_COLOR': return { ...state, customPalette: { ...state.customPalette, [action.payload.key]: action.payload.value } };
    default:                 return state;
  }
}

function getSetting(key: string, fallback: string): string {
  try {
    const r = db.getFirstSync<{ value: string }>('SELECT value FROM settings WHERE key=?', [key]);
    return r?.value ?? fallback;
  } catch { return fallback; }
}
function saveSetting(key: string, value: string) {
  db.runSync('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)', [key, value]);
}

interface SettingsContextValue {
  theme: ThemeName;
  isDark: boolean;
  autoDark: boolean;
  fontFamily: FontFamily;
  language: Language;
  pdfReader: 'builtin' | 'external';
  imageReader: 'builtin' | 'external';
  primaryColor: string;
  themeMode: 'standard' | 'custom';
  animations: boolean;
  homeSections: HomeSections;
  customPalette: Partial<ThemeColors>;
  isRTL: boolean;
  colors: ThemeColors;
  t: (key: TranslationKey) => string;
  loadSettings: () => void;
  setTheme: (t: ThemeName) => void;
  toggleDark: () => void;
  setDark: (v: boolean) => void;
  setAutoDark: (v: boolean) => void;
  setFontFamily: (f: FontFamily) => void;
  setLanguage: (l: Language) => void;
  setPdfReader: (r: 'builtin' | 'external') => void;
  setImageReader: (r: 'builtin' | 'external') => void;
  setPrimaryColor: (c: string) => void;
  setThemeMode: (m: 'standard' | 'custom') => void;
  setAnimations: (v: boolean) => void;
  setHomeSections: (s: HomeSections) => void;
  setCustomColor: (key: keyof ThemeColors, value: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    theme: 'oxford', isDark: false, autoDark: false, fontFamily: 'lora', language: 'en',
    pdfReader: 'builtin', imageReader: 'builtin',
    primaryColor: '#8B4513', themeMode: 'standard',
    animations: true,
    homeSections: {
      greeting:true, streak:true, intention:true, stats:true, exams:true,
      quote:true, stickyNotes:true, actions:true, courses:true, recentActivity:true, deadlines:true
    },
    customPalette: {},
  });

  const loadSettings = useCallback(() => {
    dispatch({
      type: 'LOAD', payload: {
        theme:      getSetting('theme', 'oxford') as ThemeName,
        isDark:     getSetting('isDark', 'false') === 'true',
        autoDark:   getSetting('autoDark', 'false') === 'true',
        fontFamily: getSetting('fontFamily', 'lora') as FontFamily,
        language:   getSetting('language', 'en') as Language,
        pdfReader:  getSetting('pdfReader', 'builtin') as 'builtin' | 'external',
        imageReader:getSetting('imageReader', 'builtin') as 'builtin' | 'external',
        primaryColor:getSetting('primaryColor', '#8B4513'),
        themeMode:  getSetting('themeMode', 'standard') as 'standard' | 'custom',
        animations: getSetting('animations', 'true') === 'true',
        homeSections: JSON.parse(getSetting('homeSections', JSON.stringify({
          greeting:true, streak:true, intention:true, stats:true, exams:true,
          quote:true, stickyNotes:true, actions:true, courses:true, recentActivity:true, deadlines:true
        }))),
        customPalette: JSON.parse(getSetting('customPalette', '{}')),
      },
    });
  }, []);

  // Auto dark mode — listen to system color scheme
  useEffect(() => {
    if (!state.autoDark) return;
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch({ type: 'SET_DARK', payload: colorScheme === 'dark' });
    });
    // Set immediately
    dispatch({ type: 'SET_DARK', payload: Appearance.getColorScheme() === 'dark' });
    return () => sub.remove();
  }, [state.autoDark]);

  const setTheme      = useCallback((theme: ThemeName) => { saveSetting('theme', theme); dispatch({ type: 'SET_THEME', payload: theme }); }, []);
  const toggleDark    = useCallback(() => { const n = !state.isDark; saveSetting('isDark', String(n)); dispatch({ type: 'TOGGLE_DARK' }); }, [state.isDark]);
  const setDark       = useCallback((v: boolean) => { saveSetting('isDark', String(v)); dispatch({ type: 'SET_DARK', payload: v }); }, []);
  const setAutoDark   = useCallback((v: boolean) => {
    saveSetting('autoDark', String(v));
    dispatch({ type: 'SET_AUTO_DARK', payload: v });
    if (v) dispatch({ type: 'SET_DARK', payload: Appearance.getColorScheme() === 'dark' });
  }, []);
  const setFontFamily = useCallback((f: FontFamily) => { saveSetting('fontFamily', f); dispatch({ type: 'SET_FONT', payload: f }); }, []);
  const setLanguage   = useCallback((l: Language) => { saveSetting('language', l); dispatch({ type: 'SET_LANGUAGE', payload: l }); }, []);
  const setPdfReader  = useCallback((r: 'builtin'|'external') => { saveSetting('pdfReader', r); dispatch({ type: 'SET_PDF_READER', payload: r }); }, []);
  const setImageReader= useCallback((r: 'builtin'|'external') => { saveSetting('imageReader', r); dispatch({ type: 'SET_IMAGE_READER', payload: r }); }, []);
  const setPrimaryColor=useCallback((c:string)=>{saveSetting('primaryColor',c);dispatch({type:'SET_PRIMARY_COLOR',payload:c});},[]);
  const setThemeMode  =useCallback((m:'standard'|'custom')=>{saveSetting('themeMode',m);dispatch({type:'SET_THEME_MODE',payload:m});},[]);
  const setAnimations =useCallback((v:boolean)=>{saveSetting('animations',String(v));dispatch({type:'SET_ANIMATIONS',payload:v});},[]);
  const setHomeSections =useCallback((s:HomeSections)=>{saveSetting('homeSections',JSON.stringify(s));dispatch({type:'SET_HOME_SECTIONS',payload:s});},[]);
  const setCustomColor =useCallback((key:keyof ThemeColors,value:string)=>{
    saveSetting('customPalette', JSON.stringify({ ...state.customPalette, [key]: value }));
    dispatch({type:'SET_CUSTOM_COLOR',payload:{key,value}});
  },[state.customPalette]);

  const standardColors = THEMES[state.theme][state.isDark ? 'dark' : 'light'];
  const generated      = generateThemeFromColor(state.primaryColor, state.isDark);
  
  // Merge generated with custom overrides
  const customColors = { ...generated, ...state.customPalette };
  
  const colors = state.themeMode === 'custom' ? customColors : standardColors;

  const isRTL  = state.language === 'ar';
  
  const t = useCallback((key: TranslationKey) => {
    return TRANSLATIONS[state.language][key] || key;
  }, [state.language]);

  return (
    <SettingsContext.Provider value={{ ...state, colors, isRTL, t, loadSettings, setTheme, toggleDark, setDark, setAutoDark, setFontFamily, setLanguage, setPdfReader, setImageReader, setPrimaryColor, setThemeMode, setAnimations, setHomeSections, setCustomColor }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
