import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, View } from 'react-native';

import { useDestacados } from '@/hooks/useDestacados';
import { useAuthStore } from '@/store/authStore';

export default function DestacadosScreen() {
  const user = useAuthStore((s) => s.user);
  const { rows, loading, error } = useDestacados(!!user);
  const [q, setQ] = useState('');

  const filtered = rows.filter((r) => r.name.toLowerCase().includes(q.trim().toLowerCase()));

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1c1410] px-6">
        <Ionicons name="trophy-outline" size={48} color="#8a7a6a" />
        <Text className="mt-4 text-center text-lg font-semibold text-[#f5e6d3]">Ranking del mes</Text>
        <Text className="mt-2 text-center text-[#a89888]">Inicia sesión para ver las cafeterías con más check-ins en los últimos 30 días.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1c1410] px-4 pt-4">
      <Text className="text-2xl font-semibold text-[#f5e6d3]">Destacadas del mes</Text>
      <Text className="mt-1 text-sm text-[#8a7a6a]">Según check-ins de los últimos 30 días</Text>

      <View className="mt-4 flex-row items-center gap-2 rounded-2xl border border-white/10 bg-[#2a1f18] px-4 py-3">
        <Ionicons name="search" size={20} color="#8a7a6a" />
        <TextInput
          className="flex-1 text-base text-[#f5e6d3]"
          placeholder="Buscar cafetería…"
          placeholderTextColor="#6b5d52"
          value={q}
          onChangeText={setQ}
        />
      </View>

      {loading ? (
        <ActivityIndicator className="mt-10" color="#c4836c" />
      ) : error ? (
        <Text className="mt-6 text-center text-red-300">{error}</Text>
      ) : (
        <ScrollView className="mt-4" contentContainerStyle={{ paddingBottom: 32 }}>
          {filtered.map((row, i) => (
            <View
              key={row.id}
              className="mb-3 flex-row items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-2xl bg-[#c4836c]/25">
                <Text className="text-lg font-bold text-[#e8c4b0]">#{i + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-[#f5e6d3]">{row.name}</Text>
                {row.address ? <Text className="text-sm text-[#8a7a6a]">{row.address}</Text> : null}
                <View className="mt-2 flex-row items-center gap-1">
                  <Ionicons name="flame" size={14} color="#fb923c" />
                  <Text className="text-xs font-medium text-[#c4836c]">
                    {row.check_ins_ultimos_30_dias} check-ins (30 días)
                  </Text>
                </View>
              </View>
            </View>
          ))}
          {filtered.length === 0 ? (
            <Text className="py-10 text-center text-[#8a7a6a]">Sin resultados o sin datos aún en Supabase.</Text>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
