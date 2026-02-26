import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { User } from '../types';

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nome: string, email: string, password: string, goleiro?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão salva ao iniciar o app
  useEffect(() => {
    async function loadStoredSession() {
      try {
        const storedToken = await AsyncStorage.getItem('@resenha:token');
        const storedUser = await AsyncStorage.getItem('@resenha:user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // sessão inválida — ignora
      } finally {
        setLoading(false);
      }
    }
    loadStoredSession();
  }, []);

  async function login(email: string, password: string) {
    const response = await api.post('/api/users/login', { email, senha: password });
    const { token: newToken, idUsuario, nome, email: userEmail } = response.data;

    const userData: User = { idUsuario, nome, email: userEmail };

    await AsyncStorage.setItem('@resenha:token', newToken);
    await AsyncStorage.setItem('@resenha:user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  }

  async function register(nome: string, email: string, password: string, goleiro?: boolean) {
    await api.post('/api/users/register', { nome, email, senha: password, goleiro: goleiro ?? false });
    // Faz login automático após cadastro
    await login(email, password);
  }

  async function logout() {
    await AsyncStorage.removeItem('@resenha:token');
    await AsyncStorage.removeItem('@resenha:user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
