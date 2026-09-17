const API = 'http://localhost:3001';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} on ${path}: ${JSON.stringify(json)}`);
  }
  return json.data !== undefined ? json.data : json;
}

async function runTest() {
  console.log('--- TEST TAHAP 3: TABUNGAN & TARGET ALOKASI ---');

  const email = `test_tahap3_${Date.now()}@example.com`;
  const password = 'Password123!';

  console.log(`1. Mendaftarkan & login user: ${email}`);
  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name: 'Tester Tahap 3' }),
  });
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const token = loginRes.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  console.log('2. Inisialisasi Finance Profile (Saldo Awal Rp 10.000.000, Kebutuhan Bulanan Rp 3.000.000)');
  await request('/finance-profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      initialBalance: '10000000',
      monthlyNeeds: '3000000',
      startDate: '2026-09-01',
      timezone: 'Asia/Makassar',
    }),
  });

  console.log('3. Cek Default Savings Goals (Harus otomatis ada Dana Pengaman & Tabungan Belum Ditentukan)');
  const defaultGoals = await request('/savings-goals', { headers: authHeaders });
  console.log(`   Ditemukan ${defaultGoals.length} default goals:`, defaultGoals.map(g => `${g.name} (${g.type})`));
  const emergencyGoal = defaultGoals.find(g => g.type === 'EMERGENCY');
  if (!emergencyGoal) throw new Error('Default Dana Pengaman tidak ditemukan!');

  console.log('4. Buat Target Impian: Beli Laptop (Rp 15jt) & Liburan (Rp 5jt)');
  const laptopGoal = await request('/savings-goals', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Beli Laptop',
      type: 'PURCHASE',
      priceReference: '15000000',
    }),
  });
  const liburanGoal = await request('/savings-goals', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Liburan',
      type: 'PURCHASE',
      priceReference: '5000000',
    }),
  });

  // Uji PATCH /savings-goals/shares (70% Laptop, 30% Liburan)
  await request('/savings-goals/shares', {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      shares: [
        { goalId: laptopGoal.id, shareRatio: 5000 },
        { goalId: liburanGoal.id, shareRatio: 5000 },
      ],
    }),
  });

  console.log('5. Cek Status Alokasi (Awal: Saldo 10jt, Belum Disisihkan 10jt, Tersisih 0)');
  const statusAwal = await request('/allocations/status', { headers: authHeaders });
  console.log('   Status:', statusAwal);
  if (statusAwal.unallocatedMoney !== '10000000') throw new Error('Unallocated money tidak sesuai!');

  console.log('6. Cek Preview Sisihkan Rp 5.000.000 (Aturan 60% Dana Pengaman = 3jt, 40% Impian = 1jt Laptop + 1jt Liburan)');
  const preview = await request('/allocations/preview-save?amount=5000000', { headers: authHeaders });
  console.log('   Preview Items:', preview.previewItems);
  const pEmerg = preview.previewItems.find(p => p.type === 'EMERGENCY');
  if (pEmerg.amount !== '3000000') throw new Error(`Preview Dana Pengaman salah: ${pEmerg.amount}`);

  console.log('7. Eksekusi Sisihkan (Allocate) Rp 5.000.000');
  await request('/allocations/allocate', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      allocations: preview.previewItems.map(p => ({
        targetGoalId: p.targetGoalId,
        amount: p.amount,
      })),
      date: '2026-09-17',
      note: 'Sisihkan tabungan bulanan',
    }),
  });

  console.log('8. Verifikasi Invarian: Saldo Utama Tetap 10jt, Tersisih 5jt, Belum Disisihkan 5jt');
  const statusAfterAlloc = await request('/allocations/status', { headers: authHeaders });
  console.log('   Status Setelah Alokasi:', statusAfterAlloc);
  if (statusAfterAlloc.mainBalance !== '10000000') throw new Error('INVARIANT VIOLATION: Saldo utama berubah!');
  if (statusAfterAlloc.totalAllocated !== '5000000') throw new Error('Total tersisih salah!');
  if (statusAfterAlloc.unallocatedMoney !== '5000000') throw new Error('Belum disisihkan salah!');

  console.log('9. Coba Sisihkan melebihi Uang Belum Disisihkan (Harus Ditolak HTTP 400)');
  let overRejected = false;
  try {
    await request('/allocations/allocate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        allocations: [{ targetGoalId: emergencyGoal.id, amount: '6000000' }],
      }),
    });
  } catch (err) {
    overRejected = true;
    console.log('   Ditolak dengan aman:', err.message);
  }
  if (!overRejected) throw new Error('Seharusnya alokasi berlebih ditolak!');

  console.log('10. Uji Pelepasan Alokasi (Release) Rp 500.000 dari Dana Pengaman');
  await request('/allocations/release', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      sourceGoalId: emergencyGoal.id,
      amount: '500000000' ? '500000' : '0',
      note: 'Perlu dana bebas',
    }),
  });
  const statusAfterRelease = await request('/allocations/status', { headers: authHeaders });
  console.log('   Status Setelah Release:', statusAfterRelease);
  if (statusAfterRelease.totalAllocated !== '4500000') throw new Error('Total tersisih setelah release salah!');
  if (statusAfterRelease.unallocatedMoney !== '5500000') throw new Error('Belum disisihkan setelah release salah!');
  if (statusAfterRelease.mainBalance !== '10000000') throw new Error('INVARIANT VIOLATION: Saldo utama berubah saat release!');

  console.log('11. Uji Belanja dengan Sumber Dana Tabungan (Beli Laptop Rp 400.000)');
  const catRes = await request('/categories', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Gadget', type: 'expense', group: 'WANT' }),
  });
  const spendTrx = await request('/transactions', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: '400000',
      categoryId: catRes.id,
      date: '2026-09-17',
      sourceGoalId: laptopGoal.id,
      note: 'Beli mouse laptop',
    }),
  });
  console.log('   Transaksi tercipta dengan sourceGoal:', spendTrx.sourceGoal?.name);

  console.log('12. Cek Laporan Summary & Emergency Months');
  const summary = await request('/reports/summary', { headers: authHeaders });
  console.log('   Summary:', {
    mainBalance: summary.mainBalance,
    totalAllocatedSavings: summary.totalAllocatedSavings,
    unallocatedMoney: summary.unallocatedMoney,
    emergencyBalance: summary.emergencyBalance,
    emergencyMonths: summary.emergencyMonths,
  });

  if (summary.mainBalance !== '9600000') throw new Error('Saldo utama setelah belanja salah!');
  if (summary.totalAllocatedSavings !== '4100000') throw new Error('Total dana tersisih salah!');
  if (summary.unallocatedMoney !== '5500000') throw new Error('Uang bebas salah!');
  // Emergency balance: 3jt - 500k = 2.5jt. Emergency months: 2.5jt / 3jt = 0.8
  if (summary.emergencyBalance !== '2500000') throw new Error('Saldo dana darurat salah!');
  if (summary.emergencyMonths !== 0.8) throw new Error(`Emergency months salah: ${summary.emergencyMonths}`);

  console.log('\n>>> SEMUA 12 TES TAHAP 3 BERHASIL DILALUI DENGAN SEMPURNA! <<<');
}

runTest().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
