import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';

const tint = '#A07850';
const inactive = '#C4B5A4';

function TabBarIcon({ name, color }: { name: keyof typeof Ionicons.glyphMap; color: string }) {
  return <Ionicons size={24} name={name} color={color} style={{ marginBottom: -2 }} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: inactive,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          backgroundColor: '#FAF5EF',
          borderTopColor: 'rgba(180,160,140,0.25)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 6,
          shadowColor: '#3D2B1F',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
        headerStyle: {
          backgroundColor: '#FAF5EF',
          shadowColor: '#3D2B1F',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(180,160,140,0.2)',
        },
        headerTintColor: '#3D2B1F',
        headerTitleStyle: {
          fontWeight: '700',
          letterSpacing: 0.5,
          color: '#3D2B1F',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mapa',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
        }}
      />
      <Tabs.Screen
        name="destacados"
        options={{
          title: 'Destacadas',
          tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="comunidad"
        options={{
          title: 'Comunidad',
          tabBarIcon: ({ color }) => <TabBarIcon name="chatbubbles" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cuenta"
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
        }}
      />
    </Tabs>
  );
}
