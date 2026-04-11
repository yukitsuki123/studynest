import { Feather } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { Alert, ScrollView, TextInput, TouchableOpacity, Vibration, View, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../components/ui/Text';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../context/SettingsContext';
import { TranslationKey } from '../constants/translations';

function pad(n: number) { return String(n).padStart(2, '0'); }

interface Preset {
  key: TranslationKey;
  minutes: number;
  color: string;
}

const PRESETS_DATA: Preset[] = [
  { key: 'pom_focus',       minutes: 25, color: '#C0622A' },
  { key: 'pom_short_break', minutes: 5,  color: '#3A7A4A' },
  { key: 'pom_long_break',  minutes: 15, color: '#2C5F8A' },
  { key: 'pom_custom',      minutes: 0,  color: '#6B4C8A' },
];

export default function PomodoroScreen() {
  const tColor = useTheme();
  const router = useRouter();
  const { state, addPomodoro } = useApp();
  const { t, isRTL } = useSettings();

  const [presetIdx,      setPresetIdx]      = useState(0);
  const [customMinutes,  setCustomMinutes]  = useState('45');
  const [customSeconds,  setCustomSeconds]  = useState('00');
  const [editingCustom,  setEditingCustom]  = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>();
  const [running,        setRunning]        = useState(false);

  const preset = PRESETS_DATA[presetIdx];
  const totalSeconds = preset.minutes > 0
    ? preset.minutes * 60
    : (parseInt(customMinutes) || 0) * 60 + (parseInt(customSeconds) || 0);

  const [seconds, setSeconds] = useState(totalSeconds);
  const targetTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer when preset or custom time changes
  useEffect(() => {
    if (!running) setSeconds(totalSeconds);
  }, [presetIdx, customMinutes, customSeconds, running]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    targetTimeRef.current = null;
    setRunning(false);
  }, []);

  const reset = useCallback(() => { stop(); setSeconds(totalSeconds); }, [stop, totalSeconds]);

  const switchPreset = (idx: number) => {
    stop();
    setPresetIdx(idx);
    const m = PRESETS_DATA[idx].minutes > 0 ? PRESETS_DATA[idx].minutes * 60 : (parseInt(customMinutes)||0)*60+(parseInt(customSeconds)||0);
    setSeconds(m);
    setEditingCustom(false);
  };

  // Keep screen on while timer is running
  useEffect(() => {
    if (running) { activateKeepAwakeAsync(); }
    else         { deactivateKeepAwake(); }
    return () => { deactivateKeepAwake(); };
  }, [running]);

  const startTimer = useCallback(() => {
    if (seconds <= 0) return;
    targetTimeRef.current = Date.now() + seconds * 1000;
    setRunning(true);
  }, [seconds]);

  const handleTick = useCallback(() => {
    if (!targetTimeRef.current) return;
    const remaining = Math.max(0, Math.floor((targetTimeRef.current - Date.now()) / 1000));
    setSeconds(remaining);
    
    if (remaining === 0) {
      stop();
      Vibration.vibrate([0, 400, 200, 400]);
      if (presetIdx === 0 || preset.minutes === 0) {
        // Only count Focus or Custom sessions towards reports
        addPomodoro(totalSeconds, selectedCourse);
        Alert.alert(t('session_complete'), `${Math.floor(totalSeconds/60)} min session done. Keep going!`);
      } else {
        Alert.alert(t('break_over'), t('time_back_to_work'));
      }
    }
  }, [presetIdx, preset.minutes, totalSeconds, selectedCourse, stop, addPomodoro, t]);

  useEffect(() => {
    if (running) {
      handleTick(); // immediate update
      intervalRef.current = setInterval(handleTick, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, handleTick]);

  // Catch up immediately when returning from background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && running) {
        handleTick();
      }
    });
    return () => sub.remove();
  }, [running, handleTick]);

  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const progress = totalSeconds > 0 ? 1 - seconds / totalSeconds : 0;

  const todaySessions   = state.pomodoroSessions.filter(s => new Date(s.completedAt).toDateString() === new Date().toDateString());
  const todayStudyMin   = todaySessions.filter(s => s.duration >= 20 * 60).reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
      <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={isRTL?"chevron-right":"x"} size={18} color={tColor.text2} />
        </TouchableOpacity>
        <Txt variant="display" size={20} style={{ flex: 1, marginLeft: isRTL?0:12, marginRight: isRTL?12:0, textAlign:isRTL?'right':'left' }}>{t('pomodoro_timer')}</Txt>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' }}>

        {/* Mode selector */}
        <View style={{ flexDirection: isRTL?'row-reverse':'row', gap: 8, marginBottom: 28, alignSelf: 'stretch' }}>
          {PRESETS_DATA.map((m, i) => (
            <TouchableOpacity key={m.key} onPress={() => switchPreset(i)}
              style={{ flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5,
                borderColor: presetIdx === i ? m.color : tColor.border2,
                backgroundColor: presetIdx === i ? m.color + '22' : tColor.card,
                alignItems: 'center' }}>
              <Txt variant="mono" size={9} style={{ color: presetIdx === i ? m.color : tColor.text3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t(m.key)}</Txt>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom time editor */}
        {presetIdx === 3 && (
          <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 12, marginBottom: 24, backgroundColor: tColor.card, borderRadius: 14, borderWidth: 1, borderColor: tColor.border2, padding: 16, alignSelf: 'stretch' }}>
            <Txt variant="mono" size={11} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>{t('custom_time')}</Txt>
            <View style={{ flex: 1, flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <TextInput
                value={customMinutes}
                onChangeText={v => { setCustomMinutes(v.replace(/[^0-9]/g,'')); stop(); }}
                keyboardType="numeric"
                maxLength={3}
                style={{ width: 56, height: 40, borderRadius: 8, borderWidth: 1, borderColor: tColor.accent, backgroundColor: tColor.bg2, fontFamily: 'JetBrainsMono_500Medium', fontSize: 22, color: tColor.accent, textAlign: 'center' }}
              />
              <Txt variant="mono" size={20} color="accent">:</Txt>
              <TextInput
                value={customSeconds}
                onChangeText={v => { setCustomSeconds(v.replace(/[^0-9]/g,'').slice(0,2)); stop(); }}
                keyboardType="numeric"
                maxLength={2}
                style={{ width: 56, height: 40, borderRadius: 8, borderWidth: 1, borderColor: tColor.border, backgroundColor: tColor.bg2, fontFamily: 'JetBrainsMono_500Medium', fontSize: 22, color: tColor.text, textAlign: 'center' }}
              />
              <Txt variant="mono" size={11} color="tertiary">mm:ss</Txt>
            </View>
          </View>
        )}

        {/* Ring */}
        <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
          <View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 8, borderColor: tColor.bg3 }} />
          <View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 8,
            borderColor: preset.color || '#6B4C8A',
            borderRightColor: progress < 0.75 ? 'transparent' : (preset.color || '#6B4C8A'),
            borderBottomColor: progress < 0.5 ? 'transparent' : (preset.color || '#6B4C8A'),
            borderLeftColor: progress < 0.25 ? 'transparent' : (preset.color || '#6B4C8A'),
            transform: [{ rotate: '-90deg' }] }} />
          <View style={{ alignItems: 'center' }}>
            <Txt variant="display" size={48} style={{ color: preset.color || '#6B4C8A', lineHeight: 56 }}>{pad(mm)}:{pad(ss)}</Txt>
            <Txt variant="mono" size={11} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>{t(preset.key)}</Txt>
          </View>
        </View>

        {/* Controls */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          {running ? (
            <TouchableOpacity onPress={stop} style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: tColor.bg2, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="pause" size={24} color={tColor.text} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startTimer} style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: preset.color || tColor.accent, alignItems: 'center', justifyContent: 'center', shadowColor: preset.color || tColor.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}>
              <Feather name="play" size={32} color="#fff" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
        </View>

        {/* Course picker */}
        <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, alignSelf: isRTL?'flex-end':'flex-start', textAlign:isRTL?'right':'left' }}>{t('studying_for')}</Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 24, flexDirection: isRTL?'row-reverse':'row' }} style={{ alignSelf: 'stretch' }}>
          <TouchableOpacity onPress={() => setSelectedCourse(undefined)}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
              borderColor: !selectedCourse ? tColor.accent : tColor.border2, backgroundColor: !selectedCourse ? tColor.accent + '22' : tColor.card }}>
            <Txt variant="mono" size={11} style={{ color: !selectedCourse ? tColor.accent : tColor.text3 }}>{t('general')}</Txt>
          </TouchableOpacity>
          {state.courses.filter(c => !c.archived).map(c => (
            <TouchableOpacity key={c.id} onPress={() => setSelectedCourse(c.id)}
              style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
                borderColor: selectedCourse === c.id ? c.color : tColor.border2, backgroundColor: selectedCourse === c.id ? c.color + '22' : tColor.card }}>
              <Txt size={14}>{c.icon}</Txt>
              <Txt variant="mono" size={11} style={{ color: selectedCourse === c.id ? c.color : tColor.text3 }}>{c.name}</Txt>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats */}
        <View style={{ flexDirection: isRTL?'row-reverse':'row', gap: 10, alignSelf: 'stretch' }}>
          {[
            { key: 'today', value: todaySessions.length },
            { key: 'study_min', value: todayStudyMin },
            { key: 'all_time', value: state.pomodoroSessions.length },
          ].map(s => (
            <View key={s.key} style={{ flex: 1, backgroundColor: tColor.card, borderRadius: 12, borderWidth: 1, borderColor: tColor.border2, padding: 12, alignItems: 'center' }}>
              <Txt variant="display" size={22} color="accent">{s.value}</Txt>
              <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2, textAlign: 'center' }}>{t(s.key as any)}</Txt>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
