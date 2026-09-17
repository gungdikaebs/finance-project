<script setup lang="ts">
defineProps<{
  activeTab: 'ringkasan' | 'anggaran' | 'tabungan' | 'transaksi' | 'semua';
}>();

const emit = defineEmits<{
  (e: 'update:activeTab', tab: 'ringkasan' | 'anggaran' | 'tabungan' | 'transaksi' | 'semua'): void;
  (e: 'openSimulator'): void;
}>();
</script>

<template>
  <nav
    class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-1.5 px-2 flex justify-around items-center shadow-lg transition-all"
    aria-label="Navigasi Bawah Seluler"
  >
    <button
      @click="emit('update:activeTab', 'ringkasan')"
      :class="activeTab === 'ringkasan' ? 'text-[#183D2B] font-bold' : 'text-gray-500 font-medium'"
      class="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition text-center cursor-pointer"
    >
      <span class="text-lg leading-none mb-0.5">🏠</span>
      <span class="text-[10px]">Ringkasan</span>
      <span v-if="activeTab === 'ringkasan'" class="w-1.5 h-1.5 rounded-full bg-[#183D2B] mt-0.5"></span>
    </button>

    <button
      @click="emit('update:activeTab', 'anggaran')"
      :class="activeTab === 'anggaran' ? 'text-[#183D2B] font-bold' : 'text-gray-500 font-medium'"
      class="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition text-center cursor-pointer"
    >
      <span class="text-lg leading-none mb-0.5">📊</span>
      <span class="text-[10px]">Anggaran</span>
      <span v-if="activeTab === 'anggaran'" class="w-1.5 h-1.5 rounded-full bg-[#183D2B] mt-0.5"></span>
    </button>

    <button
      @click="emit('update:activeTab', 'tabungan')"
      :class="activeTab === 'tabungan' ? 'text-[#183D2B] font-bold' : 'text-gray-500 font-medium'"
      class="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition text-center cursor-pointer"
    >
      <span class="text-lg leading-none mb-0.5">🎯</span>
      <span class="text-[10px]">Tabungan</span>
      <span v-if="activeTab === 'tabungan'" class="w-1.5 h-1.5 rounded-full bg-[#183D2B] mt-0.5"></span>
    </button>

    <button
      @click="emit('update:activeTab', 'transaksi')"
      :class="activeTab === 'transaksi' ? 'text-[#183D2B] font-bold' : 'text-gray-500 font-medium'"
      class="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition text-center cursor-pointer"
    >
      <span class="text-lg leading-none mb-0.5">💸</span>
      <span class="text-[10px]">Transaksi</span>
      <span v-if="activeTab === 'transaksi'" class="w-1.5 h-1.5 rounded-full bg-[#183D2B] mt-0.5"></span>
    </button>

    <button
      @click="emit('openSimulator')"
      class="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition text-center text-emerald-800 font-medium cursor-pointer"
    >
      <span class="text-lg leading-none mb-0.5">🧮</span>
      <span class="text-[10px]">Simulator</span>
    </button>
  </nav>
</template>
