import { ArrowLeft, ArrowRight, CreditCard } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../../../components/ui/Text';
import { useApp } from '../../../context/AppContext';
import { useSettings } from '../../../context/SettingsContext';
import { useTheme } from '../../../hooks/useTheme';

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

export default function ProfileSettings() {
  const tColor = useTheme();
  const router = useRouter();
  const { state } = useApp();
  const { t, isRTL } = useSettings();
  const profile = state.profile;
  const { courses, todos, streak } = state;

  return (
    <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
      <Header title={t('student_profile')} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:20, paddingBottom:40 }}>
        
        <View style={{ alignItems:'center', marginTop:20, marginBottom:32 }}>
          <View style={{ width:100, height:100, borderRadius:50, backgroundColor:profile?.avatarBg??tColor.accent, alignItems:'center', justifyContent:'center', shadowColor:tColor.accent, shadowOffset:{width:0,height:6}, shadowOpacity:0.3, shadowRadius:12, elevation:6 }}>
            <Txt style={{ fontSize:44 }}>{profile?.avatarEmoji??'🎓'}</Txt>
          </View>
          <Txt variant="display" size={24} style={{ marginTop:16 }}>{profile?.name??'Student'}</Txt>
          <Txt variant="bodyItalic" size={14} color="tertiary">{profile?.email || t('no_email_set')}</Txt>
          
          <TouchableOpacity onPress={() => router.push('/idcard' as any)}
            style={{ marginTop:16, backgroundColor:tColor.bg2, borderWidth:1, borderColor:tColor.border, borderRadius:20, paddingHorizontal:16, paddingVertical:8, flexDirection:isRTL?'row-reverse':'row', alignItems:'center', gap:8 }}>
            <CreditCard size={14} color={tColor.accent} />
            <Txt variant="mono" size={11} color="accent" style={{ textTransform:'uppercase', letterSpacing:1 }}>{t('manage_id_cards')}</Txt>
          </TouchableOpacity>
        </View>

        <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase', letterSpacing:1.5, marginBottom:12, textAlign:isRTL?'right':'left' }}>{t('academic_stats')}</Txt>
        <View style={{ flexDirection:isRTL?'row-reverse':'row', gap:10, marginBottom:24 }}>
          <View style={{ flex:1, backgroundColor:tColor.card, borderRadius:16, borderWidth:1, borderColor:tColor.border2, padding:16, alignItems:'center' }}>
            <Txt variant="display" size={20} color="accent">{courses.length}</Txt>
            <Txt variant="mono" size={9} color="tertiary" style={{ marginTop:4 }}>{t('courses')}</Txt>
          </View>
          <View style={{ flex:1, backgroundColor:tColor.card, borderRadius:16, borderWidth:1, borderColor:tColor.border2, padding:16, alignItems:'center' }}>
            <Txt variant="display" size={20} color="accent">{todos.filter(x=>x.done).length}</Txt>
            <Txt variant="mono" size={9} color="tertiary" style={{ marginTop:4 }}>{t('tasks_done')}</Txt>
          </View>
          <View style={{ flex:1, backgroundColor:tColor.card, borderRadius:16, borderWidth:1, borderColor:tColor.border2, padding:16, alignItems:'center' }}>
            <Txt variant="display" size={20} color="accent">{streak.currentStreak}</Txt>
            <Txt variant="mono" size={9} color="tertiary" style={{ marginTop:4 }}>{t('day_streak')}</Txt>
          </View>
        </View>

        <View style={{ backgroundColor:tColor.card, borderRadius:16, borderWidth:1, borderColor:tColor.border2, overflow:'hidden', padding: 20, alignItems: 'center' }}>
           <Txt variant="bodyItalic" size={13} color="tertiary" style={{ textAlign: 'center' }}>
             {t('profile_managed_via_id' as any) || 'Your profile information is managed through your Student ID cards.'}
           </Txt>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
