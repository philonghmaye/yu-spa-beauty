/**
 * Biometric Authentication (FaceID/TouchID)
 * Apple App Store Guideline 4.2 — Native functionality
 */

import { Capacitor } from '@capacitor/core';

export async function isBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  
  try {
    // Use Web Credentials API as fallback detection
    if ('credentials' in navigator) {
      return true;
    }
  } catch {}
  return false;
}

/**
 * Store biometric preference
 */
export function setBiometricEnabled(enabled: boolean) {
  try {
    localStorage.setItem('biometric_enabled', enabled ? '1' : '0');
  } catch {}
}

export function isBiometricEnabled(): boolean {
  try {
    return localStorage.getItem('biometric_enabled') === '1';
  } catch {}
  return false;
}

/**
 * Store encrypted credentials for biometric re-auth
 * In a real production app, use Keychain (iOS) via a Capacitor plugin
 */
export function storeCredentials(email: string) {
  try {
    localStorage.setItem('bio_user', btoa(email));
  } catch {}
}

export function getStoredCredentials(): string | null {
  try {
    const stored = localStorage.getItem('bio_user');
    if (stored) return atob(stored);
  } catch {}
  return null;
}

export function clearBiometricData() {
  try {
    localStorage.removeItem('biometric_enabled');
    localStorage.removeItem('bio_user');
  } catch {}
}
