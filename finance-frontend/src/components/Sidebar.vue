<script setup lang="ts">
import {
  LayoutDashboard,
  PieChart,
  Target,
  ReceiptText,
  Calculator,
  CalendarCheck,
  Tag,
  Wallet,
  Plus,
  LogOut,
  Clock,
} from 'lucide-vue-next';

const props = defineProps<{
  activeSection?: 'ringkasan' | 'anggaran' | 'tabungan' | 'transaksi';
  timezone?: string;
  userName?: string;
  userEmail?: string;
}>();

const emit = defineEmits<{
  (e: 'navigate', section: 'ringkasan' | 'anggaran' | 'tabungan' | 'transaksi'): void;
  (e: 'openCreateTransaction', type?: 'income' | 'expense'): void;
  (e: 'openSimulator'): void;
  (e: 'openMonthEndReview'): void;
  (e: 'openManage'): void;
  (e: 'openProfile'): void;
  (e: 'logout'): void;
}>();
</script>

<template>
  <aside
    class="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-emerald-950/10 z-30 justify-between select-none shadow-[4px_0_24px_-8px_rgba(24,61,43,0.06)]"
    aria-label="Navigasi Desktop"
  >
    <!-- Top Area: Brand & Navigation -->
    <div class="flex-1 flex flex-col overflow-y-auto px-4 py-5 space-y-6">
      <!-- Brand Monogram & App Title -->
      <div class="flex items-center space-x-3 px-2">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#183D2B] via-[#143425] to-[#0D2218] text-[#B8DF38] font-bold text-sm flex items-center justify-center shadow-md ring-2 ring-[#B8DF38]/20 tracking-wider shrink-0">
          PK
        </div>
        <div class="min-w-0">
          <h1 class="text-sm font-bold tracking-tight text-[#18221B] truncate">Project-Keuangan</h1>
          <div class="flex items-center space-x-1.5 mt-0.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[10px] text-[#18221B]/55 font-medium">Fintech Live</span>
          </div>
        </div>
      </div>

      <!-- Quick Action: Catat Transaksi Button -->
      <div class="px-1">
        <button
          type="button"
          @click="emit('openCreateTransaction')"
          class="tactile-btn w-full py-2.5 px-3.5 bg-[#183D2B] hover:bg-[#204e37] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition cursor-pointer"
        >
          <Plus class="w-4 h-4 text-[#B8DF38]" />
          <span>Catat Transaksi</span>
        </button>
      </div>

      <!-- Group 1: Navigasi Halaman / Seksi -->
      <div class="space-y-1">
        <p class="px-2.5 text-[10px] font-bold text-[#18221B]/40 uppercase tracking-wider">
          Navigasi Utama
        </p>

        <!-- Ringkasan -->
        <button
          type="button"
          @click="emit('navigate', 'ringkasan')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          :class="activeSection === 'ringkasan'
            ? 'bg-[#183D2B]/10 text-[#183D2B] font-bold'
            : 'text-[#18221B]/70 hover:bg-canvas hover:text-[#18221B]'"
        >
          <LayoutDashboard class="w-4 h-4 shrink-0" :class="activeSection === 'ringkasan' ? 'text-[#183D2B]' : 'text-[#18221B]/50'" />
          <span class="truncate">Ringkasan Saldo</span>
        </button>

        <!-- Anggaran -->
        <button
          type="button"
          @click="emit('navigate', 'anggaran')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          :class="activeSection === 'anggaran'
            ? 'bg-[#183D2B]/10 text-[#183D2B] font-bold'
            : 'text-[#18221B]/70 hover:bg-canvas hover:text-[#18221B]'"
        >
          <PieChart class="w-4 h-4 shrink-0" :class="activeSection === 'anggaran' ? 'text-[#183D2B]' : 'text-[#18221B]/50'" />
          <span class="truncate">Anggaran 50/30/20</span>
        </button>

        <!-- Tabungan -->
        <button
          type="button"
          @click="emit('navigate', 'tabungan')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          :class="activeSection === 'tabungan'
            ? 'bg-[#183D2B]/10 text-[#183D2B] font-bold'
            : 'text-[#18221B]/70 hover:bg-canvas hover:text-[#18221B]'"
        >
          <Target class="w-4 h-4 shrink-0" :class="activeSection === 'tabungan' ? 'text-[#183D2B]' : 'text-[#18221B]/50'" />
          <span class="truncate">Tabungan & Impian</span>
        </button>

        <!-- Transaksi -->
        <button
          type="button"
          @click="emit('navigate', 'transaksi')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          :class="activeSection === 'transaksi'
            ? 'bg-[#183D2B]/10 text-[#183D2B] font-bold'
            : 'text-[#18221B]/70 hover:bg-canvas hover:text-[#18221B]'"
        >
          <ReceiptText class="w-4 h-4 shrink-0" :class="activeSection === 'transaksi' ? 'text-[#183D2B]' : 'text-[#18221B]/50'" />
          <span class="truncate">Riwayat Transaksi</span>
        </button>
      </div>

      <!-- Group 2: Alat Finansial -->
      <div class="space-y-1 pt-1">
        <p class="px-2.5 text-[10px] font-bold text-[#18221B]/40 uppercase tracking-wider">
          Alat & Evaluasi
        </p>

        <!-- Simulator Modal -->
        <button
          type="button"
          @click="emit('openSimulator')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#18221B]/75 hover:bg-canvas hover:text-[#18221B] transition cursor-pointer"
        >
          <Calculator class="w-4 h-4 shrink-0 text-emerald-700" />
          <span class="truncate">Simulasi KPR & Target</span>
        </button>

        <!-- Review Akhir Bulan -->
        <button
          type="button"
          @click="emit('openMonthEndReview')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#18221B]/75 hover:bg-canvas hover:text-[#18221B] transition cursor-pointer"
        >
          <CalendarCheck class="w-4 h-4 shrink-0 text-emerald-700" />
          <span class="truncate">Review Akhir Bulan</span>
        </button>
      </div>

      <!-- Group 3: Pengaturan -->
      <div class="space-y-1 pt-1">
        <p class="px-2.5 text-[10px] font-bold text-[#18221B]/40 uppercase tracking-wider">
          Pengaturan
        </p>

        <!-- Kategori & Pos Dana -->
        <button
          type="button"
          @click="emit('openManage')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#18221B]/75 hover:bg-canvas hover:text-[#18221B] transition cursor-pointer"
        >
          <Tag class="w-4 h-4 shrink-0 text-[#18221B]/50" />
          <span class="truncate">Kategori & Pos Dana</span>
        </button>

        <!-- Profil & Saldo Awal -->
        <button
          type="button"
          @click="emit('openProfile')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#18221B]/75 hover:bg-canvas hover:text-[#18221B] transition cursor-pointer"
        >
          <Wallet class="w-4 h-4 shrink-0 text-[#18221B]/50" />
          <span class="truncate">Profil Keuangan</span>
        </button>
      </div>
    </div>

    <!-- Bottom Area: Profile & Logout -->
    <div class="p-4 border-t border-emerald-950/10 space-y-3 bg-canvas/30">
      <!-- Timezone Info Badge -->
      <div class="flex items-center space-x-2 px-2 py-1 text-[11px] text-[#18221B]/60 font-medium">
        <Clock class="w-3.5 h-3.5 text-emerald-800 shrink-0" />
        <span class="truncate">{{ timezone || 'Asia/Jakarta' }}</span>
      </div>

      <!-- User Info & Logout Button -->
      <div class="flex items-center justify-between px-2 pt-1">
        <div class="flex items-center space-x-2.5 min-w-0">
          <div class="w-8 h-8 rounded-xl bg-[#183D2B]/10 text-[#183D2B] font-bold text-xs flex items-center justify-center shrink-0">
            {{ (userName || userEmail || 'U').charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold text-[#18221B] truncate">{{ userName || 'Pengguna' }}</p>
            <p class="text-[10px] text-[#18221B]/50 truncate">{{ userEmail || 'Fintech User' }}</p>
          </div>
        </div>

        <button
          type="button"
          @click="emit('logout')"
          class="tactile-btn p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer shrink-0"
          title="Keluar dari akun"
          aria-label="Keluar"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>
</template>
