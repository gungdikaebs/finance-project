<script setup lang="ts">
import { formatRupiah, formatDate } from '../utils/format';
import type { Transaction } from '../api/services';

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
  <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
    <div class="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-lg font-bold text-[#202820]">Riwayat Transaksi</h2>
        <p class="text-xs text-gray-500 mt-0.5">Catatan uang keluar dan masuk yang dapat dikoreksi atau dibatalkan.</p>
      </div>

      <!-- Filter Bar -->
      <div class="flex flex-wrap items-center gap-2">
        <select
          :value="currentMonth"
          @change="emit('update:currentMonth', Number(($event.target as HTMLSelectElement).value)); emit('changeFilter')"
          class="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 focus:outline-none cursor-pointer"
        >
          <option v-for="m in 12" :key="m" :value="m">
            Bulan {{ m }}
          </option>
        </select>

        <select
          :value="currentYear"
          @change="emit('update:currentYear', Number(($event.target as HTMLSelectElement).value)); emit('changeFilter')"
          class="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 focus:outline-none cursor-pointer"
        >
          <option :value="2025">2025</option>
          <option :value="2026">2026</option>
          <option :value="2027">2027</option>
        </select>

        <select
          :value="filterType"
          @change="emit('update:filterType', ($event.target as HTMLSelectElement).value); emit('changeFilter')"
          class="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Tipe</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>

        <select
          :value="filterStatus"
          @change="emit('update:filterStatus', ($event.target as HTMLSelectElement).value); emit('changeFilter')"
          class="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 focus:outline-none cursor-pointer"
        >
          <option value="">Semua Status</option>
          <option value="ACTIVE">Aktif Saja</option>
          <option value="CANCELLED">Dibatalkan Saja</option>
        </select>
      </div>
    </div>

    <!-- Tabel Riwayat -->
    <div v-if="transactions.length > 0" class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50/50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            <th class="py-3 px-4">Tanggal</th>
            <th class="py-3 px-4">Keterangan / Kategori</th>
            <th class="py-3 px-4">Sumber / Pos</th>
            <th class="py-3 px-4 text-right">Nominal</th>
            <th class="py-3 px-4 text-center">Status</th>
            <th class="py-3 px-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="trx in transactions"
            :key="trx.id"
            :class="trx.status === 'CANCELLED' ? 'opacity-50 bg-gray-50/30' : 'hover:bg-gray-50/50'"
            class="transition"
          >
            <td class="py-3 px-4 whitespace-nowrap text-xs text-gray-600">
              {{ formatDate(trx.date) }}
            </td>
            <td class="py-3 px-4">
              <div class="font-medium text-gray-900 text-xs">
                {{ trx.note || trx.category?.name || 'Transaksi' }}
              </div>
              <div class="flex items-center space-x-1.5 mt-0.5">
                <span class="text-[11px] text-gray-500">{{ trx.category?.name }}</span>
                <!-- Badge Grup Kategori -->
                <span
                  v-if="trx.groupSnapshot === 'NEED'"
                  class="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-semibold"
                >
                  Kebutuhan
                </span>
                <span
                  v-else-if="trx.groupSnapshot === 'WANT'"
                  class="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 font-semibold"
                >
                  Keinginan
                </span>
              </div>
            </td>
            <td class="py-3 px-4 text-xs text-gray-500">
              <span v-if="trx.typeSnapshot === 'INCOME'">
                {{ trx.incomeSource?.name || 'Pemasukan Umum' }}
              </span>
              <span v-else>
                <!-- Badge Sumber Dana Tabungan -->
                <span
                  v-if="trx.sourceGoal"
                  class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800"
                >
                  🎯 {{ trx.sourceGoal.name }}
                </span>
                <span v-else class="text-gray-400">Kas Bebas</span>
              </span>
            </td>
            <td class="py-3 px-4 text-right whitespace-nowrap">
              <span
                class="font-bold text-xs"
                :class="trx.typeSnapshot === 'INCOME' ? 'text-green-700' : 'text-gray-900'"
              >
                {{ trx.typeSnapshot === 'INCOME' ? '+' : '-' }} {{ formatRupiah(trx.amount) }}
              </span>
            </td>
            <td class="py-3 px-4 text-center whitespace-nowrap">
              <span
                v-if="trx.status === 'ACTIVE'"
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800"
              >
                Aktif
              </span>
              <span
                v-else
                class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-800"
              >
                Dibatalkan
              </span>
            </td>
            <td class="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
              <button
                v-if="trx.status === 'ACTIVE'"
                @click="emit('openEditTransaction', trx)"
                class="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 cursor-pointer"
              >
                Koreksi
              </button>
              <button
                v-if="trx.status === 'ACTIVE'"
                @click="emit('openCancelTransaction', trx)"
                class="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 cursor-pointer"
              >
                Batalkan
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State Transaksi dengan Aksi Langsung -->
    <div v-else class="text-center py-12 px-4 space-y-3">
      <div class="w-14 h-14 rounded-full bg-[#183D2B]/5 text-[#183D2B] flex items-center justify-center mx-auto text-2xl font-bold">
        🧾
      </div>
      <h3 class="text-base font-bold text-[#202820]">Belum Ada Transaksi</h3>
      <p class="text-xs text-gray-500 max-w-sm mx-auto">
        Mulai catat transaksi untuk mengontrol batas kebutuhan dan keinginan bulan ini secara akurat.
      </p>
      <div class="flex items-center justify-center gap-2 pt-2">
        <button
          @click="emit('openCreateIncome')"
          class="px-3.5 py-2 bg-[#B8DF38] text-[#183D2B] rounded-xl text-xs font-bold hover:bg-[#a3c82e] shadow-xs cursor-pointer transition"
        >
          + Catat Pemasukan
        </button>
        <button
          @click="emit('openCreateExpense')"
          class="px-3.5 py-2 bg-gray-100 text-gray-800 rounded-xl text-xs font-bold hover:bg-gray-200 shadow-xs cursor-pointer transition"
        >
          - Catat Pengeluaran
        </button>
      </div>
    </div>
  </div>
</template>
