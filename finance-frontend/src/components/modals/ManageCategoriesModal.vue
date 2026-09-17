<script setup lang="ts">
import { ref } from 'vue';
import { financeApi, type Category, type IncomeSource } from '../../api/services';

const props = defineProps<{
  show: boolean;
  categories: Category[];
  incomeSources: IncomeSource[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'refresh'): void;
}>();

const newSource = ref('');
const newCatName = ref('');
const newCatType = ref<'income' | 'expense'>('expense');
const newCatGroup = ref<'NEED' | 'WANT' | 'UNASSIGNED'>('NEED');
const submittingSource = ref(false);
const submittingCat = ref(false);

const handleAddSource = async () => {
  if (!newSource.value.trim()) return;
  submittingSource.value = true;
  try {
    await financeApi.createIncomeSource(newSource.value.trim());
    newSource.value = '';
    emit('refresh');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menambahkan sumber pemasukan');
  } finally {
    submittingSource.value = false;
  }
};

const handleArchiveSource = async (id: number) => {
  if (!confirm('Yakin ingin mengarsipkan sumber pemasukan ini?')) return;
  try {
    await financeApi.archiveIncomeSource(id);
    emit('refresh');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal mengarsipkan');
  }
};

const handleAddCategory = async () => {
  if (!newCatName.value.trim()) return;
  submittingCat.value = true;
  try {
    await financeApi.createCategory({
      name: newCatName.value.trim(),
      type: newCatType.value,
      group: newCatType.value === 'expense' ? newCatGroup.value : undefined,
    });
    newCatName.value = '';
    emit('refresh');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal menambahkan kategori');
  } finally {
    submittingCat.value = false;
  }
};

const handleArchiveCategory = async (id: number) => {
  if (!confirm('Yakin ingin mengarsipkan kategori ini?')) return;
  try {
    await financeApi.archiveCategory(id);
    emit('refresh');
  } catch (err: any) {
    alert(err.response?.data?.message || 'Gagal mengarsipkan kategori');
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
    role="dialog"
    aria-modal="true"
    aria-labelledby="manage-categories-title"
  >
    <div class="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between border-b pb-3">
        <h3 id="manage-categories-title" class="text-lg font-bold text-[#202820]">Kelola Kategori & Sumber Pemasukan</h3>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
          aria-label="Tutup dialog"
        >
          ✕
        </button>
      </div>

      <!-- Bagian Sumber Pemasukan -->
      <div class="space-y-3">
        <h4 class="text-sm font-bold text-gray-800 uppercase tracking-wider">Sumber Pemasukan</h4>
        <div class="flex space-x-2">
          <input
            v-model="newSource"
            type="text"
            placeholder="Nama sumber baru (misal: Gaji Kantor, Freelance)"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#183D2B]"
          />
          <button
            @click="handleAddSource"
            :disabled="submittingSource"
            class="px-4 py-2 bg-[#183D2B] text-white text-xs font-semibold rounded-lg hover:bg-[#24553d] disabled:opacity-50 cursor-pointer transition"
          >
            {{ submittingSource ? 'Menambah...' : 'Tambah' }}
          </button>
        </div>

        <div class="flex flex-wrap gap-2 pt-2">
          <div
            v-for="src in incomeSources"
            :key="src.id"
            class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs"
            :class="src.isArchived ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-green-50 text-green-800 border-green-200'"
          >
            <span>{{ src.name }}</span>
            <button
              v-if="!src.isArchived"
              @click="handleArchiveSource(src.id)"
              class="text-red-500 hover:text-red-700 ml-1 font-bold cursor-pointer"
              title="Arsipkan"
            >
              ✕
            </button>
            <span v-else class="text-[10px] text-gray-400">(Arsip)</span>
          </div>
        </div>
      </div>

      <!-- Bagian Kategori -->
      <div class="space-y-3 border-t pt-4">
        <h4 class="text-sm font-bold text-gray-800 uppercase tracking-wider">Kategori Pengeluaran & Pemasukan</h4>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            v-model="newCatName"
            type="text"
            placeholder="Nama kategori"
            class="sm:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#183D2B]"
          />
          <select
            v-model="newCatType"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#183D2B]"
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
          <select
            v-if="newCatType === 'expense'"
            v-model="newCatGroup"
            class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#183D2B]"
          >
            <option value="NEED">Kebutuhan (Need)</option>
            <option value="WANT">Keinginan (Want)</option>
          </select>
        </div>
        <button
          @click="handleAddCategory"
          :disabled="submittingCat"
          class="px-4 py-2 bg-[#183D2B] text-white text-xs font-semibold rounded-lg hover:bg-[#24553d] disabled:opacity-50 cursor-pointer transition"
        >
          {{ submittingCat ? 'Menambah...' : 'Tambah Kategori' }}
        </button>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="flex items-center justify-between px-3 py-2 rounded-lg border text-xs"
            :class="cat.isArchived ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white border-gray-200'"
          >
            <div>
              <span class="font-semibold text-gray-800">{{ cat.name }}</span>
              <span class="text-[10px] text-gray-500 ml-1.5">
                ({{ cat.type === 'income' ? 'Pemasukan' : cat.group }})
              </span>
            </div>
            <button
              v-if="!cat.isArchived"
              @click="handleArchiveCategory(cat.id)"
              class="text-red-500 hover:text-red-700 text-xs cursor-pointer"
            >
              Arsipkan
            </button>
            <span v-else class="text-[10px] text-gray-400">Diarsipkan</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-4 border-t">
        <button
          @click="emit('close')"
          class="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold cursor-pointer transition"
        >
          Selesai
        </button>
      </div>
    </div>
  </div>
</template>
