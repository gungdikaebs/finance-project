<script setup lang="ts">
import {
  LayoutDashboard,
  PieChart,
  Target,
  ReceiptText,
  Calculator,
} from 'lucide-vue-next';

defineProps<{
  activeTab: 'ringkasan' | 'anggaran' | 'tabungan' | 'transaksi' | 'semua';
}>();

const emit = defineEmits<{
  (e: 'update:activeTab', tab: 'ringkasan' | 'anggaran' | 'tabungan' | 'transaksi' | 'semua'): void;
  (e: 'openSimulator'): void;
}>();
</script>

<template>
  <aside
    class="md:hidden fixed bottom-3 inset-x-3 sm:inset-x-6 max-w-md mx-auto z-40 glass-dock rounded-2xl border border-emerald-950/10 py-2 px-3 shadow-[0_12px_32px_-4px_rgba(24,61,43,0.18)]"
    aria-label="Navigasi Bawah Mobile"
  >
    <div class="flex justify-around items-center">
      <!-- Ringkasan -->
      <button
        type="button"
        @click="emit('update:activeTab', 'ringkasan')"
        class="tactile-btn flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-center cursor-pointer select-none"
        :class="activeTab === 'ringkasan' ? 'text-[#183D2B] font-extrabold' : 'text-stone-500 font-semibold hover:text-stone-700'"
      >
        <div class="relative">
          <LayoutDashboard class="w-5 h-5" :stroke-width="activeTab === 'ringkasan' ? 2.25 : 1.75" />
          <span
            v-if="activeTab === 'ringkasan'"
            class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#B8DF38] shadow-xs"
          ></span>
        </div>
        <span class="text-[10px] mt-1">Ringkasan</span>
      </button>

      <!-- Anggaran -->
      <button
        type="button"
        @click="emit('update:activeTab', 'anggaran')"
        class="tactile-btn flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-center cursor-pointer select-none"
        :class="activeTab === 'anggaran' ? 'text-[#183D2B] font-extrabold' : 'text-stone-500 font-semibold hover:text-stone-700'"
      >
        <div class="relative">
          <PieChart class="w-5 h-5" :stroke-width="activeTab === 'anggaran' ? 2.25 : 1.75" />
          <span
            v-if="activeTab === 'anggaran'"
            class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#B8DF38] shadow-xs"
          ></span>
        </div>
        <span class="text-[10px] mt-1">Anggaran</span>
      </button>

      <!-- Tabungan -->
      <button
        type="button"
        @click="emit('update:activeTab', 'tabungan')"
        class="tactile-btn flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-center cursor-pointer select-none"
        :class="activeTab === 'tabungan' ? 'text-[#183D2B] font-extrabold' : 'text-stone-500 font-semibold hover:text-stone-700'"
      >
        <div class="relative">
          <Target class="w-5 h-5" :stroke-width="activeTab === 'tabungan' ? 2.25 : 1.75" />
          <span
            v-if="activeTab === 'tabungan'"
            class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#B8DF38] shadow-xs"
          ></span>
        </div>
        <span class="text-[10px] mt-1">Tabungan</span>
      </button>

      <!-- Transaksi -->
      <button
        type="button"
        @click="emit('update:activeTab', 'transaksi')"
        class="tactile-btn flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-center cursor-pointer select-none"
        :class="activeTab === 'transaksi' ? 'text-[#183D2B] font-extrabold' : 'text-stone-500 font-semibold hover:text-stone-700'"
      >
        <div class="relative">
          <ReceiptText class="w-5 h-5" :stroke-width="activeTab === 'transaksi' ? 2.25 : 1.75" />
          <span
            v-if="activeTab === 'transaksi'"
            class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#B8DF38] shadow-xs"
          ></span>
        </div>
        <span class="text-[10px] mt-1">Transaksi</span>
      </button>

      <!-- Simulator Modal Trigger -->
      <button
        type="button"
        @click="emit('openSimulator')"
        class="tactile-btn flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-center text-[#183D2B] bg-[#B8DF38]/35 border border-[#B8DF38]/60 cursor-pointer select-none"
      >
        <Calculator class="w-5 h-5 text-[#183D2B]" :stroke-width="2" />
        <span class="text-[10px] font-bold mt-1">Simulator</span>
      </button>
    </div>
  </aside>
</template>
