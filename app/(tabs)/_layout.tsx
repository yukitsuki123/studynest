import { Home, FolderOpen, Calendar, Settings } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';



export default function TabLayout() {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  // On Android, insets.bottom accounts for the gesture nav bar / 3-button nav bar
  // We add it to the tab bar height so the bar sits above the system UI
  const tabBarHeight = 66 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.card,
          borderTopColor: t.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
          height: tabBarHeight,
          // Push content up above the system nav bar
          paddingBottom: insets.bottom + 8,
          paddingTop: 10,
        },
        tabBarActiveTintColor:   t.accent,
        tabBarInactiveTintColor: t.text3,
        tabBarLabelStyle: {
          fontFamily: 'CrimsonPro_400Regular',
          fontSize: 12,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Home',     tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="courses"  options={{ title: 'Courses',  tabBarIcon: ({ color, size }) => <FolderOpen color={color} size={size} /> }} />
      <Tabs.Screen name="schedule" options={{ title: 'Schedule', tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} /> }} />
      <Tabs.Screen name="settings/index" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
      <Tabs.Screen name="settings/profile" options={{ href: null }} />
      <Tabs.Screen name="settings/appearance" options={{ href: null }} />
      <Tabs.Screen name="settings/dashboard" options={{ href: null }} />
      <Tabs.Screen name="settings/files" options={{ href: null }} />
      <Tabs.Screen name="settings/language" options={{ href: null }} />
      <Tabs.Screen name="settings/data" options={{ href: null }} />
      <Tabs.Screen name="settings/about" options={{ href: null }} />
    </Tabs>
  );
}
