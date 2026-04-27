import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { timeAgo } from '@/lib/utils/timeAgo';

type Review = {
  id: string;
  author_name: string | null;
  body: string;
  created_at: string;
};

export function CafeReviews({ cafeId }: { cafeId: string }) {
  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: e } = await supabase
        .from('cafe_reviews')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (!isMounted) return;
      if (e) setError(e.message);
      else setReviews(data ?? []);
      setLoading(false);
    }
    load();
    return () => { isMounted = false; };
  }, [cafeId, user]);

  async function addReview() {
    if (!user || !body.trim()) return;
    setSending(true);
    const newReview = {
      cafe_id: cafeId,
      user_id: user.id,
      body: body.trim(),
      author_name: displayName || 'Usuario Anónimo',
    };
    
    const { data, error: e } = await supabase
      .from('cafe_reviews')
      .insert(newReview)
      .select()
      .single();

    setSending(false);
    if (e) {
      setError(e.message);
    } else if (data) {
      setReviews((prev) => [data, ...prev]);
      setBody('');
    }
  }

  if (!user) {
    return (
      <View className="items-center py-4">
        <Ionicons name="lock-closed-outline" size={24} color="#8a7a6a" />
        <Text className="mt-2 text-center text-sm text-[#8a7a6a]">Inicia sesión para ver las reseñas</Text>
      </View>
    );
  }

  return (
    <View className="py-2">
      {/* New Review Form */}
      <View className="mb-5 flex-row items-end gap-3">
        <TextInput
          className="flex-1 rounded-2xl border border-white/10 bg-[#2a1f18] px-4 py-3 text-sm text-[#f5e6d3]"
          placeholder="¿Qué te pareció este café?"
          placeholderTextColor="#6b5d52"
          value={body}
          onChangeText={setBody}
          multiline
        />
        <Pressable
          disabled={sending || !body.trim()}
          onPress={addReview}
          className="h-[46px] w-[46px] items-center justify-center rounded-2xl active:opacity-80 disabled:opacity-40"
          style={{ backgroundColor: '#D4A574' }}>
          {sending ? (
            <ActivityIndicator color="#1c1410" size="small" />
          ) : (
            <Ionicons name="send" size={18} color="#1c1410" style={{ marginLeft: 2 }} />
          )}
        </Pressable>
      </View>

      {/* Reviews List */}
      {loading ? (
        <ActivityIndicator color="#D4A574" style={{ marginVertical: 16 }} />
      ) : error ? (
        <Text className="text-sm text-red-400">{error}</Text>
      ) : reviews.length === 0 ? (
        <Text className="text-center text-sm italic text-[#6b5d52]">Aún no hay reseñas. ¡Sé el primero!</Text>
      ) : (
        <View className="gap-4">
          {reviews.map((r) => (
            <View key={r.id}>
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="font-semibold text-[#d4c4b4]">{r.author_name || 'Anónimo'}</Text>
                <Text className="text-xs text-[#6b5d52]">{timeAgo(r.created_at)}</Text>
              </View>
              <Text className="text-sm leading-5 text-[#f5e6d3]">{r.body}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
