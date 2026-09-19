<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
} from 'lucide-vue-next';

const isRegister = ref(false);
const name = ref('');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const auth = useAuthStore();
const router = useRouter();

// Password Strength Evaluation for Registration
const passwordCriteria = computed(() => {
  const pwd = password.value;
  return {
    minLength: pwd.length >= 8,
    hasUpper: /[A-Z]/.test(pwd),
    hasLower: /[a-z]/.test(pwd),
    hasNumberOrSymbol: /((?=.*\d)|(?=.*\W+))/.test(pwd),
  };
});

const passwordScore = computed(() => {
  const c = passwordCriteria.value;
  let score = 0;
  if (c.minLength) score++;
  if (c.hasUpper) score++;
  if (c.hasLower) score++;
  if (c.hasNumberOrSymbol) score++;
  return score;
});

const passwordStrengthMeta = computed(() => {
  const s = passwordScore.value;
  if (!password.value) {
    return { label: '', color: 'bg-stone-200 dark:bg-stone-700', width: '0%' };
  }
  if (s <= 1) {
    return { label: 'Sangat Lemah', color: 'bg-rose-500', width: '25%' };
  }
  if (s === 2) {
    return { label: 'Cukup', color: 'bg-amber-500', width: '50%' };
  }
  if (s === 3) {
    return { label: 'Baik', color: 'bg-blue-500', width: '75%' };
  }
  return { label: 'Sangat Kuat', color: 'bg-[#B8DF38]', width: '100%' };
});

const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!email.value || !password.value) {
    errorMessage.value = 'Mohon isi email dan kata sandi.';
    return;
  }

  if (isRegister.value) {
    if (!name.value.trim()) {
      errorMessage.value = 'Mohon isi nama lengkap.';
      return;
    }
    if (passwordScore.value < 4) {
      errorMessage.value =
        'Kata sandi harus minimal 8 karakter dan mengandung kombinasi huruf besar, huruf kecil, serta angka.';
      return;
    }
  }

  loading.value = true;
  try {
    if (isRegister.value) {
      await api.post('/auth/register', {
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value,
      });
      successMessage.value = 'Registrasi berhasil! Silakan masuk.';
      isRegister.value = false;
      password.value = '';
    } else {
      await auth.login(email.value.trim(), password.value);
      router.push('/dashboard');
    }
  } catch (err: any) {
    if (err.response?.status === 429) {
      errorMessage.value =
        'Terlalu banyak percobaan masuk. Demi keamanan, silakan tunggu 1 menit sebelum mencoba lagi.';
    } else {
      errorMessage.value =
        err.response?.data?.message || 'Terjadi kesalahan, silakan coba lagi.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-[100dvh] bg-[#F3F5EF] dark:bg-[#0E1410] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-200">
    <!-- Ambient subtle background glow -->
    <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#183D2B]/8 dark:bg-[#B8DF38]/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 left-1/3 w-80 h-80 bg-[#B8DF38]/10 dark:bg-[#183D2B]/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="fintech-card bg-white dark:bg-[#16201A] w-full max-w-md rounded-2xl shadow-xl border border-emerald-950/10 dark:border-[#243329] p-7 sm:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
      <!-- Header / Brand -->
      <div class="text-center mb-7">
        <div class="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-br from-[#183D2B] via-[#143425] to-[#0D2218] dark:from-[#132E21] dark:to-[#0A1B13] text-[#B8DF38] font-bold text-xl mb-3.5 shadow-md ring-4 ring-[#B8DF38]/20 tracking-wider border border-[#B8DF38]/30">
          PK
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-[#18221B] dark:text-[#F0F4F1]">Project-Keuangan</h1>
        <p class="text-xs text-[#18221B]/60 dark:text-[#98A79D] mt-1">Sistem Pengelolaan Keuangan Pribadi yang Terarah</p>
      </div>

      <!-- Mode Switcher Tabs -->
      <div class="flex rounded-xl bg-stone-200/50 dark:bg-[#0E1410] p-1 mb-6 border border-emerald-950/10 dark:border-[#243329]">
        <button
          type="button"
          @click="isRegister = false; errorMessage = ''; successMessage = '';"
          :class="[
            'tactile-btn flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer',
            !isRegister
              ? 'bg-white dark:bg-[#16201A] text-[#18221B] dark:text-[#F0F4F1] shadow-2xs'
              : 'text-[#18221B]/60 dark:text-[#98A79D] hover:text-[#18221B] dark:hover:text-[#F0F4F1]'
          ]"
        >
          Masuk
        </button>
        <button
          type="button"
          @click="isRegister = true; errorMessage = ''; successMessage = '';"
          :class="[
            'tactile-btn flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer',
            isRegister
              ? 'bg-white dark:bg-[#16201A] text-[#18221B] dark:text-[#F0F4F1] shadow-2xs'
              : 'text-[#18221B]/60 dark:text-[#98A79D] hover:text-[#18221B] dark:hover:text-[#F0F4F1]'
          ]"
        >
          Daftar Akun
        </button>
      </div>

      <!-- Alerts -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-start space-x-2 animate-in fade-in duration-150"
      >
        <AlertCircle class="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
        <span>{{ errorMessage }}</span>
      </div>

      <div
        v-if="successMessage"
        class="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-start space-x-2 animate-in fade-in duration-150"
      >
        <CheckCircle2 class="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
        <span>{{ successMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="isRegister">
          <label class="block text-[11px] font-bold text-[#18221B]/70 dark:text-[#98A79D] uppercase tracking-wider mb-1.5">
            Nama Lengkap
          </label>
          <div class="relative">
            <User class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#18221B]/40 dark:text-[#98A79D]/60 pointer-events-none" />
            <input
              v-model="name"
              type="text"
              placeholder="Misal: Dika Pratama"
              class="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/60 dark:bg-[#0E1410] border border-stone-200 dark:border-[#243329] rounded-xl text-xs sm:text-sm text-[#18221B] dark:text-[#F0F4F1] placeholder-[#18221B]/40 dark:placeholder-[#98A79D]/40 focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:border-[#183D2B] dark:focus:border-[#B8DF38] focus:ring-2 focus:ring-[#B8DF38]/30 transition"
            />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-[#18221B]/70 dark:text-[#98A79D] uppercase tracking-wider mb-1.5">
            Email
          </label>
          <div class="relative">
            <Mail class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#18221B]/40 dark:text-[#98A79D]/60 pointer-events-none" />
            <input
              v-model="email"
              type="email"
              placeholder="nama@email.com"
              class="w-full pl-10 pr-3.5 py-2.5 bg-stone-50/60 dark:bg-[#0E1410] border border-stone-200 dark:border-[#243329] rounded-xl text-xs sm:text-sm text-[#18221B] dark:text-[#F0F4F1] placeholder-[#18221B]/40 dark:placeholder-[#98A79D]/40 focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:border-[#183D2B] dark:focus:border-[#B8DF38] focus:ring-2 focus:ring-[#B8DF38]/30 transition"
            />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-[#18221B]/70 dark:text-[#98A79D] uppercase tracking-wider mb-1.5">
            Kata Sandi
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#18221B]/40 dark:text-[#98A79D]/60 pointer-events-none" />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="w-full pl-10 pr-10 py-2.5 bg-stone-50/60 dark:bg-[#0E1410] border border-stone-200 dark:border-[#243329] rounded-xl text-xs sm:text-sm text-[#18221B] dark:text-[#F0F4F1] placeholder-[#18221B]/40 dark:placeholder-[#98A79D]/40 focus:bg-white dark:focus:bg-[#0E1410] focus:outline-none focus:border-[#183D2B] dark:focus:border-[#B8DF38] focus:ring-2 focus:ring-[#B8DF38]/30 transition"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-[#F0F4F1] cursor-pointer p-1"
              :title="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
            >
              <EyeOff v-if="showPassword" class="w-4 h-4" />
              <Eye v-else class="w-4 h-4" />
            </button>
          </div>

          <!-- Password Strength Meter (Only on Registration) -->
          <div v-if="isRegister && password" class="mt-2.5 p-3 rounded-xl bg-stone-50 dark:bg-[#0E1410] border border-stone-200 dark:border-[#243329] space-y-2">
            <div class="flex items-center justify-between text-[11px]">
              <span class="text-stone-500 dark:text-[#98A79D]">Kekuatan Sandi:</span>
              <span class="font-bold text-[#18221B] dark:text-[#F0F4F1]">{{ passwordStrengthMeta.label }}</span>
            </div>

            <!-- Progress bar -->
            <div class="w-full h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-300 rounded-full"
                :class="passwordStrengthMeta.color"
                :style="{ width: passwordStrengthMeta.width }"
              ></div>
            </div>

            <!-- Requirements Checklist -->
            <div class="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
              <div
                class="flex items-center gap-1"
                :class="passwordCriteria.minLength ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-400 dark:text-stone-500'"
              >
                <Check class="w-3 h-3" />
                <span>Min. 8 karakter</span>
              </div>
              <div
                class="flex items-center gap-1"
                :class="passwordCriteria.hasUpper ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-400 dark:text-stone-500'"
              >
                <Check class="w-3 h-3" />
                <span>Huruf besar (A-Z)</span>
              </div>
              <div
                class="flex items-center gap-1"
                :class="passwordCriteria.hasLower ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-400 dark:text-stone-500'"
              >
                <Check class="w-3 h-3" />
                <span>Huruf kecil (a-z)</span>
              </div>
              <div
                class="flex items-center gap-1"
                :class="passwordCriteria.hasNumberOrSymbol ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-stone-400 dark:text-stone-500'"
              >
                <Check class="w-3 h-3" />
                <span>Angka / simbol</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="tactile-btn w-full mt-3 py-3 px-4 bg-[#183D2B] dark:bg-[#B8DF38] hover:bg-[#204e37] dark:hover:bg-[#A3C82E] text-white dark:text-[#0E1410] font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <template v-if="loading">
            <Loader2 class="w-4 h-4 animate-spin text-[#B8DF38] dark:text-[#0E1410]" />
            <span>Memproses...</span>
          </template>
          <template v-else>
            <span>{{ isRegister ? 'Daftar Sekarang' : 'Masuk ke Aplikasi' }}</span>
            <ArrowRight class="w-4 h-4 text-[#B8DF38] dark:text-[#0E1410]" />
          </template>
        </button>
      </form>

      <!-- Subtext footer -->
      <div class="mt-6 pt-4 border-t border-emerald-950/10 dark:border-[#243329] text-center">
        <p class="text-[11px] text-[#18221B]/50 dark:text-[#98A79D]">
          Metode 50/30/20 &bull; Multi-Goal Tabungan &bull; Multi-Dompet
        </p>
      </div>
    </div>
  </div>
</template>

