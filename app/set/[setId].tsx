import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Txt } from '../../components/ui/Text';
import { Button } from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../hooks/useTheme';
import { useSettings } from '../../context/SettingsContext';

type Mode = 'overview' | 'quiz';

export default function StudySetScreen() {
  const tColor = useTheme();
  const router = useRouter();
  const { setId: setIdParam } = useLocalSearchParams<{ setId: string }>();
  const setId = Array.isArray(setIdParam) ? setIdParam[0] : setIdParam;
  const { state, toggleStep, deleteStudySet } = useApp();
  const { t, isRTL } = useSettings();
  const [mode,        setMode]        = useState<Mode>('overview');
  const [quizIndex,   setQuizIndex]   = useState(0);
  const [quizDone,    setQuizDone]    = useState<Set<string>>(new Set());
  const [revealed,    setRevealed]    = useState(false);

  const set = useMemo(() => state.studySets.find(ss => ss.id === setId) ?? null, [state.studySets, setId]);
  if (!state.ready) {
    return <SafeAreaView style={{ flex:1, backgroundColor:tColor.bg }} edges={['top']}><View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><Txt variant="bodyItalic" size={14} color="tertiary">Loading…</Txt></View></SafeAreaView>;
  }
  if (!set) {
    return <SafeAreaView style={{ flex:1, backgroundColor:tColor.bg }} edges={['top']}><View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><Txt variant="display" size={18} color="tertiary">{t('course_not_found')}</Txt></View></SafeAreaView>;
  }

  const done     = set.steps.filter(s => s.done).length;
  const progress = set.steps.length ? done / set.steps.length : 0;
  const pct      = Math.round(progress * 100);

  // Quiz mode
  const quizSteps = set.steps;
  const current   = quizSteps[quizIndex];
  const quizPct   = quizSteps.length ? quizDone.size / quizSteps.length : 0;

  const markKnow = () => {
    setQuizDone(prev => new Set([...prev, current.id]));
    setRevealed(false);
    if (quizIndex < quizSteps.length - 1) setQuizIndex(i => i + 1);
  };
  const markSkip = () => {
    setRevealed(false);
    if (quizIndex < quizSteps.length - 1) setQuizIndex(i => i + 1);
  };
  const restartQuiz = () => { setQuizIndex(0); setQuizDone(new Set()); setRevealed(false); };

  const quizFinished = quizIndex === quizSteps.length - 1 && revealed;

  if (mode === 'quiz') {
    return (
      <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
        <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:12, paddingHorizontal:20, paddingVertical:14, borderBottomWidth:1, borderBottomColor:tColor.border }}>
          <TouchableOpacity onPress={() => setMode('overview')} style={{ width:34,height:34,borderRadius:9,backgroundColor:tColor.card,borderWidth:1,borderColor:tColor.border,alignItems:'center',justifyContent:'center' }}>
            <Feather name="x" size={18} color={tColor.text2} />
          </TouchableOpacity>
          <Txt variant="display" size={17} style={{ flex:1, textAlign: isRTL?'right':'left' }}>{t('quiz')} — {set.title}</Txt>
          <Txt variant="mono" size={11} color="tertiary">{quizIndex+1}/{quizSteps.length}</Txt>
        </View>

        <View style={{ paddingHorizontal:20,paddingTop:8 }}>
          <ProgressBar progress={quizPct} height={5} />
          <Txt variant="mono" size={10} color="tertiary" style={{ textAlign: isRTL?'left':'right', marginTop:4 }}>{quizDone.size} {t('known')}</Txt>
        </View>

        {quizFinished ? (
          <View style={{ flex:1,alignItems:'center',justifyContent:'center',padding:32 }}>
            <Txt style={{ fontSize:60,marginBottom:16 }}>🎉</Txt>
            <Txt variant="display" size={24} style={{ textAlign:'center',marginBottom:8 }}>{t('quiz_complete')}</Txt>
            <Txt variant="bodyItalic" size={15} color="tertiary" style={{ textAlign:'center',marginBottom:32 }}>
              {t('quiz_result_summary').replace('{known}', quizDone.size.toString()).replace('{total}', quizSteps.length.toString())}
            </Txt>
            <Button label={t('restart_quiz')} onPress={restartQuiz} style={{ width:'100%',marginBottom:12 }} />
            <Button label={t('back_to_overview')} variant="secondary" onPress={() => setMode('overview')} style={{ width:'100%' }} />
          </View>
        ) : (
          <View style={{ flex:1,padding:20 }}>
            {/* Card */}
            <TouchableOpacity onPress={() => setRevealed(r=>!r)} activeOpacity={0.9}
              style={{ flex:1,backgroundColor:tColor.card,borderRadius:20,borderWidth:1,borderColor:tColor.border2,
                alignItems:'center',justifyContent:'center',padding:32,marginBottom:20,
                shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.08,shadowRadius:12,elevation:3 }}>
              {revealed ? (
                <>
                  <View style={{ backgroundColor:tColor.accent+'22',paddingHorizontal:12,paddingVertical:4,borderRadius:20,marginBottom:16 }}>
                    <Txt variant="mono" size={10} color="accent" style={{ textTransform:'uppercase',letterSpacing:0.8 }}>{t('step_label')} {quizIndex+1}</Txt>
                  </View>
                  <Txt variant="display" size={20} style={{ textAlign:'center',lineHeight:28 }}>{current.label}</Txt>
                  {current.done && (
                    <View style={{ marginTop:16,flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:6 }}>
                      <Feather name="check-circle" size={14} color={tColor.accent3} />
                      <Txt variant="mono" size={11} style={{ color:tColor.accent3 }}>{t('marked_complete')}</Txt>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Txt style={{ fontSize:48,marginBottom:12 }}>🤔</Txt>
                  <Txt variant="display" size={18} color="tertiary">{t('tap_to_reveal')}</Txt>
                  <Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginTop:6 }}>{t('step_label')} {quizIndex+1} {t('out_of').toLowerCase()} {quizSteps.length}</Txt>
                </>
              )}
            </TouchableOpacity>

            {/* Actions */}
            {revealed && !quizFinished && (
              <View style={{ flexDirection: isRTL?'row-reverse':'row', gap:12 }}>
                <TouchableOpacity onPress={markSkip}
                  style={{ flex:1,paddingVertical:14,borderRadius:12,borderWidth:1.5,borderColor:tColor.red+'66',backgroundColor:tColor.red+'11',alignItems:'center',flexDirection: isRTL?'row-reverse':'row',justifyContent:'center',gap:8 }}>
                  <Feather name="x" size={16} color={tColor.red} />
                  <Txt variant="bodySemi" size={14} style={{ color:tColor.red }}>{t('skip')}</Txt>
                </TouchableOpacity>
                <TouchableOpacity onPress={markKnow}
                  style={{ flex:1,paddingVertical:14,borderRadius:12,borderWidth:1.5,borderColor:tColor.accent3+'66',backgroundColor:tColor.accent3+'11',alignItems:'center',flexDirection: isRTL?'row-reverse':'row',justifyContent:'center',gap:8 }}>
                  <Feather name="check" size={16} color={tColor.accent3} />
                  <Txt variant="bodySemi" size={14} style={{ color:tColor.accent3 }}>{t('got_it')}</Txt>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Overview mode
  return (
    <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
      <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:12, paddingHorizontal:20, paddingVertical:14, borderBottomWidth:1, borderBottomColor:tColor.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width:34,height:34,borderRadius:9,backgroundColor:tColor.card,borderWidth:1,borderColor:tColor.border,alignItems:'center',justifyContent:'center' }}>
          <Feather name={isRTL?"chevron-right":"chevron-left"} size={18} color={tColor.text2} />
        </TouchableOpacity>
        <Txt variant="display" size={18} style={{ flex:1, textAlign: isRTL?'right':'left' }}>{set.title}</Txt>
        <TouchableOpacity onPress={() => Alert.alert(t('trash_management'), `${t('permanent_delete')} "${set.title}"?`, [{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>{deleteStudySet(setId!);router.back();}}])}>
          <Feather name="trash-2" size={16} color={tColor.text3} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding:20,paddingBottom:40 }}>
        {/* Progress card */}
        <View style={{ backgroundColor:tColor.card,borderRadius:14,borderWidth:1,borderColor:tColor.border2,padding:20,marginBottom:16 }}>
          <View style={{ flexDirection: isRTL?'row-reverse':'row', justifyContent:'space-between', alignItems:'flex-end', marginBottom:12 }}>
            <View>
              <Txt variant="display" size={42} color="accent" style={{ lineHeight:48, textAlign: isRTL?'right':'left' }}>{pct}%</Txt>
              <Txt variant="bodyItalic" size={13} color="tertiary" style={{ textAlign: isRTL?'right':'left' }}>{done} {t('out_of').toLowerCase()} {set.steps.length} {t('marked_complete').toLowerCase()}</Txt>
            </View>
            {pct===100
              ? <View style={{ backgroundColor:tColor.accent3+'22',paddingHorizontal:12,paddingVertical:6,borderRadius:20 }}><Txt variant="mono" size={11} style={{ color:tColor.accent3 }}>✓ {t('status_in_progress')}</Txt></View>
              : <View style={{ backgroundColor:tColor.bg2,paddingHorizontal:12,paddingVertical:6,borderRadius:20 }}><Txt variant="mono" size={11} color="tertiary">{set.steps.length-done} {t('left')}</Txt></View>
            }
          </View>
          <ProgressBar progress={progress} height={8} />
        </View>

        {/* Quiz button */}
        <TouchableOpacity onPress={() => { restartQuiz(); setMode('quiz'); }}
          style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:12, backgroundColor:tColor.accent+'22', borderWidth:1.5, borderColor:tColor.accent+'44', borderRadius:12, padding:16, marginBottom:20 }}>
          <View style={{ width:40,height:40,borderRadius:10,backgroundColor:tColor.accent,alignItems:'center',justifyContent:'center' }}>
            <Feather name="zap" size={18} color="#fff" />
          </View>
          <View style={{ flex:1 }}>
            <Txt variant="bodySemi" size={15} color="accent" style={{ textAlign: isRTL?'right':'left' }}>{t('start_quiz_mode')}</Txt>
            <Txt variant="bodyItalic" size={12} color="tertiary" style={{ textAlign: isRTL?'right':'left' }}>{t('test_yourself_hint')}</Txt>
          </View>
          <Feather name={isRTL?"chevron-left":"chevron-right"} size={16} color={tColor.accent} />
        </TouchableOpacity>

        {/* Steps */}
        <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.2,marginBottom:12, textAlign: isRTL?'right':'left' }}>— {t('sets')}</Txt>
        {set.steps.map((step, idx) => (
          <TouchableOpacity key={step.id} onPress={() => toggleStep(set.id, step.id)} activeOpacity={0.8}
            style={{ flexDirection: isRTL?'row-reverse':'row', alignItems:'center', gap:14, backgroundColor:tColor.card, borderWidth:1, borderColor:step.done?tColor.accent3+'44':tColor.border2, borderRadius:12, padding:16, marginBottom:8 }}>
            <Txt variant="mono" size={12} color="tertiary" style={{ width:20,textAlign:'center' }}>{idx+1}</Txt>
            <View style={{ width:22,height:22,borderRadius:6,borderWidth:1.5,borderColor:step.done?tColor.accent3:tColor.border,backgroundColor:step.done?tColor.accent3:'transparent',alignItems:'center',justifyContent:'center' }}>
              {step.done && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Txt variant="body" size={15} style={{ flex:1,color:step.done?tColor.text3:tColor.text,textDecorationLine:step.done?'line-through':'none',lineHeight:22, textAlign: isRTL?'right':'left' }}>{step.label}</Txt>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
