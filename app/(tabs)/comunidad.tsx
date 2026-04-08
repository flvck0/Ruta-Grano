import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
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

export default function ComunidadScreen() {
  const user = useAuthStore((s) => s.user);
  const [listKey, setListKey] = useState(0);
  const { threads, loading, error } = useForumThreads(!!user, listKey);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

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
      setMsg('Hilo publicado');
      setListKey((k) => k + 1);
    }
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1c1410] px-6">
        <Ionicons name="chatbubbles-outline" size={48} color="#8a7a6a" />
        <Text className="mt-4 text-center text-lg font-semibold text-[#f5e6d3]">Comunidad</Text>
        <Text className="mt-2 text-center text-[#a89888]">Entra para ver hilos y votar respuestas.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1c1410] px-4 pt-4">
      <Text className="text-2xl font-semibold text-[#f5e6d3]">Foros</Text>
      <Text className="mt-1 text-sm text-[#8a7a6a]">Micro-debates: cortados, pasteles, barrios…</Text>

      <View className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4">
        <Text className="text-xs font-semibold uppercase tracking-wider text-[#c4836c]">Nuevo hilo</Text>
        <TextInput
          className="mt-2 rounded-xl border border-white/10 bg-[#2a1f18] px-3 py-3 text-[#f5e6d3]"
          placeholder="Título (ej. ¿Mejor cortado en Lastarria?)"
          placeholderTextColor="#6b5d52"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          className="mt-2 min-h-[72px] rounded-xl border border-white/10 bg-[#2a1f18] px-3 py-3 text-[#f5e6d3]"
          placeholder="Detalle opcional…"
          placeholderTextColor="#6b5d52"
          multiline
          value={body}
          onChangeText={setBody}
        />
        <Pressable
          disabled={sending || !title.trim()}
          onPress={crearHilo}
          className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl bg-[#c4836c] py-3.5 active:opacity-90 disabled:opacity-40">
          {sending ? (
            <ActivityIndicator color="#1c1410" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#1c1410" />
              <Text className="font-semibold text-[#1c1410]">Publicar</Text>
            </>
          )}
        </Pressable>
        {msg ? <Text className="mt-2 text-center text-sm text-emerald-300">{msg}</Text> : null}
      </View>

      {loading ? (
        <ActivityIndicator className="mt-8" color="#c4836c" />
      ) : error ? (
        <Text className="mt-6 text-red-300">{error}</Text>
      ) : (
        <ScrollView className="mt-4" contentContainerStyle={{ paddingBottom: 40 }}>
          {threads.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => router.push({ pathname: '/thread/[id]', params: { id: t.id } })}
              className="mb-3 rounded-2xl border border-white/10 bg-[#2a1f18] p-4 active:opacity-90">
              <Text className="text-base font-semibold text-[#f5e6d3]">{t.title}</Text>
              {t.body ? (
                <Text className="mt-1 text-sm text-[#a89888]" numberOfLines={2}>
                  {t.body}
                </Text>
              ) : null}
              <Text className="mt-2 text-xs text-[#6b5d52]">{new Date(t.created_at).toLocaleString()}</Text>
            </Pressable>
          ))}
          {threads.length === 0 ? (
            <Text className="py-8 text-center text-[#8a7a6a]">Aún no hay hilos. ¡Sé el primero!</Text>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
