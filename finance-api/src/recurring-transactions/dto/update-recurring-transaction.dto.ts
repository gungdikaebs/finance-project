import {
  IsString,
  IsIn,
  IsOptional,
  IsInt,
  Min,
  Max,
  Matches,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class UpdateRecurringTransactionDto {
  @IsOptional()
  @IsString()
  @IsIn(['expense', 'income'], {
    message: 'Tipe harus "expense" atau "income"',
  })
  type?: 'expense' | 'income';

  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d*$/, {
    message: 'Nominal harus berupa angka bulat positif lebih dari 0',
  })
  amount?: string;

  @IsOptional()
  @IsInt({ message: 'ID Kategori harus berupa integer' })
  categoryId?: number;

  @IsOptional()
  @IsInt({ message: 'ID Sumber Pemasukan harus berupa integer' })
  incomeSourceId?: number;

  @IsOptional()
  @IsString()
  @IsIn(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'], {
    message: 'Frekuensi harus DAILY, WEEKLY, MONTHLY, atau YEARLY',
  })
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

  @IsOptional()
  @IsInt({ message: 'Interval harus berupa integer' })
  @Min(1, { message: 'Interval minimal 1' })
  @Max(365, { message: 'Interval maksimal 365' })
  interval?: number;

  @IsOptional()
  @IsInt({ message: 'Hari eksekusi harus berupa integer' })
  @Min(1, { message: 'Hari eksekusi minimal 1' })
  @Max(31, { message: 'Hari eksekusi maksimal 31' })
  dayOfExecution?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal mulai harus YYYY-MM-DD' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal akhir harus YYYY-MM-DD' })
  endDate?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
