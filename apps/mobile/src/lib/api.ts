import axios from 'axios';
import { account } from './appwrite';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator, localhost for iOS simulator and web
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api/v1';
  }
  return 'http://localhost:5000/api/v1';
};

export const API_URL = getBaseUrl();

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get the current session JWT from Appwrite
      const jwt = await account.createJWT();
      if (jwt && jwt.jwt) {
        config.headers.Authorization = `Bearer ${jwt.jwt}`;
      }
    } catch (error) {
      console.log('Error attaching JWT to request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
