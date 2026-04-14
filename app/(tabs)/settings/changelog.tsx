import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react-native';
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
      <TouchableOpacity onPress={() => router.push('/(tabs)/settings' as any)} style={{ width:40,height:40,borderRadius:20,backgroundColor:tColor.bg2,alignItems:'center',justifyContent:'center' }}>
        {isRTL ? <ArrowRight size={20} color={tColor.text} /> : <ArrowLeft size={20} color={tColor.text} />}
      </TouchableOpacity>
      <Txt variant="display" size={20} style={{ marginLeft:isRTL?0:16, marginRight:isRTL?16:0 }}>{title}</Txt>
    </View>
  );
}

export default function ChangelogScreen() {
  const tColor = useTheme();
  const { isRTL } = useSettings();
  
  const contentDirection = isRTL ? 'row-reverse' : 'row';
  const alignText = isRTL ? 'right' : 'left';

  const v1_1_features = [
    "New Home screen: fast access to most app features directly",
    "Personalized themes, layouts, and adjustable font sizes",
    "Backup saving, database encryption, and secure keys",
    "New in-app viewers for PDF documents and Images",
    "Exporting notes in multiple different formats",
    "Beautiful new color palettes and themes",
    "Trash bin and Archive systems for data recovery",
    "New language added with full RTL support",
    "Multiple Student ID cards creation and selection",
    "Adding multiple files and documents at the same time",
    "Editing file names directly inside the app",
    "Vast set of new UI icons added",
    "Daily intentions and emotion/mood setting",
    "Haptic feedback and smooth UI animations added",
    "Fixed schedule dates logic & rendering",
    "Fixed Pomodoro timer background issues",
    "General bug fixes and performance improvements",
  ];

  const v1_0_features = [
    "Initial Release",
    "Organize courses into dedicated folders and files",
    "Write and format markdown academic notes",
    "Pomodoro timer system for intense focus",
    "Personalization engine with multiple themes and fonts",
    "100% offline privacy - keep your notes secure",
    "Academic schedule to track tasks and exams",
  ];

  return (
    <SafeAreaView style={{ flex:1,backgroundColor:tColor.bg }} edges={['top']}>
      <Header title="Changelog" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal:20, paddingBottom:60 }}>
        
        {/* Version 1.1.0 */}
        <View style={{ marginTop: 24, marginBottom: 8, flexDirection: contentDirection, alignItems: 'center', gap: 10 }}>
          <View style={{ width:40, height:40, borderRadius:12, backgroundColor: '#D1FAE5', alignItems:'center', justifyContent:'center' }}>
            <CheckCircle2 size={20} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
             <Txt variant="display" size={22} style={{ textAlign:alignText }}>v1.1.0</Txt>
             <Txt variant="mono" size={11} color="tertiary" style={{ textAlign:alignText }}>LATEST UPDATE</Txt>
          </View>
        </View>

        <View style={{ backgroundColor:tColor.card, borderRadius:20, borderWidth:1, borderColor:tColor.border2, paddingVertical: 16 }}>
          <Txt variant="bodySemi" size={15} color="secondary" style={{ marginBottom: 16, paddingHorizontal: 20, textAlign: alignText }}>
            What's new in v1.1.0
          </Txt>
          {v1_1_features.map((item, idx) => (
             <View key={idx} style={{ flexDirection: contentDirection, paddingHorizontal: 20, paddingVertical: 8, gap: 12 }}>
                <View style={{ width: 16, alignItems: 'center', paddingTop: 2 }}>
                  <CheckCircle2 size={16} color={tColor.accent} />
                </View>
                <Txt variant="body" size={14} style={{ flex: 1, textAlign: alignText, lineHeight: 22 }}>{item}</Txt>
             </View>
          ))}
        </View>

        {/* Version 1.0.0 */}
        <View style={{ marginTop: 32, marginBottom: 8, flexDirection: contentDirection, alignItems: 'center', gap: 10 }}>
          <View style={{ width:40, height:40, borderRadius:12, backgroundColor: tColor.bg3, alignItems:'center', justifyContent:'center' }}>
            <CheckCircle2 size={20} color={tColor.text3} />
          </View>
          <View style={{ flex: 1 }}>
             <Txt variant="display" size={20} color="secondary" style={{ textAlign:alignText }}>v1.0.0</Txt>
             <Txt variant="mono" size={10} color="tertiary" style={{ textAlign:alignText }}>INITIAL RELEASE</Txt>
          </View>
        </View>

        <View style={{ backgroundColor:tColor.card, opacity: 0.8, borderRadius:20, borderWidth:1, borderColor:tColor.border2, paddingVertical: 16 }}>
          {v1_0_features.map((item, idx) => (
             <View key={idx} style={{ flexDirection: contentDirection, paddingHorizontal: 20, paddingVertical: 8, gap: 12 }}>
                <View style={{ width: 16, alignItems: 'center', paddingTop: 2 }}>
                   <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: tColor.text3, marginTop: 4 }} />
                </View>
                <Txt variant="body" size={14} color="secondary" style={{ flex: 1, textAlign: alignText, lineHeight: 22 }}>{item}</Txt>
             </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
