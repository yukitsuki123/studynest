import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, HardDrive, Trash2, Lock } from 'lucide-react-native';
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

function SettingsRow({ icon: Icon, label, description, onPress, last }: {
  icon: React.ElementType; label: string; description?: string;
  onPress: () => void; last?: boolean;
}) {
  const tColor = useTheme();
  const { isRTL } = useSettings();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={{ flexDirection:isRTL?'row-reverse':'row',alignItems:'center',gap:14,paddingHorizontal:16,paddingVertical:16,
        borderBottomWidth:last?0:1,borderBottomColor:tColor.border2 }}>
      <View style={{ width:36,height:36,borderRadius:10,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center',marginLeft:isRTL?14:0,marginRight:isRTL?0:14 }}>
        <Icon size={18} color={tColor.accent} />
      </View>
      <View style={{ flex:1 }}>
        <Txt variant="bodySemi" size={14} style={{ textAlign:isRTL?'right':'left' }}>{label}</Txt>
        {description && <Txt variant="bodyItalic" size={12} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{description}</Txt>}
      </View>
      {isRTL ? <ChevronLeft size={16} color={tColor.text3} /> : <ChevronRight size={16} color={tColor.text3} />}
    </TouchableOpacity>
  );
}

export default function DataSettings() {
  const tColor = useTheme();
  const { t, isRTL } = useSettings();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
      <Header title={t('data_privacy')} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:20, paddingBottom:40 }}>
        <Txt variant="bodyItalic" size={13} color="tertiary" style={{ marginBottom:20, marginTop:8, textAlign:isRTL?'right':'left' }}>
          {t('data_privacy_desc')}
        </Txt>

        <View style={{ backgroundColor:tColor.card, borderRadius:16, borderWidth:1, borderColor:tColor.border2, overflow:'hidden' }}>
          <SettingsRow 
            icon={HardDrive}
            label={t('backup_restore')} 
            description={t('backup_restore_desc')}
            onPress={() => router.push('/backup' as any)} 
          />
          <SettingsRow 
            icon={Trash2}
            label={t('storage_management')} 
            description={t('storage_management_desc')}
            onPress={() => router.push('/trash' as any)} 
            last 
          />
        </View>

        <View style={{ marginTop:24, padding:18, backgroundColor:tColor.card, borderRadius:16, borderLeftWidth:isRTL?0:4, borderRightWidth:isRTL?4:0, borderLeftColor:tColor.accent, borderRightColor:tColor.accent }}>
          <Txt variant="mono" size={10} color="tertiary" style={{ textTransform:'uppercase',letterSpacing:1.5, marginBottom:6, textAlign:isRTL?'right':'left' }}>{t('privacy_policy')}</Txt>
          <Txt variant="body" size={13} color="secondary" style={{ lineHeight:20, textAlign:isRTL?'right':'left' }}>
            {t('privacy_policy_desc')}
          </Txt>
        </View>

        <View style={{ marginTop:24 }}>
          <SettingsRow 
            icon={Lock}
            label={t('encryption')} 
            description={t('encryption_active' as any) || 'AES-256 Encryption: Active and Secure'}
            onPress={() => {}} 
            last
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
