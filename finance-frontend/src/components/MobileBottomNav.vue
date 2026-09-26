<script setup lang="ts">
import {
  LayoutDashboard,
  Target,
  PieChart,
  ReceiptText,
  Menu,
} from 'lucide-vue-next';

defineProps<{
  activeTab: 'ringkasan' | 'analitik' | 'anggaran' | 'tabungan' | 'transaksi' | 'semua';
  menuOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:activeTab', tab: 'ringkasan' | 'analitik' | 'anggaran' | 'tabungan' | 'transaksi' | 'semua'): void;
  (e: 'openMenu'): void;
}>();
</script>

<template>
  <aside
    class="lg:hidden fixed bottom-safe inset-x-3 sm:inset-x-6 max-w-md mx-auto z-40 glass-dock rounded-2xl border border-emerald-950/10 dark:border-[#243329] py-2 px-3 shadow-[0_12px_32px_-4px_rgba(24,61,43,0.18)] dark:shadow-[0_12px_32px_-4px_rgba(0,0,0,0.6)] select-none transition-colors"
    aria-label="Navigasi Bawah Mobile"
  >
    <div class="flex justify-around items-center">
      <!-- 1. Ringkasan -->
      <button
        type="button"
        @click="emit('update:activeTab', 'ringkasan')"
        :aria-current="activeTab === 'ringkasan' ? 'page' : undefined"
        class="tactile-btn flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-center cursor-pointer select-none"
        :class="activeTab === 'ringkasan' ? 'text-[#183D2B] dark:text-[#B8DF38] font-extrabold' : 'text-stone-500 dark:text-[#98A79D] font-semibold hover:text-stone-700 dark:hover:text-[#F0F4F1]'"
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

      <!-- 2. Tabungan -->
      <button
        type="button"
        @click="emit('update:activeTab', 'tabungan')"
        :aria-current="activeTab === 'tabungan' ? 'page' : undefined"
        class="tactile-btn flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-center cursor-pointer select-none"
        :class="activeTab === 'tabungan' ? 'text-[#183D2B] dark:text-[#B8DF38] font-extrabold' : 'text-stone-500 dark:text-[#98A79D] font-semibold hover:text-stone-700 dark:hover:text-[#F0F4F1]'"
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

      <!-- 3. Anggaran -->
      <button
        type="button"
        @click="emit('update:activeTab', 'anggaran')"
        :aria-current="activeTab === 'anggaran' ? 'page' : undefined"
        class="tactile-btn flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-center cursor-pointer select-none"
        :class="activeTab === 'anggaran' ? 'text-[#183D2B] dark:text-[#B8DF38] font-extrabold' : 'text-stone-500 dark:text-[#98A79D] font-semibold hover:text-stone-700 dark:hover:text-[#F0F4F1]'"
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

      <!-- 4. Transaksi -->
      <button
        type="button"
        @click="emit('update:activeTab', 'transaksi')"
        :aria-current="activeTab === 'transaksi' ? 'page' : undefined"
        class="tactile-btn flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-center cursor-pointer select-none"
        :class="activeTab === 'transaksi' ? 'text-[#183D2B] dark:text-[#B8DF38] font-extrabold' : 'text-stone-500 dark:text-[#98A79D] font-semibold hover:text-stone-700 dark:hover:text-[#F0F4F1]'"
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

      <!-- 5. Menu & Pengaturan Trigger -->
      <button
        type="button"
        @click="emit('openMenu')"
        :aria-expanded="menuOpen"
        aria-haspopup="dialog"
        aria-label="Buka menu dan pengaturan"
        class="tactile-btn flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition text-center cursor-pointer select-none"
        :class="menuOpen
          ? 'text-[#183D2B] dark:text-[#B8DF38] font-extrabold'
          : 'text-stone-500 dark:text-[#98A79D] font-semibold hover:text-stone-700 dark:hover:text-[#F0F4F1]'"
        title="Buka menu & alat lainnya"
      >
        <div class="relative">
          <Menu class="w-5 h-5" :stroke-width="menuOpen ? 2.25 : 1.75" />
          <span
            v-if="menuOpen"
            class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#B8DF38] shadow-xs"
          ></span>
        </div>
        <span class="text-[10px] mt-1">Menu</span>
      </button>
    </div>
  </aside>
</template>
