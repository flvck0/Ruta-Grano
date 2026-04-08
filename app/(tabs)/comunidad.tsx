import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useForumThreads } from '@/hooks/useForumThreads';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `hace ${days}d`;
  return new Date(dateStr).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' });
}

export default function ComunidadScreen() {
  const user = useAuthStore((s) => s.user);
  const [listKey, setListKey] = useState(0);
  const { threads, loading, error } = useForumThreads(!!user, listKey);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function crearHilo() {
    if (!user || !title.trim()) return;
    setSending(true);
    setMsg(null);
    const { error: e } = await supabase.from('forum_threads').insert({
      title: title.trim(),
      body: body.trim() || null,
      created_by: user.id,
    });
    setSending(false);
    if (e) setMsg(e.message);
    else {
      setTitle('');
      setBody('');
      setMsg('¡Hilo publicado exitosamente!');
      setShowForm(false);
      setListKey((k) => k + 1);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1c1410] px-6">
        <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl" style={{ backgroundColor: 'rgba(212,165,116,0.2)' }}>
          <Ionicons name="chatbubbles-outline" size={40} color="#D4A574" />
        </View>
        <Text className="mb-2 text-center text-xl font-semibold text-[#f5e6d3]">Comunidad</Text>
        <Text className="mb-1 text-center text-sm leading-5 text-[#a89888]">
          Únete a la comunidad cafetera de Santiago.
        </Text>
        <Text className="text-center text-sm leading-5 text-[#a89888]">
          Crea hilos, debate y vota las mejores respuestas.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1c1410]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}>
        {/* Page header */}
        <View className="flex-row items-end justify-between">
          <View>
            <Text className="text-2xl font-bold text-[#f5e6d3]">Comunidad</Text>
            <Text className="mt-1 text-sm text-[#8a7a6a]">Debates, tips y recomendaciones de café</Text>
          </View>
          <Pressable
            onPress={() => setShowForm(!showForm)}
            className="flex-row items-center gap-1.5 rounded-2xl px-4 py-2.5 active:opacity-90"
            style={{ backgroundColor: showForm ? 'rgba(255,255,255,0.08)' : '#D4A574' }}>
            <Ionicons
              name={showForm ? 'close' : 'add'}
              size={20}
              color={showForm ? '#D4A574' : '#fff'}
            />
            <Text
              style={{
                fontWeight: '600',
                fontSize: 14,
                color: showForm ? '#D4A574' : '#fff',
              }}>
              {showForm ? 'Cancelar' : 'Nuevo'}
            </Text>
          </Pressable>
        </View>

        {/* Success message */}
        {msg ? (
          <View className="mt-4 flex-row items-center gap-2 rounded-2xl px-4 py-3" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text style={{ color: '#a7f3d0', fontSize: 14 }}>{msg}</Text>
          </View>
        ) : null}

        {/* New thread form — collapsible */}
        {showForm ? (
          <View className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <Text className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4A574' }}>
              Nuevo hilo
            </Text>
            <TextInput
              className="rounded-2xl border border-white/10 bg-[#2a1f18] px-4 py-3.5 text-base text-[#f5e6d3]"
              placeholder="Título (ej. ¿Mejor cortado en Lastarria?)"
              placeholderTextColor="#6b5d52"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              className="mt-3 min-h-[80px] rounded-2xl border border-white/10 bg-[#2a1f18] px-4 py-3.5 text-base text-[#f5e6d3]"
              placeholder="Agrega más contexto (opcional)…"
              placeholderTextColor="#6b5d52"
              multiline
              textAlignVertical="top"
              value={body}
              onChangeText={setBody}
            />
            <Pressable
              disabled={sending || !title.trim()}
              onPress={crearHilo}
              className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl py-3.5 active:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#D4A574' }}>
              {sending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text className="font-semibold text-white">Publicar hilo</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : null}

        {/* Thread list */}
        {loading ? (
          <ActivityIndicator className="mt-10" color="#D4A574" />
        ) : error ? (
          <View className="mt-6 items-center rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-4">
            <Ionicons name="alert-circle-outline" size={24} color="#fca5a5" />
            <Text className="mt-2 text-center text-sm text-red-300">{error}</Text>
          </View>
        ) : (
          <View className="mt-5">
            {threads.map((t, idx) => (
              <React.Fragment key={t.id}>
                <Pressable
                  onPress={() => router.push({ pathname: '/thread/[id]', params: { id: t.id } })}
                  className="mb-3 overflow-hidden rounded-2xl border border-white/10 active:opacity-90"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <View className="px-5 pb-3 pt-4">
                    {/* Title */}
                    <Text className="text-base font-semibold text-[#f5e6d3]">{t.title}</Text>
  
                    {/* Body preview */}
                    {t.body ? (
                      <Text className="mt-1.5 text-sm leading-5 text-[#a89888]" numberOfLines={2}>
                        {t.body}
                      </Text>
                    ) : null}
                  </View>
  
                  {/* Thread footer */}
                  <View
                    className="flex-row items-center justify-between px-5 py-2.5"
                    style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                    <View className="flex-row items-center gap-2">
                      <Ionicons name="time-outline" size={14} color="#6b5d52" />
                      <Text className="text-xs text-[#6b5d52]">{timeAgo(t.created_at)}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                      <Ionicons name="chatbubble-outline" size={14} color="#8a7a6a" />
                      <Text className="text-xs text-[#8a7a6a]">Ver hilo</Text>
                      <Ionicons name="chevron-forward" size={14} color="#6b5d52" />
                    </View>
                  </View>
                </Pressable>
              </React.Fragment>
            ))}
            {threads.length === 0 ? (
              <View className="items-center rounded-3xl border border-dashed border-white/10 py-12">
                <Ionicons name="cafe-outline" size={40} color="#6b5d52" />
                <Text className="mt-4 text-center text-lg font-medium text-[#8a7a6a]">
                  Aún no hay hilos
                </Text>
                <Text className="mt-1 text-center text-sm text-[#6b5d52]">
                  ¡Sé el primero en iniciar la conversación!
                </Text>
                <Pressable
                  onPress={() => setShowForm(true)}
                  className="mt-5 flex-row items-center gap-2 rounded-2xl px-6 py-3 active:opacity-90"
                  style={{ backgroundColor: '#D4A574' }}>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text className="font-semibold text-white">Crear primer hilo</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
