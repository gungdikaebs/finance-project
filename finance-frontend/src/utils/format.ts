export const formatRupiah = (val?: string | number | bigint | null): string => {
  if (val === undefined || val === null || val === '') return 'Rp 0';
  const num = typeof val === 'bigint' ? val.toString() : String(val);
  const parts = num.replace(/[^0-9-]/g, '');
  if (!parts) return 'Rp 0';
  const isNeg = parts.startsWith('-');
  const clean = isNeg ? parts.slice(1) : parts;
  return (isNeg ? '- Rp ' : 'Rp ') + clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format string/number input dengan pemisah ribuan titik Indonesia (contoh: "3000000" -> "3.000.000")
 */
export const formatNumberInput = (val?: string | number | null): string => {
  if (val === undefined || val === null) return '';
  const digits = String(val).replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits, 10).toLocaleString('id-ID');
};

/**
 * Bersihkan string angka berformat menjadi string digit murni untuk payload API (contoh: "3.000.000" -> "3000000")
 */
export const parseCleanNumber = (val?: string | number | null): string => {
  if (val === undefined || val === null) return '0';
  return String(val).replace(/\D/g, '') || '0';
};
