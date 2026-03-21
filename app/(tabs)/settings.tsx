import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Toggle } from '../../components/ui/Toggle';
import { Txt } from '../../components/ui/Text';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import { THEME_META } from '../../constants/themes';
import { ThemeName, Language } from '../../constants/types';
import { useTheme } from '../../hooks/useTheme';
import { exportBackupJSON, exportBackupCSV } from '../../utils/storage';

const FONTS = [
  { id:'lora',        label:'Lora',        description:'Classic warm serif',       preview:'Lora_600SemiBold' },
  { id:'crimson',     label:'Crimson Pro',  description:'Research paper style',     preview:'CrimsonPro_600SemiBold' },
  { id:'spectral',    label:'Spectral',     description:'Elegant editorial serif',  preview:'Spectral_600SemiBold' },
  { id:'merriweather',label:'Merriweather', description:'Strong & highly readable', preview:'Merriweather_700Bold' },
  { id:'eb_garamond', label:'EB Garamond',  description:'Historic academic serif',  preview:'EBGaramond_600SemiBold' },
  { id:'cormorant',   label:'Cormorant',    description:'Refined display serif',    preview:'Cormorant_600SemiBold' },
] as const;

const ABOUT_TEXT = `StudyNest is a private academic organizer built for students who take their studies seriously.

Organize your courses into smart folders. Each course holds your files, lecture notes, to-do lists, study sets, resource links, and grades — all in one place.

Write notes with markdown support, track deadlines on a built-in calendar, prep for exams with flashcard quiz mode, and stay focused with the Pomodoro timer.

Your data lives entirely on your device — no cloud, no accounts, no ads. Export a backup anytime.

Built with care for academic excellence.`;

function SectionTitle({ label }: { label: string }) {
  const t = useTheme();
  return <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.2,marginBottom:8,marginTop:4 }}>{label}</Txt>;
}

function SettingsRow({ icon, label, value, onPress, right, last }: {
  icon: keyof typeof Feather.glyphMap; label: string; value?: string;
  onPress?: () => void; right?: React.ReactNode; last?: boolean;
}) {
  const t = useTheme();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}
      style={{ flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:16,paddingVertical:14,
        borderBottomWidth:last?0:1,borderBottomColor:t.border2 }}>
      <View style={{ width:32,height:32,borderRadius:9,backgroundColor:t.bg2,alignItems:'center',justifyContent:'center' }}>
        <Feather name={icon} size={15} color={t.accent} />
      </View>
      <Txt variant="body" size={14} style={{ flex:1 }}>{label}</Txt>
      {value && <Txt variant="bodyItalic" size={12} color="tertiary">{value}</Txt>}
      {right}
      {onPress && !right && <Feather name="chevron-right" size={16} color={t.text3} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const t = useTheme();
  const router = useRouter();
  const { theme, isDark, autoDark, fontFamily, language, setTheme, toggleDark, setDark, setAutoDark, setFontFamily, setLanguage } = useSettings();
  const { state } = useApp();
  const profile = state.profile;
  const [showFonts, setShowFonts] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <SafeAreaView style={{ flex:1,backgroundColor:t.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:40 }}>
        <View style={{ paddingHorizontal:20,paddingTop:16,paddingBottom:20 }}>
          <Txt variant="display" size={26} style={{ letterSpacing:-0.5 }}>Settings</Txt>
        </View>

        {/* Profile / ID card */}
        <TouchableOpacity onPress={() => router.push('/idcard' as any)} style={{ alignItems:'center',paddingBottom:24 }}>
          <View style={{ width:76,height:76,borderRadius:38,backgroundColor:profile?.avatarBg??t.accent,alignItems:'center',justifyContent:'center',marginBottom:10,shadowColor:t.accent,shadowOffset:{width:0,height:4},shadowOpacity:0.3,shadowRadius:8,elevation:4 }}>
            <Txt style={{ fontSize:32 }}>{profile?.avatarEmoji??'🎓'}</Txt>
          </View>
          <Txt variant="display" size={18}>{profile?.name??'Student'}</Txt>
          <Txt variant="bodyItalic" size={12} color="tertiary">{profile?.email || 'Tap to edit profile'}</Txt>
          <View style={{ marginTop:6,flexDirection:'row',alignItems:'center',gap:4,backgroundColor:t.bg2,paddingHorizontal:10,paddingVertical:4,borderRadius:20,borderWidth:1,borderColor:t.border }}>
            <Feather name="credit-card" size={12} color={t.accent} />
            <Txt variant="mono" size={10} color="accent">View ID Card</Txt>
          </View>
        </TouchableOpacity>

        <View style={{ paddingHorizontal:20,gap:20 }}>

          {/* Appearance */}
          <View>
            <SectionTitle label="Appearance" />
            <View style={{ backgroundColor:t.card,borderRadius:14,borderWidth:1,borderColor:t.border2,overflow:'hidden' }}>
              <SettingsRow icon="moon" label="Dark Mode" right={<Toggle value={isDark} onToggle={toggleDark} />} />
              <SettingsRow icon="sunset" label="Auto Dark (System)" right={<Toggle value={autoDark} onToggle={() => setAutoDark(!autoDark)} />} />
              <SettingsRow icon="type" label="Font Style" value={FONTS.find(f=>f.id===fontFamily)?.label??'Lora'} onPress={() => setShowFonts(true)} last />
            </View>
          </View>

          {/* Theme grid */}
          <View>
            <SectionTitle label="Theme" />
            <View style={{ flexDirection:'row',flexWrap:'wrap',gap:10 }}>
              {(Object.keys(THEME_META) as ThemeName[]).map(key => {
                const meta = THEME_META[key];
                const active = theme === key;
                return (
                  <TouchableOpacity key={key} onPress={() => setTheme(key)}
                    style={{ width:'47%',flexDirection:'row',alignItems:'center',gap:10,paddingVertical:12,paddingHorizontal:14,borderRadius:14,borderWidth:active?2:1,borderColor:active?t.accent:t.border2,backgroundColor:t.card }}>
                    <View style={{ width:22,height:22,borderRadius:11,overflow:'hidden',borderWidth:1,borderColor:t.border }}>
                      <View style={{ position:'absolute',left:0,top:0,bottom:0,right:'50%',backgroundColor:meta.swatchLight }} />
                      <View style={{ position:'absolute',right:0,top:0,bottom:0,left:'50%',backgroundColor:meta.swatchDark }} />
                    </View>
                    <View style={{ flex:1 }}>
                      <Txt variant="bodySemi" size={12}>{meta.label}</Txt>
                      <Txt variant="bodyItalic" size={9} color="tertiary">{meta.description}</Txt>
                    </View>
                    {active && <Feather name="check" size={13} color={t.accent} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Language */}
          <View>
            <SectionTitle label="Language" />
            <View style={{ flexDirection:'row',gap:10 }}>
              {([['en','English','LTR'],['ar','العربية','RTL']] as const).map(([code,label,dir]) => (
                <TouchableOpacity key={code} onPress={() => setLanguage(code as Language)}
                  style={{ flex:1,paddingVertical:12,paddingHorizontal:14,borderRadius:12,borderWidth:language===code?2:1,borderColor:language===code?t.accent:t.border2,backgroundColor:t.card,alignItems:'center' }}>
                  <Txt variant="bodySemi" size={14}>{label}</Txt>
                  <Txt variant="mono" size={9} color="tertiary">{dir}</Txt>
                  {language===code && <Feather name="check" size={12} color={t.accent} style={{ marginTop:4 }} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Data */}
          <View>
            <SectionTitle label="Data & Backup" />
            <View style={{ backgroundColor:t.card,borderRadius:14,borderWidth:1,borderColor:t.border2,overflow:'hidden' }}>
              <SettingsRow icon="upload"    label="Export as JSON" value="Coming soon" />
              <SettingsRow icon="file-text" label="Export as CSV"  value="Coming soon" />
              <SettingsRow icon="download"  label="Restore Backup" value="Coming soon" last />
            </View>
          </View>

          {/* About */}
          <View>
            <SectionTitle label="About" />
            <View style={{ backgroundColor:t.card,borderRadius:14,borderWidth:1,borderColor:t.border2,overflow:'hidden' }}>
              <SettingsRow icon="info"      label="Version"          value="1.0.0" />
              <SettingsRow icon="book-open" label="About StudyNest"  onPress={() => setShowAbout(true)} last />
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Font picker */}
      <BottomSheet visible={showFonts} onClose={() => setShowFonts(false)} title="Choose Font" scrollable>
        {FONTS.map((f, i) => {
          const active = fontFamily === f.id;
          return (
            <TouchableOpacity key={f.id} onPress={() => { setFontFamily(f.id as any); setShowFonts(false); }}
              style={{ flexDirection:'row',alignItems:'center',gap:14,paddingVertical:14,borderBottomWidth:i<FONTS.length-1?1:0,borderBottomColor:t.border2 }}>
              <View style={{ width:56,height:46,borderRadius:10,backgroundColor:active?t.accent+'22':t.bg2,borderWidth:1,borderColor:active?t.accent:t.border2,alignItems:'center',justifyContent:'center' }}>
                <Txt size={20} style={{ fontFamily:f.preview }}>Aa</Txt>
              </View>
              <View style={{ flex:1 }}>
                <Txt variant="bodySemi" size={15}>{f.label}</Txt>
                <Txt variant="bodyItalic" size={12} color="tertiary">{f.description}</Txt>
              </View>
              {active && <View style={{ width:24,height:24,borderRadius:12,backgroundColor:t.accent,alignItems:'center',justifyContent:'center' }}><Feather name="check" size={14} color="#fff" /></View>}
            </TouchableOpacity>
          );
        })}
      </BottomSheet>

      {/* About sheet */}
      <BottomSheet visible={showAbout} onClose={() => setShowAbout(false)} title="About StudyNest" scrollable>
        <View style={{ marginBottom:16,alignItems:'center' }}>
          <Txt style={{ fontSize:48,marginBottom:8 }}>📚</Txt>
          <Txt variant="mono" size={11} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1 }}>StudyNest v1.0.0</Txt>
        </View>
        {ABOUT_TEXT.split('\n\n').map((para, i) => (
          <Txt key={i} variant="body" size={14} color="secondary" style={{ lineHeight:24,marginBottom:14 }}>{para}</Txt>
        ))}
        <View style={{ backgroundColor:t.bg2,borderRadius:10,padding:14,marginTop:4 }}>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1,marginBottom:6 }}>Your data stays on your device</Txt>
          <Txt variant="bodyItalic" size={13} color="secondary">No internet required · No account needed · No ads</Txt>
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}
