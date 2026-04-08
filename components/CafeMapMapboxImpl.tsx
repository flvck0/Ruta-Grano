import MapboxGL, { setAccessToken } from '@rnmapbox/maps';
import type { CafeMapProps } from '@/lib/types/cafe';
import { useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';

let mapboxTokenApplied = false;

function ensureMapboxToken() {
  const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) {
    return false;
  }
  if (!mapboxTokenApplied) {
    setAccessToken(token);
    mapboxTokenApplied = true;
  }
  return true;
}

export function CafeMapMapboxImpl({ markers, center, selectedId, onSelectCafe }: CafeMapProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(ensureMapboxToken());
  }, []);

  const cameraCenter = useMemo(() => {
    const sel = markers.find((m) => m.id === selectedId);
    return sel ? sel.coordinate : center;
  }, [markers, selectedId, center]);

  const zoomLevel = selectedId ? 15 : 13;

  if (!ready) {
    return (
      <View className="flex-1 items-center justify-center bg-[#1c1410] px-6">
        <Text className="text-center text-base text-[#d4c4b4]">
          Configura <Text className="font-mono text-[#e8c4b0]">EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN</Text> en{' '}
          <Text className="font-mono text-[#8a7a6a]">.env</Text>
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapboxGL.MapView
        style={{ flex: 1 }}
        styleURL={MapboxGL.StyleURL.Street}
        scaleBarEnabled={false}
        onPress={() => onSelectCafe(null)}>
        <MapboxGL.Camera zoomLevel={zoomLevel} centerCoordinate={cameraCenter} animationMode="easeTo" />
        {markers.map((cafe) => (
          <MapboxGL.PointAnnotation
            key={cafe.id}
            id={cafe.id}
            coordinate={cafe.coordinate}
            onSelected={() => onSelectCafe(cafe.id)}>
            <View
              className={`h-5 w-5 rounded-full border-[3px] ${
                selectedId === cafe.id ? 'border-amber-300' : 'border-white'
              } ${cafe.hot ? 'bg-orange-500' : 'bg-amber-700'}`}
              accessibilityLabel={cafe.name}
            />
          </MapboxGL.PointAnnotation>
        ))}
      </MapboxGL.MapView>
    </View>
  );
}
