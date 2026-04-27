import type { CafeMapProps } from '@/lib/types/cafe';
// @ts-ignore
import mapboxgl from 'mapbox-gl/dist/mapbox-gl.js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';

const DEFAULT_CENTER: [number, number] = [-70.6693, -33.4489];

function isValidLngLat(coord: any): coord is [number, number] {
  if (!Array.isArray(coord) || coord.length !== 2) return false;
  return typeof coord[0] === 'number' && !Number.isNaN(coord[0]) &&
         typeof coord[1] === 'number' && !Number.isNaN(coord[1]);
}

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (!document.getElementById('mapbox-gl-css')) {
    const link = document.createElement('link');
    link.id = 'mapbox-gl-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/mapbox-gl@2.15.0/dist/mapbox-gl.css';
    document.head.appendChild(link);
  }
  if (!document.getElementById('ruta-grano-markers')) {
    const style = document.createElement('style');
    style.id = 'ruta-grano-markers';
    style.textContent = `
      .rg-marker { display:flex; flex-direction:column; align-items:center; cursor:pointer; transition:transform .15s ease; }
      .rg-marker:hover { transform:scale(1.12) translateY(-2px); z-index:10!important; }
      .rg-marker-pin { width:38px; height:38px; border-radius:50% 50% 50% 0; transform:rotate(-45deg); display:flex; align-items:center; justify-content:center; border:2.5px solid #fff; box-shadow:0 3px 10px rgba(0,0,0,.25); }
      .rg-marker.selected .rg-marker-pin { width:44px; height:44px; border-color:#fbbf24; border-width:3px; box-shadow:0 4px 16px rgba(251,191,36,.35); }
      .rg-marker-icon { transform:rotate(45deg); font-size:16px; line-height:1; }
      .rg-marker.selected .rg-marker-icon { font-size:19px; }
      .rg-marker-label { margin-top:4px; padding:2px 8px; border-radius:10px; background:rgba(28,20,16,.85); color:#f5e6d3; font-size:11px; font-weight:600; white-space:nowrap; max-width:120px; overflow:hidden; text-overflow:ellipsis; pointer-events:none; opacity:0; transition:opacity .15s ease; }
      .rg-marker:hover .rg-marker-label, .rg-marker.selected .rg-marker-label { opacity:1; }
    `;
    document.head.appendChild(style);
  }
}

function createMarkerEl(name: string, hot: boolean | undefined, selected: boolean): HTMLElement {
  const w = document.createElement('div');
  w.className = `rg-marker${selected ? ' selected' : ''}`;
  const pin = document.createElement('div');
  pin.className = 'rg-marker-pin';
  pin.style.background = hot ? 'linear-gradient(135deg,#f97316,#ef4444)' : 'linear-gradient(135deg,#D4A574,#A67C52)';
  const ico = document.createElement('span');
  ico.className = 'rg-marker-icon';
  ico.textContent = '☕';
  pin.appendChild(ico);
  w.appendChild(pin);
  const lbl = document.createElement('div');
  lbl.className = 'rg-marker-label';
  lbl.textContent = name;
  w.appendChild(lbl);
  return w;
}

export function CafeMap({ markers, center, selectedId, onSelectCafe }: CafeMapProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const onSelectRef = useRef(onSelectCafe);
  const [mapReady, setMapReady] = useState(false);
  onSelectRef.current = onSelectCafe;

  const safeCenter = isValidLngLat(center) ? center : DEFAULT_CENTER;
  const token = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Use callback ref to init map when the DOM node is available
  const mapContainerRef = useCallback((node: HTMLDivElement | null) => {
    // Cleanup old map if any
    if (mapRef.current) {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      mapRef.current.remove();
      mapRef.current = null;
      setMapReady(false);
    }

    if (!node || !token || typeof window === 'undefined') return;

    injectStyles();
    mapboxgl.accessToken = token;

    try {
      const map = new mapboxgl.Map({
        container: node,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: safeCenter,
        zoom: 13,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

      mapRef.current = map;

      map.on('load', () => {
        setMapReady(true);
        map.resize();
      });

      map.on('click', () => onSelectRef.current(null));

      // ResizeObserver to automatically resize the map if the container changes
      // This fixes the 'bugeado' map canvas when returning from modals
      const resizeObserver = new ResizeObserver(() => {
        map.resize();
      });
      resizeObserver.observe(node);

      // Save observer to cleanup
      (map as any)._resizeObserver = resizeObserver;

      // Fallback resizes
      setTimeout(() => map.resize(), 500);
      setTimeout(() => map.resize(), 2000);
    } catch (e) {
      console.error('Mapbox init error:', e);
    }
  }, [token]);

  // Cleanup map when component unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        if ((mapRef.current as any)._resizeObserver) {
          (mapRef.current as any)._resizeObserver.disconnect();
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // UPDATE markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    for (const cafe of markers) {
      if (!isValidLngLat(cafe.coordinate)) continue;
      const el = createMarkerEl(cafe.name, cafe.hot, selectedId === cafe.id);
      el.addEventListener('click', (e) => { e.stopPropagation(); onSelectCafe(cafe.id); });
      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(cafe.coordinate)
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [markers, selectedId, onSelectCafe, mapReady]);

  // FLY TO
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    const sel = markers.find(m => m.id === selectedId);
    if (sel && isValidLngLat(sel.coordinate)) {
      map.flyTo({ center: sel.coordinate, zoom: 15, essential: true });
    }
  }, [selectedId, markers, mapReady]);

  if (!token) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1c1410', padding: 24 }}>
        <Text style={{ textAlign: 'center', fontSize: 14, color: '#d4c4b4' }}>
          Configura EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN en .env
        </Text>
      </View>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#1c1410',
      }}
    />
  );
}
