import { Platform } from 'react-native';
import Constants from 'expo-constants';

// 🌐 LIVE BACKEND (Render)
const PROD_API_URL = 'https://smart-food-backend-fj9g.onrender.com';

// Optional override from .env (if you still want flexibility)
const EXPLICIT_API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

const extractHost = (rawHost?: string | null) => {
  if (!rawHost) return null;

  try {
    return rawHost.includes('://')
      ? new URL(rawHost).hostname
      : new URL(`http://${rawHost}`).hostname;
  } catch {
    const match = rawHost.match(/^(?:[a-z]+:\/\/)?([^:/]+)/i);
    return match?.[1] ?? null;
  }
};

const getLanApiBaseUrl = () => {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    (Constants as any).expoGoConfig?.debuggerHost,
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost,
    (Constants as any).manifest?.debuggerHost,
    (Constants as any).manifest?.hostUri,
  ];

  for (const candidate of hostCandidates) {
    const host = extractHost(candidate);

    if (!host) continue;

    return `http://${host}:5000`;
  }

  return null;
};

const getApiBaseUrl = () => {
  // 1️⃣ If env variable exists → use it first
  if (EXPLICIT_API_BASE_URL) {
    return EXPLICIT_API_BASE_URL;
  }

  // 2️⃣ If production build → use Render backend
  if (!__DEV__) {
    return PROD_API_URL;
  }

  // 3️⃣ Local development fallback
  const lanUrl = getLanApiBaseUrl();
  if (lanUrl) return lanUrl;

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  return 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();