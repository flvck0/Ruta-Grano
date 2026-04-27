import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';

import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const passwordsMatch = mode === 'register' ? password === confirmPassword && password.length > 0 : true;
  const canSubmit =
    !loading &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    (mode === 'login' || (passwordsMatch && confirmPassword.length > 0 && displayName.trim().length >= 2));

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => {
      if (countdown === 1) {
        setMode('login');
        setRegistered(false);
        setMessage(null);
        setConfirmPassword('');
        setCountdown(0);
      } else {
        setCountdown(countdown - 1);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function submit() {
    setMessage(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        if (!passwordsMatch) {
          setMessage('Las contraseñas no coinciden.');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { display_name: displayName.trim() },
          },
        });
        if (error) throw error;
        setRegistered(true);
        setMessage('✉️ ¡Cuenta creada! Revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.');
        setCountdown(4);
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

  function switchMode() {
    const next = mode === 'login' ? 'register' : 'login';
    setMode(next);
    setMessage(null);
    setRegistered(false);
    setConfirmPassword('');
    setDisplayName('');
    setCountdown(0);
  }

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS !== 'web'}
        className="flex-1 bg-[#1c1410]">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 40, paddingTop: 16 }}
          keyboardShouldPersistTaps="handled">
          {/* Brand */}
          <View className="mb-8 items-center">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-3xl" style={{ backgroundColor: 'rgba(212,165,116,0.2)' }}>
              <Ionicons name="cafe" size={36} color="#D4A574" />
            </View>
            <Text className="font-serif text-3xl text-[#f5e6d3]" style={{ fontFamily: 'System' }}>
              Ruta Grano
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-[#a89888]">
              Tu mapa de cafeterías, reseñas y comunidad.
            </Text>
          </View>

          {/* Form Card */}
          <View className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <Text className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4A574' }}>
              {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </Text>

            {/* Display Name — only register */}
            {mode === 'register' ? (
              <>
                <Text className="mb-1 text-sm text-[#d4c4b4]">Nombre de usuario</Text>
                <TextInput
                  className="mb-4 rounded-2xl border border-white/10 bg-[#2a1f18] px-4 py-3.5 text-base text-[#f5e6d3]"
                  placeholder="Ej: CaféLover_23"
                  placeholderTextColor="#6b5d52"
                  autoCapitalize="none"
                  value={displayName}
                  onChangeText={setDisplayName}
                />
              </>
            ) : null}

            {/* Email */}
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

            {/* Password */}
            <Text className="mb-1 text-sm text-[#d4c4b4]">Contraseña</Text>
            <TextInput
              className="rounded-2xl border border-white/10 bg-[#2a1f18] px-4 py-3.5 text-base text-[#f5e6d3]"
              style={mode === 'register' ? { marginBottom: 12 } : { marginBottom: 24 }}
              placeholder="••••••••  (mín. 6 caracteres)"
              placeholderTextColor="#6b5d52"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={submit}
            />

            {/* Confirm Password */}
            {mode === 'register' ? (
              <>
                <View className="flex-row items-center justify-between">
                  <Text className="mb-1 text-sm text-[#d4c4b4]">Repetir contraseña</Text>
                  {confirmPassword.length > 0 ? (
                    <View className="mb-1 flex-row items-center gap-1">
                      <Ionicons
                        name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={passwordsMatch ? '#10b981' : '#f87171'}
                      />
                      <Text style={{ fontSize: 12, color: passwordsMatch ? '#10b981' : '#f87171' }}>
                        {passwordsMatch ? 'Coinciden' : 'No coinciden'}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <TextInput
                  className="mb-6 rounded-2xl border border-white/10 bg-[#2a1f18] px-4 py-3.5 text-base text-[#f5e6d3]"
                  style={
                    confirmPassword.length > 0
                      ? { borderColor: passwordsMatch ? 'rgba(16,185,129,0.4)' : 'rgba(248,113,113,0.4)' }
                      : undefined
                  }
                  placeholder="••••••••"
                  placeholderTextColor="#6b5d52"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </>
            ) : null}

            {/* Message */}
            {message ? (
              <View
                className="mb-4 flex-row items-start gap-2 rounded-2xl px-4 py-3"
                style={{
                  backgroundColor: registered ? 'rgba(16,185,129,0.12)' : 'rgba(251,191,36,0.12)',
                }}>
                <Ionicons
                  name={registered ? 'mail-outline' : 'warning-outline'}
                  size={20}
                  color={registered ? '#10b981' : '#f59e0b'}
                  style={{ marginTop: 2 }}
                />
                <View className="flex-1">
                  <Text style={{ fontSize: 14, color: registered ? '#a7f3d0' : '#fde68a', lineHeight: 20 }}>
                    {message}
                  </Text>
                  {registered && countdown > 0 ? (
                    <Text style={{ fontSize: 12, color: '#6ee7b7', marginTop: 4 }}>
                      Redirigiendo a login en {countdown}s…
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              disabled={!canSubmit}
              onPress={submit}
              className="flex-row items-center justify-center rounded-2xl py-4 active:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#D4A574' }}>
              {loading ? (
                <ActivityIndicator color="#1c1410" />
              ) : (
                <Text className="text-base font-semibold text-[#1c1410]">
                  {mode === 'login' ? 'Entrar' : 'Registrarme'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle mode */}
            <TouchableOpacity onPress={switchMode} className="mt-5">
              <Text className="text-center text-sm text-[#a89888]">
                {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                <Text className="font-semibold" style={{ color: '#D4A574' }}>
                  {mode === 'login' ? 'Crear una' : 'Entrar'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Back link */}
          <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); } else { router.replace('/(tabs)'); } }} className="mt-8 flex-row items-center justify-center gap-2">
            <Ionicons name="chevron-back" size={18} color="#8a7a6a" />
            <Text className="text-sm text-[#8a7a6a]">Seguir explorando sin cuenta</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
  );
}

