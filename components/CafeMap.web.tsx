import type { CafeMapProps } from '@/lib/types/cafe';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';

export function CafeMap({ markers, center, selectedId, onSelectCafe }: CafeMapProps) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const onSelectRef = useRef(onSelectCafe);
  onSelectRef.current = onSelectCafe;

  useEffect(() => {
    const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const el = mapElRef.current;
    if (!token || !el || typeof window === 'undefined') {
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: el,
      style: 'mapbox://styles/mapbox/streets-v11',
      center,
      zoom: 13,
      attributionControl: true,
    });

    mapRef.current = map;
    map.on('click', () => onSelectRef.current(null));

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once; center is applied in other effects
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const cafe of markers) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.style.width = '18px';
      dot.style.height = '18px';
      dot.style.borderRadius = '9999px';
      dot.style.border = '3px solid #fff';
      dot.style.boxShadow = '0 2px 8px rgba(0,0,0,0.35)';
      dot.style.backgroundColor = cafe.hot ? '#f97316' : '#b45309';
      dot.style.cursor = 'pointer';
      if (selectedId === cafe.id) {
        dot.style.transform = 'scale(1.15)';
        dot.style.borderColor = '#fbbf24';
      }
      dot.setAttribute('aria-label', cafe.name);
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectCafe(cafe.id);
      });

      const marker = new mapboxgl.Marker({ element: dot }).setLngLat(cafe.coordinate).addTo(map);
      markersRef.current.push(marker);
    }
  }, [markers, selectedId, onSelectCafe]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const selected = markers.find((m) => m.id === selectedId);
    if (selected) {
      map.flyTo({ center: selected.coordinate, zoom: 15, essential: true });
    } else {
      map.flyTo({ center, zoom: 13, essential: true });
    }
  }, [selectedId, markers, center]);

  const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token) {
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
    <View className="relative flex-1 bg-[#1c1410]">
      <div
        ref={mapElRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </View>
  );
}
