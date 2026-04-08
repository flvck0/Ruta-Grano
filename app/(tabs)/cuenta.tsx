import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';

export default function CuentaScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const displayName = useAuthStore((s) => s.displayName);
  const setDisplayName = useAuthStore((s) => s.setDisplayName);
  const favoriteIds = useFavoritesStore((s) => s.ids);
  const favoriteCafes = useFavoritesStore((s) => s.cafes);
  const favoriteCount = favoriteIds.size;

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [threadCount, setThreadCount] = useState(0);

  // Load thread count for current user
  useEffect(() => {
    if (!user) return;
    supabase
      .from('forum_threads')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', user.id)
      .then(({ count }) => {
        setThreadCount(count ?? 0);
      });
  }, [user]);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1c1410] px-6">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl" style={{ backgroundColor: 'rgba(212,165,116,0.2)' }}>
          <Ionicons name="person-outline" size={44} color="#D4A574" />
        </View>
        <Text className="mb-2 text-center text-xl font-semibold text-[#f5e6d3]">Tu perfil</Text>
        <Text className="mb-8 text-center text-[#a89888]">Inicia sesión para check-ins, foros y más.</Text>
        <Link href="/login" asChild>
          <Pressable className="rounded-2xl px-10 py-4 active:opacity-90" style={{ backgroundColor: '#D4A574' }}>
            <Text className="text-base font-semibold text-white">Entrar o registrarse</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  const initials = (displayName ?? user.email ?? '?')
    .split(/[@.\s]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');

  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  async function saveName() {
    if (!nameInput.trim()) return;
    setSaving(true);
    await setDisplayName(nameInput.trim());
    setSaving(false);
    setEditing(false);
  }

  // Get favorite cafes as array from the Map
  const favCafeList = Array.from(favoriteCafes.values());

  return (
    <ScrollView
      className="flex-1 bg-[#1c1410]"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}>
      {/* Header */}
      <Text className="mb-6 text-2xl font-bold text-[#f5e6d3]">Mi Perfil</Text>

      {/* Avatar + Name Card */}
      <View className="items-center rounded-3xl border border-white/10 bg-white/5 px-5 pb-6 pt-8">
        <View
          className="mb-4 h-24 w-24 items-center justify-center rounded-full"
          style={{
            backgroundColor: '#D4A574',
            shadowColor: '#D4A574',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 12,
            elevation: 6,
          }}>
          <Text className="text-3xl font-bold text-white">{initials}</Text>
        </View>

        {editing ? (
          <View className="w-full flex-row items-center gap-2">
            <TextInput
              className="flex-1 rounded-2xl border border-white/15 bg-[#2a1f18] px-4 py-3 text-base text-[#f5e6d3]"
              placeholder="Tu nombre o apodo"
              placeholderTextColor="#6b5d52"
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
            />
            <Pressable
              onPress={saveName}
              disabled={saving || !nameInput.trim()}
              className="rounded-2xl px-4 py-3 active:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#D4A574' }}>
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="checkmark" size={22} color="#fff" />
              )}
            </Pressable>
            <Pressable
              onPress={() => {
                setEditing(false);
                setNameInput(displayName ?? '');
              }}
              className="rounded-2xl border border-white/15 px-3 py-3 active:opacity-80">
              <Ionicons name="close" size={22} color="#a89888" />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setEditing(true)} className="flex-row items-center gap-2 active:opacity-80">
            <Text className="text-xl font-semibold text-[#f5e6d3]">
              {displayName || user.email?.split('@')[0] || 'Sin nombre'}
            </Text>
            <Ionicons name="pencil-outline" size={18} color="#D4A574" />
          </Pressable>
        )}

        <Text className="mt-2 text-sm text-[#8a7a6a]">{user.email}</Text>
      </View>

      {/* Stats Section */}
      <View className="mt-5 flex-row gap-3">
        <View className="flex-1 items-center rounded-2xl border border-white/10 bg-white/5 py-5">
          <Ionicons name="location" size={24} color="#D4A574" />
          <Text className="mt-2 text-2xl font-bold text-[#f5e6d3]">—</Text>
          <Text className="mt-1 text-xs text-[#8a7a6a]">Check-ins</Text>
        </View>
        <View className="flex-1 items-center rounded-2xl border border-white/10 bg-white/5 py-5">
          <Ionicons name="heart" size={24} color="#ec4899" />
          <Text className="mt-2 text-2xl font-bold text-[#f5e6d3]">{favoriteCount}</Text>
          <Text className="mt-1 text-xs text-[#8a7a6a]">Favoritas</Text>
        </View>
        <View className="flex-1 items-center rounded-2xl border border-white/10 bg-white/5 py-5">
          <Ionicons name="chatbubbles" size={24} color="#60a5fa" />
          <Text className="mt-2 text-2xl font-bold text-[#f5e6d3]">{threadCount}</Text>
          <Text className="mt-1 text-xs text-[#8a7a6a]">Hilos</Text>
        </View>
      </View>

      {/* Favorite Cafes Section */}
      {favoriteCount > 0 ? (
        <View className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
          <View className="mb-3 flex-row items-center gap-2">
            <Ionicons name="heart" size={18} color="#ec4899" />
            <Text className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4A574' }}>
              Mis cafeterías favoritas
            </Text>
          </View>
          {favCafeList.map((cafe) => (
            <View
              key={cafe.id}
              className="mb-2 flex-row items-center gap-3 rounded-2xl px-4 py-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(212,165,116,0.15)' }}>
                <Text style={{ fontSize: 18 }}>☕</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-[#f5e6d3]">{cafe.name}</Text>
                {cafe.address ? (
                  <Text className="text-xs text-[#8a7a6a]">{cafe.address}</Text>
                ) : null}
              </View>
              {cafe.hot ? (
                <View className="flex-row items-center gap-1 rounded-full px-2 py-1" style={{ backgroundColor: 'rgba(249,115,22,0.12)' }}>
                  <Ionicons name="flame" size={12} color="#fb923c" />
                  <Text style={{ fontSize: 10, color: '#fb923c', fontWeight: '600' }}>HOT</Text>
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}

      {/* Account Info */}
      <View className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
        <Text className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4A574' }}>
          Información de la cuenta
        </Text>

        <View className="mb-4">
          <Text className="text-xs text-[#8a7a6a]">Correo electrónico</Text>
          <Text className="mt-1 text-base text-[#f5e6d3]">{user.email}</Text>
        </View>

        <View className="mb-4 h-px bg-white/10" />

        <View className="mb-4">
          <Text className="text-xs text-[#8a7a6a]">ID de usuario</Text>
          <Text className="mt-1 font-mono text-sm text-[#a89888]">{user.id.slice(0, 12)}…</Text>
        </View>

        <View className="mb-1 h-px bg-white/10" />

        {memberSince ? (
          <View className="mt-3">
            <Text className="text-xs text-[#8a7a6a]">Miembro desde</Text>
            <Text className="mt-1 text-sm text-[#d4c4b4]">{memberSince}</Text>
          </View>
        ) : null}
      </View>

      {/* Preferences Section */}
      <View className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-5">
        <Text className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4A574' }}>
          Preferencias
        </Text>
        <Pressable onPress={() => router.push('/preferences/notificaciones')} className="flex-row items-center justify-between py-3 active:opacity-80">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: 'rgba(212,165,116,0.12)' }}>
              <Ionicons name="notifications-outline" size={22} color="#D4A574" />
            </View>
            <Text className="text-base text-[#f5e6d3]">Notificaciones</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6b5d52" />
        </Pressable>
        <View className="my-1 h-px bg-white/5" />
        <Pressable onPress={() => router.push('/preferences/privacidad')} className="flex-row items-center justify-between py-3 active:opacity-80">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: 'rgba(212,165,116,0.12)' }}>
              <Ionicons name="shield-outline" size={22} color="#D4A574" />
            </View>
            <Text className="text-base text-[#f5e6d3]">Privacidad</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6b5d52" />
        </Pressable>
        <View className="my-1 h-px bg-white/5" />
        <Pressable onPress={() => router.push('/preferences/ayuda')} className="flex-row items-center justify-between py-3 active:opacity-80">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-2xl" style={{ backgroundColor: 'rgba(212,165,116,0.12)' }}>
              <Ionicons name="help-circle-outline" size={22} color="#D4A574" />
            </View>
            <Text className="text-base text-[#f5e6d3]">Ayuda y soporte</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6b5d52" />
        </Pressable>
      </View>

      {/* Sign Out */}
      <Pressable
        onPress={async () => {
          await signOut();
          router.replace('/(tabs)');
        }}
        className="mt-8 flex-row items-center justify-center gap-2 rounded-2xl border border-red-400/30 py-4 active:opacity-80"
        style={{ backgroundColor: 'rgba(248,113,113,0.06)' }}>
        <Ionicons name="log-out-outline" size={22} color="#fca5a5" />
        <Text className="text-base font-semibold text-red-300">Cerrar sesión</Text>
      </Pressable>

      {/* Version */}
      <Text className="mt-6 text-center text-xs text-[#6b5d52]">Ruta Grano v1.0.0</Text>
    </ScrollView>
  );
}
