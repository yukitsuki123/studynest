import '../utils/crypto-polyfill';
import '../global.css';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Lora_600SemiBold, Lora_600SemiBold_Italic } from '@expo-google-fonts/lora';
import { CrimsonPro_400Regular, CrimsonPro_400Regular_Italic, CrimsonPro_600SemiBold } from '@expo-google-fonts/crimson-pro';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { Spectral_400Regular, Spectral_400Regular_Italic, Spectral_600SemiBold, Spectral_600SemiBold_Italic } from '@expo-google-fonts/spectral';
import { Merriweather_400Regular, Merriweather_400Regular_Italic, Merriweather_700Bold, Merriweather_700Bold_Italic } from '@expo-google-fonts/merriweather';
import { EBGaramond_400Regular, EBGaramond_400Regular_Italic, EBGaramond_600SemiBold, EBGaramond_600SemiBold_Italic } from '@expo-google-fonts/eb-garamond';
import { Cormorant_400Regular, Cormorant_400Regular_Italic, Cormorant_600SemiBold, Cormorant_600SemiBold_Italic } from '@expo-google-fonts/cormorant';
import { initDB, initNewTables } from '../utils/db';
import { AppProvider, useApp } from '../context/AppContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { StarryBackground } from '../components/ui/StarryBackground';

function AppShell() {
  const { colors, loadSettings, isDark } = useSettings();
  const { loadAll, state, updateStreak } = useApp();
  const [dbReady, setDbReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Lora_600SemiBold, Lora_600SemiBold_Italic,
    CrimsonPro_400Regular, CrimsonPro_400Regular_Italic, CrimsonPro_600SemiBold,
    JetBrainsMono_400Regular, JetBrainsMono_500Medium,
    Spectral_400Regular, Spectral_400Regular_Italic, Spectral_600SemiBold, Spectral_600SemiBold_Italic,
    Merriweather_400Regular, Merriweather_400Regular_Italic, Merriweather_700Bold, Merriweather_700Bold_Italic,
    EBGaramond_400Regular, EBGaramond_400Regular_Italic, EBGaramond_600SemiBold, EBGaramond_600SemiBold_Italic,
    Cormorant_400Regular, Cormorant_400Regular_Italic, Cormorant_600SemiBold, Cormorant_600SemiBold_Italic,
  });

  useEffect(() => {
    (async () => {
      await initDB();
      initNewTables();
      loadSettings();
      loadAll();
      setDbReady(true);
      setTimeout(() => updateStreak(), 500);
    })();
  }, []);

  const allReady = fontsLoaded && dbReady && state.ready;

  if (!allReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {isDark && <StarryBackground />}
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course/[id]/index" />
        <Stack.Screen name="note/[noteId]"   options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="set/[setId]"      options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="pomodoro"         options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="search"           options={{ animation: 'fade' }} />
        <Stack.Screen name="report"           options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="idcard"           options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="trash"            options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="backup"           options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="imageviewer"      options={{ animation: 'slide_from_bottom', presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="pdfviewer"        options={{ animation: 'slide_from_bottom', presentation: 'modal', headerShown: false }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AppProvider>
          <AppShell />
        </AppProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
