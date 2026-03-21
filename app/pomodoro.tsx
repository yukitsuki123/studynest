import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, TextInput, TouchableOpacity, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../components/ui/Text';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';

function pad(n: number) { return String(n).padStart(2, '0'); }

const PRESETS = [
  { label: 'Focus',       minutes: 25, color: '#C0622A' },
  { label: 'Short Break', minutes: 5,  color: '#3A7A4A' },
  { label: 'Long Break',  minutes: 15, color: '#2C5F8A' },
  { label: 'Custom',      minutes: 0,  color: '#6B4C8A' },
];

export default function PomodoroScreen() {
  const t = useTheme();
  const router = useRouter();
  const { state, addPomodoro } = useApp();

  const [presetIdx,      setPresetIdx]      = useState(0);
  const [customMinutes,  setCustomMinutes]  = useState('45');
  const [customSeconds,  setCustomSeconds]  = useState('00');
  const [editingCustom,  setEditingCustom]  = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>();
  const [running,        setRunning]        = useState(false);

  const preset = PRESETS[presetIdx];
  const totalSeconds = preset.minutes > 0
    ? preset.minutes * 60
    : (parseInt(customMinutes) || 0) * 60 + (parseInt(customSeconds) || 0);

  const [seconds, setSeconds] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset timer when preset or custom time changes
  useEffect(() => {
    if (!running) setSeconds(totalSeconds);
  }, [presetIdx, customMinutes, customSeconds]);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
  }, []);

  const reset = useCallback(() => { stop(); setSeconds(totalSeconds); }, [stop, totalSeconds]);

  const switchPreset = (idx: number) => {
    stop();
    setPresetIdx(idx);
    const m = PRESETS[idx].minutes > 0 ? PRESETS[idx].minutes * 60 : (parseInt(customMinutes)||0)*60+(parseInt(customSeconds)||0);
    setSeconds(m);
    setEditingCustom(false);
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            stop();
            Vibration.vibrate([0, 400, 200, 400]);
            if (presetIdx === 0 || preset.minutes === 0) {
              addPomodoro(totalSeconds, selectedCourse);
              Alert.alert('🎉 Session complete!', `${Math.floor(totalSeconds/60)} min focus session done.`);
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const progress = totalSeconds > 0 ? 1 - seconds / totalSeconds : 0;

  const todaySessions   = state.pomodoroSessions.filter(s => new Date(s.completedAt).toDateString() === new Date().toDateString());
  const todayFocusMin   = todaySessions.filter(s => s.duration >= 20 * 60).reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="x" size={18} color={t.text2} />
        </TouchableOpacity>
        <Txt variant="display" size={20} style={{ flex: 1, marginLeft: 12 }}>Pomodoro Timer</Txt>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' }}>

        {/* Mode selector */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28, alignSelf: 'stretch' }}>
          {PRESETS.map((m, i) => (
            <TouchableOpacity key={m.label} onPress={() => switchPreset(i)}
              style={{ flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5,
                borderColor: presetIdx === i ? m.color : t.border2,
                backgroundColor: presetIdx === i ? m.color + '22' : t.card,
                alignItems: 'center' }}>
              <Txt variant="mono" size={9} style={{ color: presetIdx === i ? m.color : t.text3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.label}</Txt>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom time editor */}
        {presetIdx === 3 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, backgroundColor: t.card, borderRadius: 14, borderWidth: 1, borderColor: t.border2, padding: 16, alignSelf: 'stretch' }}>
            <Txt variant="mono" size={11} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Custom Time</Txt>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <TextInput
                value={customMinutes}
                onChangeText={v => { setCustomMinutes(v.replace(/[^0-9]/g,'')); stop(); }}
                keyboardType="numeric"
                maxLength={3}
                style={{ width: 56, height: 40, borderRadius: 8, borderWidth: 1, borderColor: t.accent, backgroundColor: t.bg2, fontFamily: 'JetBrainsMono_500Medium', fontSize: 22, color: t.accent, textAlign: 'center' }}
              />
              <Txt variant="mono" size={20} color="accent">:</Txt>
              <TextInput
                value={customSeconds}
                onChangeText={v => { setCustomSeconds(v.replace(/[^0-9]/g,'').slice(0,2)); stop(); }}
                keyboardType="numeric"
                maxLength={2}
                style={{ width: 56, height: 40, borderRadius: 8, borderWidth: 1, borderColor: t.border, backgroundColor: t.bg2, fontFamily: 'JetBrainsMono_500Medium', fontSize: 22, color: t.text, textAlign: 'center' }}
              />
              <Txt variant="mono" size={11} color="tertiary">mm:ss</Txt>
            </View>
          </View>
        )}

        {/* Ring */}
        <View style={{ width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
          <View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 8, borderColor: t.bg3 }} />
          <View style={{ position: 'absolute', width: 200, height: 200, borderRadius: 100, borderWidth: 8,
            borderColor: preset.color || '#6B4C8A',
            borderRightColor: progress < 0.75 ? 'transparent' : (preset.color || '#6B4C8A'),
            borderBottomColor: progress < 0.5 ? 'transparent' : (preset.color || '#6B4C8A'),
            borderLeftColor: progress < 0.25 ? 'transparent' : (preset.color || '#6B4C8A'),
            transform: [{ rotate: '-90deg' }] }} />
          <View style={{ alignItems: 'center' }}>
            <Txt variant="display" size={48} style={{ color: preset.color || '#6B4C8A', lineHeight: 56 }}>{pad(mm)}:{pad(ss)}</Txt>
            <Txt variant="mono" size={11} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>{preset.label}</Txt>
          </View>
        </View>

        {/* Controls */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <TouchableOpacity onPress={reset}
            style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="rotate-ccw" size={20} color={t.text2} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setRunning(r => !r)}
            style={{ width: 120, height: 52, borderRadius: 26, backgroundColor: preset.color || '#6B4C8A', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }}>
            <Feather name={running ? 'pause' : 'play'} size={20} color="#fff" />
            <Txt variant="bodySemi" size={16} style={{ color: '#fff' }}>{running ? 'Pause' : 'Start'}</Txt>
          </TouchableOpacity>
        </View>

        {/* Course picker */}
        <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, alignSelf: 'flex-start' }}>Studying for</Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 24 }} style={{ alignSelf: 'stretch' }}>
          <TouchableOpacity onPress={() => setSelectedCourse(undefined)}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
              borderColor: !selectedCourse ? t.accent : t.border2, backgroundColor: !selectedCourse ? t.accent + '22' : t.card }}>
            <Txt variant="mono" size={11} style={{ color: !selectedCourse ? t.accent : t.text3 }}>General</Txt>
          </TouchableOpacity>
          {state.courses.filter(c => !c.archived).map(c => (
            <TouchableOpacity key={c.id} onPress={() => setSelectedCourse(c.id)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
                borderColor: selectedCourse === c.id ? c.color : t.border2, backgroundColor: selectedCourse === c.id ? c.color + '22' : t.card }}>
              <Txt size={14}>{c.icon}</Txt>
              <Txt variant="mono" size={11} style={{ color: selectedCourse === c.id ? c.color : t.text3 }}>{c.name}</Txt>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 10, alignSelf: 'stretch' }}>
          {[
            { label: 'Today', value: todaySessions.length },
            { label: 'Focus Min', value: todayFocusMin },
            { label: 'All Time', value: state.pomodoroSessions.length },
          ].map(s => (
            <View key={s.label} style={{ flex: 1, backgroundColor: t.card, borderRadius: 12, borderWidth: 1, borderColor: t.border2, padding: 12, alignItems: 'center' }}>
              <Txt variant="display" size={22} color="accent">{s.value}</Txt>
              <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2, textAlign: 'center' }}>{s.label}</Txt>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
