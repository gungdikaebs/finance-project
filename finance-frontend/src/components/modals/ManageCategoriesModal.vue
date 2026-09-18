<script setup lang="ts">
import { ref } from 'vue';
import { financeApi, type Category, type IncomeSource } from '../../api/services';
import { Tag, Plus, Archive, X, ArrowDownLeft, Check, FolderTree } from 'lucide-vue-next';

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
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 glass-modal-backdrop overflow-y-auto"
    role="dialog"
    aria-modal="true"
    aria-labelledby="manage-categories-title"
    @click.self="emit('close')"
  >
    <div class="fintech-card bg-white w-full max-w-2xl rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-emerald-950/10 animate-in fade-in zoom-in-95 duration-200">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-emerald-950/10 pb-4">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-[#183D2B]/10 text-[#183D2B] flex items-center justify-center">
            <FolderTree class="w-5 h-5" />
          </div>
          <div>
            <h3 id="manage-categories-title" class="text-base sm:text-lg font-bold text-[#18221B]">
              Kelola Kategori & Sumber Dana
            </h3>
            <p class="text-xs text-[#18221B]/60">Atur sumber pemasukan serta kategori pos kebutuhan dan keinginan</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="rounded-xl p-2 text-emerald-950/40 hover:text-emerald-950 hover:bg-emerald-950/5 transition cursor-pointer"
          aria-label="Tutup dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Bagian Sumber Pemasukan -->
      <div class="space-y-3.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <ArrowDownLeft class="w-4 h-4 text-emerald-700" />
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#18221B]">Sumber Pemasukan</h4>
          </div>
          <span class="text-[11px] text-[#18221B]/50 font-medium">
            {{ incomeSources.filter(s => !s.isArchived).length }} Aktif
          </span>
        </div>

        <div class="flex gap-2">
          <input
            v-model="newSource"
            type="text"
            placeholder="Nama sumber baru (misal: Gaji Kantor, Freelance, Dividen)"
            class="flex-1 px-3.5 py-2.5 bg-canvas/40 border border-emerald-950/15 rounded-xl text-xs sm:text-sm text-[#18221B] placeholder-[#18221B]/40 focus:outline-none focus:bg-white focus:border-[#183D2B] focus:ring-2 focus:ring-[#B8DF38]/30 transition"
          />
          <button
            @click="handleAddSource"
            :disabled="submittingSource || !newSource.trim()"
            class="tactile-btn px-4 py-2.5 bg-[#183D2B] text-white text-xs font-semibold rounded-xl hover:bg-[#204e37] disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer transition shadow-xs"
          >
            <Plus class="w-4 h-4" />
            <span>{{ submittingSource ? 'Menyimpan...' : 'Tambah' }}</span>
          </button>
        </div>

        <div class="flex flex-wrap gap-2 pt-1">
          <div
            v-for="src in incomeSources"
            :key="src.id"
            class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs transition"
            :class="src.isArchived ? 'bg-canvas/60 text-[#18221B]/40 border-emerald-950/10' : 'bg-emerald-50 text-emerald-900 border-emerald-200/70 shadow-2xs'"
          >
            <span class="font-medium">{{ src.name }}</span>
            <button
              v-if="!src.isArchived"
              @click="handleArchiveSource(src.id)"
              class="text-emerald-900/40 hover:text-red-600 ml-1 p-0.5 rounded transition cursor-pointer"
              title="Arsipkan sumber ini"
            >
              <Archive class="w-3.5 h-3.5" />
            </button>
            <span v-else class="text-[10px] text-[#18221B]/40 font-mono">(Arsip)</span>
          </div>
        </div>
      </div>

      <!-- Bagian Kategori Pengeluaran & Pemasukan -->
      <div class="space-y-3.5 border-t border-emerald-950/10 pt-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <Tag class="w-4 h-4 text-[#183D2B]" />
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#18221B]">Kategori Alokasi</h4>
          </div>
          <span class="text-[11px] text-[#18221B]/50 font-medium">
            {{ categories.filter(c => !c.isArchived).length }} Aktif
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            v-model="newCatName"
            type="text"
            placeholder="Nama kategori (misal: Makan & Minum)"
            class="sm:col-span-5 px-3.5 py-2.5 bg-canvas/40 border border-emerald-950/15 rounded-xl text-xs sm:text-sm text-[#18221B] placeholder-[#18221B]/40 focus:outline-none focus:bg-white focus:border-[#183D2B] focus:ring-2 focus:ring-[#B8DF38]/30 transition"
          />
          <select
            v-model="newCatType"
            class="sm:col-span-3 px-3 py-2.5 border border-emerald-950/15 rounded-xl text-xs sm:text-sm bg-white text-[#18221B] focus:outline-none focus:border-[#183D2B] focus:ring-2 focus:ring-[#B8DF38]/30 transition cursor-pointer"
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
          <select
            v-if="newCatType === 'expense'"
            v-model="newCatGroup"
            class="sm:col-span-4 px-3 py-2.5 border border-emerald-950/15 rounded-xl text-xs sm:text-sm bg-white text-[#18221B] focus:outline-none focus:border-[#183D2B] focus:ring-2 focus:ring-[#B8DF38]/30 transition cursor-pointer"
          >
            <option value="NEED">Kebutuhan (Need)</option>
            <option value="WANT">Keinginan (Want)</option>
          </select>
          <div v-else class="sm:col-span-4 flex items-center px-3 text-xs text-[#18221B]/50 italic">
            Pos masuk pendapatan
          </div>
        </div>

        <div>
          <button
            @click="handleAddCategory"
            :disabled="submittingCat || !newCatName.trim()"
            class="tactile-btn px-4 py-2.5 bg-[#183D2B] text-white text-xs font-semibold rounded-xl hover:bg-[#204e37] disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer transition shadow-xs"
          >
            <Plus class="w-4 h-4" />
            <span>{{ submittingCat ? 'Menyimpan...' : 'Tambah Kategori' }}</span>
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <div
            v-for="cat in categories"
            :key="cat.id"
            class="flex items-center justify-between p-3 rounded-xl border transition"
            :class="cat.isArchived ? 'bg-canvas/50 border-emerald-950/10 opacity-60' : 'bg-white border-emerald-950/10 hover:border-emerald-950/20 shadow-2xs'"
          >
            <div class="flex items-center space-x-2.5 min-w-0">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="cat.type === 'income' ? 'bg-emerald-500' : (cat.group === 'NEED' ? 'bg-blue-600' : 'bg-amber-500')"
              ></span>
              <div class="min-w-0">
                <p class="font-semibold text-xs text-[#18221B] truncate">{{ cat.name }}</p>
                <div class="flex items-center space-x-1.5 text-[10px] text-[#18221B]/55 font-medium">
                  <span v-if="cat.type === 'income'" class="text-emerald-700">Pemasukan</span>
                  <span v-else-if="cat.group === 'NEED'" class="text-blue-700 font-semibold">Kebutuhan (50%)</span>
                  <span v-else class="text-amber-700 font-semibold">Keinginan (30%)</span>
                </div>
              </div>
            </div>

            <button
              v-if="!cat.isArchived"
              @click="handleArchiveCategory(cat.id)"
              class="shrink-0 p-1.5 rounded-lg text-emerald-950/40 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
              title="Arsipkan kategori"
            >
              <Archive class="w-3.5 h-3.5" />
            </button>
            <span v-else class="shrink-0 text-[10px] text-[#18221B]/40 font-mono px-2 py-0.5 bg-canvas rounded-md">
              Arsip
            </span>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="flex justify-end pt-4 border-t border-emerald-950/10">
        <button
          @click="emit('close')"
          class="tactile-btn px-5 py-2.5 bg-canvas hover:bg-emerald-950/10 text-[#18221B] rounded-xl text-xs font-bold cursor-pointer transition flex items-center space-x-1.5"
        >
          <Check class="w-4 h-4 text-emerald-700" />
          <span>Selesai</span>
        </button>
      </div>
    </div>
  </div>
</template>

