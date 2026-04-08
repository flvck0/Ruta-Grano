import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useDestacados } from '@/hooks/useDestacados';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { CafeReviews } from '@/components/CafeReviews';

const MEDAL_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

export default function DestacadosScreen() {
  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName);
  const { rows, loading, error } = useDestacados(!!user);
  const [q, setQ] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const favoriteIds = useFavoritesStore((s) => s.ids);

  const filtered = rows.filter((r) => r.name.toLowerCase().includes(q.trim().toLowerCase()));

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1c1410] px-6">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl" style={{ backgroundColor: 'rgba(212,165,116,0.2)' }}>
          <Ionicons name="trophy-outline" size={40} color="#D4A574" />
        </View>
        <Text className="mb-2 text-center text-xl font-semibold text-[#f5e6d3]">Ranking del mes</Text>
        <Text className="mt-2 text-center text-sm leading-5 text-[#a89888]">
          Inicia sesión para ver las cafeterías con más check-ins en los últimos 30 días.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1c1410]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}>
        {/* Header */}
        <Text className="text-2xl font-bold text-[#f5e6d3]">Destacadas del mes</Text>
        <Text className="mt-1 text-sm text-[#8a7a6a]">Según check-ins de los últimos 30 días</Text>

        {/* Search */}
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

        {/* List */}
        {loading ? (
          <ActivityIndicator className="mt-10" color="#D4A574" />
        ) : error ? (
          <View className="mt-6 items-center rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-4">
            <Ionicons name="alert-circle-outline" size={24} color="#fca5a5" />
            <Text className="mt-2 text-center text-sm text-red-300">{error}</Text>
          </View>
        ) : (
          <View className="mt-4">
            {filtered.map((row, i) => {
              const isFav = favoriteIds.has(row.id);
              const isExpanded = expandedId === row.id;
              const isTop3 = i < 3;

              return (
                <View key={row.id} className="mb-3">
                  <Pressable
                    onPress={() => setExpandedId(isExpanded ? null : row.id)}
                    className="overflow-hidden rounded-2xl border border-white/10 active:opacity-90"
                    style={{ backgroundColor: isTop3 ? 'rgba(212,165,116,0.06)' : 'rgba(255,255,255,0.03)' }}>
                    <View className="flex-row items-center p-4">
                      {/* Rank badge */}
                      <View
                        className="mr-4 h-12 w-12 items-center justify-center rounded-2xl"
                        style={{
                          backgroundColor: isTop3 ? `${MEDAL_COLORS[i]}20` : 'rgba(212,165,116,0.15)',
                        }}>
                        {isTop3 ? (
                          <Ionicons name="trophy" size={22} color={MEDAL_COLORS[i]} />
                        ) : (
                          <Text className="text-lg font-bold" style={{ color: '#D4A574' }}>#{i + 1}</Text>
                        )}
                      </View>

                      {/* Name + info */}
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-[#f5e6d3]">{row.name}</Text>
                        {row.address ? (
                          <Text className="text-sm text-[#8a7a6a]">{row.address}</Text>
                        ) : null}
                        <View className="mt-2 flex-row items-center gap-3">
                          <View className="flex-row items-center gap-1">
                            <Ionicons name="flame" size={14} color="#fb923c" />
                            <Text className="text-xs font-medium" style={{ color: '#D4A574' }}>
                              {row.check_ins_ultimos_30_dias} check-ins
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Actions */}
                      <View className="flex-row items-center gap-2">
                        <Pressable
                          onPress={(e) => {
                            e.stopPropagation?.();
                            toggleFavorite({ id: row.id, name: row.name, address: row.address });
                          }}
                          className="rounded-full p-2 active:opacity-80"
                          style={{ backgroundColor: isFav ? 'rgba(236,72,153,0.12)' : 'rgba(255,255,255,0.06)' }}>
                          <Ionicons
                            name={isFav ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isFav ? '#ec4899' : '#8a7a6a'}
                          />
                        </Pressable>
                        <Ionicons
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={18}
                          color="#6b5d52"
                        />
                      </View>
                    </View>
                  </Pressable>

                  {/* Expanded feedback section */}
                  {isExpanded ? (
                    <View
                      className="overflow-hidden rounded-b-2xl border-x border-b border-white/10 px-5 py-4"
                      style={{ backgroundColor: 'rgba(42,31,24,0.6)', marginTop: -3 }}>
                      <CafeReviews cafeId={row.id} />
                    </View>
                  ) : null}
                </View>
              );
            })}
            {filtered.length === 0 ? (
              <View className="items-center rounded-3xl border border-dashed border-white/10 py-12">
                <Ionicons name="search-outline" size={36} color="#6b5d52" />
                <Text className="mt-3 text-center text-[#8a7a6a]">Sin resultados</Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
