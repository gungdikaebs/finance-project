<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-vue-next';
import NalaraLogo from './ui/NalaraLogo.vue';
import { useAuthStore } from '../stores/auth.store';
import { useTheme } from '../composables/useTheme';

const auth = useAuthStore();
const route = useRoute();
const { isDark, toggleTheme } = useTheme();
const menuOpen = ref(false);
const startLink = computed(() => (auth.token ? '/dashboard' : '/login?mode=register'));
const startLabel = computed(() => (auth.token ? 'Buka Dashboard' : 'Mulai Sekarang'));
const onLanding = computed(() => route.path === '/');

const closeMenu = () => {
  menuOpen.value = false;
};
</script>

<template>
  <div class="public-shell min-h-[100dvh] bg-[#F8FAFC] text-[#0F172A] transition-colors duration-200 dark:bg-[#070B14] dark:text-[#F8FAFC]">
    <header class="sticky top-0 z-40 border-b border-slate-200/80 bg-[#F8FAFC]/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#070B14]/90">
      <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:h-[72px] lg:px-10" aria-label="Navigasi utama">
        <RouterLink
          to="/"
          class="inline-flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B192C] dark:focus-visible:outline-[#38BDF8]"
          aria-label="Nalara, beranda"
          @click="closeMenu"
        >
          <NalaraLogo :with-badge="true" size="sm" />
          <span class="text-base font-extrabold tracking-tight text-[#0B192C] dark:text-[#F8FAFC]">Nalara</span>
        </RouterLink>

        <div class="hidden items-center gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300 md:flex">
          <RouterLink to="/#metode" class="rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white">Manfaat</RouterLink>
          <RouterLink to="/#simulasi" class="rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white">Simulasi Anggaran</RouterLink>
          <RouterLink to="/#target-impian" class="rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white">Target Impian</RouterLink>
          <RouterLink to="/about" class="rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800/60 dark:hover:text-white" :aria-current="!onLanding ? 'page' : undefined">Tentang Nalara</RouterLink>
        </div>

        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B192C] dark:border-slate-800 dark:bg-[#0D1524] dark:text-slate-200 dark:hover:bg-[#162238] dark:focus-visible:outline-[#38BDF8] cursor-pointer"
            :aria-label="isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'"
            @click="toggleTheme"
          >
            <Sun v-if="isDark" class="h-[18px] w-[18px] text-amber-400" aria-hidden="true" />
            <Moon v-else class="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
          <RouterLink
            v-if="!auth.token"
            to="/login"
            class="hidden rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-[#0B192C] dark:text-slate-300 dark:hover:text-white sm:inline-flex"
          >
            Masuk
          </RouterLink>
          <RouterLink
            :to="startLink"
            class="hidden min-h-10 items-center gap-2 whitespace-nowrap rounded-xl bg-[#0B192C] px-4 py-2 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#172B45] hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B192C] dark:bg-white dark:text-[#0B192C] dark:hover:bg-slate-100 dark:focus-visible:outline-white sm:inline-flex"
          >
            {{ startLabel }} <ArrowRight class="h-4 w-4" aria-hidden="true" />
          </RouterLink>
          <button
            type="button"
            class="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B192C] dark:border-slate-800 dark:bg-[#0D1524] dark:text-slate-200 dark:focus-visible:outline-[#38BDF8] md:hidden cursor-pointer"
            :aria-label="menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'"
            :aria-expanded="menuOpen"
            aria-controls="public-mobile-menu"
            @click="menuOpen = !menuOpen"
          >
            <X v-if="menuOpen" class="h-5 w-5" aria-hidden="true" /><Menu v-else class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>

      <div
        v-if="menuOpen"
        id="public-mobile-menu"
        class="border-t border-slate-200 bg-[#F8FAFC] px-5 pb-5 pt-3 dark:border-slate-800 dark:bg-[#070B14] md:hidden"
      >
        <div class="mx-auto grid max-w-7xl gap-1 text-sm font-semibold">
          <RouterLink to="/#metode" class="rounded-lg px-3 py-3 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white" @click="closeMenu">Manfaat</RouterLink>
          <RouterLink to="/#simulasi" class="rounded-lg px-3 py-3 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white" @click="closeMenu">Simulasi Anggaran</RouterLink>
          <RouterLink to="/#target-impian" class="rounded-lg px-3 py-3 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white" @click="closeMenu">Target Impian</RouterLink>
          <RouterLink to="/about" class="rounded-lg px-3 py-3 text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white" @click="closeMenu">Tentang Nalara</RouterLink>

          <div class="mt-2 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <RouterLink
              v-if="!auth.token"
              to="/login"
              class="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-[#0D1524] dark:text-slate-200 dark:hover:bg-slate-800"
              @click="closeMenu"
            >
              Masuk
            </RouterLink>
            <RouterLink
              :to="startLink"
              class="flex min-h-11 items-center justify-center rounded-xl bg-[#0B192C] px-3 text-center font-bold text-white transition hover:bg-[#172B45] dark:bg-white dark:text-[#0B192C] dark:hover:bg-slate-100"
              :class="auth.token ? 'col-span-2' : ''"
              @click="closeMenu"
            >
              {{ startLabel }}
            </RouterLink>
          </div>
        </div>
      </div>
    </header>

    <main><slot /></main>

    <footer class="border-t border-slate-200/80 bg-slate-50/80 dark:border-slate-800/80 dark:bg-[#070B14]">
      <div class="mx-auto grid max-w-7xl gap-9 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] lg:px-10">
        <div class="max-w-sm">
          <RouterLink to="/" class="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">
            <NalaraLogo :with-badge="true" size="xs" />
            <span class="font-extrabold text-[#0B192C] dark:text-[#F8FAFC]">Nalara</span>
          </RouterLink>
          <p class="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Ruang untuk mencatat, memahami, dan merencanakan keuangan pribadi dengan lebih jelas.
          </p>
        </div>
        <div class="flex flex-wrap items-start gap-x-7 gap-y-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <RouterLink to="/#metode" class="transition-colors hover:text-[#0B192C] dark:hover:text-white">Manfaat</RouterLink>
          <RouterLink to="/#simulasi" class="transition-colors hover:text-[#0B192C] dark:hover:text-white">Simulasi Anggaran</RouterLink>
          <RouterLink to="/about" class="transition-colors hover:text-[#0B192C] dark:hover:text-white">Tentang Nalara</RouterLink>
          <RouterLink :to="auth.token ? '/dashboard' : '/login'" class="transition-colors hover:text-[#0B192C] dark:hover:text-white">
            {{ auth.token ? 'Dashboard' : 'Masuk' }}
          </RouterLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
@media (prefers-reduced-motion: reduce) {
  .public-shell *, .public-shell *::before, .public-shell *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>
