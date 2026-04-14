import * as Crypto from 'expo-crypto';

// Polyfill for crypto.getRandomValues in React Native / Expo environment
// This ensures that libraries like crypto-js and uuid can generate secure random numbers.

if (typeof global.crypto !== 'object') {
  (global as any).crypto = {};
}

if (typeof global.crypto.getRandomValues !== 'function') {
  (global as any).crypto.getRandomValues = (array: any) => {
    return Crypto.getRandomValues(array);
  };
}

console.log('[CryptoPolyfill] Secure random values polyfill applied.');
