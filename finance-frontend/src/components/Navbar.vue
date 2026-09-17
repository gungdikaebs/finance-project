<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  timezone?: string;
}>();

const emit = defineEmits<{
  (e: 'openSimulator'): void;
  (e: 'openMonthEndReview'): void;
  (e: 'openManage'): void;
  (e: 'openProfile'): void;
  (e: 'logout'): void;
}>();

const showMobileMenu = ref(false);
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-lg bg-[#183D2B] text-[#B8DF38] font-bold flex items-center justify-center text-sm shadow-inner">
          PK
        </div>
        <div>
          <h1 class="text-base font-bold text-[#202820] leading-tight">Project-Keuangan</h1>
          <span class="text-xs text-gray-500">{{ timezone || 'Asia/Makassar' }}</span>
        </div>
      </div>

      <!-- Desktop Action Buttons (md:flex) -->
      <div class="hidden md:flex items-center space-x-2">
        <button
          @click="emit('openSimulator')"
          class="px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition border border-emerald-300 cursor-pointer"
        >
          📊 Simulator KPR & Target
        </button>
        <button
          @click="emit('openMonthEndReview')"
          class="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition border border-amber-200 cursor-pointer"
        >
          Tinjauan Bulan Lalu
        </button>
        <button
          @click="emit('openManage')"
          class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
        >
          Kelola Kategori
        </button>
        <button
          @click="emit('openProfile')"
          class="px-3 py-1.5 text-xs font-medium text-[#183D2B] bg-[#183D2B]/10 hover:bg-[#183D2B]/20 rounded-lg transition font-semibold cursor-pointer"
        >
          Saldo Awal
        </button>
        <button
          @click="emit('logout')"
          class="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
        >
          Keluar
        </button>
      </div>

      <!-- Mobile Header Quick Actions (md:hidden) -->
      <div class="flex md:hidden items-center space-x-1.5">
        <button
          @click="emit('openProfile')"
          class="px-2.5 py-1.5 text-[11px] font-semibold text-[#183D2B] bg-[#183D2B]/10 rounded-lg transition cursor-pointer"
        >
          Saldo Awal
        </button>
        <button
          @click="showMobileMenu = !showMobileMenu"
          class="p-1.5 text-gray-700 bg-gray-100 rounded-lg transition cursor-pointer text-sm font-bold"
          aria-label="Menu Opsi"
        >
          ⚙️
        </button>
      </div>
    </div>

    <!-- Mobile Dropdown Menu -->
    <div
      v-if="showMobileMenu"
      class="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2 shadow-md animate-fadeIn"
    >
      <button
        @click="emit('openManage'); showMobileMenu = false;"
        class="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg flex items-center justify-between"
      >
        <span>🏷️ Kelola Kategori & Sumber</span>
        <span>›</span>
      </button>
      <button
        @click="emit('openMonthEndReview'); showMobileMenu = false;"
        class="w-full text-left px-3 py-2 text-xs font-medium text-amber-800 bg-amber-50 rounded-lg flex items-center justify-between"
      >
        <span>📋 Tinjauan Bulan Lalu</span>
        <span>›</span>
      </button>
      <button
        @click="emit('openSimulator'); showMobileMenu = false;"
        class="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 rounded-lg flex items-center justify-between"
      >
        <span>📊 Simulator KPR & Target</span>
        <span>›</span>
      </button>
      <button
        @click="emit('logout'); showMobileMenu = false;"
        class="w-full text-left px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg flex items-center justify-between"
      >
        <span>🚪 Keluar dari Aplikasi</span>
        <span>›</span>
      </button>
    </div>
  </header>
</template>
