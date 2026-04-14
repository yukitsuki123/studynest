import { 
  X, ChevronRight, RefreshCw, Pause, Play, Square, Award 
} from 'lucide-react-native';
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

import { pomodoroStore } from '../utils/pomodoroStore';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Button } from '../components/ui/Button';
import { DynamicIcon } from '../components/ui/DynamicIcon';

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

function usePomodoroStore() {
  const [state, setState] = useState(pomodoroStore.getState());
  useEffect(() => {
    const unsub = pomodoroStore.subscribe(() => setState(pomodoroStore.getState()));
    return unsub;
  }, []);
  return state;
}

export default function PomodoroScreen() {
  const tColor = useTheme();
  const router = useRouter();
  const { state: appState, addPomodoro } = useApp();
  const { t, isRTL } = useSettings();

  const pStore = usePomodoroStore();
  const preset = PRESETS_DATA[pStore.presetIdx];

  const presetIdx = pStore.presetIdx;
  const customMinutes = pStore.customMinutes;
  const customSeconds = pStore.customSeconds;
  const selectedCourse = pStore.selectedCourse;
  const seconds = pStore.secondsRemaining;
  const totalSeconds = pStore.totalSeconds;
  const running = pStore.running;

  const stop = (force?: boolean) => pomodoroStore.stop(force);
  const reset = () => pomodoroStore.reset();
  const switchPreset = (idx: number) => pomodoroStore.switchPreset(idx, PRESETS_DATA[idx].minutes);
  const startTimer = () => pomodoroStore.start();

  // Keep screen on while timer is running
  useEffect(() => {
    if (running) { activateKeepAwakeAsync(); }
    else         { deactivateKeepAwake(); }
    return () => { deactivateKeepAwake(); };
  }, [running]);

  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const progress = totalSeconds > 0 ? 1 - seconds / totalSeconds : 0;

  const todaySessions   = appState.pomodoroSessions.filter(s => new Date(s.completedAt).toDateString() === new Date().toDateString());
  const todayStudyMin   = todaySessions.reduce((acc, s) => acc + Math.floor(s.duration / 60), 0);
  
  const handleSaveProgress = () => {
     addPomodoro(pStore.pendingCalculatedElapsed, selectedCourse);
     pomodoroStore.setState({ showCompletionModal: false, pendingCalculatedElapsed: 0, secondsRemaining: pomodoroStore.getState().totalSeconds });
  };
  
  const handleDiscardProgress = () => {
    pomodoroStore.setState({ showCompletionModal: false, pendingCalculatedElapsed: 0, secondsRemaining: pomodoroStore.getState().totalSeconds });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
      <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
          {isRTL ? <ChevronRight size={18} color={tColor.text2} /> : <X size={18} color={tColor.text2} />}
        </TouchableOpacity>
        <Txt variant="display" size={20} style={{ flex: 1, marginLeft: isRTL?0:12, marginRight: isRTL?12:0, textAlign:isRTL?'right':'left' }}>{t('pomodoro_timer')}</Txt>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' }}>

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

        {presetIdx === 3 && (
          <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 12, marginBottom: 24, backgroundColor: tColor.card, borderRadius: 14, borderWidth: 1, borderColor: tColor.border2, padding: 16, alignSelf: 'stretch' }}>
            <Txt variant="mono" size={11} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>{t('custom_time')}</Txt>
            <View style={{ flex: 1, flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
              <TextInput
                value={customMinutes}
                onChangeText={v => {
                  const val = v.replace(/[^0-9]/g,'');
                  pomodoroStore.setState({ customMinutes: val });
                  stop(true);
                  pomodoroStore.switchPreset(3, 0);
                }}
                keyboardType="numeric"
                maxLength={3}
                style={{ width: 56, height: 40, borderRadius: 8, borderWidth: 1, borderColor: tColor.accent, backgroundColor: tColor.bg2, fontFamily: 'JetBrainsMono_500Medium', fontSize: 22, color: tColor.accent, textAlign: 'center' }}
              />
              <Txt variant="mono" size={20} color="accent">:</Txt>
              <TextInput
                value={customSeconds}
                onChangeText={v => {
                  const val = v.replace(/[^0-9]/g,'').slice(0,2);
                  pomodoroStore.setState({ customSeconds: val });
                  stop(true);
                  pomodoroStore.switchPreset(3, 0);
                }}
                keyboardType="numeric"
                maxLength={2}
                style={{ width: 56, height: 40, borderRadius: 8, borderWidth: 1, borderColor: tColor.border, backgroundColor: tColor.bg2, fontFamily: 'JetBrainsMono_500Medium', fontSize: 22, color: tColor.text, textAlign: 'center' }}
              />
              <Txt variant="mono" size={11} color="tertiary">mm:ss</Txt>
            </View>
          </View>
        )}

        <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
          <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 8, borderColor: tColor.bg3 }} />
          <View style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 8,
            borderColor: preset.color || '#6B4C8A',
            borderRightColor: progress < 0.75 ? 'transparent' : (preset.color || '#6B4C8A'),
            borderBottomColor: progress < 0.5 ? 'transparent' : (preset.color || '#6B4C8A'),
            borderLeftColor: progress < 0.25 ? 'transparent' : (preset.color || '#6B4C8A'),
            transform: [{ rotate: '-90deg' }] }} />
          <View style={{ alignItems: 'center' }}>
            <Txt variant="display" size={52} style={{ color: preset.color || '#6B4C8A', lineHeight: 60 }}>{pad(mm)}:{pad(ss)}</Txt>
            <Txt variant="mono" size={11} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>{t(preset.key)}</Txt>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32, marginBottom: 28 }}>
          <TouchableOpacity onPress={reset} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={20} color={tColor.text3} />
          </TouchableOpacity>

          {running ? (
            <TouchableOpacity onPress={() => stop()} style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: tColor.card, borderWidth: 2, borderColor: preset.color || tColor.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Pause size={28} color={preset.color || tColor.accent} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startTimer} style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: preset.color || tColor.accent, alignItems: 'center', justifyContent: 'center', shadowColor: preset.color || tColor.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 }}>
              <Play size={32} color="#fff" fill="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={() => stop(false)} disabled={!running} style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center', opacity: running ? 1 : 0.3 }}>
            <Square size={18} color={tColor.red} fill={tColor.red} />
          </TouchableOpacity>
        </View>

        <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, alignSelf: isRTL?'flex-end':'flex-start', textAlign:isRTL?'right':'left' }}>{t('studying_for')}</Txt>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 24, flexDirection: isRTL?'row-reverse':'row' }} style={{ alignSelf: 'stretch' }}>
          <TouchableOpacity onPress={() => pomodoroStore.setState({ selectedCourse: undefined })}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
              borderColor: !selectedCourse ? tColor.accent : tColor.border2, backgroundColor: !selectedCourse ? tColor.accent + '22' : tColor.card }}>
            <Txt variant="mono" size={11} style={{ color: !selectedCourse ? tColor.accent : tColor.text3 }}>{t('general')}</Txt>
          </TouchableOpacity>
          {appState.courses.filter(c => !c.archived).map(c => (
            <TouchableOpacity key={c.id} onPress={() => pomodoroStore.setState({ selectedCourse: c.id })}
              style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5,
                borderColor: selectedCourse === c.id ? c.color : tColor.border2, backgroundColor: selectedCourse === c.id ? c.color + '22' : tColor.card }}>
              <DynamicIcon name={c.icon} size={14} color={selectedCourse === c.id ? c.color : tColor.text3} />
              <Txt variant="mono" size={11} style={{ color: selectedCourse === c.id ? c.color : tColor.text3 }}>{c.name}</Txt>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ flexDirection: isRTL?'row-reverse':'row', gap: 10, alignSelf: 'stretch' }}>
          {[
            { key: 'today', value: todaySessions.length },
            { key: 'study_min', value: todayStudyMin },
            { key: 'all_time', value: appState.pomodoroSessions.length },
          ].map(s => (
            <View key={s.key} style={{ flex: 1, backgroundColor: tColor.card, borderRadius: 12, borderWidth: 1, borderColor: tColor.border2, padding: 12, alignItems: 'center' }}>
              <Txt variant="display" size={22} color="accent">{s.value}</Txt>
              <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 2, textAlign: 'center' }}>{t(s.key as any)}</Txt>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Completion Modal */}
      <BottomSheet visible={pStore.showCompletionModal} onClose={handleDiscardProgress} title="Session Complete! 🎉">
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: tColor.accent + '22', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Award size={32} color={tColor.accent} />
          </View>
           <Txt variant="display" size={24} style={{ marginBottom: 8, textAlign: 'center' }}>Great work!</Txt>
           <Txt variant="bodyItalic" size={15} color="secondary" style={{ textAlign: 'center', marginBottom: 30, paddingHorizontal: 20 }}>
             You studied for {Math.floor(pStore.pendingCalculatedElapsed / 60)} minutes. Save this to your stats to keep your streak going!
           </Txt>
           
           <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
             <Button label="Discard" variant="secondary" onPress={handleDiscardProgress} style={{ flex: 1 }} />
             <Button label="Save Progress" onPress={handleSaveProgress} style={{ flex: 2 }} />
           </View>
        </View>
      </BottomSheet>

    </SafeAreaView>
  );
}
