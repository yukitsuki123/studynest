import { ArrowLeft, ArrowRight, Moon, Sunset, Type, ChevronLeft, ChevronRight, Zap, Move, Check, Sliders } from 'lucide-react-native';
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
import { ColorPicker } from '../../../components/ui/ColorPicker';

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
  return <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.2,marginBottom:10,marginTop:24,paddingHorizontal:20,textAlign:isRTL?'right':'left' }}>{label}</Txt>;
}

export default function AppearanceSettings() {
  const tColor = useTheme();
  const { 
    theme, isDark, autoDark, fontFamily, themeMode, animations, primaryColor, t, isRTL, customPalette,
    fontSizeMultiplier, haptics,
    setTheme, toggleDark, setAutoDark, setFontFamily, setThemeMode, setAnimations, setPrimaryColor, setCustomColor,
    setFontSizeMultiplier, setHaptics
  } = useSettings();
  
  const [showFonts, setShowFonts] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [activePickerKey, setActivePickerKey] = useState<keyof ThemeColors | null>(null);

  const hexToHsl = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max === min) h = s = 0;
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  };

  return (
    <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
      <Header title={t('appearance')} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:40 }}>
        
        <SectionTitle label={t('dark_mode')} />
        <View style={{ marginHorizontal:20,backgroundColor:tColor.card,borderRadius:16,borderWidth:1,borderColor:tColor.border2,overflow:'hidden' }}>
          <View style={{ flexDirection:isRTL?'row-reverse':'row',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:tColor.border2 }}>
            <View style={{ width:32,height:32,borderRadius:8,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center',marginLeft:isRTL?12:0,marginRight:isRTL?0:12 }}>
              <Moon size={16} color={tColor.accent} />
            </View>
            <Txt variant="body" style={{ flex:1,textAlign:isRTL?'right':'left' }}>{t('dark_mode')}</Txt>
            <Toggle value={isDark} onToggle={toggleDark} />
          </View>
          <View style={{ flexDirection:isRTL?'row-reverse':'row',alignItems:'center',padding:16 }}>
            <View style={{ width:32,height:32,borderRadius:8,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center',marginLeft:isRTL?12:0,marginRight:isRTL?0:12 }}>
              <Sunset size={16} color={tColor.accent} />
            </View>
            <Txt variant="body" style={{ flex:1,textAlign:isRTL?'right':'left' }}>{t('auto_dark')}</Txt>
            <Toggle value={autoDark} onToggle={() => setAutoDark(!autoDark)} />
          </View>
        </View>

        <SectionTitle label={t('font_style')} />
        <TouchableOpacity onPress={() => setShowFonts(true)} activeOpacity={0.7}
          style={{ marginHorizontal:20,backgroundColor:tColor.card,borderRadius:16,borderWidth:1,borderColor:tColor.border2,padding:16,flexDirection:isRTL?'row-reverse':'row',alignItems:'center' }}>
          <View style={{ width:32,height:32,borderRadius:8,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center',marginLeft:isRTL?12:0,marginRight:isRTL?0:12 }}>
            <Type size={16} color={tColor.accent} />
          </View>
          <View style={{ flex:1 }}>
            <Txt variant="body" style={{ textAlign:isRTL?'right':'left' }}>{t('font_style')}</Txt>
            <Txt variant="bodyItalic" size={12} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{FONTS.find(f=>f.id===fontFamily)?.label??'Lora'}</Txt>
          </View>
          {isRTL ? <ChevronLeft size={16} color={tColor.text3} /> : <ChevronRight size={16} color={tColor.text3} />}
        </TouchableOpacity>

        <SectionTitle label={t('animations')} />
        <View style={{ marginHorizontal:20,backgroundColor:tColor.card,borderRadius:16,borderWidth:1,borderColor:tColor.border2,overflow:'hidden' }}>
          <View style={{ flexDirection:isRTL?'row-reverse':'row',alignItems:'center',padding:16,borderBottomWidth:1,borderBottomColor:tColor.border2 }}>
            <View style={{ width:32,height:32,borderRadius:8,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center',marginLeft:isRTL?12:0,marginRight:isRTL?0:12 }}>
              <Zap size={16} color={tColor.accent} />
            </View>
            <Txt variant="body" style={{ flex:1,textAlign:isRTL?'right':'left' }}>{t('animations')}</Txt>
            <Toggle value={animations} onToggle={() => setAnimations(!animations)} />
          </View>
          <View style={{ flexDirection:isRTL?'row-reverse':'row',alignItems:'center',padding:16 }}>
            <View style={{ width:32,height:32,borderRadius:8,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center',marginLeft:isRTL?12:0,marginRight:isRTL?0:12 }}>
              <Move size={16} color={tColor.accent} />
            </View>
            <Txt variant="body" style={{ flex:1,textAlign:isRTL?'right':'left' }}>{t('haptics' as any) || 'Haptic Feedback'}</Txt>
            <Toggle value={haptics} onToggle={() => setHaptics(!haptics)} />
          </View>
        </View>

        <SectionTitle label={t('font_size' as any) || 'Font Size'} />
        <View style={{ marginHorizontal:20,backgroundColor:tColor.card,borderRadius:16,borderWidth:1,borderColor:tColor.border2,padding:16 }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:12 }}>
            <Txt variant="mono" size={10} color="tertiary">A</Txt>
            <Txt variant="mono" size={14} color="tertiary">A</Txt>
          </View>
          <View style={{ flexDirection:'row', gap:4, height:40, alignItems:'center' }}>
            {[0.8, 0.9, 1.0, 1.1, 1.2].map(val => (
                <TouchableOpacity key={val} onPress={() => setFontSizeMultiplier(val)}
                  style={{ flex:1, height:4, backgroundColor: fontSizeMultiplier === val ? tColor.accent : tColor.bg2, borderRadius:2, position:'relative', alignItems:'center', justifyContent:'center' }}>
                  <View style={{ width:12, height:12, borderRadius:6, backgroundColor: fontSizeMultiplier === val ? tColor.accent : 'transparent', borderWidth: fontSizeMultiplier === val ? 0 : 1, borderColor: tColor.border }} />
                </TouchableOpacity>
            ))}
          </View>
          <Txt variant="bodyItalic" size={11} color="tertiary" style={{ marginTop:8, textAlign:'center' }}>
            {Math.round(fontSizeMultiplier * 100)}% {t('font_size_scale' as any) || 'scaling'}
          </Txt>
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
                    {active && <Check size={14} color={tColor.accent} />}
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
                    {primaryColor === c && <Check size={20} color="#fff" />}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity onPress={() => setShowCustom(true)}
                style={{ marginTop:24, paddingVertical:14, borderRadius:12, backgroundColor:tColor.bg2, borderWidth:1, borderColor:tColor.border, alignItems:'center', justifyContent:'center', flexDirection:isRTL?'row-reverse':'row', gap:8 }}>
                <Sliders size={16} color={tColor.accent} />
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
              {active && <View style={{ width:26,height:26,borderRadius:13,backgroundColor:tColor.accent,alignItems:'center',justifyContent:'center' }}><Check size={14} color="#fff" /></View>}
            </TouchableOpacity>
          );
        })}
      </BottomSheet>

      {/* Custom Color Palette Editor */}
      <BottomSheet visible={showCustom} onClose={() => { setShowCustom(false); setActivePickerKey(null); }} title={t('edit_custom_colors')} scrollable>
        {activePickerKey ? (
          <View>
            <TouchableOpacity onPress={() => setActivePickerKey(null)} style={{ flexDirection:isRTL?'row-reverse':'row', alignItems:'center', gap:8, marginBottom:16 }}>
              {isRTL ? <ChevronRight size={14} color={tColor.text3} /> : <ChevronLeft size={14} color={tColor.text3} />}
              <Txt variant="mono" size={11} color="tertiary">BACK TO LIST</Txt>
            </TouchableOpacity>
            
            <ColorPicker 
              label={`Edit ${activePickerKey}`}
              initialHue={hexToHsl(customPalette[activePickerKey!] || tColor[activePickerKey!]).h}
              initialSat={hexToHsl(customPalette[activePickerKey!] || tColor[activePickerKey!]).s}
              initialLum={hexToHsl(customPalette[activePickerKey!] || tColor[activePickerKey!]).l}
              onColorChange={(h, s, l) => {
                setCustomColor(activePickerKey!, hslToHex(h, s, l));
              }}
            />
            <Button label="Done" onPress={() => setActivePickerKey(null)} style={{ marginTop:20 }} />
          </View>
        ) : (
          <View>
            <Txt variant="bodyItalic" size={12} color="tertiary" style={{ marginBottom:20 }}>Tap a color to refine it using the visual picker.</Txt>
            {(Object.keys(tColor) as (keyof ThemeColors)[]).map((key) => {
              if (typeof tColor[key] !== 'string') return null;
              const label = t(`${key}_color_label` as TranslationKey);
              const colorValue = customPalette[key] || tColor[key];
              
              return (
                <TouchableOpacity key={key} onPress={() => setActivePickerKey(key)}
                  style={{ flexDirection:isRTL?'row-reverse':'row', alignItems:'center', gap:12, marginBottom:16, backgroundColor:tColor.bg2, padding:12, borderRadius:12, borderWidth:1, borderColor:tColor.border2 }}>
                  <View style={{ width:32, height:32, borderRadius:16, backgroundColor: colorValue, borderWidth:1, borderColor:tColor.border }} />
                  <View style={{ flex:1 }}>
                    <Txt variant="bodySemi" size={14} style={{ textAlign:isRTL?'right':'left' }}>{label}</Txt>
                    <Txt variant="mono" size={11} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{colorValue}</Txt>
                  </View>
                  {isRTL ? <ChevronLeft size={16} color={tColor.text3} /> : <ChevronRight size={16} color={tColor.text3} />}
                </TouchableOpacity>
              );
            })}
            <Button label="Close" onPress={() => setShowCustom(false)} style={{ marginTop:14 }} />
          </View>
        )}
      </BottomSheet>
    </SafeAreaView>
  );
}
