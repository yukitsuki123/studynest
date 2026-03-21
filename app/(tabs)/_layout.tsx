import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';

function TabIcon({ name, color, size }: { name: keyof typeof Feather.glyphMap; color: string; size: number }) {
  return <Feather name={name} size={size} color={color} />;
}

export default function TabLayout() {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  // On Android, insets.bottom accounts for the gesture nav bar / 3-button nav bar
  // We add it to the tab bar height so the bar sits above the system UI
  const tabBarHeight = 54 + insets.bottom;

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
          paddingBottom: insets.bottom + 6,
          paddingTop: 8,
        },
        tabBarActiveTintColor:   t.accent,
        tabBarInactiveTintColor: t.text3,
        tabBarLabelStyle: {
          fontFamily: 'CrimsonPro_400Regular',
          fontSize: 11,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen name="index"    options={{ title: 'Home',     tabBarIcon: ({ color, size }) => <TabIcon name="home"     color={color} size={size} /> }} />
      <Tabs.Screen name="courses"  options={{ title: 'Courses',  tabBarIcon: ({ color, size }) => <TabIcon name="folder"   color={color} size={size} /> }} />
      <Tabs.Screen name="schedule" options={{ title: 'Schedule', tabBarIcon: ({ color, size }) => <TabIcon name="calendar" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <TabIcon name="settings" color={color} size={size} /> }} />
    </Tabs>
  );
}
