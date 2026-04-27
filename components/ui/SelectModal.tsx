import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, TextInput } from 'react-native';

interface SelectModalProps {
  title: string;
  items: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SelectModal({ title, items, selectedValue, onSelect, placeholder = 'Seleccionar...', disabled }: SelectModalProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filteredItems = items.filter(i => i.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <Pressable 
        onPress={() => { if (!disabled) { setVisible(true); setSearch(''); } }}
        className={`bg-[#2a1f18] border border-white/10 px-4 py-3.5 rounded-2xl flex-row items-center justify-between ${disabled ? 'opacity-50' : ''}`}
      >
        <Text className={selectedValue ? 'text-[#f5e6d3] text-base' : 'text-[#6b5d52] text-base'}>
          {selectedValue || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#6b5d52" />
      </Pressable>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVisible(false)}>
        <View className="flex-1 bg-[#1c1410] pt-10">
          <View className="flex-row items-center justify-between px-5 pb-4 border-b border-white/10">
            <Text className="text-xl font-bold text-[#f5e6d3]">{title}</Text>
            <Pressable onPress={() => setVisible(false)} className="p-2">
              <Ionicons name="close" size={24} color="#8a7a6a" />
            </Pressable>
          </View>
          
          <View className="px-5 py-3 border-b border-white/10">
             <View className="flex-row items-center bg-[#2a1f18] rounded-xl px-3 py-2 border border-white/5">
                <Ionicons name="search" size={18} color="#6b5d52" />
                <TextInput 
                   className="flex-1 text-[#f5e6d3] ml-2 text-base"
                   placeholder="Buscar..."
                   placeholderTextColor="#6b5d52"
                   value={search}
                   onChangeText={setSearch}
                />
             </View>
          </View>

          <ScrollView className="flex-1">
            {filteredItems.map(item => (
              <Pressable
                key={item}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
                className={`px-5 py-4 border-b border-white/5 flex-row items-center justify-between ${selectedValue === item ? 'bg-[#D4A574]/10' : ''}`}
              >
                <Text className={`text-base ${selectedValue === item ? 'text-[#D4A574] font-bold' : 'text-[#d4c4b4]'}`}>{item}</Text>
                {selectedValue === item && <Ionicons name="checkmark" size={20} color="#D4A574" />}
              </Pressable>
            ))}
            {filteredItems.length === 0 && (
              <Text className="text-center text-[#8a7a6a] mt-10">No se encontraron resultados.</Text>
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
