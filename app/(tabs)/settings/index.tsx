import { 
  Palette, LayoutDashboard, Languages, ShieldCheck, 
  Info, ChevronRight, ChevronLeft, HardDrive, Trash2, 
  FileText, Image as ImageIcon, Archive, RefreshCw, Lock, AlertCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../../../components/ui/Text';
import { useApp } from '../../../context/AppContext';
import { useSettings } from '../../../context/SettingsContext';
import { useTheme } from '../../../hooks/useTheme';

/**
 * Section title for major settings categories
 */
function SectionTitle({ label }: { label: string }) {
  const tColor = useTheme();
  const { isRTL } = useSettings();
  return (
    <Txt 
      variant="mono" 
      size={10} 
      color="tertiary" 
      style={{ 
        textTransform:'uppercase',
        letterSpacing:1.5,
        marginBottom:12,
        marginTop:28,
        textAlign:isRTL?'right':'left' 
      }}
    >
      {label}
    </Txt>
  );
}

/**
 * Small status badge used on the right side of menu rows
 */
function Badge({ label }: { label: string }) {
  const tColor = useTheme();
  return (
    <View style={{ backgroundColor: tColor.bg2, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginRight: 8 }}>
      <Txt variant="mono" size={10} color="secondary">{label}</Txt>
    </View>
  );
}

/**
 * Subtle internal sub-divider used to group items within a single card
 */
function SubDivider({ label }: { label: string }) {
  const tColor = useTheme();
  const { isRTL } = useSettings();
  return (
    <View style={{ height: 32, justifyContent: 'center', backgroundColor: tColor.bg3 + '44', paddingHorizontal: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: tColor.border2 }}>
      <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.5, textAlign: isRTL ? 'right' : 'left' }}>
        {label}
      </Txt>
    </View>
  );
}

/**
 * Primary menu row component with custom icon backgrounds and status badges
 */
function MenuRow({ icon, label, description, onPress, last, value, iconBg, iconColor }: {
  icon: React.ElementType; 
  label: string; 
  description?: string;
  onPress: () => void; 
  last?: boolean; 
  value?: string;
  iconBg: string;
  iconColor: string;
}) {
  const tColor = useTheme();
  const { isRTL } = useSettings();
  
  // RTL logic: Flip flexDirection using isRTL from context
  const contentDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={{ 
        flexDirection: contentDirection,
        alignItems:'center',
        paddingHorizontal:16,
        paddingVertical:14,
        borderBottomWidth:last?0:1,
        borderBottomColor:tColor.border2,
        backgroundColor:tColor.card 
      }}>
      <View style={{ 
        width:40,
        height:40,
        borderRadius:12,
        backgroundColor: iconBg,
        alignItems:'center',
        justifyContent:'center',
        marginLeft:isRTL?14:0,
        marginRight:isRTL?0:14 
      }}>
        {React.createElement(icon, { size: 20, color: iconColor })}
      </View>
      
      <View style={{ flex:1 }}>
        <Txt variant="bodySemi" size={14} style={{ textAlign:isRTL?'right':'left' }}>{label}</Txt>
        {description && (
          <Txt variant="bodyItalic" size={12} color="tertiary" numberOfLines={1} style={{ textAlign:isRTL?'right':'left' }}>
            {description}
          </Txt>
        )}
      </View>

      <View style={{ flexDirection: contentDirection, alignItems: 'center' }}>
        {value && <Badge label={value} />}
        {isRTL ? <ChevronLeft size={16} color={tColor.text3} /> : <ChevronRight size={16} color={tColor.text3} />}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsMain() {
  const tColor = useTheme();
  const router = useRouter();
  const { state } = useApp();
  const { theme, themeMode, language, t, isRTL } = useSettings();
  const profile = state.profile;

  // Profile card documents the emoji/color fallback logic:
  // Uses profile data if available, otherwise defaults to a graduation cap and the accent color.
  const avatarEmoji = profile?.avatarEmoji ?? '🎓';
  const avatarBg = profile?.avatarBg ?? tColor.accent;

  return (
    <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:60 }}>
        
        <View style={{ paddingHorizontal:24,paddingTop:16,paddingBottom:24 }}>
          <Txt variant="display" size={32} style={{ letterSpacing:-1, textAlign:isRTL?'right':'left' }}>{t('settings')}</Txt>
        </View>

        {/* Profile Card -> Route: /settings/profile */}
        <TouchableOpacity onPress={() => router.push('/settings/profile' as any)} activeOpacity={0.8}
          style={{ 
            marginHorizontal:20,
            marginBottom:28,
            padding:20,
            backgroundColor:tColor.card,
            borderRadius:20,
            borderWidth:1,
            borderColor:tColor.border2,
            flexDirection:isRTL?'row-reverse':'row',
            alignItems:'center',
            gap:18 
          }}>
          <View style={{ 
            width:64,
            height:64,
            borderRadius:32,
            backgroundColor: avatarBg,
            alignItems:'center',
            justifyContent:'center',
            shadowColor: avatarBg,
            shadowOffset:{width:0,height:4},
            shadowOpacity:0.3,
            shadowRadius:8,
            elevation:5 
          }}>
            <Txt style={{ fontSize:28 }}>{avatarEmoji}</Txt>
          </View>
          <View style={{ flex:1 }}>
            <Txt variant="display" size={20} style={{ textAlign:isRTL?'right':'left' }}>{profile?.name??'Student'}</Txt>
            <Txt variant="bodyItalic" size={13} color="tertiary" numberOfLines={1} style={{ textAlign:isRTL?'right':'left' }}>{profile?.email || t('profile_desc')}</Txt>
          </View>
          {isRTL ? <ChevronLeft size={20} color={tColor.text3} /> : <ChevronRight size={20} color={tColor.text3} />}
        </TouchableOpacity>

        <View style={{ paddingHorizontal:20 }}>
          
          {/* PERSONALIZATION SECTION */}
          <SectionTitle label={t('personalization')} />
          <View style={{ borderRadius:20,overflow:'hidden',borderWidth:1,borderColor:tColor.border2 }}>
            <MenuRow 
              icon={Palette} 
              iconBg="#EDE9FE" // Light Purple
              iconColor="#7C3AED" 
              label={t('themes')} 
              description={t('appearance_desc')}
              value={themeMode === 'custom' ? t('custom') : t(theme as any)}
              onPress={() => router.push('/settings/appearance' as any)} 
            />
            <MenuRow 
              icon={LayoutDashboard} 
              iconBg="#D1FAE5" // Light Teal
              iconColor="#10B981"
              label={t('layouts')} 
              description={t('dashboard_desc')}
              onPress={() => router.push('/settings/dashboard' as any)} 
              last 
            />
          </View>

          {/* STORAGE & DATA SECTION */}
          <SectionTitle label={t('storage_data_backups')} />
          <View style={{ borderRadius:20,overflow:'hidden',borderWidth:1,borderColor:tColor.border2 }}>
            <MenuRow 
              icon={Archive} 
              iconBg="#FEF3C7" // Light Amber
              iconColor="#D97706"
              label={t('archive')} 
              description={t('archive_desc')}
              onPress={() => router.push('/archive' as any)} 
            />
            <MenuRow 
              icon={Trash2} 
              iconBg="#FEE2E2" // Light Coral
              iconColor="#EF4444"
              label={t('trash_bin')} 
              description={t('trash_desc')}
              onPress={() => router.push('/trash' as any)} 
            />
            
            {/* Sub-divider pattern for intentional grouping inside the card */}
            <SubDivider label="Backups" />
            
            <MenuRow 
              icon={RefreshCw} 
              iconBg="#DBEAFE" // Light Blue
              iconColor="#3B82F6"
              label={t('backup_restore')} 
              description={t('backup_restore_desc')}
              onPress={() => router.push('/backup' as any)} 
            />
            <MenuRow 
              icon={ShieldCheck} 
              iconBg="#D1FAE5" // Light Mint
              iconColor="#059669"
              label={t('data_privacy')} 
              description={t('data_privacy_desc')}
              onPress={() => router.push('/settings/data' as any)} 
              last
            />
          </View>

          {/* FILES SECTION */}
          <SectionTitle label="Files" />
          <View style={{ borderRadius:20,overflow:'hidden',borderWidth:1,borderColor:tColor.border2 }}>
            <MenuRow 
              icon={FileText} 
              iconBg="#FCE7F3" // Light Pink
              iconColor="#DB2777"
              label="File viewer" 
              description={t('file_viewer_desc')}
              onPress={() => router.push('/settings/files' as any)} 
              last
            />
          </View>

          {/* LANGUAGE SECTION */}
          <SectionTitle label="Language" />
          <View style={{ borderRadius:20,overflow:'hidden',borderWidth:1,borderColor:tColor.border2 }}>
            <MenuRow 
              icon={Languages} 
              iconBg="#FEF3C7" // Light Gold
              iconColor="#B45309"
              label="App language" 
              description={t('app_language_desc')}
              value={language === 'ar' ? 'العربية' : 'English'}
              onPress={() => router.push('/settings/language' as any)} 
              last
            />
          </View>

          {/* SUPPORT SECTION */}
          <SectionTitle label={t('support')} />
          <View style={{ borderRadius:20,overflow:'hidden',borderWidth:1,borderColor:tColor.border2 }}>
            <MenuRow 
              icon={AlertCircle} 
              iconBg="#F3F4F6" // Light Gray
              iconColor="#4B5563"
              label={t('about')} 
              description={t('about_desc')}
              value="v1.0.0"
              onPress={() => router.push('/settings/about' as any)} 
              last 
            />
          </View>

          {/* Footer watermark footer to reduce visual clutter */}
          <View style={{ marginTop:48, marginBottom: 20, alignItems:'center' }}>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:4 }}>STUDYNEST · V1</Txt>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
