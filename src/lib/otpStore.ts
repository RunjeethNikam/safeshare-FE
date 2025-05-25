// src/lib/otpStore.ts
interface OTPData {
  otp: string;
  expires: number;
  attempts: number;
}

// Use globalThis to ensure persistence across API calls
declare global {
  var otpStoreInstance: Map<string, OTPData> | undefined;
}

// Create or get the global store
const getOTPStore = (): Map<string, OTPData> => {
  if (!globalThis.otpStoreInstance) {
    globalThis.otpStoreInstance = new Map<string, OTPData>();
  }
  return globalThis.otpStoreInstance;
};

export const otpStore = {
  set(email: string, data: OTPData): void {
    const store = getOTPStore();
    const emailKey = email.toLowerCase().trim();
    store.set(emailKey, data);
  },

  get(email: string): OTPData | undefined {
    const store = getOTPStore();
    const emailKey = email.toLowerCase().trim();
    return store.get(emailKey);
  },

  delete(email: string): boolean {
    const store = getOTPStore();
    const emailKey = email.toLowerCase().trim();
    return store.delete(emailKey);
  },

  getStoreState(): Record<string, OTPData & { expired: boolean }> {
    const store = getOTPStore();
    const state: Record<string, OTPData & { expired: boolean }> = {};
    store.forEach((value, key) => {
      state[key] = {
        ...value,
        expired: Date.now() > value.expires
      };
    });
    return state;
  },

  getAllKeys(): string[] {
    const store = getOTPStore();
    return Array.from(store.keys());
  },

  getSize(): number {
    const store = getOTPStore();
    return store.size;
  },

  // Method to check if store is working
  testStore(): void {
    const store = getOTPStore();
    const testKey = 'test@example.com';
    const testData: OTPData = { otp: '123456', expires: Date.now() + 60000, attempts: 0 };
    
    store.set(testKey, testData);
    const retrieved = store.get(testKey);
    store.delete(testKey);
  }
};

// Helper functions
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function verifyOTP(email: string, providedOtp: string): boolean {
  const emailKey = email.toLowerCase().trim();
  const cleanOtp = providedOtp.toString().trim();
  
  const stored = otpStore.get(emailKey);
  
  if (!stored) {
    return false;
  }

  // Check if expired
  const now = Date.now();
  if (now > stored.expires) {
    otpStore.delete(emailKey);
    return false;
  }

  // Check attempts (max 5 attempts)
  if (stored.attempts >= 5) {
    otpStore.delete(emailKey);
    return false;
  }

  // Increment attempts - we need to update the stored object
  stored.attempts++;
  otpStore.set(emailKey, stored); // Update the store with incremented attempts

  // Check OTP - convert both to strings and trim
  const storedOtpStr = stored.otp.toString().trim();
  const providedOtpStr = cleanOtp.toString().trim();
  
  if (storedOtpStr === providedOtpStr) {
    otpStore.delete(emailKey); // Clear OTP after successful verification
    return true;
  }

  return false;
}