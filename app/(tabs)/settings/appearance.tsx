import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Txt } from '../../../components/ui/Text';
import { Toggle } from '../../../components/ui/Toggle';
import { THEME_META } from '../../../constants/themes';
import { ThemeName } from '../../../constants/types';
import { useSettings } from '../../../context/SettingsContext';
import { useTheme } from '../../../hooks/useTheme';
import { ThemeColors } from '../../../constants/types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { TranslationKey } from '../../../constants/translations';

const FONTS = [
  { id:'lora',        label:'Lora',        description:'Classic warm serif',       preview:'Lora_600SemiBold' },
  { id:'crimson',     label:'Crimson Pro',  description:'Research paper style',     preview:'CrimsonPro_600SemiBold' },
  { id:'spectral',    label:'Spectral',     description:'Elegant editorial serif',  preview:'Spectral_600SemiBold' },
  { id:'merriweather',label:'Merriweather', description:'Strong & highly readable', preview:'Merriweather_700Bold' },
  { id:'eb_garamond', label:'EB Garamond',  description:'Historic academic serif',  preview:'EBGaramond_600SemiBold' },
  { id:'cormorant',   label:'Cormorant',    description:'Refined display serif',    preview:'Cormorant_600SemiBold' },
] as const;

const BRAND_COLORS = [
  '#2563EB', '#7C3AED', '#DB2777', '#DC2626', '#EA580C', '#D97706',
  '#65A30D', '#059669', '#0891B2', '#4F46E5', '#1E293B', '#8B4513'
];

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

function SectionTitle({ label }: { label: string }) {
  const tColor = useTheme();
  const { isRTL } = useSettings();
  return <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.2,marginBottom:10,marginTop:24,paddingHorizontal:20,textAlign:isRTL?'right':'left' }}>{label}</Txt>;
}

export default function AppearanceSettings() {
  const tColor = useTheme();
  const { 
    theme, isDark, autoDark, fontFamily, themeMode, animations, primaryColor, t, isRTL, customPalette,
    setTheme, toggleDark, setAutoDark, setFontFamily, setThemeMode, setAnimations, setPrimaryColor, setCustomColor
  } = useSettings();
  
  const [showFonts, setShowFonts] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  return (
    <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
      <Header title={t('appearance')} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:40 }}>
        
        <SectionTitle label={t('dark_mode')} />
        <View style={{ marginHorizontal:20,backgroundColor:tColor.card,borderRadius:16,borderWidth:1,borderColor:tColor.border2,overflow:'hidden' }}>
          <View style={{ flexDirection:isRTL?'row-reverse':'row',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:tColor.border2 }}>
            <View style={{ width:32,height:32,borderRadius:8,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center',marginLeft:isRTL?12:0,marginRight:isRTL?0:12 }}>
              <Feather name="moon" size={16} color={tColor.accent} />
            </View>
            <Txt variant="body" style={{ flex:1,textAlign:isRTL?'right':'left' }}>{t('dark_mode')}</Txt>
            <Toggle value={isDark} onToggle={toggleDark} />
          </View>
          <View style={{ flexDirection:isRTL?'row-reverse':'row',alignItems:'center',padding:16 }}>
            <View style={{ width:32,height:32,borderRadius:8,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center',marginLeft:isRTL?12:0,marginRight:isRTL?0:12 }}>
              <Feather name="sunset" size={16} color={tColor.accent} />
            </View>
            <Txt variant="body" style={{ flex:1,textAlign:isRTL?'right':'left' }}>{t('auto_dark')}</Txt>
            <Toggle value={autoDark} onToggle={() => setAutoDark(!autoDark)} />
          </View>
        </View>

        <SectionTitle label={t('font_style')} />
        <TouchableOpacity onPress={() => setShowFonts(true)} activeOpacity={0.7}
          style={{ marginHorizontal:20,backgroundColor:tColor.card,borderRadius:16,borderWidth:1,borderColor:tColor.border2,padding:16,flexDirection:isRTL?'row-reverse':'row',alignItems:'center' }}>
          <View style={{ width:32,height:32,borderRadius:8,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center',marginLeft:isRTL?12:0,marginRight:isRTL?0:12 }}>
            <Feather name="type" size={16} color={tColor.accent} />
          </View>
          <View style={{ flex:1 }}>
            <Txt variant="body" style={{ textAlign:isRTL?'right':'left' }}>{t('font_style')}</Txt>
            <Txt variant="bodyItalic" size={12} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{FONTS.find(f=>f.id===fontFamily)?.label??'Lora'}</Txt>
          </View>
          <Feather name={isRTL?"chevron-left":"chevron-right"} size={16} color={tColor.text3} />
        </TouchableOpacity>

        <SectionTitle label={t('animations')} />
        <View style={{ marginHorizontal:20,backgroundColor:tColor.card,borderRadius:16,borderWidth:1,borderColor:tColor.border2,padding:16,flexDirection:isRTL?'row-reverse':'row',alignItems:'center' }}>
          <View style={{ width:32,height:32,borderRadius:8,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center',marginLeft:isRTL?12:0,marginRight:isRTL?0:12 }}>
            <Feather name="zap" size={16} color={tColor.accent} />
          </View>
          <Txt variant="body" style={{ flex:1,textAlign:isRTL?'right':'left' }}>{t('animations')}</Txt>
          <Toggle value={animations} onToggle={() => setAnimations(!animations)} />
        </View>

        <View style={{ flexDirection:isRTL?'row-reverse':'row', justifyContent:'space-between', alignItems:'center', marginTop:14 }}>
          <SectionTitle label={t('theme_branding')} />
          <View style={{ flexDirection:isRTL?'row-reverse':'row', backgroundColor:tColor.bg2, borderRadius:10, padding:3, gap:2, marginLeft:isRTL?20:0, marginRight:isRTL?0:20, marginTop:10 }}>
            {(['standard', 'custom'] as const).map(m => (
              <TouchableOpacity key={m} onPress={() => setThemeMode(m)}
                style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:8, backgroundColor: themeMode === m ? tColor.card : 'transparent' }}>
                <Txt variant="mono" size={10} style={{ textTransform:'uppercase', color: themeMode === m ? tColor.accent : tColor.text3 }}>{t(m)}</Txt>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal:20, marginTop:8 }}>
          {themeMode === 'standard' ? (
            <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10 }}>
              {(Object.keys(THEME_META) as ThemeName[]).map(key => {
                const meta = THEME_META[key];
                const active = theme === key;
                return (
                  <TouchableOpacity key={key} onPress={() => setTheme(key)}
                    style={{ width:'48%', flexDirection:'row', alignItems:'center', gap:10, paddingVertical:12, paddingHorizontal:14, borderRadius:16, borderWidth:active?2:1, borderColor:active?tColor.accent:tColor.border2, backgroundColor:tColor.card }}>
                    <View style={{ width:24, height:24, borderRadius:12, overflow:'hidden', borderWidth:1, borderColor:tColor.border }}>
                      <View style={{ position:'absolute', left:0, top:0, bottom:0, right:'50%', backgroundColor:meta.swatchLight }} />
                      <View style={{ position:'absolute', right:0, top:0, bottom:0, left:'50%', backgroundColor:meta.swatchDark }} />
                    </View>
                    <View style={{ flex:1 }}>
                      <Txt variant="bodySemi" size={13}>{meta.label}</Txt>
                    </View>
                    {active && <Feather name="check" size={14} color={tColor.accent} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={{ backgroundColor:tColor.card, borderRadius:16, padding:16, borderWidth:1, borderColor:tColor.border2 }}>
              <Txt variant="bodyItalic" size={12} color="tertiary" style={{ marginBottom:16, textAlign:isRTL?'right':'left' }}>{t('brand_color_desc')}</Txt>
              <View style={{ flexDirection:isRTL?'row-reverse':'row', flexWrap:'wrap', gap:12 }}>
                {BRAND_COLORS.map(c => (
                  <TouchableOpacity key={c} onPress={() => setPrimaryColor(c)}
                    style={{ width:42, height:42, borderRadius:21, backgroundColor:c, borderWidth:3, borderColor: primaryColor === c ? tColor.text : 'transparent', alignItems:'center', justifyContent:'center' }}>
                    {primaryColor === c && <Feather name="check" size={20} color="#fff" />}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={() => setShowCustom(true)}
                style={{ marginTop:24, paddingVertical:14, borderRadius:12, backgroundColor:tColor.bg2, borderWidth:1, borderColor:tColor.border, alignItems:'center', justifyContent:'center', flexDirection:isRTL?'row-reverse':'row', gap:8 }}>
                <Feather name="sliders" size={16} color={tColor.accent} />
                <Txt variant="mono" size={11} color="accent" style={{ textTransform:'uppercase', letterSpacing:0.5 }}>{t('edit_custom_colors')}</Txt>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Font picker */}
      <BottomSheet visible={showFonts} onClose={() => setShowFonts(false)} title={t('choose_font')} scrollable>
        {FONTS.map((f, i) => {
          const active = fontFamily === f.id;
          return (
            <TouchableOpacity key={f.id} onPress={() => { setFontFamily(f.id as any); setShowFonts(false); }}
              style={{ flexDirection:isRTL?'row-reverse':'row',alignItems:'center',gap:14,paddingVertical:16,borderBottomWidth:i<FONTS.length-1?1:0,borderBottomColor:tColor.border2 }}>
              <View style={{ width:60,height:50,borderRadius:12,backgroundColor:active?tColor.accent+'22':tColor.bg2,borderWidth:1,borderColor:active?tColor.accent:tColor.border2,alignItems:'center',justifyContent:'center' }}>
                <Txt size={22} style={{ fontFamily:f.preview }}>Aa</Txt>
              </View>
              <View style={{ flex:1 }}>
                <Txt variant="bodySemi" size={16} style={{ textAlign:isRTL?'right':'left' }}>{f.label}</Txt>
                <Txt variant="bodyItalic" size={13} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{f.description}</Txt>
              </View>
              {active && <View style={{ width:26,height:26,borderRadius:13,backgroundColor:tColor.accent,alignItems:'center',justifyContent:'center' }}><Feather name="check" size={14} color="#fff" /></View>}
            </TouchableOpacity>
          );
        })}
      </BottomSheet>

      {/* Custom Color Palette Editor */}
      <BottomSheet visible={showCustom} onClose={() => setShowCustom(false)} title={t('edit_custom_colors')} scrollable>
        <Txt variant="bodyItalic" size={12} color="tertiary" style={{ marginBottom:20 }}>Overrides the generated branding colors. Enter valid Hex codes (e.g. #FFFFFF).</Txt>
        {(Object.keys(tColor) as (keyof ThemeColors)[]).map((key) => {
          // Filter out complex or non-color keys if any exist, but ThemeColors is all strings usually
          if (typeof tColor[key] !== 'string') return null;
          
          const labelKey = `${key}_color_label` as TranslationKey;
          const label = t(labelKey);
          
          return (
            <View key={key} style={{ marginBottom:16 }}>
              <View style={{ flexDirection:isRTL?'row-reverse':'row', alignItems:'center', gap:10, marginBottom:6 }}>
                <View style={{ width:20, height:20, borderRadius:10, backgroundColor: tColor[key], borderWidth:1, borderColor:tColor.border }} />
                <Txt variant="mono" size={11} color="secondary" style={{ flex:1, textAlign:isRTL?'right':'left' }}>{label}</Txt>
                <Txt variant="mono" size={9} color="tertiary">[{key}]</Txt>
              </View>
              <Input
                value={customPalette[key] || tColor[key]}
                onChangeText={(val) => {
                  if (val.startsWith('#') && (val.length === 4 || val.length === 7 || val.length === 9)) {
                    setCustomColor(key, val);
                  }
                }}
                placeholder="#000000"
                style={{ height:40, fontSize:13 }}
              />
            </View>
          );
        })}
        <Button label="Done" onPress={() => setShowCustom(false)} style={{ marginTop:10 }} />
      </BottomSheet>

    </SafeAreaView>
  );
}
