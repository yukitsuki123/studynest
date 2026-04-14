import { ArrowLeft, ArrowRight, Sun, Zap, Target, BarChart2, FileText, Hash, Edit3, Layers, Book, Clock, Calendar } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../../../components/ui/Text';
import { Toggle } from '../../../components/ui/Toggle';
import { TranslationKey } from '../../../constants/translations';
import { useSettings } from '../../../context/SettingsContext';
import { useTheme } from '../../../hooks/useTheme';

const HOME_SECTION_CONFIG: Record<string, { labelKey: TranslationKey; icon: React.ElementType; descKey: TranslationKey }> = {
  greeting:       { labelKey: 'greeting_header',      icon: Sun,         descKey: 'greeting_header_desc' },
  streak:         { labelKey: 'study_streak',        icon: Zap,         descKey: 'study_streak_desc' },
  intention:      { labelKey: 'daily_intention',      icon: Target,      descKey: 'daily_intention_desc' },
  stats:          { labelKey: 'quick_stats',         icon: BarChart2, descKey: 'quick_stats_desc' },
  exams:          { labelKey: 'exam_alerts',          icon: FileText,   descKey: 'exam_alerts_desc' },
  quote:          { labelKey: 'daily_quote',          icon: Hash,        descKey: 'daily_quote_desc' },
  stickyNotes:    { labelKey: 'quick_sticky_notes',   icon: Edit3,      descKey: 'quick_sticky_notes_desc' },
  actions:        { labelKey: 'quick_action_list',    icon: Layers,      descKey: 'quick_action_list_desc' },
  courses:        { labelKey: 'course_progress',      icon: Book,        descKey: 'course_progress_desc' },
  recentActivity: { labelKey: 'recent_activity',     icon: Clock,       descKey: 'recent_activity_desc' },
  deadlines:      { labelKey: 'upcoming_deadlines',   icon: Calendar,    descKey: 'upcoming_deadlines_desc' },
};

function Header({ title }: { title: string }) {
  const tColor = useTheme();
  const { isRTL } = useSettings();
  const router = useRouter();
  return (
    <View style={{ flexDirection:isRTL?'row-reverse':'row',alignItems:'center',paddingHorizontal:16,paddingVertical:12 }}>
      <TouchableOpacity onPress={() => router.push('/(tabs)/settings')} style={{ width:40,height:40,borderRadius:20,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center' }}>
        {isRTL ? <ArrowRight size={20} color={tColor.text} /> : <ArrowLeft size={20} color={tColor.text} />}
      </TouchableOpacity>
      <Txt variant="display" size={20} style={{ marginLeft:isRTL?0:16, marginRight:isRTL?16:0 }}>{title}</Txt>
    </View>
  );
}

export default function DashboardSettings() {
  const tColor = useTheme();
  const { homeSections, setHomeSections, t, isRTL } = useSettings();

  return (
    <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
      <Header title={t('dashboard_layout')} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:20, paddingBottom:40 }}>
        <Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginBottom:20, marginTop:8, textAlign:isRTL?'right':'left' }}>
          {t('dashboard_layout_desc')}
        </Txt>

        <View style={{ backgroundColor:tColor.card, borderRadius:16, borderWidth:1, borderColor:tColor.border2, overflow:'hidden' }}>
          {(Object.keys(HOME_SECTION_CONFIG)).map((key, idx) => {
            const isLast = idx === Object.keys(HOME_SECTION_CONFIG).length - 1;
            const cfg = HOME_SECTION_CONFIG[key];
            const isVisible = homeSections[key as keyof typeof homeSections];

            return (
              <View key={key} style={{ flexDirection:isRTL?'row-reverse':'row', alignItems:'center', padding:16, borderBottomWidth:isLast?0:1, borderBottomColor:tColor.border2 }}>
                <View style={{ width:36, height:36, borderRadius:10, backgroundColor:tColor.bg2, alignItems:'center', justifyContent:'center', marginLeft:isRTL?14:0, marginRight:isRTL?0:14 }}>
                  <cfg.icon size={18} color={isVisible ? tColor.accent : tColor.text3} />
                </View>
                <View style={{ flex:1 }}>
                  <Txt variant="bodySemi" size={14} color={isVisible ? 'primary' : 'tertiary'} style={{ textAlign:isRTL?'right':'left' }}>{t(cfg.labelKey)}</Txt>
                  <Txt variant="bodyItalic" size={12} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{t(cfg.descKey)}</Txt>
                </View>
                <Toggle 
                  value={isVisible} 
                  onToggle={() => setHomeSections({ ...homeSections, [key]: !isVisible })} 
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
