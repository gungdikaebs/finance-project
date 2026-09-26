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
  <div class="min-h-[100dvh] grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] bg-[#F3F5EF] dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1]">
    <aside class="relative hidden lg:flex h-[100dvh] lg:sticky lg:top-0 overflow-hidden bg-[#183D2B] text-[#F0F4F1]">
      <img src="/landing-budget-desk.jpg" alt="Seseorang mencatat rencana keuangan di meja kerja" class="absolute inset-0 w-full h-full object-cover" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#0D2218]/95 via-[#0D2218]/30 to-[#0D2218]/10"></div>
      <div class="relative z-10 self-end p-10 xl:p-16 max-w-2xl">
        <p class="text-sm font-semibold text-[#D5EC89] mb-4">Nalara</p>
        <p class="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.12]">Catat transaksi. Pahami kondisi keuanganmu.</p>
        <p class="mt-5 max-w-md text-base text-[#F0F4F1]/85 leading-relaxed">Atur anggaran dan pantau tabungan serta tujuanmu di satu tempat.</p>
      </div>
    </aside>

    <div class="min-h-[100dvh] flex flex-col px-5 sm:px-10 lg:px-12 py-7 sm:py-10">
      <header class="flex items-center justify-between gap-4">
        <RouterLink to="/" class="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183D2B] dark:focus-visible:outline-[#B8DF38]" aria-label="Nalara, kembali ke beranda">
          <NalaraLogo :with-badge="true" size="sm" />
          <span class="font-bold tracking-tight text-sm sm:text-base">Nalara</span>
        </RouterLink>
        <RouterLink to="/" class="inline-flex items-center gap-1.5 text-sm font-semibold text-[#24553D] dark:text-[#B8DF38] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current">
          <ArrowLeft class="w-4 h-4" /> Beranda
        </RouterLink>
      </header>

      <main class="flex-1 w-full max-w-[420px] mx-auto flex flex-col justify-center py-12 sm:py-16">
        <template v-if="googleCredential">
          <div class="w-12 h-12 rounded-2xl bg-[#E8F2C7] dark:bg-[#253719] text-[#183D2B] dark:text-[#B8DF38] grid place-items-center mb-6">
            <LockKeyhole class="w-6 h-6" />
          </div>
          <h1 class="text-3xl font-bold tracking-tight">Hubungkan akun lama</h1>
          <p class="mt-3 text-sm leading-relaxed text-[#5E6961] dark:text-[#B5C2B8]">Email Google ini cocok dengan akun Nalara yang sudah ada. Masukkan kata sandi akun tersebut untuk menghubungkan kedua cara masuk. Catatan keuanganmu tetap di akun yang sama.</p>
          <form class="mt-8 space-y-4" @submit.prevent="handleLink">
            <div>
              <label for="link-password" class="block text-sm font-semibold mb-2">Kata sandi akun lama</label>
              <input id="link-password" v-model="linkPassword" type="password" autocomplete="current-password" required class="auth-input" />
            </div>
            <p v-if="errorMessage" role="alert" class="auth-error">{{ errorMessage }}</p>
            <button type="submit" :disabled="loading" class="auth-primary w-full">{{ loading ? 'Menghubungkan...' : 'Hubungkan dan masuk' }}</button>
          </form>
          <button type="button" class="mt-5 self-start text-sm font-semibold text-[#24553D] dark:text-[#B8DF38] hover:underline" @click="googleCredential = null; linkPassword = ''; errorMessage = ''">Kembali ke pilihan masuk</button>
          <p class="mt-8 text-xs leading-relaxed text-[#5E6961] dark:text-[#B5C2B8]">Lupa kata sandi? Akun belum bisa dihubungkan lewat Google tanpa kata sandi akun yang sudah ada.</p>
        </template>

        <template v-else>
          <h1 class="text-3xl sm:text-[2.15rem] font-bold tracking-tight">{{ isRegister ? 'Buat akun Nalara' : 'Masuk ke Nalara' }}</h1>
          <p class="mt-2 text-sm leading-relaxed text-[#5E6961] dark:text-[#B5C2B8]">{{ isRegister ? 'Setelah mendaftar, kamu bisa mulai mencatat pemasukan dan pengeluaran.' : 'Lanjutkan catatan dan rencana keuanganmu.' }}</p>

          <div class="grid grid-cols-2 mt-8 border-b border-[#D2DDD2] dark:border-[#314035]" role="group" aria-label="Pilih metode akun">
            <button type="button" class="auth-mode" :class="!isRegister ? 'auth-mode-active' : ''" :aria-current="!isRegister ? 'page' : undefined" @click="setMode(false)">Masuk</button>
            <button type="button" class="auth-mode" :class="isRegister ? 'auth-mode-active' : ''" :aria-current="isRegister ? 'page' : undefined" @click="setMode(true)">Daftar akun</button>
          </div>

          <div class="mt-8">
            <GoogleSignInButton v-if="!googleUnavailable" @credential="handleGoogleCredential" @unavailable="googleUnavailable = $event" />
            <p v-if="googleUnavailable" role="status" class="rounded-xl bg-[#E9EFE8] dark:bg-[#1D2A20] px-4 py-3 text-sm text-[#425348] dark:text-[#CDD9CE]">{{ googleUnavailable }}</p>
            <p v-if="googleLoading" role="status" class="mt-3 text-sm text-[#5E6961] dark:text-[#B5C2B8]">Memproses akun Google...</p>
          </div>

          <div class="flex items-center gap-4 my-7 text-xs text-[#5E6961] dark:text-[#B5C2B8]"><span class="h-px flex-1 bg-[#D2DDD2] dark:bg-[#314035]"></span><span>{{ isRegister ? 'atau daftar dengan email' : 'atau masuk dengan email' }}</span><span class="h-px flex-1 bg-[#D2DDD2] dark:bg-[#314035]"></span></div>

          <p v-if="errorMessage" role="alert" class="auth-error mb-5">{{ errorMessage }}</p>
          <p v-if="successMessage" role="status" class="rounded-xl bg-[#E8F2C7] dark:bg-[#253719] px-4 py-3 mb-5 text-sm text-[#183D2B] dark:text-[#D5EC89]">{{ successMessage }}</p>

          <form class="space-y-4" @submit.prevent="handleSubmit">
            <div v-if="isRegister">
              <label for="auth-name" class="block text-sm font-semibold mb-2">Nama lengkap</label>
              <input id="auth-name" v-model="name" type="text" autocomplete="name" class="auth-input" />
            </div>
            <div>
              <label for="auth-email" class="block text-sm font-semibold mb-2">Email</label>
              <input id="auth-email" v-model="email" type="email" autocomplete="email" inputmode="email" class="auth-input" />
            </div>
            <div>
              <label for="auth-password" class="block text-sm font-semibold mb-2">Kata sandi</label>
              <div class="relative">
                <input id="auth-password" v-model="password" :type="showPassword ? 'text' : 'password'" :autocomplete="isRegister ? 'new-password' : 'current-password'" class="auth-input pr-12" />
                <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#5E6961] dark:text-[#B5C2B8] focus-visible:outline-2 focus-visible:outline-[#183D2B] dark:focus-visible:outline-[#B8DF38]" :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'" @click="showPassword = !showPassword">
                  <EyeOff v-if="showPassword" class="w-5 h-5" /><Eye v-else class="w-5 h-5" />
                </button>
              </div>
              <div v-if="isRegister && password" class="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs" aria-live="polite">
                <span :class="criteria.length ? 'text-[#24553D] dark:text-[#B8DF38]' : 'text-[#5E6961] dark:text-[#B5C2B8]'">{{ criteria.length ? '✓' : '○' }} 8 karakter</span>
                <span :class="criteria.upper ? 'text-[#24553D] dark:text-[#B8DF38]' : 'text-[#5E6961] dark:text-[#B5C2B8]'">{{ criteria.upper ? '✓' : '○' }} Huruf besar</span>
                <span :class="criteria.lower ? 'text-[#24553D] dark:text-[#B8DF38]' : 'text-[#5E6961] dark:text-[#B5C2B8]'">{{ criteria.lower ? '✓' : '○' }} Huruf kecil</span>
                <span :class="criteria.numberOrSymbol ? 'text-[#24553D] dark:text-[#B8DF38]' : 'text-[#5E6961] dark:text-[#B5C2B8]'">{{ criteria.numberOrSymbol ? '✓' : '○' }} Angka atau simbol</span>
              </div>
            </div>
            <button type="submit" :disabled="loading" class="auth-primary w-full mt-2 inline-flex items-center justify-center gap-2">
              {{ loading ? 'Memproses...' : isRegister ? 'Daftar dengan email' : 'Masuk dengan email' }}
              <ArrowRight v-if="!loading" class="w-4 h-4" />
            </button>
          </form>
        </template>
      </main>

      <footer class="text-center text-xs text-[#5E6961] dark:text-[#B5C2B8]">Nalara</footer>
    </div>
  </div>
</template>

<style scoped>
.auth-input {
  width: 100%;
  min-height: 3rem;
  border: 1px solid #b8c7ba;
  border-radius: 0.75rem;
  background: #fff;
  padding: 0.7rem 0.9rem;
  color: #18221b;
  font-size: 0.875rem;
  outline: none;
}
.auth-input::placeholder { color: #68766c; }
.auth-input:focus-visible { border-color: #183d2b; box-shadow: 0 0 0 3px rgba(24, 61, 43, 0.18); }
.auth-primary { min-height: 3rem; border-radius: 0.75rem; background: #183d2b; color: #f4f7ee; padding: 0.7rem 1rem; font-weight: 700; font-size: 0.875rem; transition: transform .18s ease, background-color .18s ease; }
.auth-primary:hover:not(:disabled) { background: #24553d; }
.auth-primary:active:not(:disabled) { transform: scale(.98); }
.auth-primary:disabled { opacity: .6; cursor: not-allowed; }
.auth-primary:focus-visible { outline: 3px solid #b8df38; outline-offset: 3px; }
.auth-mode { min-height: 2.75rem; border-bottom: 2px solid transparent; color: #5e6961; font-size: .875rem; font-weight: 600; }
.auth-mode-active { border-color: #183d2b; color: #183d2b; }
.auth-mode:focus-visible { outline: 2px solid #183d2b; outline-offset: -2px; }
.auth-error { border: 1px solid #f4bbbb; border-radius: .75rem; background: #fff1f1; padding: .75rem 1rem; color: #8b1e27; font-size: .875rem; line-height: 1.5; }
:global(html.dark .auth-input) { border-color: #536657; background: #0e1410; color: #f0f4f1; }
:global(html.dark input.auth-input::placeholder) { color: #b5c2b8 !important; }
:global(html.dark .auth-input:focus-visible) { border-color: #b8df38; box-shadow: 0 0 0 3px rgba(184, 223, 56, .23); }
:global(html.dark .auth-primary) { background: #b8df38; color: #0e1410; }
:global(html.dark .auth-primary:hover:not(:disabled)) { background: #c9e96a; }
:global(html.dark .auth-mode) { color: #b5c2b8; }
:global(html.dark .auth-mode-active) { border-color: #b8df38; color: #f0f4f1; }
:global(html.dark .auth-mode:focus-visible) { outline-color: #b8df38; }
:global(html.dark .auth-error) { border-color: #a7474f; background: #3b1a1e; color: #ffd6da; }
@media (prefers-reduced-motion: reduce) { .auth-primary { transition: none; } }
</style>
