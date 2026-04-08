import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  userEmail: string | null;
  displayName: string | null;
  loadingCafes?: boolean;
};

export function MapFloatingHeader({ userEmail, displayName, loadingCafes }: Props) {
  const insets = useSafeAreaInsets();
  const label = displayName || (userEmail ? userEmail.split('@')[0] : null);

  return (
    <View className="absolute left-0 right-0 top-0 z-10 px-4" style={{ paddingTop: Math.max(insets.top, 12) + 8 }}>
      <View
        className="flex-row items-center justify-between rounded-3xl px-4 py-3"
        style={{
          backgroundColor: 'rgba(250,245,239,0.92)',
          borderWidth: 1,
          borderColor: 'rgba(180,160,140,0.3)',
          shadowColor: '#3D2B1F',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        }}>
        <View className="flex-row items-center gap-3">
          <View
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'rgba(212,165,116,0.18)' }}>
            <Ionicons name="cafe" size={24} color="#D4A574" />
          </View>
          <View>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 2, color: '#D4A574', textTransform: 'uppercase' }}>
              Ruta Grano
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#3D2B1F' }}>
              Mapa cafeterías
            </Text>
            {loadingCafes ? (
              <View className="flex-row items-center gap-1">
                <ActivityIndicator size="small" color="#D4A574" />
                <Text style={{ fontSize: 12, color: '#8a7a6a' }}>Cargando pines…</Text>
              </View>
            ) : (
              <Text style={{ fontSize: 12, color: '#8a7a6a' }}>Explora y deja tu check-in</Text>
            )}
          </View>
        </View>
        <Link href={userEmail ? '/cuenta' : '/login'} asChild>
          <Pressable
            className="flex-row items-center gap-2 rounded-2xl px-3 py-2.5 active:opacity-80"
            style={{ backgroundColor: 'rgba(212,165,116,0.12)' }}>
            <Ionicons name={userEmail ? 'person' : 'log-in-outline'} size={20} color="#A07850" />
            <Text className="max-w-[96px]" numberOfLines={1} style={{ fontSize: 14, fontWeight: '500', color: '#5C4033' }}>
              {label || 'Entrar'}
            </Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
