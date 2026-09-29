<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-vue-next';
import api from '../api/axios';
import GoogleSignInButton from '../components/GoogleSignInButton.vue';
import { useAuthStore } from '../stores/auth.store';
import NalaraLogo from '../components/ui/NalaraLogo.vue';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const isRegister = ref(route.query.mode === 'register');
const name = ref('');
const email = ref('');
const password = ref('');
const linkPassword = ref('');
const googleCredential = ref<string | null>(null);
const showPassword = ref(false);
const loading = ref(false);
const googleLoading = ref(false);
const googleUnavailable = ref('');
const errorMessage = ref('');
const successMessage = ref('');

watch(() => route.query.mode, (mode) => {
  isRegister.value = mode === 'register';
  googleCredential.value = null;
  linkPassword.value = '';
  errorMessage.value = '';
  successMessage.value = '';
});

const criteria = computed(() => ({
  length: password.value.length >= 8,
  upper: /[A-Z]/.test(password.value),
  lower: /[a-z]/.test(password.value),
  numberOrSymbol: /[\d\W]/.test(password.value),
}));
const strongPassword = computed(() => Object.values(criteria.value).every(Boolean));

function setMode(register: boolean) {
  if (isRegister.value === register) return;
  void router.replace({ path: '/login', query: register ? { mode: 'register' } : {} });
}

function getErrorMessage(error: any) {
  if (error.response?.status === 429) return 'Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.';
  const message = error.response?.data?.message;
  return typeof message === 'string' ? message : 'Terjadi kesalahan. Silakan coba lagi.';
}

async function handleGoogleCredential(credential: string) {
  errorMessage.value = '';
  successMessage.value = '';
  googleLoading.value = true;
  try {
    await auth.loginWithGoogle(credential);
    await router.replace('/dashboard');
  } catch (error: any) {
    if (error.response?.status === 409 && error.response?.data?.code === 'ACCOUNT_LINK_REQUIRED') {
      googleCredential.value = credential;
      linkPassword.value = '';
    } else {
      errorMessage.value = getErrorMessage(error);
    }
  } finally {
    googleLoading.value = false;
  }
}

async function handleLink() {
  if (!googleCredential.value || !linkPassword.value) {
    errorMessage.value = 'Masukkan kata sandi akun lama.';
    return;
  }
  loading.value = true;
  errorMessage.value = '';
  try {
    await auth.linkGoogle(googleCredential.value, linkPassword.value);
    googleCredential.value = null;
    linkPassword.value = '';
    await router.replace('/dashboard');
  } catch (error: any) {
    const message = getErrorMessage(error);
    if (error.response?.status === 401 && message.includes('Sesi Google')) {
      googleCredential.value = null;
      linkPassword.value = '';
      errorMessage.value = 'Sesi Google kedaluwarsa. Pilih Google lagi untuk mencoba.';
    } else {
      errorMessage.value = message;
    }
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  errorMessage.value = '';
  successMessage.value = '';
  if (!email.value || !password.value) {
    errorMessage.value = 'Isi email dan kata sandi.';
    return;
  }
  if (isRegister.value && (!name.value.trim() || !strongPassword.value)) {
    errorMessage.value = !name.value.trim()
      ? 'Isi nama lengkap.'
      : 'Kata sandi perlu 8 karakter, huruf besar, huruf kecil, dan angka atau simbol.';
    return;
  }

  loading.value = true;
  try {
    if (isRegister.value) {
      await api.post('/auth/register', {
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value,
      });
      password.value = '';
      await router.replace('/login');
      successMessage.value = 'Akun berhasil dibuat. Silakan masuk.';
    } else {
      await auth.login(email.value.trim(), password.value);
      await router.replace('/dashboard');
    }
  } catch (error) {
    errorMessage.value = getErrorMessage(error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-[100dvh] grid lg:grid-cols-[minmax(0,1fr)_minmax(440px,520px)] bg-[#F8FAFC] dark:bg-[#070B14] text-[#0F172A] dark:text-[#F8FAFC]">
    <!-- Left Hero Banner (Desktop) -->
    <aside class="relative hidden lg:flex h-[100dvh] lg:sticky lg:top-0 overflow-hidden bg-[#0B192C] text-[#F8FAFC]">
      <img src="/landing-budget-desk.jpg" alt="Seseorang mencatat rencana keuangan di meja kerja" class="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#070B14] via-[#0B192C]/70 to-[#0B192C]/30"></div>
      <div class="relative z-10 self-end p-10 xl:p-16 max-w-2xl">
        <p class="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">Nalara</p>
        <p class="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.12]">Catat transaksi. Pahami kondisi keuanganmu.</p>
        <p class="mt-4 max-w-md text-base text-slate-300 leading-relaxed">Atur anggaran dan pantau tabungan serta target impian dalam satu sistem terintegrasi.</p>
      </div>
    </aside>

    <!-- Right Content Area -->
    <div class="min-h-[100dvh] flex flex-col px-5 sm:px-10 lg:px-12 py-7 sm:py-10">
      <!-- Header -->
      <header class="flex items-center justify-between gap-4">
        <RouterLink to="/" class="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0B192C] dark:focus-visible:outline-[#38BDF8]" aria-label="Nalara, kembali ke beranda">
          <NalaraLogo :with-badge="true" size="sm" />
          <span class="font-extrabold tracking-tight text-sm sm:text-base text-[#0B192C] dark:text-[#F8FAFC]">Nalara</span>
        </RouterLink>
        <RouterLink to="/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0B192C] dark:hover:text-white transition focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
          <ArrowLeft class="w-4 h-4" /> Beranda
        </RouterLink>
      </header>

      <!-- Main Form Area -->
      <main class="flex-1 w-full max-w-[420px] mx-auto flex flex-col justify-center py-10 sm:py-14">
        <!-- Account Linking Form -->
        <template v-if="googleCredential">
          <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 grid place-items-center mb-6">
            <LockKeyhole class="w-6 h-6" />
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B192C] dark:text-[#F8FAFC]">Hubungkan akun lama</h1>
          <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Email Google ini cocok dengan akun Nalara yang sudah ada. Masukkan kata sandi akun tersebut untuk menghubungkan kedua cara masuk. Catatan keuanganmu tetap utuh di akun yang sama.
          </p>
          <form class="mt-8 space-y-4" @submit.prevent="handleLink">
            <div>
              <label for="link-password" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Kata sandi akun lama</label>
              <input id="link-password" v-model="linkPassword" type="password" autocomplete="current-password" required class="auth-input" />
            </div>
            <p v-if="errorMessage" role="alert" class="auth-error">{{ errorMessage }}</p>
            <button type="submit" :disabled="loading" class="auth-primary w-full">
              {{ loading ? 'Menghubungkan...' : 'Hubungkan dan masuk' }}
            </button>
          </form>
          <button type="button" class="mt-5 self-start text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" @click="googleCredential = null; linkPassword = ''; errorMessage = ''">
            Kembali ke pilihan masuk
          </button>
          <p class="mt-8 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Lupa kata sandi? Akun belum bisa dihubungkan lewat Google tanpa kata sandi akun yang sudah ada.
          </p>
        </template>

        <!-- Standard Login / Register Form -->
        <template v-else>
          <h1 class="text-3xl sm:text-[2.15rem] font-extrabold tracking-tight text-[#0B192C] dark:text-[#F8FAFC]">
            {{ isRegister ? 'Buat akun Nalara' : 'Masuk ke Nalara' }}
          </h1>
          <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {{ isRegister ? 'Mulai kelola uang tanpa menebak-nebak dan amankan target finansial Anda.' : 'Lanjutkan catatan dan rencana alokasi keuangan Anda.' }}
          </p>

          <!-- Mode Switcher Tabs -->
          <div class="grid grid-cols-2 mt-7 border-b border-slate-200 dark:border-slate-800" role="group" aria-label="Pilih metode akun">
            <button
              type="button"
              class="auth-mode cursor-pointer"
              :class="!isRegister ? 'auth-mode-active' : ''"
              :aria-current="!isRegister ? 'page' : undefined"
              @click="setMode(false)"
            >
              Masuk
            </button>
            <button
              type="button"
              class="auth-mode cursor-pointer"
              :class="isRegister ? 'auth-mode-active' : ''"
              :aria-current="isRegister ? 'page' : undefined"
              @click="setMode(true)"
            >
              Daftar akun
            </button>
          </div>

          <!-- Google Sign-In Area -->
          <div class="mt-7">
            <GoogleSignInButton v-if="!googleUnavailable" @credential="handleGoogleCredential" @unavailable="googleUnavailable = $event" />
            <p v-if="googleUnavailable" role="status" class="rounded-xl bg-slate-100 dark:bg-slate-800/80 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
              {{ googleUnavailable }}
            </p>
            <p v-if="googleLoading" role="status" class="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Memproses akun Google...
            </p>
          </div>

          <!-- Divider -->
          <div class="flex items-center gap-4 my-6 text-xs text-slate-400 dark:text-slate-500">
            <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
            <span>{{ isRegister ? 'atau daftar dengan email' : 'atau masuk dengan email' }}</span>
            <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800"></span>
          </div>

          <!-- Messages -->
          <p v-if="errorMessage" role="alert" class="auth-error mb-4">{{ errorMessage }}</p>
          <p v-if="successMessage" role="status" class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 mb-4 text-sm font-medium text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {{ successMessage }}
          </p>

          <!-- Credentials Form -->
          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div v-if="isRegister">
              <label for="auth-name" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Nama lengkap</label>
              <input id="auth-name" v-model="name" type="text" autocomplete="name" placeholder="Nama Anda" class="auth-input" />
            </div>
            <div>
              <label for="auth-email" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
              <input id="auth-email" v-model="email" type="email" autocomplete="email" inputmode="email" placeholder="nama@email.com" class="auth-input" />
            </div>
            <div>
              <label for="auth-password" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Kata sandi</label>
              <div class="relative">
                <input
                  id="auth-password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  :autocomplete="isRegister ? 'new-password' : 'current-password'"
                  placeholder="••••••••"
                  class="auth-input pr-12"
                />
                <button
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
                  :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="w-4 h-4" /><Eye v-else class="w-4 h-4" />
                </button>
              </div>

              <!-- Password Quality Checklist -->
              <div v-if="isRegister && password" class="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs" aria-live="polite">
                <span :class="criteria.length ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-400 dark:text-slate-500'">
                  {{ criteria.length ? '✓' : '○' }} 8 karakter
                </span>
                <span :class="criteria.upper ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-400 dark:text-slate-500'">
                  {{ criteria.upper ? '✓' : '○' }} Huruf besar
                </span>
                <span :class="criteria.lower ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-400 dark:text-slate-500'">
                  {{ criteria.lower ? '✓' : '○' }} Huruf kecil
                </span>
                <span :class="criteria.numberOrSymbol ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-400 dark:text-slate-500'">
                  {{ criteria.numberOrSymbol ? '✓' : '○' }} Angka atau simbol
                </span>
              </div>
            </div>

            <button type="submit" :disabled="loading" class="auth-primary w-full mt-2 inline-flex items-center justify-center gap-2 cursor-pointer">
              {{ loading ? 'Memproses...' : isRegister ? 'Daftar dengan email' : 'Masuk dengan email' }}
              <ArrowRight v-if="!loading" class="w-4 h-4" />
            </button>
          </form>
        </template>
      </main>

      <!-- Footer -->
      <footer class="text-center text-xs text-slate-400 dark:text-slate-500">
        Nalara
      </footer>
    </div>
  </div>
</template>

<style scoped>
.auth-input {
  width: 100%;
  min-height: 3rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.75rem;
  background: #ffffff;
  padding: 0.7rem 0.95rem;
  color: #0f172a;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.auth-input::placeholder {
  color: #94a3b8;
}
.auth-input:focus-visible {
  border-color: #0b192c;
  box-shadow: 0 0 0 3px rgba(11, 25, 44, 0.12);
}

.auth-primary {
  min-height: 3rem;
  border-radius: 0.75rem;
  background: #0b192c;
  color: #ffffff;
  padding: 0.7rem 1rem;
  font-weight: 700;
  font-size: 0.875rem;
  transition: transform 0.15s ease, background-color 0.15s ease;
}
.auth-primary:hover:not(:disabled) {
  background: #172b45;
}
.auth-primary:active:not(:disabled) {
  transform: scale(0.98);
}
.auth-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.auth-primary:focus-visible {
  outline: 3px solid #38bdf8;
  outline-offset: 3px;
}

.auth-mode {
  min-height: 2.75rem;
  border-bottom: 2px solid transparent;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  transition: color 0.15s ease, border-color 0.15s ease;
}
.auth-mode:hover {
  color: #0f172a;
}
.auth-mode-active {
  border-color: #0b192c;
  color: #0b192c;
}
.auth-mode:focus-visible {
  outline: 2px solid #0b192c;
  outline-offset: -2px;
}

.auth-error {
  border: 1px solid #fecdd3;
  border-radius: 0.75rem;
  background: #fff1f2;
  padding: 0.75rem 1rem;
  color: #9f1239;
  font-size: 0.875rem;
  line-height: 1.5;
}

:global(html.dark .auth-input) {
  border-color: #334155;
  background: #0d1524;
  color: #f8fafc;
}
:global(html.dark input.auth-input::placeholder) {
  color: #64748b !important;
}
:global(html.dark .auth-input:focus-visible) {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.2);
}

:global(html.dark .auth-primary) {
  background: #ffffff;
  color: #0b192c;
}
:global(html.dark .auth-primary:hover:not(:disabled)) {
  background: #f1f5f9;
}

:global(html.dark .auth-mode) {
  color: #94a3b8;
}
:global(html.dark .auth-mode:hover) {
  color: #f8fafc;
}
:global(html.dark .auth-mode-active) {
  border-color: #ffffff;
  color: #ffffff;
}
:global(html.dark .auth-mode:focus-visible) {
  outline-color: #38bdf8;
}

:global(html.dark .auth-error) {
  border-color: #881337;
  background: #4c0519/40;
  color: #fecdd3;
}

@media (prefers-reduced-motion: reduce) {
  .auth-primary {
    transition: none;
  }
}
</style>
