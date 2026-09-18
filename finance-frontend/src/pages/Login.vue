<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import { User, Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-vue-next';

const isRegister = ref(false);
const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const auth = useAuthStore();
const router = useRouter();

const handleSubmit = async () => {
  errorMessage.value = '';
  successMessage.value = '';

  if (!email.value || !password.value) {
    errorMessage.value = 'Mohon isi email dan kata sandi.';
    return;
  }

  if (isRegister.value && !name.value) {
    errorMessage.value = 'Mohon isi nama lengkap.';
    return;
  }

  loading.value = true;
  try {
    if (isRegister.value) {
      await api.post('/auth/register', {
        name: name.value,
        email: email.value,
        password: password.value,
      });
      successMessage.value = 'Registrasi berhasil! Silakan masuk.';
      isRegister.value = false;
      password.value = '';
    } else {
      await auth.login(email.value, password.value);
      router.push('/dashboard');
    }
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.message || 'Terjadi kesalahan, silakan coba lagi.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#F3F5EF] flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Ambient subtle background glow -->
    <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#183D2B]/8 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 left-1/3 w-80 h-80 bg-[#B8DF38]/10 rounded-full blur-3xl pointer-events-none"></div>

    <div class="fintech-card bg-white w-full max-w-md rounded-2xl shadow-xl border border-emerald-950/10 p-7 sm:p-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
      <!-- Header / Brand -->
      <div class="text-center mb-7">
        <div class="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-gradient-to-br from-[#183D2B] via-[#143425] to-[#0D2218] text-[#B8DF38] font-bold text-xl mb-3.5 shadow-md ring-4 ring-[#B8DF38]/20 tracking-wider">
          PK
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-[#18221B]">Project-Keuangan</h1>
        <p class="text-xs text-[#18221B]/60 mt-1">Sistem Pengelolaan Keuangan Pribadi yang Terarah</p>
      </div>

      <!-- Mode Switcher Tabs -->
      <div class="flex rounded-xl bg-canvas p-1 mb-6 border border-emerald-950/10">
        <button
          type="button"
          @click="isRegister = false; errorMessage = ''; successMessage = '';"
          :class="[
            'tactile-btn flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer',
            !isRegister
              ? 'bg-white text-[#18221B] shadow-2xs'
              : 'text-[#18221B]/60 hover:text-[#18221B]'
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
              ? 'bg-white text-[#18221B] shadow-2xs'
              : 'text-[#18221B]/60 hover:text-[#18221B]'
          ]"
        >
          Daftar Akun
        </button>
      </div>

      <!-- Alerts -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3.5 bg-red-50/90 border border-red-200 text-red-700 text-xs rounded-xl flex items-start space-x-2 animate-in fade-in duration-150"
      >
        <AlertCircle class="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
        <span>{{ errorMessage }}</span>
      </div>

      <div
        v-if="successMessage"
        class="mb-4 p-3.5 bg-emerald-50/90 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start space-x-2 animate-in fade-in duration-150"
      >
        <CheckCircle2 class="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
        <span>{{ successMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="isRegister">
          <label class="block text-[11px] font-bold text-[#18221B]/70 uppercase tracking-wider mb-1.5">
            Nama Lengkap
          </label>
          <div class="relative">
            <User class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#18221B]/40 pointer-events-none" />
            <input
              v-model="name"
              type="text"
              placeholder="Misal: Dika Pratama"
              class="w-full pl-10 pr-3.5 py-2.5 bg-canvas/40 border border-emerald-950/15 rounded-xl text-xs sm:text-sm text-[#18221B] placeholder-[#18221B]/40 focus:bg-white focus:outline-none focus:border-[#183D2B] focus:ring-2 focus:ring-[#B8DF38]/30 transition"
            />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-[#18221B]/70 uppercase tracking-wider mb-1.5">
            Email
          </label>
          <div class="relative">
            <Mail class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#18221B]/40 pointer-events-none" />
            <input
              v-model="email"
              type="email"
              placeholder="nama@email.com"
              class="w-full pl-10 pr-3.5 py-2.5 bg-canvas/40 border border-emerald-950/15 rounded-xl text-xs sm:text-sm text-[#18221B] placeholder-[#18221B]/40 focus:bg-white focus:outline-none focus:border-[#183D2B] focus:ring-2 focus:ring-[#B8DF38]/30 transition"
            />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-[#18221B]/70 uppercase tracking-wider mb-1.5">
            Kata Sandi
          </label>
          <div class="relative">
            <Lock class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#18221B]/40 pointer-events-none" />
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="w-full pl-10 pr-3.5 py-2.5 bg-canvas/40 border border-emerald-950/15 rounded-xl text-xs sm:text-sm text-[#18221B] placeholder-[#18221B]/40 focus:bg-white focus:outline-none focus:border-[#183D2B] focus:ring-2 focus:ring-[#B8DF38]/30 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="tactile-btn w-full mt-3 py-3 px-4 bg-[#183D2B] hover:bg-[#204e37] text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <template v-if="loading">
            <Loader2 class="w-4 h-4 animate-spin text-[#B8DF38]" />
            <span>Memproses...</span>
          </template>
          <template v-else>
            <span>{{ isRegister ? 'Daftar Sekarang' : 'Masuk ke Aplikasi' }}</span>
            <ArrowRight class="w-4 h-4 text-[#B8DF38]" />
          </template>
        </button>
      </form>

      <!-- Subtext footer -->
      <div class="mt-6 pt-4 border-t border-emerald-950/10 text-center">
        <p class="text-[11px] text-[#18221B]/50">
          Metode 50/30/20 &bull; Multi-Goal Tabungan &bull; Simulasi KPR
        </p>
      </div>
    </div>
  </div>
</template>

