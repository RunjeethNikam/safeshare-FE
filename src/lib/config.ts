// src/lib/config.ts
// Environment configuration helper

interface Config {
  apiBaseUrl: string;
  resendApiKey: string;
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

function getConfig(): Config {
  // Validate required environment variables
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const resendApiKey = process.env.RESEND_API_KEY;
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (!apiBaseUrl) {
    console.warn('⚠️ NEXT_PUBLIC_API_BASE_URL not set, using default');
  }

  if (!resendApiKey) {
    console.warn('⚠️ RESEND_API_KEY not set, email sending will fail');
  }

  return {
    apiBaseUrl: apiBaseUrl,
    resendApiKey: resendApiKey || '',
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
  };
}

export const config = getConfig();

// Export individual values for convenience
export const {
  apiBaseUrl,
  resendApiKey,
  nodeEnv,
  isDevelopment,
  isProduction,
} = config;