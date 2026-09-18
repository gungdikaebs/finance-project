<script setup lang="ts">
import { useConfirm } from '../../composables/useConfirm';
import {
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-vue-next';

const { confirmState, handleConfirm, handleCancel } = useConfirm();
</script>

<template>
  <div
    v-if="confirmState.isOpen"
    class="fixed inset-0 z-[9998] flex items-center justify-center p-4 glass-modal-backdrop"
    @click.self="handleCancel"
    role="dialog"
    aria-modal="true"
    :aria-label="confirmState.title"
  >
    <div
      class="fintech-card bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- Header with Icon & Close -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div
            v-if="confirmState.type === 'danger'"
            class="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0"
          >
            <AlertTriangle class="w-5 h-5" :stroke-width="2.25" />
          </div>
          <div
            v-else-if="confirmState.type === 'warning'"
            class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0"
          >
            <AlertCircle class="w-5 h-5" :stroke-width="2.25" />
          </div>
          <div
            v-else
            class="w-10 h-10 rounded-xl bg-emerald-50 text-[#183D2B] border border-emerald-100 flex items-center justify-center shrink-0"
          >
            <HelpCircle class="w-5 h-5" :stroke-width="2.25" />
          </div>

          <div>
            <h3 class="text-base font-extrabold text-[#18221B] leading-tight">
              {{ confirmState.title }}
            </h3>
          </div>
        </div>

        <button
          type="button"
          @click="handleCancel"
          class="tactile-btn w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer shrink-0"
          aria-label="Tutup dialog"
        >
          <X class="w-4 h-4" :stroke-width="2" />
        </button>
      </div>

      <!-- Message Body -->
      <div class="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
        {{ confirmState.message }}
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2.5 pt-2 border-t border-stone-100">
        <button
          type="button"
          @click="handleCancel"
          class="tactile-btn flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition cursor-pointer"
        >
          {{ confirmState.cancelText }}
        </button>

        <button
          type="button"
          @click="handleConfirm"
          class="tactile-btn flex-1 min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold text-white transition cursor-pointer shadow-xs"
          :class="{
            'bg-rose-600 hover:bg-rose-700': confirmState.type === 'danger',
            'bg-amber-600 hover:bg-amber-700': confirmState.type === 'warning',
            'bg-[#183D2B] hover:bg-[#23553c]': confirmState.type === 'info',
          }"
        >
          {{ confirmState.confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
