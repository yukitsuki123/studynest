import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Appearance } from 'react-native';
import { db } from '../utils/db';
import { ThemeName, FontFamily, Language } from '../constants/types';
import { THEMES } from '../constants/themes';
import { ThemeColors } from '../constants/types';

interface SettingsState {
  theme: ThemeName;
  isDark: boolean;
  autoDark: boolean;
  fontFamily: FontFamily;
  language: Language;
}

type Action =
  | { type: 'SET_THEME'; payload: ThemeName }
  | { type: 'TOGGLE_DARK' }
  | { type: 'SET_DARK'; payload: boolean }
  | { type: 'SET_AUTO_DARK'; payload: boolean }
  | { type: 'SET_FONT'; payload: FontFamily }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'LOAD'; payload: SettingsState };

function reducer(state: SettingsState, action: Action): SettingsState {
  switch (action.type) {
    case 'LOAD':          return action.payload;
    case 'SET_THEME':     return { ...state, theme: action.payload };
    case 'TOGGLE_DARK':   return { ...state, isDark: !state.isDark };
    case 'SET_DARK':      return { ...state, isDark: action.payload };
    case 'SET_AUTO_DARK': return { ...state, autoDark: action.payload };
    case 'SET_FONT':      return { ...state, fontFamily: action.payload };
    case 'SET_LANGUAGE':  return { ...state, language: action.payload };
    default:              return state;
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
  isRTL: boolean;
  colors: ThemeColors;
  loadSettings: () => void;
  setTheme: (t: ThemeName) => void;
  toggleDark: () => void;
  setDark: (v: boolean) => void;
  setAutoDark: (v: boolean) => void;
  setFontFamily: (f: FontFamily) => void;
  setLanguage: (l: Language) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    theme: 'oxford', isDark: false, autoDark: false, fontFamily: 'lora', language: 'en',
  });

  const loadSettings = useCallback(() => {
    dispatch({
      type: 'LOAD', payload: {
        theme:      getSetting('theme', 'oxford') as ThemeName,
        isDark:     getSetting('isDark', 'false') === 'true',
        autoDark:   getSetting('autoDark', 'false') === 'true',
        fontFamily: getSetting('fontFamily', 'lora') as FontFamily,
        language:   getSetting('language', 'en') as Language,
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

  const colors = THEMES[state.theme][state.isDark ? 'dark' : 'light'];
  const isRTL  = state.language === 'ar';

  return (
    <SettingsContext.Provider value={{ ...state, colors, isRTL, loadSettings, setTheme, toggleDark, setDark, setAutoDark, setFontFamily, setLanguage }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
