// app\(tabs)\_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index"   options={{ tabBarLabel: '🎧 Mood Tunes'    }} />
      <Tabs.Screen name="history" options={{ tabBarLabel: '🕘 Listening History' }} />
      <Tabs.Screen name="folders" options={{ tabBarLabel: '📁 Folders' }} />
    </Tabs>
  );
}
