import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  userEmail: string | null;
  loadingCafes?: boolean;
};

export function MapFloatingHeader({ userEmail, loadingCafes }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View className="absolute left-0 right-0 top-0 z-10 px-4" style={{ paddingTop: Math.max(insets.top, 12) + 8 }}>
      <View className="flex-row items-center justify-between rounded-3xl border border-white/10 bg-[#1c1410]/88 px-4 py-3 backdrop-blur-md">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#c4836c]/30">
            <Ionicons name="cafe" size={24} color="#f5e6d3" />
          </View>
          <View>
            <Text className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c4836c]">Ruta Grano</Text>
            <Text className="text-base font-semibold text-[#f5e6d3]">Mapa cafeterías</Text>
            {loadingCafes ? (
              <Text className="text-xs text-[#8a7a6a]">Cargando pines…</Text>
            ) : (
              <Text className="text-xs text-[#8a7a6a]">Explora y deja tu check-in</Text>
            )}
          </View>
        </View>
        <Link href={userEmail ? '/cuenta' : '/login'} asChild>
          <Pressable className="flex-row items-center gap-2 rounded-2xl bg-white/10 px-3 py-2.5 active:opacity-80">
            <Ionicons name={userEmail ? 'person' : 'log-in-outline'} size={20} color="#e8c4b0" />
            <Text className="max-w-[96px] text-sm font-medium text-[#e8c4b0]" numberOfLines={1}>
              {userEmail ? userEmail.split('@')[0] : 'Entrar'}
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
