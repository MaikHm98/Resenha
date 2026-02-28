import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use EXPO_PUBLIC_API_BASE_URL para forçar a URL em qualquer ambiente.
// Exemplo (celular físico): EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:5276
const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

const defaultByPlatform = Platform.select({
  web: 'http://localhost:5276',
  android: 'http://10.0.2.2:5276',
  ios: 'http://localhost:5276',
  default: 'http://localhost:5276',
});

export const API_BASE_URL = envBaseUrl || defaultByPlatform;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Injeta o token JWT em todas as requisições autenticadas
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('@resenha:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
