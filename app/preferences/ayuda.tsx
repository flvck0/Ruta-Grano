import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function AyudaScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#1c1410] px-5 pt-10">
      {/* Top bar */}
      <View
        className="mb-8 flex-row items-center pb-4"
        style={{
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.08)',
        }}>
        <Pressable onPress={() => router.back()} className="mr-3 flex-row items-center justify-center rounded-xl p-2 active:opacity-80">
          <Ionicons name="chevron-back" size={24} color="#D4A574" />
        </Pressable>
        <Text className="text-xl font-semibold text-[#f5e6d3]">Ayuda y Soporte</Text>
      </View>

      <View className="items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-12">
        <Ionicons name="help-buoy-outline" size={48} color="#D4A574" style={{ opacity: 0.8 }} />
        <Text className="mt-4 text-center text-lg font-medium text-[#f5e6d3]">Próximamente</Text>
        <Text className="mt-2 px-6 text-center text-sm text-[#8a7a6a]">
          Aquí encontrarás preguntas frecuentes y cómo contactar con el equipo de soporte.
        </Text>
      </View>
    </View>
  );
}
