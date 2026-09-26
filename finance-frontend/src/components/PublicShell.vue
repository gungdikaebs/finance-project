<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-vue-next';
import NalaraLogo from './ui/NalaraLogo.vue';
import { useAuthStore } from '../stores/auth.store';
import { useTheme } from '../composables/useTheme';
// import { usePwa } from '../composables/usePwa';

const auth = useAuthStore();
const route = useRoute();
const { isDark, toggleTheme } = useTheme();
// const { isInstalled, installApp } = usePwa();
const menuOpen = ref(false);
const startLink = computed(() => auth.token ? '/dashboard' : '/login?mode=register');
const startLabel = computed(() => auth.token ? 'Buka dashboard' : 'Buat akun');
const onLanding = computed(() => route.path === '/');

const closeMenu = () => { menuOpen.value = false; };
</script>

<template>
  <div class="public-shell min-h-[100dvh] bg-[#F3F5EF] text-[#18221B] transition-colors duration-200 dark:bg-[#0E1410] dark:text-[#F0F4F1]">
    <header class="sticky top-0 z-40 border-b border-[#DAE2D9] bg-[#F3F5EF]/95 backdrop-blur-md dark:border-[#26362A] dark:bg-[#0E1410]/95">
      <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:h-[72px] lg:px-10" aria-label="Navigasi utama">
        <RouterLink to="/" class="inline-flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183D2B] dark:focus-visible:outline-[#B8DF38]" aria-label="Nalara, beranda" @click="closeMenu">
          <NalaraLogo :with-badge="true" size="sm" />
          <span class="text-base font-extrabold tracking-tight">Nalara</span>
        </RouterLink>

        <div class="hidden items-center gap-1 text-sm font-semibold text-[#405147] dark:text-[#C8D3CA] md:flex">
          <RouterLink to="/#metode" class="rounded-lg px-3 py-2 hover:bg-[#E6ECE4] dark:hover:bg-[#1B281F]">Manfaat</RouterLink>
          <RouterLink to="/#simulasi" class="rounded-lg px-3 py-2 hover:bg-[#E6ECE4] dark:hover:bg-[#1B281F]">Simulasi anggaran</RouterLink>
          <RouterLink to="/#target-impian" class="rounded-lg px-3 py-2 hover:bg-[#E6ECE4] dark:hover:bg-[#1B281F]">Target Impian</RouterLink>
          <RouterLink to="/about" class="rounded-lg px-3 py-2 hover:bg-[#E6ECE4] dark:hover:bg-[#1B281F]" :aria-current="!onLanding ? 'page' : undefined">Tentang Nalara</RouterLink>
        </div>

        <div class="flex shrink-0 items-center gap-2 sm:gap-3">
          <!-- Install App Button (Desktop) - Sementara dinonaktifkan
          <button
            v-if="!isInstalled"
            type="button"
            @click="installApp"
            class="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#CAD8CA] dark:border-[#324638] text-xs font-bold text-[#183D2B] dark:text-[#B8DF38] hover:bg-[#E8EFE5] dark:hover:bg-[#1B281F] transition cursor-pointer"
            title="Pasang Nalara di perangkat Anda"
          >
            <Download class="w-3.5 h-3.5" />
            <span>Pasang Aplikasi</span>
          </button>
          -->

          <button type="button" class="grid h-10 w-10 place-items-center rounded-xl border border-[#DAE2D9] bg-white/70 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183D2B] dark:border-[#26362A] dark:bg-[#18241C] dark:hover:bg-[#233227] dark:focus-visible:outline-[#B8DF38]" :aria-label="isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'" @click="toggleTheme">
            <Sun v-if="isDark" class="h-[18px] w-[18px] text-[#B8DF38]" aria-hidden="true" />
            <Moon v-else class="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
          <RouterLink v-if="!auth.token" to="/login" class="hidden rounded-lg px-3 py-2 text-sm font-semibold hover:underline sm:inline-flex">Masuk</RouterLink>
          <RouterLink :to="startLink" class="hidden min-h-10 items-center gap-2 whitespace-nowrap rounded-xl bg-[#183D2B] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#24553D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183D2B] dark:bg-[#B8DF38] dark:text-[#0E1410] dark:hover:bg-[#A3C82E] dark:focus-visible:outline-[#B8DF38] sm:inline-flex">
            {{ startLabel }} <ArrowRight class="h-4 w-4" aria-hidden="true" />
          </RouterLink>
          <button type="button" class="grid h-10 w-10 place-items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#183D2B] dark:focus-visible:outline-[#B8DF38] md:hidden" :aria-label="menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'" :aria-expanded="menuOpen" aria-controls="public-mobile-menu" @click="menuOpen = !menuOpen">
            <X v-if="menuOpen" class="h-5 w-5" aria-hidden="true" /><Menu v-else class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </nav>
      <div v-if="menuOpen" id="public-mobile-menu" class="border-t border-[#DAE2D9] bg-[#F3F5EF] px-5 pb-5 pt-3 dark:border-[#26362A] dark:bg-[#0E1410] md:hidden">
        <div class="mx-auto grid max-w-7xl gap-1 text-sm font-semibold">
          <RouterLink to="/#metode" class="rounded-lg px-3 py-3 hover:bg-[#E6ECE4] dark:hover:bg-[#1B281F]" @click="closeMenu">Manfaat</RouterLink>
          <RouterLink to="/#simulasi" class="rounded-lg px-3 py-3 hover:bg-[#E6ECE4] dark:hover:bg-[#1B281F]" @click="closeMenu">Simulasi anggaran</RouterLink>
          <RouterLink to="/#target-impian" class="rounded-lg px-3 py-3 hover:bg-[#E6ECE4] dark:hover:bg-[#1B281F]" @click="closeMenu">Target Impian</RouterLink>
          <RouterLink to="/about" class="rounded-lg px-3 py-3 hover:bg-[#E6ECE4] dark:hover:bg-[#1B281F]" @click="closeMenu">Tentang Nalara</RouterLink>
          
          <!-- Mobile Menu Install Button - Sementara dinonaktifkan
          <button
            v-if="!isInstalled"
            type="button"
            @click="() => { installApp(); closeMenu(); }"
            class="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#183D2B] dark:border-[#B8DF38] text-[#183D2B] dark:text-[#B8DF38] font-bold text-xs hover:bg-[#E8EFE5] dark:hover:bg-[#1B281F] transition cursor-pointer"
          >
            <Download class="w-4 h-4" />
            <span>Pasang Aplikasi di HP</span>
          </button>
          -->

          <div class="mt-2 grid grid-cols-2 gap-2 border-t border-[#DAE2D9] pt-4 dark:border-[#26362A]">
            <RouterLink v-if="!auth.token" to="/login" class="flex min-h-11 items-center justify-center rounded-xl border border-[#DAE2D9] dark:border-[#26362A]" @click="closeMenu">Masuk</RouterLink>
            <RouterLink :to="startLink" class="flex min-h-11 items-center justify-center rounded-xl bg-[#183D2B] px-3 text-center text-white dark:bg-[#B8DF38] dark:text-[#0E1410]" :class="auth.token ? 'col-span-2' : ''" @click="closeMenu">{{ startLabel }}</RouterLink>
          </div>
        </div>
      </div>
    </header>

    <main><slot /></main>

    <footer class="border-t border-[#DAE2D9] bg-[#EEF2EB] dark:border-[#26362A] dark:bg-[#111A14]">
      <div class="mx-auto grid max-w-7xl gap-9 px-5 py-10 sm:px-8 md:grid-cols-[1fr_auto] lg:px-10">
        <div class="max-w-sm">
          <RouterLink to="/" class="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current">
            <NalaraLogo :with-badge="true" size="xs" />
            <span class="font-extrabold">Nalara</span>
          </RouterLink>
          <p class="mt-3 text-sm leading-relaxed text-[#53645A] dark:text-[#ADBCB0]">Ruang untuk mencatat, memahami, dan merencanakan keuangan pribadi dengan lebih jelas.</p>
        </div>
        <div class="flex flex-wrap items-start gap-x-7 gap-y-3 text-sm font-semibold text-[#405147] dark:text-[#C8D3CA]">
          <RouterLink to="/#metode" class="hover:underline">Manfaat</RouterLink>
          <RouterLink to="/#simulasi" class="hover:underline">Simulasi anggaran</RouterLink>
          <RouterLink to="/about" class="hover:underline">Tentang Nalara</RouterLink>
          <RouterLink :to="auth.token ? '/dashboard' : '/login'" class="hover:underline">{{ auth.token ? 'Dashboard' : 'Masuk' }}</RouterLink>
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
