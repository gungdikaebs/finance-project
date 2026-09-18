<script setup lang="ts">
import { useToast } from '../../composables/useToast';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-vue-next';

const { toasts, dismiss } = useToast();
</script>

<template>
  <div
    class="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] max-w-sm w-[calc(100%-2rem)] flex flex-col gap-2.5 pointer-events-none"
    role="region"
    aria-label="Pemberitahuan Sistem"
  >
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-[-12px] scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95 translate-y-[-8px]"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto rounded-2xl p-4 shadow-xl border backdrop-blur-md flex items-start gap-3 relative overflow-hidden group"
        :class="{
          'bg-[#183D2B] text-white border-[#B8DF38]/30 shadow-emerald-950/20':
            toast.type === 'success',
          'bg-[#2A0E12] text-rose-50 border-rose-600/40 shadow-rose-950/20':
            toast.type === 'error',
          'bg-[#2B1B0A] text-amber-50 border-amber-500/40 shadow-amber-950/20':
            toast.type === 'warning',
          'bg-[#101F2B] text-sky-50 border-sky-500/40 shadow-slate-950/20':
            toast.type === 'info',
        }"
      >
        <!-- Icon Container -->
        <div class="shrink-0 mt-0.5">
          <div
            v-if="toast.type === 'success'"
            class="w-7 h-7 rounded-xl bg-[#B8DF38]/20 text-[#B8DF38] flex items-center justify-center"
          >
            <CheckCircle2 class="w-4 h-4" :stroke-width="2.5" />
          </div>
          <div
            v-else-if="toast.type === 'error'"
            class="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center"
          >
            <AlertCircle class="w-4 h-4" :stroke-width="2.5" />
          </div>
          <div
            v-else-if="toast.type === 'warning'"
            class="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center"
          >
            <AlertTriangle class="w-4 h-4" :stroke-width="2.5" />
          </div>
          <div
            v-else
            class="w-7 h-7 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center"
          >
            <Info class="w-4 h-4" :stroke-width="2.5" />
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 pr-1">
          <h4
            v-if="toast.title"
            class="text-xs font-bold leading-tight tracking-tight mb-0.5"
            :class="{
              'text-[#B8DF38]': toast.type === 'success',
              'text-rose-300': toast.type === 'error',
              'text-amber-300': toast.type === 'warning',
              'text-sky-300': toast.type === 'info',
            }"
          >
            {{ toast.title }}
          </h4>
          <p class="text-xs leading-relaxed font-medium opacity-95 break-words">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button
          type="button"
          @click="dismiss(toast.id)"
          class="tactile-btn shrink-0 w-6 h-6 rounded-lg flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-white/10 transition cursor-pointer"
          aria-label="Tutup pemberitahuan"
        >
          <X class="w-3.5 h-3.5" :stroke-width="2" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
