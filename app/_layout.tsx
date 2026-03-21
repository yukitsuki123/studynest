import { CrimsonPro_400Regular, CrimsonPro_400Regular_Italic, CrimsonPro_600SemiBold } from '@expo-google-fonts/crimson-pro';
import { EBGaramond_400Regular, EBGaramond_400Regular_Italic, EBGaramond_600SemiBold, EBGaramond_600SemiBold_Italic } from '@expo-google-fonts/eb-garamond';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { Lora_600SemiBold, Lora_600SemiBold_Italic } from '@expo-google-fonts/lora';
// import { Merriweather_400Regular, Merriweather_400Regular_Italic, Merriweather_700Bold, Merriweather_700Bold_Italic } from '@expo-google-fonts/merriweather';
import { Spectral_400Regular, Spectral_400Regular_Italic, Spectral_600SemiBold, Spectral_600SemiBold_Italic } from '@expo-google-fonts/spectral';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
// import { Cormorant_400Regular, Cormorant_400Regular_Italic, Cormorant_600SemiBold, Cormorant_600SemiBold_Italic } from '@expo-google-fonts/cormorant';
import { AppProvider, useApp } from '../context/AppContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { initDB } from '../utils/db';

function AppShell() {
  const { colors, loadSettings } = useSettings();
  const { loadAll, state } = useApp();
  const [dbReady, setDbReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Lora_600SemiBold, Lora_600SemiBold_Italic,
    CrimsonPro_400Regular, CrimsonPro_400Regular_Italic, CrimsonPro_600SemiBold,
    JetBrainsMono_400Regular, JetBrainsMono_500Medium,
    Spectral_400Regular, Spectral_400Regular_Italic, Spectral_600SemiBold, Spectral_600SemiBold_Italic,
    // Merriweather_400Regular, Merriweather_400Regular_Italic, Merriweather_700Bold, Merriweather_700Bold_Italic,
    EBGaramond_400Regular, EBGaramond_400Regular_Italic, EBGaramond_600SemiBold, EBGaramond_600SemiBold_Italic,
    // Cormorant_400Regular, Cormorant_400Regular_Italic, Cormorant_600SemiBold, Cormorant_600SemiBold_Italic,
  });

  useEffect(() => {
    (async () => {
      await initDB();
      loadSettings();
      loadAll();
      setDbReady(true);
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
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course/[id]/index" />
        <Stack.Screen name="note/[noteId]"   options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="set/[setId]"      options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="pomodoro"         options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="search"           options={{ animation: 'fade' }} />
        <Stack.Screen name="report"           options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="idcard"           options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
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
