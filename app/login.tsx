import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    setMessage(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        setMessage('Revisa tu correo para confirmar la cuenta (si está activado en Supabase).');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.back();
      }
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : 'Error al autenticar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-[#1c1410]">
        <View className="flex-1 justify-center px-6 pb-10 pt-4">
          <View className="mb-8 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-3xl bg-[#c4836c]/25">
              <Ionicons name="cafe" size={36} color="#e8c4b0" />
            </View>
            <Text className="font-serif text-3xl text-[#f5e6d3]" style={{ fontFamily: 'System' }}>
              Ruta Grano
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-[#a89888]">
              Tu mapa de cafeterías, reseñas y comunidad.
            </Text>
          </View>

          <View className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <Text className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#c4836c]">
              {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </Text>
            <Text className="mb-1 text-sm text-[#d4c4b4]">Correo</Text>
            <TextInput
              className="mb-4 rounded-2xl border border-white/10 bg-[#2a1f18] px-4 py-3.5 text-base text-[#f5e6d3]"
              placeholder="hola@correo.com"
              placeholderTextColor="#6b5d52"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />
            <Text className="mb-1 text-sm text-[#d4c4b4]">Contraseña</Text>
            <TextInput
              className="mb-6 rounded-2xl border border-white/10 bg-[#2a1f18] px-4 py-3.5 text-base text-[#f5e6d3]"
              placeholder="••••••••"
              placeholderTextColor="#6b5d52"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {message ? (
              <Text className="mb-4 text-center text-sm text-amber-200/90">{message}</Text>
            ) : null}

            <Pressable
              disabled={loading || !email || !password}
              onPress={submit}
              className="flex-row items-center justify-center rounded-2xl bg-[#c4836c] py-4 active:opacity-90 disabled:opacity-40">
              {loading ? (
                <ActivityIndicator color="#1c1410" />
              ) : (
                <Text className="text-base font-semibold text-[#1c1410]">
                  {mode === 'login' ? 'Entrar' : 'Registrarme'}
                </Text>
              )}
            </Pressable>

            <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')} className="mt-5">
              <Text className="text-center text-sm text-[#a89888]">
                {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <Text className="font-semibold text-[#e8c4b0]">
                  {mode === 'login' ? 'Crear una' : 'Entrar'}
                </Text>
              </Text>
            </Pressable>
          </View>

          <Pressable onPress={() => router.back()} className="mt-8 flex-row items-center justify-center gap-2">
            <Ionicons name="chevron-back" size={18} color="#8a7a6a" />
            <Text className="text-sm text-[#8a7a6a]">Seguir explorando sin cuenta</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
  );
}

export const options = {
  presentation: 'modal' as const,
  headerShown: false,
  contentStyle: { backgroundColor: '#1c1410' },
};
