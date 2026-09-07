import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Dynamically resolves the FastAPI backend URL based on execution environment:
 * - Web browser: http://localhost:8000/api/v1
 * - Physical device via Expo Go: http://<computer-lan-ip>:8000/api/v1
 * - Android Emulator: http://10.0.2.2:8000/api/v1
 */
function resolveBackendUrl(): string {
  // 1. If explicit env variable is set
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? `${envUrl}api/v1` : `${envUrl}/api/v1`;
  }

  // 2. Web browser environment
  if (Platform.OS === 'web') {
    return 'http://localhost:8000/api/v1';
  }

  // 3. Expo Go device on local Wi-Fi / LAN
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8000/api/v1`;
  }

  // 4. Android emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1';
  }

  return 'http://localhost:8000/api/v1';
}

export const API_CONFIG = {
  BASE_URL: resolveBackendUrl(),
  TIMEOUT_MS: 8000,
};
