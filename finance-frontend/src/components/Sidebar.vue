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
  TrendingUp,
  ArrowRightLeft,
  Sun,
  Moon,
} from 'lucide-vue-next';
import { useTheme } from '../composables/useTheme';
import NalaraLogo from './ui/NalaraLogo.vue';

const props = defineProps<{
  activeSection?: 'ringkasan' | 'analitik' | 'anggaran' | 'tabungan' | 'transaksi';
  timezone?: string;
  userName?: string;
  userEmail?: string;
}>();

const emit = defineEmits<{
  (e: 'navigate', section: 'ringkasan' | 'analitik' | 'anggaran' | 'tabungan' | 'transaksi'): void;
  (e: 'openCreateTransaction', type?: 'income' | 'expense'): void;
  (e: 'openSimulator'): void;
  (e: 'openRecurring'): void;
  (e: 'openMonthEndReview'): void;
  (e: 'openManage'): void;
  (e: 'openProfile'): void;
  (e: 'openWallets'): void;
  (e: 'openTransfer'): void;
  (e: 'logout'): void;
}>();

const { isDark, toggleTheme } = useTheme();
</script>

<template>
  <aside
    class="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-[#16201A] border-r border-emerald-950/10 dark:border-[#243329] z-30 justify-between select-none shadow-[4px_0_24px_-8px_rgba(24,61,43,0.06)] dark:shadow-none transition-colors duration-200"
    aria-label="Navigasi Desktop">
    <!-- Top Area: Brand & Navigation -->
    <div class="flex-1 flex flex-col overflow-y-auto px-4 py-5 space-y-6">
      <!-- Brand Monogram & App Title -->
      <div class="flex items-center space-x-3 px-2">
        <NalaraLogo :with-badge="true" size="md" />
        <div class="min-w-0">
          <h1 class="text-sm font-bold tracking-tight text-[#18221B] dark:text-[#F0F4F1] truncate">Nalara</h1>
          <div class="flex items-center space-x-1.5 mt-0.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[10px] text-[#18221B]/55 dark:text-[#98A79D] font-medium">Fintech Live</span>
          </div>
        </div>
      </div>

      <!-- Quick Action: Catat Transaksi Button -->
      <div class="px-1">
        <button type="button" @click="emit('openCreateTransaction')"
          class="tactile-btn w-full py-2.5 px-3.5 bg-[#183D2B] hover:bg-[#204e37] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center space-x-2 transition cursor-pointer">
          <Plus class="w-4 h-4 text-[#B8DF38]" />
          <span>Catat Transaksi</span>
        </button>
      </div>

      <!-- Group 1: Navigasi Halaman / Seksi -->
      <div class="space-y-1">
        <p class="px-2.5 text-[10px] font-bold text-[#18221B]/40 dark:text-[#98A79D]/70 uppercase tracking-wider">
          Navigasi Utama
        </p>

        <!-- 1. Ringkasan -->
        <button type="button" @click="emit('navigate', 'ringkasan')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          :class="activeSection === 'ringkasan'
            ? 'bg-[#183D2B]/10 dark:bg-[#B8DF38]/15 text-[#183D2B] dark:text-[#B8DF38] font-bold'
            : 'text-[#18221B]/70 dark:text-[#F0F4F1]/70 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1]'">
          <LayoutDashboard class="w-4 h-4 shrink-0"
            :class="activeSection === 'ringkasan' ? 'text-[#183D2B] dark:text-[#B8DF38]' : 'text-[#18221B]/50 dark:text-[#98A79D]'" />
          <span class="truncate">Ringkasan Saldo</span>
        </button>

        <!-- 2. Tabungan -->
        <button type="button" @click="emit('navigate', 'tabungan')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          :class="activeSection === 'tabungan'
            ? 'bg-[#183D2B]/10 dark:bg-[#B8DF38]/15 text-[#183D2B] dark:text-[#B8DF38] font-bold'
            : 'text-[#18221B]/70 dark:text-[#F0F4F1]/70 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1]'">
          <Target class="w-4 h-4 shrink-0"
            :class="activeSection === 'tabungan' ? 'text-[#183D2B] dark:text-[#B8DF38]' : 'text-[#18221B]/50 dark:text-[#98A79D]'" />
          <span class="truncate">Tabungan & Impian</span>
        </button>

        <!-- 3. Anggaran -->
        <button type="button" @click="emit('navigate', 'anggaran')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          :class="activeSection === 'anggaran'
            ? 'bg-[#183D2B]/10 dark:bg-[#B8DF38]/15 text-[#183D2B] dark:text-[#B8DF38] font-bold'
            : 'text-[#18221B]/70 dark:text-[#F0F4F1]/70 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1]'">
          <PieChart class="w-4 h-4 shrink-0"
            :class="activeSection === 'anggaran' ? 'text-[#183D2B] dark:text-[#B8DF38]' : 'text-[#18221B]/50 dark:text-[#98A79D]'" />
          <span class="truncate">Anggaran</span>
        </button>

        <!-- 4. Analitik & Tren -->
        <button type="button" @click="emit('navigate', 'analitik')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          :class="activeSection === 'analitik'
            ? 'bg-[#183D2B]/10 dark:bg-[#B8DF38]/15 text-[#183D2B] dark:text-[#B8DF38] font-bold'
            : 'text-[#18221B]/70 dark:text-[#F0F4F1]/70 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1]'">
          <TrendingUp class="w-4 h-4 shrink-0"
            :class="activeSection === 'analitik' ? 'text-[#183D2B] dark:text-[#B8DF38]' : 'text-[#18221B]/50 dark:text-[#98A79D]'" />
          <span class="truncate">Analitik & Tren</span>
        </button>

        <!-- 5. Transaksi -->
        <button type="button" @click="emit('navigate', 'transaksi')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
          :class="activeSection === 'transaksi'
            ? 'bg-[#183D2B]/10 dark:bg-[#B8DF38]/15 text-[#183D2B] dark:text-[#B8DF38] font-bold'
            : 'text-[#18221B]/70 dark:text-[#F0F4F1]/70 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1]'">
          <ReceiptText class="w-4 h-4 shrink-0"
            :class="activeSection === 'transaksi' ? 'text-[#183D2B] dark:text-[#B8DF38]' : 'text-[#18221B]/50 dark:text-[#98A79D]'" />
          <span class="truncate">Riwayat Transaksi</span>
        </button>
      </div>

      <!-- Group 2: Alat Finansial -->
      <div class="space-y-1 pt-1">
        <p class="px-2.5 text-[10px] font-bold text-[#18221B]/40 dark:text-[#98A79D]/70 uppercase tracking-wider">
          Alat & Evaluasi
        </p>

        <!-- Simulator Modal -->
        <button type="button" @click="emit('openSimulator')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#18221B]/75 dark:text-[#F0F4F1]/75 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1] transition cursor-pointer">
          <Calculator class="w-4 h-4 shrink-0 text-emerald-600 dark:text-[#B8DF38]" />
          <span class="truncate">Simulasi KPR & Target</span>
        </button>

        <!-- Transaksi Berulang (Modul 5) -->
        <button type="button" @click="emit('openRecurring')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#18221B]/75 dark:text-[#F0F4F1]/75 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1] transition cursor-pointer">
          <Clock class="w-4 h-4 shrink-0 text-emerald-600 dark:text-[#B8DF38]" />
          <span class="truncate">Transaksi Berulang</span>
        </button>

        <!-- Pindah Dana / Transfer (Modul 6) -->
        <button type="button" @click="emit('openTransfer')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#18221B]/75 dark:text-[#F0F4F1]/75 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1] transition cursor-pointer">
          <ArrowRightLeft class="w-4 h-4 shrink-0 text-emerald-600 dark:text-[#B8DF38]" />
          <span class="truncate">Pindah Dana Antar Akun</span>
        </button>

        <!-- Review Akhir Bulan -->
        <button type="button" @click="emit('openMonthEndReview')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#18221B]/75 dark:text-[#F0F4F1]/75 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1] transition cursor-pointer">
          <CalendarCheck class="w-4 h-4 shrink-0 text-emerald-600 dark:text-[#B8DF38]" />
          <span class="truncate">Review Akhir Bulan</span>
        </button>
      </div>

      <!-- Group 3: Pengaturan -->
      <div class="space-y-1 pt-1">
        <p class="px-2.5 text-[10px] font-bold text-[#18221B]/40 dark:text-[#98A79D]/70 uppercase tracking-wider">
          Pengaturan
        </p>

        <!-- Dompet & Rekening Fisik (Modul 6) -->
        <button type="button" @click="emit('openWallets')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#18221B]/75 dark:text-[#F0F4F1]/75 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1] transition cursor-pointer">
          <Wallet class="w-4 h-4 shrink-0 text-[#18221B]/50 dark:text-[#98A79D]" />
          <span class="truncate">Dompet & Rekening Fisik</span>
        </button>

        <!-- Kategori & Pos Dana -->
        <button type="button" @click="emit('openManage')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#18221B]/75 dark:text-[#F0F4F1]/75 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1] transition cursor-pointer">
          <Tag class="w-4 h-4 shrink-0 text-[#18221B]/50 dark:text-[#98A79D]" />
          <span class="truncate">Kategori & Pos Dana</span>
        </button>

        <!-- Profil & Saldo Awal -->
        <button type="button" @click="emit('openProfile')"
          class="tactile-btn w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium text-[#18221B]/75 dark:text-[#F0F4F1]/75 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1] transition cursor-pointer">
          <Wallet class="w-4 h-4 shrink-0 text-[#18221B]/50 dark:text-[#98A79D]" />
          <span class="truncate">Profil Keuangan</span>
        </button>

        <!-- Switch Mode Tampilan (Modul 9: Dark Mode) -->
        <button type="button" @click="toggleTheme"
          class="tactile-btn w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-[#18221B]/75 dark:text-[#F0F4F1]/75 hover:bg-canvas dark:hover:bg-[#0E1410] hover:text-[#18221B] dark:hover:text-[#F0F4F1] transition cursor-pointer mt-1"
          :title="isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'">
          <div class="flex items-center space-x-3 truncate">
            <Sun v-if="isDark" class="w-4 h-4 shrink-0 text-[#B8DF38]" />
            <Moon v-else class="w-4 h-4 shrink-0 text-[#18221B]/50" />
            <span class="truncate">{{ isDark ? 'Mode Gelap' : 'Mode Terang' }}</span>
          </div>
          <div class="w-8 h-4.5 rounded-full p-0.5 transition-colors" :class="isDark ? 'bg-[#B8DF38]' : 'bg-stone-200'">
            <div class="w-3.5 h-3.5 rounded-full transition-transform" :class="isDark ? 'translate-x-3.5 bg-[#0E1410]' : 'translate-x-0 bg-white shadow-2xs'"></div>
          </div>
        </button>
      </div>
    </div>

    <!-- Bottom Area: Profile & Logout -->
    <div class="p-4 border-t border-emerald-950/10 dark:border-[#243329] space-y-3 bg-canvas/30 dark:bg-[#0E1410]/50 transition-colors duration-200">
      <!-- Timezone Info Badge -->
      <div class="flex items-center space-x-2 px-2 py-1 text-[11px] text-[#18221B]/60 dark:text-[#98A79D] font-medium">
        <Clock class="w-3.5 h-3.5 text-emerald-800 dark:text-[#B8DF38] shrink-0" />
        <span class="truncate">{{ timezone || 'Asia/Jakarta' }}</span>
      </div>

      <!-- User Info & Logout Button -->
      <div class="flex items-center justify-between px-2 pt-1">
        <div class="flex items-center space-x-2.5 min-w-0">
          <div
            class="w-8 h-8 rounded-xl bg-[#183D2B]/10 dark:bg-[#B8DF38]/15 text-[#183D2B] dark:text-[#B8DF38] font-bold text-xs flex items-center justify-center shrink-0">
            {{ (userName || userEmail || 'U').charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold text-[#18221B] dark:text-[#F0F4F1] truncate">{{ userName || 'Memuat akun…' }}</p>
            <p v-if="userEmail" class="text-[10px] text-[#18221B]/50 dark:text-[#98A79D] truncate">{{ userEmail }}</p>
          </div>
        </div>

        <button type="button" @click="emit('logout')"
          class="tactile-btn p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer shrink-0"
          title="Keluar dari akun" aria-label="Keluar">
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </aside>
</template>
