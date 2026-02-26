import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Emulador Android: http://10.0.2.2:5100
// Dispositivo físico: usar IP da máquina na rede local
export const API_BASE_URL = 'http://192.168.100.113:5100';

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
