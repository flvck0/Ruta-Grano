import type { CafeMapProps } from '@/lib/types/cafe';
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

const DEFAULT_CENTER: [number, number] = [-70.6693, -33.4489];

function isValidLngLat(coord: any): coord is [number, number] {
  if (!Array.isArray(coord) || coord.length !== 2) return false;
  return typeof coord[0] === 'number' && !Number.isNaN(coord[0]) &&
         typeof coord[1] === 'number' && !Number.isNaN(coord[1]);
}

/** Inject marker and mapbox CSS once */
function injectStyles() {
  // Inject Mapbox Core CSS if missing
  if (typeof document !== 'undefined' && !document.getElementById('mapbox-gl-css')) {
    const link = document.createElement('link');
    link.id = 'mapbox-gl-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/mapbox-gl@2.15.0/dist/mapbox-gl.css';
    document.head.appendChild(link);
  }

  // Inject Custom Markers CSS
  if (typeof document !== 'undefined' && !document.getElementById('ruta-grano-markers')) {
  const style = document.createElement('style');
  style.id = 'ruta-grano-markers';
  style.textContent = `
    .rg-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.15s ease;
    }
    .rg-marker:hover {
      transform: scale(1.12) translateY(-2px);
      z-index: 10 !important;
    }
    .rg-marker-pin {
      width: 38px;
      height: 38px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2.5px solid #fff;
      box-shadow: 0 3px 10px rgba(0,0,0,0.25);
      transition: all 0.15s ease;
    }
    .rg-marker.selected .rg-marker-pin {
      width: 44px;
      height: 44px;
      border-color: #fbbf24;
      border-width: 3px;
      box-shadow: 0 4px 16px rgba(251,191,36,0.35);
    }
    .rg-marker-icon {
      transform: rotate(45deg);
      font-size: 16px;
      line-height: 1;
      filter: drop-shadow(0 1px 1px rgba(0,0,0,0.2));
    }
    .rg-marker.selected .rg-marker-icon {
      font-size: 19px;
    }
    .rg-marker-label {
      margin-top: 4px;
      padding: 2px 8px;
      border-radius: 10px;
      background: rgba(28,20,16,0.85);
      color: #f5e6d3;
      font-size: 11px;
      font-weight: 600;
      white-space: nowrap;
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .rg-marker:hover .rg-marker-label,
    .rg-marker.selected .rg-marker-label {
      opacity: 1;
    }
    .rg-marker-hot .rg-marker-pin {
      box-shadow: 0 3px 10px rgba(0,0,0,0.25), 0 0 14px rgba(249,115,22,0.35);
    }
  `;
  document.head.appendChild(style);
}
}

function createMarkerElement(
  cafe: { name: string; hot?: boolean },
  isSelected: boolean
): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = `rg-marker${isSelected ? ' selected' : ''}${cafe.hot ? ' rg-marker-hot' : ''}`;

  const pin = document.createElement('div');
  pin.className = 'rg-marker-pin';
  pin.style.background = cafe.hot
    ? 'linear-gradient(135deg, #f97316, #ef4444)'
    : 'linear-gradient(135deg, #D4A574, #A67C52)';

  const icon = document.createElement('span');
  icon.className = 'rg-marker-icon';
  icon.textContent = '☕';

  pin.appendChild(icon);
  wrapper.appendChild(pin);

  const label = document.createElement('div');
  label.className = 'rg-marker-label';
  label.textContent = cafe.name;
  wrapper.appendChild(label);

  return wrapper;
}

export function CafeMap({ markers, center, selectedId, onSelectCafe }: CafeMapProps) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const onSelectRef = useRef(onSelectCafe);
  onSelectRef.current = onSelectCafe;

  const safeCenter = isValidLngLat(center) ? center : DEFAULT_CENTER;

  // INIT map once
  useEffect(() => {
    const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const el = mapElRef.current;
    
    if (!token || !el || typeof window === 'undefined') return;

    injectStyles();
    mapboxgl.accessToken = token;

    let map: mapboxgl.Map;
    let clickHandler: any;
    let resizeObserver: ResizeObserver | null = null;

    try {
      map = new mapboxgl.Map({
        container: el,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: safeCenter,
        zoom: 13,
        attributionControl: true,
      });

      mapRef.current = map;
      clickHandler = () => onSelectRef.current(null);
      map.on('click', clickHandler);

      // Force resize observation in case dynamic CSS loads late
      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          if (map) map.resize();
        });
        resizeObserver.observe(el);
      } else {
        // Fallback for older browsers
        setTimeout(() => map && map.resize(), 500);
        setTimeout(() => map && map.resize(), 1500);
      }
    } catch (e) {
      console.error("MAPBOX FATAL CRASH:", e);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (map) {
        if (clickHandler) map.off('click', clickHandler);
        map.remove();
      }
      mapRef.current = null;
    };
  }, []);

  // UPDATE markers when data or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const cafe of markers) {
      if (!isValidLngLat(cafe.coordinate)) continue;

      const el = createMarkerElement(cafe, selectedId === cafe.id);

      // Click handler on the wrapper div
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectCafe(cafe.id);
      });

      // Use 'bottom' anchor so the tip of the pin sits on the coordinates
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(cafe.coordinate)
        .addTo(map);

      markersRef.current.push(marker);
    }
  }, [markers, selectedId, onSelectCafe]);

  // FLY TO on selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const selected = markers.find((m) => m.id === selectedId);
    if (selected && isValidLngLat(selected.coordinate)) {
      map.flyTo({ center: selected.coordinate, zoom: 15, essential: true });
    } else {
      map.flyTo({ center: isValidLngLat(center) ? center : DEFAULT_CENTER, zoom: 13, essential: true });
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
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#1c1410' }}>
      <div
        ref={mapElRef as any}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </View>
  );
}
