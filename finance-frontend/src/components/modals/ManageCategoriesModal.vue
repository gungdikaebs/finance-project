<script setup lang="ts">
import { ref, computed } from 'vue';
import { financeApi, type Category, type IncomeSource } from '../../api/services';
import { Tag, Plus, Archive, X, ArrowDownLeft, Check, FolderTree, RotateCcw, Pencil, Trash2 } from 'lucide-vue-next';

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
const newCatGroup = ref<'NEED' | 'WANT'>('NEED');
const submittingSource = ref(false);
const submittingCat = ref(false);

const expenseCategories = computed(() => {
  return props.categories.filter((c) => c.type === 'expense');
});

// Edit state for Category
const editingCatId = ref<number | null>(null);
const editingCatName = ref('');
const editingCatGroup = ref<'NEED' | 'WANT' | 'UNASSIGNED'>('NEED');
const submittingEditCat = ref(false);

const startEditCategory = (cat: Category) => {
  editingCatId.value = cat.id;
  editingCatName.value = cat.name;
  editingCatGroup.value = cat.group;
};

const cancelEditCategory = () => {
  editingCatId.value = null;
  editingCatName.value = '';
};

import { useToast } from '../../composables/useToast';
import { useConfirm } from '../../composables/useConfirm';

const toast = useToast();
const confirmDialog = useConfirm();

const handleUpdateCategory = async (id: number) => {
  if (!editingCatName.value.trim()) return;
  submittingEditCat.value = true;
  try {
    await financeApi.updateCategory(id, {
      name: editingCatName.value.trim(),
      group: editingCatGroup.value,
    });
    toast.success('Kategori berhasil diperbarui');
    editingCatId.value = null;
    emit('refresh');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal memperbarui kategori');
  } finally {
    submittingEditCat.value = false;
  }
};

const handleDeleteCategory = async (cat: Category) => {
  const confirmed = await confirmDialog.ask({
    title: 'Hapus Kategori Permanen',
    message: `PERINGATAN: Menghapus kategori "${cat.name}" akan menghapus seluruh data transaksi terkait secara permanen. Hal ini akan memengaruhi jumlah total ${cat.type === 'income' ? 'pemasukan' : 'pengeluaran'} Anda. Apakah Anda yakin?`,
    confirmText: 'Hapus Permanen',
    cancelText: 'Batal',
    type: 'danger',
  });
  if (!confirmed) return;

  try {
    await financeApi.deleteCategory(cat.id);
    toast.success(`Kategori "${cat.name}" berhasil dihapus.`);
    emit('refresh');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menghapus kategori');
  }
};

// Edit state for Income Source
const editingSourceId = ref<number | null>(null);
const editingSourceName = ref('');
const submittingEditSource = ref(false);

const startEditSource = (src: IncomeSource) => {
  editingSourceId.value = src.id;
  editingSourceName.value = src.name;
};

const cancelEditSource = () => {
  editingSourceId.value = null;
  editingSourceName.value = '';
};

const handleUpdateSource = async (id: number) => {
  if (!editingSourceName.value.trim()) return;
  submittingEditSource.value = true;
  try {
    await financeApi.updateIncomeSource(id, {
      name: editingSourceName.value.trim(),
    });
    toast.success('Sumber pemasukan berhasil diperbarui');
    editingSourceId.value = null;
    emit('refresh');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal memperbarui sumber pemasukan');
  } finally {
    submittingEditSource.value = false;
  }
};

const handleDeleteSource = async (src: IncomeSource) => {
  const confirmed = await confirmDialog.ask({
    title: 'Hapus Sumber Pemasukan',
    message: `PERINGATAN: Menghapus sumber pemasukan "${src.name}" akan menghapus seluruh data transaksi dan aturan alokasi terkait secara permanen. Hal ini akan memengaruhi riwayat pemasukan Anda. Apakah Anda yakin?`,
    confirmText: 'Hapus Permanen',
    cancelText: 'Batal',
    type: 'danger',
  });
  if (!confirmed) return;

  try {
    await financeApi.deleteIncomeSource(src.id);
    toast.success(`Sumber pemasukan "${src.name}" berhasil dihapus.`);
    emit('refresh');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menghapus sumber pemasukan');
  }
};

const handleAddSource = async () => {
  if (!newSource.value.trim()) return;
  submittingSource.value = true;
  try {
    await financeApi.createIncomeSource(newSource.value.trim());
    toast.success(`Sumber pemasukan "${newSource.value.trim()}" berhasil ditambahkan`);
    newSource.value = '';
    emit('refresh');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menambahkan sumber pemasukan');
  } finally {
    submittingSource.value = false;
  }
};

const handleArchiveSource = async (id: number) => {
  const target = props.incomeSources.find((s) => s.id === id);
  const confirmed = await confirmDialog.ask({
    title: 'Arsipkan Sumber Pemasukan',
    message: `Yakin ingin mengarsipkan sumber pemasukan "${target?.name || ''}"? Sumber ini tidak akan muncul pada pilihan transaksi baru.`,
    confirmText: 'Arsipkan',
    cancelText: 'Batal',
    type: 'warning',
  });
  if (!confirmed) return;

  try {
    await financeApi.archiveIncomeSource(id);
    toast.success('Sumber pemasukan berhasil diarsipkan');
    emit('refresh');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal mengarsipkan');
  }
};

const handleUnarchiveSource = async (id: number) => {
  try {
    await financeApi.unarchiveIncomeSource(id);
    toast.success('Sumber pemasukan berhasil dipulihkan');
    emit('refresh');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal memulihkan sumber pemasukan');
  }
};

const handleAddCategory = async () => {
  if (!newCatName.value.trim()) return;
  submittingCat.value = true;
  try {
    await financeApi.createCategory({
      name: newCatName.value.trim(),
      type: 'expense',
      group: newCatGroup.value,
    });
    toast.success(`Kategori "${newCatName.value.trim()}" berhasil ditambahkan`);
    newCatName.value = '';
    newCatGroup.value = 'NEED';
    emit('refresh');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal menambahkan kategori');
  } finally {
    submittingCat.value = false;
  }
};

const handleArchiveCategory = async (id: number) => {
  const target = props.categories.find((c) => c.id === id);
  const confirmed = await confirmDialog.ask({
    title: 'Arsipkan Kategori',
    message: `Yakin ingin mengarsipkan kategori "${target?.name || ''}"? Kategori ini tidak akan muncul pada pilihan transaksi baru.`,
    confirmText: 'Arsipkan',
    cancelText: 'Batal',
    type: 'warning',
  });
  if (!confirmed) return;

  try {
    await financeApi.archiveCategory(id);
    toast.success('Kategori berhasil diarsipkan');
    emit('refresh');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal mengarsipkan kategori');
  }
};

const handleUnarchiveCategory = async (id: number) => {
  try {
    await financeApi.unarchiveCategory(id);
    toast.success('Kategori berhasil dipulihkan');
    emit('refresh');
  } catch (err: any) {
    toast.error(err.response?.data?.message || 'Gagal memulihkan kategori');
  }
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center p-0 sm:p-4 glass-modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="manage-categories-title"
    @click.self="emit('close')"
  >
    <div class="bg-white dark:bg-[#16201A] rounded-t-3xl sm:rounded-2xl max-h-[92dvh] sm:max-h-[85vh] w-full max-w-2xl mx-auto flex flex-col shadow-2xl border border-stone-200/90 dark:border-[#243329] overflow-hidden animate-modal-enter">
      <!-- Modal Header (shrink-0) -->
      <div class="px-5 sm:px-6 py-4 border-b border-stone-100 dark:border-[#243329] flex items-center justify-between shrink-0 bg-white dark:bg-[#16201A]">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-[#243329] text-[#183D2B] dark:text-[#B8DF38] flex items-center justify-center shrink-0 border border-emerald-100/50 dark:border-[#344639]">
            <FolderTree class="w-5 h-5" />
          </div>
          <div>
            <h3 id="manage-categories-title" class="text-base sm:text-lg font-bold text-[#18221B] dark:text-[#F0F4F1] leading-tight">
              Kelola Kategori & Sumber Dana
            </h3>
            <p class="text-xs text-[#18221B]/60 dark:text-[#98A79D]">Atur sumber pemasukan serta kategori pos kebutuhan dan keinginan</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="tactile-btn min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-[#F0F4F1] hover:bg-stone-100 dark:hover:bg-[#243329] transition cursor-pointer"
          aria-label="Tutup dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Body Content (flex-1 overscroll-contain) -->
      <div class="p-5 sm:p-6 overflow-y-auto flex-1 overscroll-contain space-y-6">
        <!-- Bagian Sumber Pemasukan -->
      <div class="space-y-3.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <ArrowDownLeft class="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#18221B] dark:text-[#F0F4F1]">Sumber Pemasukan</h4>
          </div>
          <span class="text-[11px] text-[#18221B]/50 dark:text-[#98A79D] font-medium">
            {{ incomeSources.filter(s => !s.isArchived).length }} Aktif
          </span>
        </div>

        <div class="flex gap-2">
          <input
            v-model="newSource"
            type="text"
            placeholder="Nama sumber baru (misal: Gaji Kantor, Freelance, Dividen)"
            class="flex-1 px-3.5 py-2.5 bg-stone-50/70 dark:bg-[#0E1410] border border-stone-200 dark:border-[#243329] rounded-xl text-xs sm:text-sm text-[#18221B] dark:text-[#F0F4F1] placeholder-[#18221B]/40 dark:placeholder-stone-500 focus:outline-none focus:bg-white dark:focus:bg-[#0E1410] focus:border-[#183D2B] dark:focus:border-[#B8DF38] focus:ring-2 focus:ring-[#B8DF38]/30 transition"
          />
          <button
            @click="handleAddSource"
            :disabled="submittingSource || !newSource.trim()"
            class="tactile-btn px-4 py-2.5 bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] text-xs font-semibold rounded-xl hover:bg-[#204e37] dark:hover:bg-[#a3c82e] disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer transition shadow-xs"
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
            :class="src.isArchived ? 'bg-stone-100 dark:bg-[#0E1410] text-[#18221B]/40 dark:text-stone-500 border-stone-200 dark:border-[#243329]' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/50 shadow-2xs'"
          >
            <!-- Inline Edit Form for Source -->
            <template v-if="editingSourceId === src.id">
              <input
                v-model="editingSourceName"
                type="text"
                class="px-2 py-0.5 border border-emerald-500 dark:border-[#B8DF38] rounded bg-white dark:bg-[#0E1410] text-xs text-[#18221B] dark:text-[#F0F4F1] focus:outline-none"
                @keyup.enter="handleUpdateSource(src.id)"
              />
              <button
                type="button"
                @click="handleUpdateSource(src.id)"
                :disabled="submittingEditSource"
                class="p-0.5 text-emerald-700 dark:text-[#B8DF38] hover:text-emerald-900 cursor-pointer"
                title="Simpan perubahan"
              >
                <Check class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                @click="cancelEditSource"
                class="p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-[#F0F4F1] cursor-pointer"
                title="Batal"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </template>

            <!-- Regular View for Source -->
            <template v-else>
              <span class="font-medium">{{ src.name }}</span>

              <div class="flex items-center space-x-1 ml-1">
                <!-- Edit button -->
                <button
                  type="button"
                  @click="startEditSource(src)"
                  class="p-0.5 text-stone-400 hover:text-[#183D2B] dark:hover:text-[#B8DF38] transition cursor-pointer"
                  title="Ubah nama sumber"
                >
                  <Pencil class="w-3 h-3" />
                </button>

                <!-- Archive / Restore button -->
                <button
                  v-if="!src.isArchived"
                  @click="handleArchiveSource(src.id)"
                  class="text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 p-0.5 rounded transition cursor-pointer"
                  title="Arsipkan sumber ini"
                >
                  <Archive class="w-3 h-3" />
                </button>
                <button
                  v-else
                  type="button"
                  @click="handleUnarchiveSource(src.id)"
                  class="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-200 p-0.5 rounded transition cursor-pointer"
                  title="Pulihkan sumber ini"
                >
                  <RotateCcw class="w-3 h-3" />
                </button>

                <!-- Delete button -->
                <button
                  type="button"
                  @click="handleDeleteSource(src)"
                  class="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded transition cursor-pointer"
                  title="Hapus permanen sumber ini"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>

              <span v-if="src.isArchived" class="text-[10px] text-[#18221B]/40 dark:text-stone-500 font-mono">(Arsip)</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Bagian Kategori Pengeluaran (Pos 50/30/20) -->
      <div class="space-y-3.5 border-t border-stone-100 dark:border-[#243329] pt-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <Tag class="w-4 h-4 text-[#183D2B] dark:text-[#B8DF38]" />
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#18221B] dark:text-[#F0F4F1]">Kategori Pengeluaran (Pos 50/30/20)</h4>
          </div>
          <span class="text-[11px] text-[#18221B]/50 dark:text-[#98A79D] font-medium">
            {{ expenseCategories.filter(c => !c.isArchived).length }} Aktif
          </span>
        </div>

        <form @submit.prevent="handleAddCategory" class="flex flex-col sm:flex-row gap-2">
          <input
            v-model="newCatName"
            type="text"
            placeholder="Nama kategori pengeluaran (misal: Makan & Minum)"
            class="flex-1 px-3.5 py-2.5 bg-stone-50/70 dark:bg-[#0E1410] border border-stone-200 dark:border-[#243329] rounded-xl text-xs sm:text-sm text-[#18221B] dark:text-[#F0F4F1] placeholder-[#18221B]/40 dark:placeholder-stone-500 focus:outline-none focus:bg-white dark:focus:bg-[#0E1410] focus:border-[#183D2B] dark:focus:border-[#B8DF38] focus:ring-2 focus:ring-[#B8DF38]/30 transition"
          />
          <select
            v-model="newCatGroup"
            class="w-full sm:w-auto px-3 py-2.5 border border-stone-200 dark:border-[#243329] rounded-xl text-xs sm:text-sm bg-white dark:bg-[#0E1410] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none focus:border-[#183D2B] dark:focus:border-[#B8DF38] focus:ring-2 focus:ring-[#B8DF38]/30 transition cursor-pointer"
          >
            <option value="NEED">Kebutuhan (Need)</option>
            <option value="WANT">Keinginan (Want)</option>
          </select>
          <button
            type="submit"
            :disabled="submittingCat || !newCatName.trim()"
            class="tactile-btn px-4 py-2.5 bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] text-xs font-semibold rounded-xl hover:bg-[#204e37] dark:hover:bg-[#a3c82e] disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer transition shadow-xs shrink-0"
          >
            <Plus class="w-4 h-4" />
            <span>{{ submittingCat ? 'Menyimpan...' : 'Tambah' }}</span>
          </button>
        </form>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
          <div
            v-for="cat in expenseCategories"
            :key="cat.id"
            class="p-3 rounded-xl border transition"
            :class="cat.isArchived ? 'bg-stone-100 dark:bg-[#0E1410] border-stone-200 dark:border-[#243329] opacity-70' : 'bg-white dark:bg-[#0E1410] border-stone-200 dark:border-[#243329] hover:border-stone-300 dark:hover:border-[#344639] shadow-2xs'"
          >
            <!-- Inline Edit Form for Category -->
            <template v-if="editingCatId === cat.id">
              <div class="space-y-2">
                <input
                  v-model="editingCatName"
                  type="text"
                  placeholder="Nama kategori"
                  class="w-full px-2.5 py-1.5 border border-emerald-500 dark:border-[#B8DF38] rounded-lg text-xs bg-white dark:bg-[#16201A] text-[#18221B] dark:text-[#F0F4F1] focus:outline-none"
                  @keyup.enter="handleUpdateCategory(cat.id)"
                />
                <div class="flex items-center justify-between gap-2">
                  <select
                    v-model="editingCatGroup"
                    class="px-2 py-1 border border-stone-200 dark:border-[#243329] rounded-lg text-xs bg-white dark:bg-[#16201A] text-[#18221B] dark:text-[#F0F4F1]"
                  >
                    <option value="NEED">Kebutuhan (Need)</option>
                    <option value="WANT">Keinginan (Want)</option>
                  </select>
                  <div class="flex items-center space-x-1 ml-auto">
                    <button
                      type="button"
                      @click="handleUpdateCategory(cat.id)"
                      :disabled="submittingEditCat"
                      class="tactile-btn px-2.5 py-1 bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] text-xs font-bold rounded-lg flex items-center space-x-1 cursor-pointer"
                    >
                      <Check class="w-3 h-3 text-[#B8DF38] dark:text-[#0E1410]" />
                      <span>Simpan</span>
                    </button>
                    <button
                      type="button"
                      @click="cancelEditCategory"
                      class="tactile-btn px-2 py-1 bg-stone-100 dark:bg-[#243329] hover:bg-stone-200 dark:hover:bg-[#2e4034] text-stone-600 dark:text-stone-300 text-xs rounded-lg cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- Regular View for Category -->
            <template v-else>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2.5 min-w-0">
                  <span
                    class="w-2 h-2 rounded-full shrink-0"
                    :class="cat.group === 'NEED' ? 'bg-blue-600 dark:bg-blue-400' : 'bg-amber-500 dark:bg-amber-400'"
                  ></span>
                  <div class="min-w-0">
                    <p class="font-semibold text-xs text-[#18221B] dark:text-[#F0F4F1] truncate">{{ cat.name }}</p>
                    <div class="flex items-center space-x-1.5 text-[10px] text-[#18221B]/55 dark:text-[#98A79D] font-medium">
                      <span v-if="cat.group === 'NEED'" class="text-blue-700 dark:text-blue-400 font-semibold">Kebutuhan (Need)</span>
                      <span v-else class="text-amber-700 dark:text-amber-400 font-semibold">Keinginan (Want)</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-1 shrink-0">
                  <!-- Edit button -->
                  <button
                    type="button"
                    @click="startEditCategory(cat)"
                    class="p-1.5 rounded-lg text-stone-400 hover:text-[#183D2B] dark:hover:text-[#B8DF38] hover:bg-stone-100 dark:hover:bg-[#243329] transition cursor-pointer"
                    title="Ubah nama / kelompok kategori"
                  >
                    <Pencil class="w-3.5 h-3.5" />
                  </button>

                  <!-- Archive / Restore button -->
                  <button
                    v-if="!cat.isArchived"
                    @click="handleArchiveCategory(cat.id)"
                    class="p-1.5 rounded-lg text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#243329] transition cursor-pointer"
                    title="Arsipkan kategori"
                  >
                    <Archive class="w-3.5 h-3.5" />
                  </button>
                  <button
                    v-else
                    type="button"
                    @click="handleUnarchiveCategory(cat.id)"
                    class="tactile-btn px-2 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-lg transition cursor-pointer flex items-center space-x-1 text-[11px] font-bold shadow-2xs"
                    title="Pulihkan kategori ini"
                  >
                    <RotateCcw class="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                    <span>Pulihkan</span>
                  </button>

                  <!-- Delete button -->
                  <button
                    type="button"
                    @click="handleDeleteCategory(cat)"
                    class="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#243329] transition cursor-pointer"
                    title="Hapus permanen kategori ini"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
      </div>

      <!-- Modal Footer (shrink-0) -->
      <div class="flex items-center justify-end px-5 sm:px-6 py-3.5 border-t border-stone-100 dark:border-[#243329] bg-stone-50/80 dark:bg-[#0E1410]/70 shrink-0">
        <button
          @click="emit('close')"
          class="tactile-btn min-h-[44px] px-6 py-2.5 bg-[#183D2B] dark:bg-[#B8DF38] text-white dark:text-[#0E1410] hover:bg-emerald-900 dark:hover:bg-[#a3c82e] rounded-xl text-xs font-bold cursor-pointer transition flex items-center space-x-1.5 shadow-sm"
        >
          <Check class="w-4 h-4 text-[#B8DF38] dark:text-[#0E1410]" />
          <span>Selesai</span>
        </button>
      </div>
    </div>
  </div>
</template>

