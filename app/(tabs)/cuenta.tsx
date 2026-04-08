import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useAuthStore } from '@/store/authStore';

export default function CuentaScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1c1410] px-6">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-3xl bg-[#c4836c]/25">
          <Ionicons name="person-outline" size={44} color="#e8c4b0" />
        </View>
        <Text className="mb-2 text-center text-xl font-semibold text-[#f5e6d3]">Tu perfil</Text>
        <Text className="mb-8 text-center text-[#a89888]">Inicia sesión para check-ins, foros y más.</Text>
        <Link href="/login" asChild>
          <Pressable className="rounded-2xl bg-[#c4836c] px-10 py-4 active:opacity-90">
            <Text className="text-base font-semibold text-[#1c1410]">Entrar o registrarse</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1c1410] px-5 pt-6">
      <Text className="mb-6 text-2xl font-semibold text-[#f5e6d3]">Cuenta</Text>
      <View className="rounded-3xl border border-white/10 bg-white/5 p-5">
        <Text className="text-xs font-semibold uppercase tracking-widest text-[#8a7a6a]">Correo</Text>
        <Text className="mt-1 text-lg text-[#f5e6d3]">{user.email}</Text>
        <Text className="mt-4 text-xs text-[#6b5d52]">ID: {user.id.slice(0, 8)}…</Text>
      </View>
      <Pressable
        onPress={async () => {
          await signOut();
          router.replace('/(tabs)');
        }}
        className="mt-8 flex-row items-center justify-center gap-2 rounded-2xl border border-red-400/40 py-4 active:opacity-80">
        <Ionicons name="log-out-outline" size={22} color="#fca5a5" />
        <Text className="text-base font-semibold text-red-300">Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}
