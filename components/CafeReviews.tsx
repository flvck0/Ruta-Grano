import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

type ReviewRow = {
  id: string;
  author_name: string | null;
  body: string;
  created_at: string;
};

export function CafeReviews({ cafeId }: { cafeId: string }) {
  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName);

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadReviews() {
      setLoading(true);
      const { data } = await supabase
        .from('cafe_reviews')
        .select('id, author_name, body, created_at')
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false });

      if (active) {
        setReviews((data as ReviewRow[]) ?? []);
        setLoading(false);
      }
    }
    loadReviews();
    return () => {
      active = false;
    };
  }, [cafeId]);

  async function handleSubmit() {
    const txt = inputText.trim();
    if (!txt || !user) return;

    setSubmitting(true);
    const authorName = displayName || user.email?.split('@')[0] || null;

    const { data } = await supabase
      .from('cafe_reviews')
      .insert({
        cafe_id: cafeId,
        user_id: user.id,
        author_name: authorName,
        body: txt,
      })
      .select('id, author_name, body, created_at')
      .single();

    if (data) {
      setReviews((prev) => [data as ReviewRow, ...prev]);
      setInputText('');
    }
    setSubmitting(false);
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `hace ${days}d`;
  }

  return (
    <View className="mt-2">
      <Text className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#D4A574' }}>
        Opiniones ({reviews.length})
      </Text>

      {loading ? (
        <ActivityIndicator size="small" color="#D4A574" />
      ) : reviews.length > 0 ? (
        <View className="mb-4">
          {reviews.map((r) => (
            <View key={r.id} className="mb-2 rounded-xl px-4 py-3" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <Text className="text-sm leading-5 text-[#d4c4b4]">"{r.body}"</Text>
              <View className="mt-2 flex-row items-center gap-2">
                <View className="h-5 w-5 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(212,165,116,0.2)' }}>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: '#D4A574' }}>
                    {(r.author_name ?? 'U').slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text className="text-xs text-[#8a7a6a]">
                  {r.author_name ?? 'Anónimo'} · {timeAgo(r.created_at)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className="mb-4 py-2">
          <Text className="text-xs text-[#8a7a6a]">No hay opiniones todavía. ¡Sé el primero!</Text>
        </View>
      )}

      {user ? (
        <>
          <TextInput
            className="rounded-2xl border border-white/10 bg-[#1c1410] px-4 py-3 text-sm text-[#f5e6d3]"
            placeholder="¿Qué te parece este café?"
            placeholderTextColor="#6b5d52"
            multiline
            value={inputText}
            onChangeText={setInputText}
          />
          <Pressable
            disabled={submitting || !inputText.trim()}
            onPress={handleSubmit}
            className="mt-2 flex-row items-center justify-center gap-2 rounded-xl py-2.5 active:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: '#D4A574' }}>
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="chatbubble-outline" size={16} color="#fff" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Enviar opinión</Text>
              </>
            )}
          </Pressable>
        </>
      ) : null}
    </View>
  );
}
