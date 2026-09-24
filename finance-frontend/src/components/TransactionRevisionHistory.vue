<script setup lang="ts">
import type { TransactionRevision } from '../api/services';
import { formatDate, formatRupiah } from '../utils/format';

defineProps<{
  revisions: TransactionRevision[];
}>();
</script>

<template>
  <details v-if="revisions.length" class="group text-[11px] text-stone-600 dark:text-[#98A79D]">
    <summary class="w-fit cursor-pointer font-bold text-[#183D2B] dark:text-[#B8DF38] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183D2B]">
      Riwayat perubahan ({{ revisions.length }})
    </summary>
    <ol class="mt-2 space-y-2 border-l-2 border-stone-200 dark:border-[#344639] pl-3">
      <li v-for="revision in revisions" :key="revision.id" class="leading-relaxed">
        <p class="font-bold text-stone-700 dark:text-[#F0F4F1]">
          {{ revision.reason?.startsWith('Dibatalkan:') ? 'Pembatalan' : 'Koreksi' }} · {{ formatDate(revision.createdAt) }}
        </p>
        <p v-if="revision.reason?.startsWith('Dibatalkan:')">
          {{ formatRupiah(revision.previousAmount) }} tidak lagi dihitung dalam saldo.
        </p>
        <p v-else>
          Nominal {{ formatRupiah(revision.previousAmount) }} → {{ formatRupiah(revision.newAmount) }}
        </p>
        <p v-if="revision.previousDate !== revision.newDate">
          Tanggal {{ formatDate(revision.previousDate) }} → {{ formatDate(revision.newDate) }}
        </p>
        <p v-if="revision.reason">Alasan: {{ revision.reason.replace(/^Dibatalkan:\s*/, '') }}</p>
      </li>
    </ol>
  </details>
</template>
