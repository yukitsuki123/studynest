import { ArrowLeft, ArrowRight, Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../../../components/ui/Text';
import { Language } from '../../../constants/types';
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

function SectionTitle({ label }: { label: string }) {
  const tColor = useTheme();
  const { isRTL } = useSettings();
  return <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.2,marginBottom:12,marginTop:24, textAlign:isRTL?'right':'left' }}>{label}</Txt>;
}

export default function LanguageSettings() {
  const tColor = useTheme();
  const { language, setLanguage, t, isRTL } = useSettings();

  return (
    <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
      <Header title="Language" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:20, paddingBottom:40 }}>
        
        <SectionTitle label={t('app_language')} />
        <View style={{ gap: 12 }}>
          {([['en','English','direction_ltr','status_available',false],['ar','العربية','direction_rtl','status_available',false]] as const).map(([code,label,dirKey,statusKey,isLocked]) => {
            const active = language === code;
            return (
              <TouchableOpacity key={code} onPress={() => !isLocked && setLanguage(code as Language)} disabled={isLocked}
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row', paddingVertical:16,paddingHorizontal:16,borderRadius:16,borderWidth:active?2:1,borderColor:active?tColor.accent:tColor.border2,backgroundColor:tColor.card,alignItems:'center', justifyContent: 'space-between' }}>
                <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <Txt variant="bodySemi" size={15}>{label}</Txt>
                  <Txt variant="mono" size={9} color="tertiary" style={{ marginTop:4 }}>{t(dirKey as any)} · {t(statusKey as any)}</Txt>
                </View>
                {active ? <Check size={20} color={tColor.accent} /> : <View style={{ width: 20 }} />}
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
