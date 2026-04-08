import type { ForumThreadRow } from '@/hooks/useForumThreads';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

type PostRow = {
  id: string;
  body: string;
  user_id: string;
  created_at: string;
};

export default function ThreadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [thread, setThread] = useState<ForumThreadRow | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [replying, setReplying] = useState(false);

  const refreshScores = useCallback(async (postIds: string[]) => {
    if (!postIds.length) return;
    const { data } = await supabase.from('forum_votes').select('post_id, vote').in('post_id', postIds);
    const sums: Record<string, number> = {};
    for (const row of data ?? []) {
      const r = row as { post_id: string; vote: number };
      sums[r.post_id] = (sums[r.post_id] ?? 0) + r.vote;
    }
    setVotes(sums);
  }, []);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data: th } = await supabase.from('forum_threads').select('id, title, body, created_at').eq('id', id).single();
    const { data: ps } = await supabase
      .from('forum_posts')
      .select('id, body, user_id, created_at')
      .eq('thread_id', id)
      .order('created_at', { ascending: true });
    setThread(th as ForumThreadRow);
    const list = (ps as PostRow[]) ?? [];
    setPosts(list);
    setLoading(false);
    await refreshScores(list.map((p) => p.id));
  }, [id, refreshScores]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendReply() {
    if (!user || !id || !body.trim()) return;
    setReplying(true);
    await supabase.from('forum_posts').insert({
      thread_id: id,
      user_id: user.id,
      body: body.trim(),
    });
    setBody('');
    setReplying(false);
    load();
  }

  async function vote(postId: string, value: 1 | -1) {
    if (!user) return;
    await supabase.from('forum_votes').upsert(
      { post_id: postId, user_id: user.id, vote: value },
      { onConflict: 'post_id,user_id' }
    );
    await refreshScores([postId]);
  }

  if (loading || !thread) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1c1410]">
        <ActivityIndicator color="#c4836c" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1c1410]">
      <View className="flex-row items-center border-b border-white/10 px-2 py-2">
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-1 p-2">
          <Ionicons name="chevron-back" size={22} color="#e8c4b0" />
          <Text className="text-[#e8c4b0]">Volver</Text>
        </Pressable>
      </View>
      <ScrollView className="flex-1 px-4 pb-8" contentContainerStyle={{ paddingTop: 12 }}>
        <Text className="text-xl font-bold text-[#f5e6d3]">{thread.title}</Text>
        {thread.body ? <Text className="mt-3 text-base leading-6 text-[#d4c4b4]">{thread.body}</Text> : null}
        <Text className="mt-4 text-xs text-[#6b5d52]">{new Date(thread.created_at).toLocaleString()}</Text>

        <Text className="mb-3 mt-8 text-sm font-semibold uppercase tracking-wider text-[#c4836c]">Respuestas</Text>
        {posts.map((p) => (
          <View key={p.id} className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Text className="text-[#f5e6d3]">{p.body}</Text>
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-xs text-[#6b5d52]">{p.user_id.slice(0, 6)}…</Text>
              <View className="flex-row items-center gap-2">
                <Pressable onPress={() => vote(p.id, 1)} className="rounded-full bg-white/10 p-2">
                  <Ionicons name="chevron-up" size={18} color="#86efac" />
                </Pressable>
                <Text className="w-8 text-center text-sm text-[#f5e6d3]">{votes[p.id] ?? 0}</Text>
                <Pressable onPress={() => vote(p.id, -1)} className="rounded-full bg-white/10 p-2">
                  <Ionicons name="chevron-down" size={18} color="#fca5a5" />
                </Pressable>
              </View>
            </View>
          </View>
        ))}
        {posts.length === 0 ? <Text className="text-[#8a7a6a]">Sin respuestas aún.</Text> : null}

        {user ? (
          <View className="mt-6 rounded-2xl border border-white/10 bg-[#2a1f18] p-3">
            <TextInput
              className="min-h-[80px] text-[#f5e6d3]"
              placeholder="Tu respuesta…"
              placeholderTextColor="#6b5d52"
              multiline
              value={body}
              onChangeText={setBody}
            />
            <Pressable
              disabled={replying || !body.trim()}
              onPress={sendReply}
              className="mt-2 items-center rounded-xl bg-[#c4836c] py-3 active:opacity-90 disabled:opacity-40">
              {replying ? <ActivityIndicator color="#1c1410" /> : <Text className="font-semibold text-[#1c1410]">Responder</Text>}
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
