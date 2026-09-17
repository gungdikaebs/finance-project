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
  console.log('--- TEST TAHAP 4: SIMULASI KPR & TARGET IMPIAN ---');

  const email = `test_tahap4_${Date.now()}@example.com`;
  const password = 'Password123!';

  console.log(`1. Registrasi & Login user: ${email}`);
  await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name: 'Tester Tahap 4' }),
  });
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const token = loginRes.token;
  const authHeaders = { Authorization: `Bearer ${token}` };

  console.log('2. Uji Simulasi Target: Beli Cash Tanpa Inflasi (Harga 25jt, Tabungan 1jt, Setoran 500rb/bln)');
  const res1 = await request('/simulations/goal', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      priceReference: '25000000',
      currentSavings: '1000000',
      annualPriceIncreaseRatio: 0,
      mode: 'FULL',
      calculationMode: 'TARGET_DATE',
      monthlySavings: '500000',
    }),
  });
  console.log('   Hasil Test 1:', {
    isAchievable: res1.isAchievable,
    targetMonths: res1.targetMonths,
    requiredFunds: res1.requiredFunds,
  });
  if (!res1.isAchievable || res1.targetMonths !== 48) {
    throw new Error(`Test 1 Gagal: targetMonths seharusnya 48, dapat ${res1.targetMonths}`);
  }

  console.log('3. Uji Simulasi Target: Mode Tenggat Waktu 24 Bulan (Harga 25jt, Tabungan 1jt)');
  const res2 = await request('/simulations/goal', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      priceReference: '25000000',
      currentSavings: '1000000',
      annualPriceIncreaseRatio: 0,
      mode: 'FULL',
      calculationMode: 'MONTHLY_SAVINGS',
      targetMonths: 24,
    }),
  });
  console.log('   Hasil Test 2:', {
    targetMonths: res2.targetMonths,
    monthlySavings: res2.monthlySavings,
  });
  if (res2.monthlySavings !== '1000000') {
    throw new Error(`Test 2 Gagal: monthlySavings seharusnya 1000000, dapat ${res2.monthlySavings}`);
  }

  console.log('4. Uji Simulasi Target: Mode DP + Biaya Awal + Inflasi 5% (12 Bulan)');
  const res3 = await request('/simulations/goal', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      priceReference: '100000000',
      annualPriceIncreaseRatio: 500, // 5%
      mode: 'DOWN_PAYMENT',
      dpPercent: 2000, // 20%
      initialFees: '5000000',
      calculationMode: 'MONTHLY_SAVINGS',
      targetMonths: 12,
    }),
  });
  console.log('   Hasil Test 3:', {
    projectedPrice: res3.projectedPrice,
    downPayment: res3.downPayment,
    loanPrincipal: res3.loanPrincipal,
    requiredFunds: res3.requiredFunds,
    monthlySavings: res3.monthlySavings,
  });
  // Harga setelah 12 bulan (5%): 105.000.000
  if (res3.projectedPrice !== '105000000') throw new Error('Proyeksi harga salah!');
  // DP 20%: 21.000.000
  if (res3.downPayment !== '21000000') throw new Error('DP salah!');
  // Pokok pinjaman: 105M - 21M = 84.000.000
  if (res3.loanPrincipal !== '84000000') throw new Error('Pokok pinjaman salah!');
  // Dana dibutuhkan (DP 21M + Fees 5M = 26M)
  if (res3.requiredFunds !== '26000000') throw new Error('Required funds salah!');

  console.log('5. Uji Batas Horizon 600 Bulan (Target 100 Miliar dengan Setoran Rp 10.000/bln)');
  const res4 = await request('/simulations/goal', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      priceReference: '100000000000',
      mode: 'FULL',
      calculationMode: 'TARGET_DATE',
      monthlySavings: '10000',
    }),
  });
  console.log('   Hasil Test 4:', {
    isAchievable: res4.isAchievable,
    message: res4.message,
  });
  if (res4.isAchievable !== false) throw new Error('Harusnya tidak tercapai dalam 600 bulan!');

  console.log('6. Uji Simulasi KPR: Bunga Nol (Pokok 120jt, Tenor 120 bulan)');
  const res5 = await request('/simulations/mortgage', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      principal: '120000000',
      tenorMonths: 120,
      fixedRate: 0,
      fixedMonths: 120,
      floatingRate: 0,
    }),
  });
  console.log('   Hasil Test 5:', {
    fixedInstallment: res5.fixedInstallment,
    totalInterest: res5.totalInterest,
    totalLoanPayment: res5.totalLoanPayment,
  });
  if (res5.fixedInstallment !== '1000000') throw new Error('Cicilan bunga 0 salah!');
  if (res5.totalInterest !== '0') throw new Error('Total bunga 0 salah!');
  if (res5.totalLoanPayment !== '120000000') throw new Error('Total pembayaran salah!');

  console.log('7. Uji Simulasi KPR: Suku Bunga Bertahap (Pokok 500jt, 15 Tahun, Fixed 5% 3 thn -> Floating 10%)');
  const res6 = await request('/simulations/mortgage', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      principal: '500000000',
      tenorMonths: 180,
      fixedRate: 5.0,
      fixedMonths: 36,
      floatingRate: 10.0,
      monthlyIncome: '20000000',
    }),
  });
  console.log('   Hasil Test 6:', {
    fixedInstallment: res6.fixedInstallment,
    floatingInstallment: res6.floatingInstallment,
    installmentJump: res6.installmentJump,
    balanceBeforeFloating: res6.balanceBeforeFloating,
    totalInterest: res6.totalInterest,
    fixedDsr: res6.fixedDsr,
    floatingDsr: res6.floatingDsr,
  });
  // Fixed installment 5% 180 bln untuk 500jt sekitar Rp 3.953.972
  const fixedInst = Number(res6.fixedInstallment);
  if (fixedInst < 3900000 || fixedInst > 4000000) {
    throw new Error(`Cicilan fixed tidak wajar: ${res6.fixedInstallment}`);
  }
  // Floating installment pasti naik signifikan saat rate naik ke 10%
  const floatInst = Number(res6.floatingInstallment);
  if (floatInst <= fixedInst) {
    throw new Error(`Cicilan floating harusnya lebih tinggi dari fixed: ${res6.floatingInstallment}`);
  }
  // Sisa pokok setelah 3 tahun harus berkurang dari 500jt (sekitar 430-440jt)
  const balBeforeFloat = Number(res6.balanceBeforeFloating);
  if (balBeforeFloat >= 500000000 || balBeforeFloat <= 400000000) {
    throw new Error(`Sisa pokok sebelum floating tidak wajar: ${res6.balanceBeforeFloating}`);
  }

  console.log('8. Uji Invarian Read-Only: Pastikan Tidak Ada Mutasi Database');
  const txList = await request('/transactions', { headers: authHeaders });
  if (txList.items.length !== 0) throw new Error('INVARIANT VIOLATION: Simulasi membuat transaksi!');

  console.log('\n>>> SEMUA 8 TES TAHAP 4 (SIMULASI KPR & TARGET) BERHASIL DILALUI DENGAN SEMPURNA! <<<');
}

runTest().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
