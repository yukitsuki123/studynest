import { ArrowLeft, ArrowRight, FileText, Image as ImageIcon } from 'lucide-react-native';
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

export default function FileViewerSettings() {
  const tColor = useTheme();
  const { pdfReader, setPdfReader, imageReader, setImageReader, t, isRTL } = useSettings();

  return (
    <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
      <Header title="File Viewer" />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:20, paddingBottom:40 }}>
        
        <SectionTitle label={t('file_viewing_prefs')} />
        <View style={{ backgroundColor:tColor.card, borderRadius:16, borderWidth:1, borderColor:tColor.border2, overflow:'hidden' }}>
          
          <View style={{ flexDirection:isRTL?'row-reverse':'row', alignItems:'center', padding:16, borderBottomWidth:1, borderBottomColor:tColor.border2 }}>
            <View style={{ width:36, height:36, borderRadius:10, backgroundColor:tColor.bg2, alignItems:'center', justifyContent:'center', marginLeft:isRTL?14:0, marginRight:isRTL?0:14 }}>
              <FileText size={18} color={tColor.accent} />
            </View>
            <View style={{ flex:1 }}>
              <Txt variant="bodySemi" size={14} style={{ textAlign:isRTL?'right':'left' }}>{t('pdf_reader')}</Txt>
              <Txt variant="bodyItalic" size={12} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{t('current')}: {pdfReader === 'builtin' ? t('in_app') : t('system_default')}</Txt>
            </View>
            <View style={{ flexDirection:isRTL?'row-reverse':'row', backgroundColor:tColor.bg2, borderRadius:10, padding:2 }}>
              {(['builtin', 'external'] as const).map(m => (
                <TouchableOpacity key={m} onPress={() => setPdfReader(m)}
                   style={{ paddingHorizontal:10, paddingVertical:6, borderRadius:8, backgroundColor: pdfReader === m ? tColor.card : 'transparent' }}>
                  <Txt variant="mono" size={10} style={{ color: pdfReader === m ? tColor.accent : tColor.text3 }}>{m === 'builtin' ? t('in_app') : t('system_default')}</Txt>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ flexDirection:isRTL?'row-reverse':'row', alignItems:'center', padding:16 }}>
            <View style={{ width:36, height:36, borderRadius:10, backgroundColor:tColor.bg2, alignItems:'center', justifyContent:'center', marginLeft:isRTL?14:0, marginRight:isRTL?0:14 }}>
              <ImageIcon size={18} color={tColor.accent} />
            </View>
            <View style={{ flex:1 }}>
              <Txt variant="bodySemi" size={14} style={{ textAlign:isRTL?'right':'left' }}>{t('image_viewer')}</Txt>
              <Txt variant="bodyItalic" size={12} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{t('current')}: {imageReader === 'builtin' ? t('in_app') : t('system_default')}</Txt>
            </View>
            <View style={{ flexDirection:isRTL?'row-reverse':'row', backgroundColor:tColor.bg2, borderRadius:10, padding:2 }}>
              {(['builtin', 'external'] as const).map(m => (
                <TouchableOpacity key={m} onPress={() => setImageReader(m)}
                  style={{ paddingHorizontal:10, paddingVertical:6, borderRadius:8, backgroundColor: imageReader === m ? tColor.card : 'transparent' }}>
                  <Txt variant="mono" size={10} style={{ color: imageReader === m ? tColor.accent : tColor.text3 }}>{m === 'builtin' ? t('in_app') : t('system_default')}</Txt>
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </View>

        <View style={{ marginTop:24, padding:16, backgroundColor:tColor.accent+'11', borderRadius:14, borderWidth:1, borderColor:tColor.accent+'33' }}>
          <Txt variant="bodyItalic" size={12} color="secondary" style={{ lineHeight:18, textAlign:isRTL?'right':'left' }}>
            {t('file_viewing_desc')}
          </Txt>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
