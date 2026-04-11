import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../../../components/ui/Text';
import { useSettings } from '../../../context/SettingsContext';
import { useTheme } from '../../../hooks/useTheme';

function Header({ title }: { title: string }) {
  const tColor = useTheme();
  const { isRTL } = useSettings();
  const router = useRouter();
  return (
    <View style={{ flexDirection:isRTL?'row-reverse':'row',alignItems:'center',paddingHorizontal:16,paddingVertical:12 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ width:40,height:40,borderRadius:20,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center' }}>
        <Feather name={isRTL?"arrow-right":"arrow-left"} size={20} color={tColor.text} />
      </TouchableOpacity>
      <Txt variant="display" size={20} style={{ marginLeft:isRTL?0:16, marginRight:isRTL?16:0 }}>{title}</Txt>
    </View>
  );
}

export default function AboutSettings() {
  const tColor = useTheme();
  const { t, isRTL } = useSettings();

  const paras = [
    t('about_para1'),
    t('about_para2'),
    t('about_para3'),
    t('about_para4'),
    t('about_para5'),
  ];

  return (
    <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
      <Header title={t('about_studynest')} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:20, paddingBottom:40 }}>
        
        <View style={{ marginBottom:32, alignItems:'center', marginTop:20 }}>
          <View style={{ width:80, height:80, borderRadius:20, backgroundColor:tColor.card, alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:tColor.border2, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.1, shadowRadius:10, elevation:4 }}>
            <Txt style={{ fontSize:40 }}>📚</Txt>
          </View>
          <Txt variant="display" size={22} style={{ marginTop:16 }}>StudyNest</Txt>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:2, marginTop:4 }}>{t('version_info')}</Txt>
        </View>

        {paras.map((para, i) => (
          <Txt key={i} variant="body" size={14} color="secondary" style={{ lineHeight:24, marginBottom:16, textAlign:isRTL?'right':'left' }}>
            {para}
          </Txt>
        ))}

        <View style={{ backgroundColor:tColor.card, borderRadius:16, padding:20, marginTop:10, borderWidth:1, borderColor:tColor.border2 }}>
          <Txt variant="mono" size={10} color="accent" style={{ textTransform:'uppercase',letterSpacing:1.5, marginBottom:10, textAlign:isRTL?'right':'left' }}>{t('our_philosophy')}</Txt>
          <Txt variant="bodyItalic" size={13} color="secondary" style={{ lineHeight:22, textAlign:isRTL?'right':'left' }}>
            {t('philosophy_desc')}
          </Txt>
        </View>

        <View style={{ marginTop:32, flexDirection:isRTL?'row-reverse':'row', justifyContent:'center', gap:24 }}>
          <TouchableOpacity><Feather name="github" size={20} color={tColor.text3} /></TouchableOpacity>
          <TouchableOpacity><Feather name="twitter" size={20} color={tColor.text3} /></TouchableOpacity>
          <TouchableOpacity><Feather name="globe" size={20} color={tColor.text3} /></TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
