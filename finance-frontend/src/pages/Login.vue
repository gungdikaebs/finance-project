<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth.store';
import { useRouter } from 'vue-router';
import api from '../api/axios';

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
  <div class="min-h-screen bg-[#F3F5EF] flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#183D2B] text-[#B8DF38] font-bold text-xl mb-3 shadow-inner">
          PK
        </div>
        <h1 class="text-2xl font-bold text-[#202820]">Project-Keuangan</h1>
        <p class="text-sm text-gray-500 mt-1">Pengelolaan Keuangan Pribadi yang Terarah</p>
      </div>

      <!-- Mode Switcher -->
      <div class="flex rounded-lg bg-gray-100 p-1 mb-6">
        <button
          type="button"
          @click="isRegister = false; errorMessage = ''; successMessage = '';"
          :class="[
            'flex-1 py-2 text-sm font-medium rounded-md transition-all',
            !isRegister ? 'bg-white text-[#202820] shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-900'
          ]"
        >
          Masuk
        </button>
        <button
          type="button"
          @click="isRegister = true; errorMessage = ''; successMessage = '';"
          :class="[
            'flex-1 py-2 text-sm font-medium rounded-md transition-all',
            isRegister ? 'bg-white text-[#202820] shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-900'
          ]"
        >
          Daftar Akun
        </button>
      </div>

      <!-- Alerts -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
        {{ successMessage }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div v-if="isRegister">
          <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Nama Lengkap</label>
          <input
            v-model="name"
            type="text"
            placeholder="Misal: Dika Pratama"
            class="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-[#202820] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="nama@email.com"
            class="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-[#202820] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Kata Sandi</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-[#202820] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#183D2B]"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full mt-2 py-3 px-4 bg-[#183D2B] hover:bg-[#24553d] text-white font-semibold rounded-lg shadow transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
        >
          <span v-if="loading">Memproses...</span>
          <span v-else>{{ isRegister ? 'Daftar Sekarang' : 'Masuk ke Aplikasi' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>
