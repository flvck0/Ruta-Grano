import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { SelectModal } from '@/components/ui/SelectModal';
import { useChileLocations } from '@/hooks/useChileLocations';

export default function AddCafeScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState('');
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [comuna, setComuna] = useState('');
  const [region, setRegion] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(0);
  
  const { regions, loading: loadingLocations, error: locError } = useChileLocations();
  
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getLocation() {
    setLocating(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Se requiere permiso de ubicación para añadir cafeterías.');
        setLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({ lat: location.coords.latitude, lng: location.coords.longitude });
    } catch (e: any) {
      setError('No se pudo obtener la ubicación: ' + e.message);
    }
    setLocating(false);
  }

  async function saveCafe() {
    if (!name.trim() || !calle.trim() || !numero.trim() || !comuna || !region || rating === 0) {
      setError('Por favor completa todos los campos obligatorios y tu calificación.');
      return;
    }
    setSaving(true);
    setError(null);

    const combinedAddress = `${calle.trim()} ${numero.trim()}, ${comuna}, ${region}, Chile`;

    let finalLocation = location;
    if (!finalLocation) {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(combinedAddress)}.json?access_token=${process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN}&limit=1&country=cl`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          finalLocation = { lat, lng };
        } else {
          setError('No pudimos encontrar las coordenadas para esta dirección. Por favor, verifica los datos o usa el GPS.');
          setSaving(false);
          return;
        }
      } catch (e) {
        setError('Error de red al buscar la dirección.');
        setSaving(false);
        return;
      }
    }

    const { error: rpcError } = await supabase.rpc('create_cafeteria', {
      p_name: name.trim(),
      p_description: description.trim() || null,
      p_address: combinedAddress,
      p_lat: finalLocation.lat,
      p_lng: finalLocation.lng,
      p_rating: rating
    });

    setSaving(false);

    if (rpcError) {
      setError(rpcError.message);
    } else {
      if (typeof window !== 'undefined') alert('¡Cafetería añadida con éxito!');
      router.back();
    }
  }

  if (!user) {
    return (
      <View className="flex-1 bg-[#1c1410] items-center justify-center p-6">
        <Text className="text-[#f5e6d3] text-lg text-center">Debes iniciar sesión para añadir cafeterías.</Text>
        <Pressable onPress={() => router.back()} className="mt-4 bg-[#D4A574] px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Volver</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1c1410]">
      <View className="flex-row items-center justify-between px-4 py-4 border-b border-white/10">
        <Text className="text-xl font-bold text-[#f5e6d3]">Añadir Cafetería</Text>
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="close" size={24} color="#8a7a6a" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        {error && (
          <View className="mb-4 bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex-row items-center gap-3">
            <Ionicons name="alert-circle" size={20} color="#f87171" />
            <Text className="text-red-300 flex-1">{error}</Text>
          </View>
        )}
        
        {locError && (
          <View className="mb-4 bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex-row items-center gap-3">
            <Ionicons name="warning" size={20} color="#f97316" />
            <Text className="text-orange-300 flex-1">No se pudieron cargar las comunas. ({locError})</Text>
          </View>
        )}

        <Text className="text-[#D4A574] font-semibold mb-2">Nombre de la Cafetería</Text>
        <TextInput
          className="bg-[#2a1f18] border border-white/10 text-[#f5e6d3] px-4 py-3.5 rounded-2xl mb-5 text-base"
          placeholder="Ej. Café del Valle"
          placeholderTextColor="#6b5d52"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-[#D4A574] font-semibold mb-2 mt-4">Dirección</Text>
        <View className="flex-row gap-3 mb-4">
          <TextInput
            className="flex-1 bg-[#2a1f18] border border-white/10 text-[#f5e6d3] px-4 py-3.5 rounded-2xl text-base"
            placeholder="Calle (Ej. Av. Providencia)"
            placeholderTextColor="#6b5d52"
            value={calle}
            onChangeText={setCalle}
          />
          <TextInput
            className="w-24 bg-[#2a1f18] border border-white/10 text-[#f5e6d3] px-4 py-3.5 rounded-2xl text-base"
            placeholder="Nº"
            placeholderTextColor="#6b5d52"
            value={numero}
            onChangeText={setNumero}
            keyboardType="numeric"
          />
        </View>

        <View className="flex-row gap-3 mb-5">
          <View className="flex-1">
             <SelectModal 
                title="Región" 
                items={regions.map(r => r.name)} 
                selectedValue={region} 
                onSelect={(val) => { setRegion(val); setComuna(''); }} 
                placeholder={loadingLocations ? "Cargando..." : "Región"}
                disabled={loadingLocations}
             />
          </View>
          <View className="flex-1">
             <SelectModal 
                title="Comuna" 
                items={region ? (regions.find(r => r.name === region)?.comunas.map(c => c.name) || []) : []} 
                selectedValue={comuna} 
                onSelect={setComuna} 
                placeholder="Comuna"
                disabled={!region || loadingLocations}
             />
          </View>
        </View>

        <Text className="text-[#D4A574] font-semibold mb-2">Tu Calificación</Text>
        <View className="flex-row items-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)} className="active:opacity-70 p-1">
              <Ionicons
                name="cafe"
                size={32}
                color={star <= rating ? '#fbbf24' : '#6b5d52'}
              />
            </Pressable>
          ))}
          {rating > 0 && <Text className="ml-3 text-[#fbbf24] font-bold text-lg">{rating}/5</Text>}
        </View>

        <Text className="text-[#D4A574] font-semibold mb-2">Descripción (Opcional)</Text>
        <TextInput
          className="bg-[#2a1f18] border border-white/10 text-[#f5e6d3] px-4 py-3.5 rounded-2xl mb-5 text-base min-h-[100px]"
          placeholder="¿Qué la hace especial? Ej. Tienen excelente espresso."
          placeholderTextColor="#6b5d52"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <Text className="text-[#D4A574] font-semibold mb-2">Ubicación en el Mapa</Text>
        {location ? (
          <View className="bg-green-500/10 border border-green-500/20 px-4 py-4 rounded-2xl mb-8 flex-row items-center gap-3">
            <Ionicons name="location" size={24} color="#10b981" />
            <View>
              <Text className="text-[#10b981] font-bold">Ubicación capturada</Text>
              <Text className="text-green-200/70 text-xs">Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}</Text>
            </View>
          </View>
        ) : (
          <Pressable 
            onPress={getLocation} 
            disabled={locating}
            className="bg-white/5 border border-white/10 px-4 py-4 rounded-2xl mb-8 flex-row items-center justify-center gap-2 active:opacity-70"
          >
            {locating ? <ActivityIndicator color="#D4A574" /> : <Ionicons name="locate" size={20} color="#D4A574" />}
            <Text className="text-[#D4A574] font-semibold">
              {locating ? 'Obteniendo GPS...' : 'Usar mi ubicación actual (Opcional)'}
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={saveCafe}
          disabled={saving || !name || !calle || !numero || !comuna || !region || rating === 0}
          className="bg-[#D4A574] py-4 rounded-2xl flex-row items-center justify-center gap-2 active:opacity-90 disabled:opacity-50"
        >
          {saving ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text className="text-white font-bold text-lg">Guardar Cafetería</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
