import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../../../components/ui/Text';
import { useApp } from '../../../context/AppContext';
import { useSettings } from '../../../context/SettingsContext';
import { useTheme } from '../../../hooks/useTheme';

function SectionTitle({ label }: { label: string }) {
  const tColor = useTheme();
  const { isRTL } = useSettings();
  return <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.2,marginBottom:10,marginTop:20,textAlign:isRTL?'right':'left' }}>{label}</Txt>;
}

function MenuRow({ icon, label, description, onPress, last, value }: {
  icon: keyof typeof Feather.glyphMap; label: string; description?: string;
  onPress: () => void; last?: boolean; value?: string;
}) {
  const tColor = useTheme();
  const { isRTL } = useSettings();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={{ flexDirection:isRTL?'row-reverse':'row',alignItems:'center',gap:14,paddingHorizontal:16,paddingVertical:16,
        borderBottomWidth:last?0:1,borderBottomColor:tColor.border2,backgroundColor:tColor.card }}>
      <View style={{ width:36,height:36,borderRadius:10,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center',marginLeft:isRTL?14:0,marginRight:isRTL?0:14 }}>
        <Feather name={icon} size={18} color={tColor.accent} />
      </View>
      <View style={{ flex:1 }}>
        <Txt variant="bodySemi" size={14} style={{ textAlign:isRTL?'right':'left' }}>{label}</Txt>
        {description && <Txt variant="bodyItalic" size={12} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{description}</Txt>}
      </View>
      {value && <Txt variant="mono" size={11} color="accent" style={{ marginRight:4 }}>{value}</Txt>}
      <Feather name={isRTL?"chevron-left":"chevron-right"} size={16} color={tColor.text3} />
    </TouchableOpacity>
  );
}

export default function SettingsMain() {
  const tColor = useTheme();
  const router = useRouter();
  const { state } = useApp();
  const { theme, themeMode, language, isDark, t, isRTL } = useSettings();
  const profile = state.profile;

  return (
    <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:40 }}>
        
        <View style={{ paddingHorizontal:20,paddingTop:16,paddingBottom:20 }}>
          <Txt variant="display" size={28} style={{ letterSpacing:-0.5, textAlign:isRTL?'right':'left' }}>{t('settings')}</Txt>
        </View>

        {/* Profile Card */}
        <TouchableOpacity onPress={() => router.push('/settings/profile' as any)} activeOpacity={0.8}
          style={{ marginHorizontal:20,marginBottom:24,padding:16,backgroundColor:tColor.card,borderRadius:16,borderWidth:1,borderColor:tColor.border2,flexDirection:isRTL?'row-reverse':'row',alignItems:'center',gap:16 }}>
          <View style={{ width:60,height:60,borderRadius:30,backgroundColor:profile?.avatarBg??tColor.accent,alignItems:'center',justifyContent:'center',shadowColor:tColor.accent,shadowOffset:{width:0,height:4},shadowOpacity:0.2,shadowRadius:6,elevation:3 }}>
            <Txt style={{ fontSize:26 }}>{profile?.avatarEmoji??'🎓'}</Txt>
          </View>
          <View style={{ flex:1 }}>
            <Txt variant="display" size={18} style={{ textAlign:isRTL?'right':'left' }}>{profile?.name??'Student'}</Txt>
            <Txt variant="bodyItalic" size={12} color="tertiary" numberOfLines={1} style={{ textAlign:isRTL?'right':'left' }}>{profile?.email || t('profile_desc')}</Txt>
          </View>
          <Feather name={isRTL?"chevron-left":"chevron-right"} size={20} color={tColor.text3} />
        </TouchableOpacity>

        <View style={{ paddingHorizontal:20 }}>
          
          <SectionTitle label={t('personalization')} />
          <View style={{ borderRadius:16,overflow:'hidden',borderWidth:1,borderColor:tColor.border2 }}>
            <MenuRow 
              icon="layers" 
              label={t('appearance')} 
              description={t('appearance_desc')}
              value={themeMode === 'custom' ? t('custom') : t(theme as any)}
              onPress={() => router.push('/settings/appearance' as any)} 
            />
            <MenuRow 
              icon="layout" 
              label={t('dashboard_content')} 
              description={t('dashboard_desc')}
              onPress={() => router.push('/settings/dashboard' as any)} 
              last 
            />
          </View>

          <SectionTitle label={t('system_behavior')} />
          <View style={{ borderRadius:16,overflow:'hidden',borderWidth:1,borderColor:tColor.border2 }}>
            <MenuRow 
              icon="settings" 
              label={t('language')} 
              description={t('behavior_desc')}
              value={language === 'ar' ? 'العربية' : 'English'}
              onPress={() => router.push('/settings/behavior' as any)} 
            />
            <MenuRow 
              icon="shield" 
              label={t('data_privacy')} 
              description={t('data_desc')}
              onPress={() => router.push('/settings/data' as any)} 
              last 
            />
          </View>

          <SectionTitle label={t('support')} />
          <View style={{ borderRadius:16,overflow:'hidden',borderWidth:1,borderColor:tColor.border2 }}>
            <MenuRow 
              icon="info" 
              label={t('about')} 
              description={t('about_desc')}
              onPress={() => router.push('/settings/about' as any)} 
              last 
            />
          </View>

          <View style={{ marginTop:32,alignItems:'center' }}>
            <Txt variant="mono" size={9} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:2 }}>StudyNest v1.0.0</Txt>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
