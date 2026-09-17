export interface EnvironmentConfig {
  DATABASE_URL?: string;
  PORT?: string;
  JWT_SECRET: string;
  [key: string]: unknown;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentConfig {
  const secret = config.JWT_SECRET;
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new Error('JWT_SECRET wajib diisi');
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET minimal 32 karakter');
  }

  return config as EnvironmentConfig;
}
