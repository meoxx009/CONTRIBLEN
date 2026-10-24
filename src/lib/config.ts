/**
 * ContribLens OSS — Configuration and Environment Loader
 * Strictly enforces security rules:
 * - Server secrets are NEVER exposed in NEXT_PUBLIC_* variables
 * - Safe typed defaults for scan boundaries, timeouts, and feature toggles
 * - Production environment validation
 */

export interface ScanLimits {
  maxFiles: number;
  maxFileBytes: number;
  maxTotalBytes: number;
  maxTreeEntries: number;
}

export interface FeatureControls {
  enableGemini: boolean;
  enableOsv: boolean;
  enableDemoMode: boolean;
}

export interface GeminiConfig {
  apiKey?: string;
  model: string;
  timeoutMs: number;
}

export function getScanLimits(): ScanLimits {
  return {
    maxFiles: Number(process.env.SCAN_MAX_FILES) || 60,
    maxFileBytes: Number(process.env.SCAN_MAX_FILE_BYTES) || 180000,
    maxTotalBytes: Number(process.env.SCAN_MAX_TOTAL_BYTES) || 3000000,
    maxTreeEntries: Number(process.env.SCAN_MAX_TREE_ENTRIES) || 20000,
  };
}

export function getFeatureControls(): FeatureControls {
  return {
    enableGemini: process.env.ENABLE_GEMINI !== 'false',
    enableOsv: process.env.ENABLE_OSV !== 'false',
    enableDemoMode: process.env.ENABLE_DEMO_MODE === 'true',
  };
}

export function getGeminiConfig(): GeminiConfig {
  return {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    timeoutMs: Number(process.env.GEMINI_API_TIMEOUT_MS) || 15000,
  };
}

export function validateEnvironmentSecurity(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check 1: Forbidden public variable leaks
  const envKeys = Object.keys(process.env);
  const sensitiveNames = ['GEMINI_API_KEY', 'SUPABASE_SERVICE_ROLE_KEY', 'GITHUB_TOKEN', 'JWT_SECRET'];

  for (const key of envKeys) {
    if (key.startsWith('NEXT_PUBLIC_')) {
      for (const secret of sensitiveNames) {
        if (key.includes(secret)) {
          errors.push(`CRITICAL: Server secret "${secret}" exposed in public variable "${key}"`);
        }
      }
    }
  }

  // Check 2: Production safety checks
  if (process.env.NODE_ENV === 'production') {
    if (process.env.ENABLE_DEMO_MODE === 'true') {
      errors.push('Demo mode must not be silently enabled in production.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
