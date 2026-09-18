<script setup lang="ts">
import { formatRupiah, formatDate } from '../utils/format';
import type { Transaction } from '../api/services';
import {
  ReceiptText,
  Filter,
  Edit3,
  XCircle,
  Plus,
  Minus,
  Target,
} from 'lucide-vue-next';

defineProps<{
  transactions: Transaction[];
  currentMonth: number;
  currentYear: number;
  filterType: string;
  filterStatus: string;
}>();

const emit = defineEmits<{
  (e: 'update:currentMonth', val: number): void;
  (e: 'update:currentYear', val: number): void;
  (e: 'update:filterType', val: string): void;
  (e: 'update:filterStatus', val: string): void;
  (e: 'changeFilter'): void;
  (e: 'openEditTransaction', trx: Transaction): void;
  (e: 'openCancelTransaction', trx: Transaction): void;
  (e: 'openCreateIncome'): void;
  (e: 'openCreateExpense'): void;
}>();
</script>

<template>
  <div class="fintech-card rounded-2xl overflow-hidden">
    <!-- Header & Filter Bar -->
    <div class="p-5 sm:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-emerald-50 text-[#183D2B] flex items-center justify-center">
            <ReceiptText class="w-4 h-4" :stroke-width="2" />
          </div>
          <h2 class="text-base font-extrabold text-[#18221B]">Riwayat Transaksi</h2>
        </div>
        <p class="text-xs text-[#5E6961] mt-1 font-normal">
          Catatan arus uang aktual dengan dukungan koreksi dan pembatalan berjejak audit.
        </p>
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-1.5 bg-stone-100/80 px-2 py-1 rounded-xl border border-stone-200/70 text-stone-600 text-xs">
          <Filter class="w-3.5 h-3.5 text-stone-500" :stroke-width="1.75" />
          <span class="font-semibold text-[11px]">Filter:</span>
        </div>

        <select
          :value="currentMonth"
          @change="emit('update:currentMonth', Number(($event.target as HTMLSelectElement).value)); emit('changeFilter')"
          class="text-xs font-semibold border border-stone-200/80 rounded-xl px-2.5 py-1.5 bg-stone-50/80 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
        >
          <option v-for="m in 12" :key="m" :value="m">
            Bulan {{ m }}
          </option>
        </select>

        <select
          :value="currentYear"
          @change="emit('update:currentYear', Number(($event.target as HTMLSelectElement).value)); emit('changeFilter')"
          class="text-xs font-semibold border border-stone-200/80 rounded-xl px-2.5 py-1.5 bg-stone-50/80 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
        >
          <option :value="2025">2025</option>
          <option :value="2026">2026</option>
          <option :value="2027">2027</option>
        </select>

        <select
          :value="filterType"
          @change="emit('update:filterType', ($event.target as HTMLSelectElement).value); emit('changeFilter')"
          class="text-xs font-semibold border border-stone-200/80 rounded-xl px-2.5 py-1.5 bg-stone-50/80 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
        >
          <option value="">Semua Tipe</option>
          <option value="income">Pemasukan Saja</option>
          <option value="expense">Pengeluaran Saja</option>
        </select>

        <select
          :value="filterStatus"
          @change="emit('update:filterStatus', ($event.target as HTMLSelectElement).value); emit('changeFilter')"
          class="text-xs font-semibold border border-stone-200/80 rounded-xl px-2.5 py-1.5 bg-stone-50/80 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#183D2B]/20 cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>
      </div>
    </div>

    <!-- Tabel Riwayat Transaksi -->
    <div v-if="transactions.length > 0" class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b border-stone-100 bg-stone-50/60 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
            <th class="py-3 px-5">Tanggal</th>
            <th class="py-3 px-4">Keterangan / Kategori</th>
            <th class="py-3 px-4">Sumber / Pos Dana</th>
            <th class="py-3 px-4 text-right">Nominal</th>
            <th class="py-3 px-4 text-center">Status</th>
            <th class="py-3 px-5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-stone-100">
          <tr
            v-for="trx in transactions"
            :key="trx.id"
            :class="trx.status === 'CANCELLED' ? 'opacity-40 bg-stone-50/50 line-through' : 'hover:bg-stone-50/70'"
            class="transition-colors"
          >
            <!-- Tanggal -->
            <td class="py-3.5 px-5 whitespace-nowrap text-xs font-medium text-stone-600">
              {{ formatDate(trx.date) }}
            </td>

            <!-- Keterangan & Kategori -->
            <td class="py-3.5 px-4">
              <div class="font-bold text-[#18221B] text-xs">
                {{ trx.note || trx.category?.name || 'Transaksi' }}
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-[11px] text-stone-500 font-medium">{{ trx.category?.name || 'Umum' }}</span>
                <!-- Badge Grup Kategori -->
                <span
                  v-if="trx.groupSnapshot === 'NEED'"
                  class="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200/60"
                >
                  Kebutuhan
                </span>
                <span
                  v-else-if="trx.groupSnapshot === 'WANT'"
                  class="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200/60"
                >
                  Keinginan
                </span>
              </div>
            </td>

            <!-- Sumber / Pos Dana -->
            <td class="py-3.5 px-4 text-xs text-stone-600">
              <span v-if="trx.typeSnapshot === 'INCOME'" class="font-semibold text-emerald-800">
                {{ trx.incomeSource?.name || 'Pemasukan Umum' }}
              </span>
              <span v-else>
                <!-- Badge Sumber Dana Tabungan -->
                <span
                  v-if="trx.sourceGoal"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  <Target class="w-3 h-3 text-emerald-600" />
                  <span>{{ trx.sourceGoal.name }}</span>
                </span>
                <span v-else class="text-stone-400 font-medium">Kas Bebas</span>
              </span>
            </td>

            <!-- Nominal -->
            <td class="py-3.5 px-4 text-right whitespace-nowrap">
              <span
                class="font-black text-xs tabular-nums inline-flex items-center gap-0.5"
                :class="trx.typeSnapshot === 'INCOME' ? 'text-emerald-700' : 'text-[#18221B]'"
              >
                <span>{{ trx.typeSnapshot === 'INCOME' ? '+' : '-' }}</span>
                <span>{{ formatRupiah(trx.amount) }}</span>
              </span>
            </td>

            <!-- Status -->
            <td class="py-3.5 px-4 text-center whitespace-nowrap">
              <span
                v-if="trx.status === 'ACTIVE'"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
              >
                Aktif
              </span>
              <span
                v-else
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-600 border border-stone-200"
              >
                Dibatalkan
              </span>
            </td>

            <!-- Aksi -->
            <td class="py-3.5 px-5 text-right whitespace-nowrap">
              <div v-if="trx.status === 'ACTIVE'" class="inline-flex items-center gap-1">
                <button
                  type="button"
                  @click="emit('openEditTransaction', trx)"
                  class="tactile-btn text-xs text-blue-700 hover:text-blue-900 font-bold px-2 py-1 rounded-lg hover:bg-blue-50 cursor-pointer inline-flex items-center gap-1"
                  title="Koreksi Transaksi"
                >
                  <Edit3 class="w-3 h-3" />
                  <span>Koreksi</span>
                </button>
                <button
                  type="button"
                  @click="emit('openCancelTransaction', trx)"
                  class="tactile-btn text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 cursor-pointer inline-flex items-center gap-1"
                  title="Batalkan Transaksi"
                >
                  <XCircle class="w-3 h-3" />
                  <span>Batal</span>
                </button>
              </div>
              <span v-else class="text-[11px] text-stone-400 italic font-medium">Batal</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State Transaksi -->
    <div v-else class="text-center py-12 px-4 space-y-3">
      <div class="w-12 h-12 rounded-2xl bg-stone-100 text-[#183D2B] flex items-center justify-center mx-auto">
        <ReceiptText class="w-6 h-6" :stroke-width="1.75" />
      </div>
      <div>
        <h3 class="text-sm font-bold text-[#18221B]">Belum Ada Transaksi</h3>
        <p class="text-xs text-[#5E6961] max-w-sm mx-auto mt-1 leading-relaxed font-normal">
          Mulai catat transaksi pemasukan atau pengeluaran untuk memantau batas kebutuhan dan tabungan bulan ini.
        </p>
      </div>
      <div class="flex items-center justify-center gap-2 pt-2">
        <button
          type="button"
          @click="emit('openCreateIncome')"
          class="tactile-btn px-3.5 py-2 bg-[#B8DF38] text-[#183D2B] rounded-xl text-xs font-extrabold hover:bg-[#a3c82e] shadow-xs cursor-pointer inline-flex items-center gap-1"
        >
          <Plus class="w-3.5 h-3.5 text-[#183D2B]" :stroke-width="2.5" />
          <span>Catat Pemasukan</span>
        </button>
        <button
          type="button"
          @click="emit('openCreateExpense')"
          class="tactile-btn px-3.5 py-2 bg-stone-100 text-[#18221B] rounded-xl text-xs font-bold hover:bg-stone-200 border border-stone-200 shadow-xs cursor-pointer inline-flex items-center gap-1"
        >
          <Minus class="w-3.5 h-3.5 text-[#18221B]" :stroke-width="2.5" />
          <span>Catat Pengeluaran</span>
        </button>
      </div>
    </div>
  </div>
</template>
