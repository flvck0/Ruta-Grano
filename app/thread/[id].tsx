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
import { timeAgo } from '@/lib/utils/timeAgo';

type PostRow = {
  id: string;
  body: string;
  user_id: string;
  author_name: string | null;
  created_at: string;
};

type UserVote = { post_id: string; vote: number };

export default function ThreadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName);
  const [thread, setThread] = useState<ForumThreadRow | null>(null);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [myVotes, setMyVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [replying, setReplying] = useState(false);

  /** Get display name for a post */
  function getAuthorName(post: PostRow): string {
    // If the post has a saved author_name, use that
    if (post.author_name) {
      return post.author_name;
    }
    // If it's the current user, use their displayName
    if (user && post.user_id === user.id && displayName) {
      return displayName;
    }
    // Fallback
    return `Cafetero_${post.user_id.slice(0, 4).toUpperCase()}`;
  }

  const refreshAll = useCallback(
    async (postIds: string[]) => {
      if (!postIds.length) return;

      const { data: allVotes } = await supabase
        .from('forum_votes')
        .select('post_id, vote')
        .in('post_id', postIds);

      const sums: Record<string, number> = {};
      for (const row of (allVotes ?? []) as UserVote[]) {
        sums[row.post_id] = (sums[row.post_id] ?? 0) + row.vote;
      }
      for (const pid of postIds) {
        if (!(pid in sums)) sums[pid] = 0;
      }
      setScores(sums);

      if (user) {
        const { data: mine } = await supabase
          .from('forum_votes')
          .select('post_id, vote')
          .in('post_id', postIds)
          .eq('user_id', user.id);

        const mv: Record<string, number> = {};
        for (const row of (mine ?? []) as UserVote[]) {
          mv[row.post_id] = row.vote;
        }
        setMyVotes(mv);
      }
    },
    [user]
  );

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data: th } = await supabase
      .from('forum_threads')
      .select('id, title, body, created_at')
      .eq('id', id)
      .single();
    const { data: ps } = await supabase
      .from('forum_posts')
      .select('id, body, user_id, author_name, created_at')
      .eq('thread_id', id)
      .order('created_at', { ascending: true });
    setThread(th as ForumThreadRow);
    const list = (ps as PostRow[]) ?? [];
    setPosts(list);
    setLoading(false);
    await refreshAll(list.map((p) => p.id));
  }, [id, refreshAll]);

  useEffect(() => {
    load();
  }, [load]);

  async function sendReply() {
    if (!user || !id || !body.trim()) return;
    setReplying(true);
    const authorName = displayName || user.email?.split('@')[0] || null;
    await supabase.from('forum_posts').insert({
      thread_id: id,
      user_id: user.id,
      body: body.trim(),
      author_name: authorName,
    });
    setBody('');
    setReplying(false);
    load();
  }

  async function borrarHiloActual() {
    if (typeof window !== 'undefined' && !window.confirm('¿Seguro que quieres borrar este hilo?')) return;
    const { error } = await supabase.from('forum_threads').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else router.replace('/(tabs)/comunidad');
  }

  async function vote(postId: string, value: 1 | -1) {
    if (!user) return;

    const current = myVotes[postId];

    if (current === value) {
      await supabase
        .from('forum_votes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);
    } else {
      await supabase.from('forum_votes').upsert(
        { post_id: postId, user_id: user.id, vote: value },
        { onConflict: 'post_id,user_id' }
      );
    }

    const { data: allVotes } = await supabase
      .from('forum_votes')
      .select('post_id, vote')
      .eq('post_id', postId);

    let sum = 0;
    for (const row of (allVotes ?? []) as UserVote[]) {
      sum += row.vote;
    }
    setScores((prev) => ({ ...prev, [postId]: sum }));

    if (current === value) {
      setMyVotes((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    } else {
      setMyVotes((prev) => ({ ...prev, [postId]: value }));
    }
  }


  if (loading || !thread) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1c1410]">
        <ActivityIndicator color="#D4A574" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1c1410]">
      {/* Top bar */}
      <View
        className="flex-row items-center px-3 py-3"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.08)',
        }}>
        <Pressable onPress={() => router.back()} className="flex-row items-center gap-1.5 rounded-xl px-2 py-1.5 active:opacity-80">
          <Ionicons name="chevron-back" size={22} color="#D4A574" />
          <Text style={{ color: '#D4A574', fontWeight: '500' }}>Volver</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}>
        {/* Thread header card */}
        <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <View className="flex-row justify-between items-start">
            <Text className="flex-1 text-xl font-bold text-[#f5e6d3]">{thread.title}</Text>
            {user && user.id === thread.created_by ? (
              <Pressable onPress={borrarHiloActual} className="ml-3 p-2 rounded-full bg-red-500/10 active:opacity-70">
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </Pressable>
            ) : null}
          </View>
          {thread.body ? (
            <Text className="mt-3 text-base leading-6 text-[#d4c4b4]">{thread.body}</Text>
          ) : null}
          <View className="mt-4 flex-row items-center gap-2">
            <Ionicons name="time-outline" size={14} color="#6b5d52" />
            <Text className="text-xs text-[#6b5d52]">{new Date(thread.created_at).toLocaleString()}</Text>
          </View>
        </View>

        {/* Replies section */}
        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#D4A574' }}>
            Respuestas ({posts.length})
          </Text>
        </View>

        <View className="mt-3">
          {posts.map((p) => {
            const score = scores[p.id] ?? 0;
            const myVote = myVotes[p.id] ?? 0;
            const authorName = getAuthorName(p);
            const isCurrentUser = user && p.user_id === user.id;

            return (
              <View
                key={p.id}
                className="mb-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <View className="px-5 pb-3 pt-4">
                  <Text className="text-base leading-6 text-[#f5e6d3]">{p.body}</Text>
                </View>

                <View
                  className="flex-row items-center justify-between px-5 py-3"
                  style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
                  {/* User info with name */}
                  <View className="flex-row items-center gap-2">
                    <View
                      className="h-7 w-7 items-center justify-center rounded-full"
                      style={{ backgroundColor: isCurrentUser ? 'rgba(212,165,116,0.25)' : 'rgba(138,122,106,0.2)' }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isCurrentUser ? '#D4A574' : '#8a7a6a' }}>
                        {authorName.slice(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <Text className="text-sm font-medium" style={{ color: isCurrentUser ? '#D4A574' : '#d4c4b4' }}>
                      {authorName}
                    </Text>
                    {isCurrentUser ? (
                      <Text className="text-xs" style={{ color: '#8a7a6a' }}>(tú)</Text>
                    ) : null}
                    <Text className="text-xs text-[#6b5d52]">· {timeAgo(p.created_at)}</Text>
                  </View>

                  {/* Vote controls */}
                  <View className="flex-row items-center gap-1">
                    <Pressable
                      onPress={() => vote(p.id, 1)}
                      className="items-center justify-center rounded-xl p-2 active:opacity-80"
                      style={{
                        backgroundColor: myVote === 1 ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                      }}>
                      <Ionicons
                        name={myVote === 1 ? 'arrow-up' : 'arrow-up-outline'}
                        size={18}
                        color={myVote === 1 ? '#10b981' : '#8a7a6a'}
                      />
                    </Pressable>

                    <Text
                      className="min-w-[28px] text-center text-sm font-semibold"
                      style={{
                        color: score > 0 ? '#10b981' : score < 0 ? '#f87171' : '#8a7a6a',
                      }}>
                      {score}
                    </Text>

                    <Pressable
                      onPress={() => vote(p.id, -1)}
                      className="items-center justify-center rounded-xl p-2 active:opacity-80"
                      style={{
                        backgroundColor: myVote === -1 ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.06)',
                      }}>
                      <Ionicons
                        name={myVote === -1 ? 'arrow-down' : 'arrow-down-outline'}
                        size={18}
                        color={myVote === -1 ? '#f87171' : '#8a7a6a'}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}

          {posts.length === 0 ? (
            <View className="items-center rounded-2xl border border-dashed border-white/10 py-10">
              <Ionicons name="chatbubble-outline" size={32} color="#6b5d52" />
              <Text className="mt-3 text-[#8a7a6a]">Sin respuestas aún. ¡Sé el primero!</Text>
            </View>
          ) : null}
        </View>

        {/* Reply input */}
        {user ? (
          <View className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#D4A574' }}>
              Tu respuesta
            </Text>
            <TextInput
              className="min-h-[90px] rounded-2xl border border-white/10 bg-[#2a1f18] px-4 py-3 text-base text-[#f5e6d3]"
              placeholder="Escribe tu opinión…"
              placeholderTextColor="#6b5d52"
              multiline
              textAlignVertical="top"
              value={body}
              onChangeText={setBody}
            />
            <Pressable
              disabled={replying || !body.trim()}
              onPress={sendReply}
              className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl py-3.5 active:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#D4A574' }}>
              {replying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text className="font-semibold text-white">Responder</Text>
                </>
              )}
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
