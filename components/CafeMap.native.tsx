import type { CafeMapProps } from '@/lib/types/cafe';
import { useEffect, useState, type ComponentType } from 'react';
import { NativeModules, Text, View } from 'react-native';

/**
 * Expo Go no incluye el binario nativo de @rnmapbox/maps.
 * No importamos el paquete aquí: al cargarse ejecuta RNMBXModule y crashea si no hay nativo.
 */
function hasMapboxNativeModule(): boolean {
  return NativeModules.RNMBXModule != null;
}

export function CafeMap(props: CafeMapProps) {
  const [MapboxScreen, setMapboxScreen] = useState<ComponentType<CafeMapProps> | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const canUseMapbox = hasMapboxNativeModule();

  useEffect(() => {
    if (!canUseMapbox) {
      return;
    }
    let cancelled = false;
    import('./CafeMapMapboxImpl')
      .then((mod) => {
        if (!cancelled) {
          setMapboxScreen(() => mod.CafeMapMapboxImpl);
        }
      })
      .catch((e: Error) => {
        if (!cancelled) {
          setLoadError(e?.message ?? String(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [canUseMapbox]);

  if (!canUseMapbox) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950 px-5">
        <Text className="mb-3 text-center text-lg font-semibold text-white">Mapa no disponible en esta app</Text>
        <Text className="text-center text-base leading-6 text-neutral-300">
          Estás usando <Text className="font-medium text-amber-400">Expo Go</Text> o un build sin Mapbox.{'\n\n'}
          <Text className="text-neutral-200">@rnmapbox/maps</Text> necesita código nativo compilado en tu propia app
          (development build o store build), no el cliente genérico de Expo.
        </Text>
        <Text className="mt-6 text-center text-sm leading-5 text-neutral-400">
          En Windows + iPhone: usa <Text className="font-mono text-neutral-200">eas build --profile development --platform ios</Text>
          , instala el .ipa en el dispositivo y abre el proyecto con{' '}
          <Text className="font-mono text-neutral-200">npx expo start --dev-client</Text>.{'\n\n'}
          Con Mac local: <Text className="font-mono text-neutral-200">npx expo prebuild</Text> y{' '}
          <Text className="font-mono text-neutral-200">npx expo run:ios</Text>.
        </Text>
        <Text className="mt-4 text-center text-xs text-neutral-500">
          https://rnmapbox.github.io/docs/install?rebuild=expo#rebuild
        </Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950 px-6">
        <Text className="text-center text-base text-red-300">No se pudo cargar el mapa: {loadError}</Text>
      </View>
    );
  }

  if (!MapboxScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-950">
        <Text className="text-neutral-400">Cargando mapa…</Text>
      </View>
    );
  }

  return <MapboxScreen {...props} />;
}
