<script setup lang="ts">
import { ref } from 'vue';
import { usePwa } from '../../composables/usePwa';
import {
  Download,
  Share2,
  PlusSquare,
  X,
  RefreshCw,
  Smartphone,
  CheckCircle2,
} from 'lucide-vue-next';

const {
  canInstall,
  isInstalled,
  isIOS,
  showIosInstructions,
  needRefresh,
  installApp,
  closeIosInstructions,
  reloadApp,
} = usePwa();

const dismissed = ref(sessionStorage.getItem('pwa_banner_dismissed') === 'true');

const dismissBanner = () => {
  dismissed.value = true;
  sessionStorage.setItem('pwa_banner_dismissed', 'true');
};
</script>

<template>
  <!-- Update Available Banner -->
  <aside
    v-if="needRefresh"
    class="fixed top-4 inset-x-4 max-w-md mx-auto z-50 p-4 rounded-2xl bg-[#183D2B] text-white shadow-xl border border-[#B8DF38]/30 flex items-center justify-between gap-3 animate-modal-enter"
    aria-label="Pembaruan Aplikasi"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-10 h-10 rounded-xl bg-[#B8DF38]/20 flex items-center justify-center shrink-0 text-[#B8DF38]">
        <RefreshCw class="w-5 h-5 animate-spin" />
      </div>
      <div class="min-w-0">
        <p class="text-sm font-bold text-white truncate">Versi Baru Tersedia</p>
        <p class="text-xs text-white/80 truncate">Muat ulang untuk menikmati pembaruan terkini.</p>
      </div>
    </div>
    <button
      type="button"
      @click="reloadApp"
      class="shrink-0 px-3.5 py-1.5 rounded-xl bg-[#B8DF38] text-[#183D2B] text-xs font-bold hover:bg-[#A3C82E] active:scale-95 transition cursor-pointer"
    >
      Perbarui
    </button>
  </aside>

  <!-- PWA Install Prompt Banner (Only when not yet installed and not dismissed) -->
  <aside
    v-if="canInstall && !isInstalled && !dismissed"
    class="fixed bottom-20 lg:bottom-6 right-4 left-4 sm:left-auto sm:w-96 z-40 p-4 rounded-2xl bg-white/95 dark:bg-[#16201A]/95 backdrop-blur-md border border-emerald-950/10 dark:border-[#243329] shadow-xl text-[#18221B] dark:text-[#F0F4F1] animate-modal-enter"
    aria-label="Pasang Aplikasi Nalara"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <img
          src="/favicon.png"
          alt="Nalara Logo"
          class="w-10 h-10 rounded-xl shadow-xs border border-emerald-950/10 dark:border-white/10 shrink-0"
        />
        <div>
          <h4 class="text-sm font-bold leading-tight">Pasang Aplikasi Nalara</h4>
          <p class="text-xs text-stone-500 dark:text-[#98A79D] mt-0.5 leading-snug">
            Akses instan dari layar utama, lebih cepat, dan tanpa bar browser.
          </p>
        </div>
      </div>
      <button
        type="button"
        @click="dismissBanner"
        class="text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 p-1 rounded-lg transition"
        title="Tutup banner"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <div class="mt-3.5 flex items-center gap-2">
      <button
        type="button"
        @click="installApp"
        class="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#183D2B] text-xs font-bold hover:opacity-95 active:scale-[0.98] transition cursor-pointer shadow-xs"
      >
        <Download class="w-4 h-4" />
        <span>{{ isIOS ? 'Cara Pasang di iPhone' : 'Pasang Sekarang' }}</span>
      </button>
      <button
        type="button"
        @click="dismissBanner"
        class="py-2 px-3 rounded-xl border border-stone-200 dark:border-[#243329] text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-white/5 transition"
      >
        Nanti
      </button>
    </div>
  </aside>

  <!-- iOS Installation Guide Modal -->
  <teleport to="body">
    <div
      v-if="showIosInstructions"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      @click.self="closeIosInstructions"
    >
      <div
        class="w-full max-w-sm rounded-2xl bg-white dark:bg-[#16201A] p-5 shadow-2xl border border-emerald-950/10 dark:border-[#243329] text-[#18221B] dark:text-[#F0F4F1] animate-modal-enter space-y-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-[#B8DF38]/20 flex items-center justify-center text-[#183D2B] dark:text-[#B8DF38]">
              <Smartphone class="w-4 h-4" />
            </div>
            <h3 id="ios-install-title" class="text-sm font-bold">Pasang di iPhone / iPad</h3>
          </div>
          <button
            type="button"
            @click="closeIosInstructions"
            class="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-3 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
          <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-white/5">
            <div class="w-6 h-6 rounded-md bg-[#183D2B] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
              1
            </div>
            <div>
              <p>Ketuk tombol <strong class="text-stone-900 dark:text-white inline-flex items-center gap-1 font-semibold"><Share2 class="w-3.5 h-3.5 inline" /> Bagikan (Share)</strong> di bilah bawah browser Safari Anda.</p>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-white/5">
            <div class="w-6 h-6 rounded-md bg-[#183D2B] text-white flex items-center justify-center shrink-0 font-bold text-[11px]">
              2
            </div>
            <div>
              <p>Gulir ke bawah dan pilih menu <strong class="text-stone-900 dark:text-white inline-flex items-center gap-1 font-semibold"><PlusSquare class="w-3.5 h-3.5 inline" /> Tambah ke Layar Utama</strong> (<em>Add to Home Screen</em>).</p>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 dark:bg-white/5">
            <div class="w-6 h-6 rounded-md bg-[#B8DF38] text-[#183D2B] flex items-center justify-center shrink-0 font-bold text-[11px]">
              <CheckCircle2 class="w-3.5 h-3.5" />
            </div>
            <div>
              <p>Ketuk <strong class="text-stone-900 dark:text-white font-semibold">Tambah (Add)</strong> di sudut kanan atas. Ikon Nalara akan muncul di layar utama HP Anda!</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          @click="closeIosInstructions"
          class="w-full py-2.5 rounded-xl bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#183D2B] text-xs font-bold hover:opacity-95 transition cursor-pointer"
        >
          Mengerti
        </button>
      </div>
    </div>
  </teleport>
</template>
