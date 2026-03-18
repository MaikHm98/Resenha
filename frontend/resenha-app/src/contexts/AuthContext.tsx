import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/api';
import { ClubOption, User } from '../types';
import { DominantFootCode, PlayerPositionCode } from '../constants/playerProfile';

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    nome: string,
    email: string,
    password: string,
    posicaoPrincipal: PlayerPositionCode,
    peDominante: DominantFootCode,
    goleiro?: boolean,
    inviteCode?: string,
    timeCoracaoCodigo?: string
  ) => Promise<{ inviteJoinWarning?: string }>;
  forgotPassword: (email: string) => Promise<string>;
  validateResetToken: (token: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  getClubOptions: () => Promise<ClubOption[]>;
  updateProfile: (payload: {
    nome?: string;
    goleiro?: boolean;
    timeCoracaoCodigo?: string;
    posicaoPrincipal?: PlayerPositionCode;
    peDominante?: DominantFootCode;
  }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
        // sessao invalida - ignora
      } finally {
        setLoading(false);
      }
    }
    loadStoredSession();
  }, []);

  async function login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await api.post('/api/users/login', { email: normalizedEmail, senha: password });

    const {
      token: newToken,
      idUsuario,
      nome,
      email: userEmail,
      goleiro,
      timeCoracaoCodigo,
      timeCoracaoNome,
      timeCoracaoEscudoUrl,
      posicaoPrincipal,
      peDominante,
    } = response.data;

    const userData: User = {
      idUsuario,
      nome,
      email: userEmail,
      goleiro,
      timeCoracaoCodigo,
      timeCoracaoNome,
      timeCoracaoEscudoUrl,
      posicaoPrincipal,
      peDominante,
    };

    await AsyncStorage.setItem('@resenha:token', newToken);
    await AsyncStorage.setItem('@resenha:user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  }

  async function register(
    nome: string,
    email: string,
    password: string,
    posicaoPrincipal: PlayerPositionCode,
    peDominante: DominantFootCode,
    goleiro?: boolean,
    inviteCode?: string,
    timeCoracaoCodigo?: string
  ) {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await api.post('/api/users/register', {
      nome,
      email: normalizedEmail,
      senha: password,
      posicaoPrincipal,
      peDominante,
      goleiro: goleiro ?? false,
      timeCoracaoCodigo: timeCoracaoCodigo ?? null,
    });

    const {
      token: newToken,
      idUsuario,
      nome: nomeUsuario,
      email: emailUsuario,
      goleiro: goleiroUsuario,
      timeCoracaoCodigo: clubCode,
      timeCoracaoNome: clubName,
      timeCoracaoEscudoUrl: clubLogo,
    } = response.data;

    const userData: User = {
      idUsuario,
      nome: nomeUsuario,
      email: emailUsuario,
      goleiro: goleiroUsuario,
      timeCoracaoCodigo: clubCode,
      timeCoracaoNome: clubName,
      timeCoracaoEscudoUrl: clubLogo,
      posicaoPrincipal: response.data.posicaoPrincipal,
      peDominante: response.data.peDominante,
    };

    let inviteJoinWarning: string | undefined;

    if (inviteCode) {
      try {
        await api.post(
          '/api/groups/join',
          { codigoConvite: inviteCode },
          { headers: { Authorization: `Bearer ${newToken}` } }
        );
      } catch (e: any) {
        inviteJoinWarning =
          e?.response?.data?.mensagem ||
          'Conta criada, mas nao foi possivel entrar automaticamente no grupo pelo convite.';
      }
    }

    if (inviteJoinWarning) {
      await AsyncStorage.setItem('@resenha:flash_warning', inviteJoinWarning);
    }

    await AsyncStorage.setItem('@resenha:token', newToken);
    await AsyncStorage.setItem('@resenha:user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);

    return { inviteJoinWarning };
  }

  async function forgotPassword(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const response = await api.post('/api/users/forgot-password', { email: normalizedEmail });
    return response?.data?.mensagem || 'Solicitacao enviada.';
  }

  async function validateResetToken(tokenValue: string) {
    const response = await api.get('/api/users/reset-password/validate', { params: { token: tokenValue } });
    return !!response?.data?.valido;
  }

  async function resetPassword(tokenValue: string, newPassword: string) {
    await api.post('/api/users/reset-password', { token: tokenValue, novaSenha: newPassword });
    await logout();
  }

  async function getClubOptions() {
    const response = await api.get('/api/users/clubs');
    return response.data as ClubOption[];
  }

  async function updateProfile(payload: {
    nome?: string;
    goleiro?: boolean;
    timeCoracaoCodigo?: string;
    posicaoPrincipal?: PlayerPositionCode;
    peDominante?: DominantFootCode;
  }) {
    const response = await api.patch('/api/users/profile', {
      nome: payload.nome,
      goleiro: payload.goleiro,
      timeCoracaoCodigo: payload.timeCoracaoCodigo ?? null,
      posicaoPrincipal: payload.posicaoPrincipal ?? null,
      peDominante: payload.peDominante ?? null,
    });

    const updated = response.data;
    const nextUser: User = {
      idUsuario: updated.idUsuario ?? user?.idUsuario ?? 0,
      nome: updated.nome ?? user?.nome ?? '',
      email: updated.email ?? user?.email ?? '',
      goleiro: updated.goleiro,
      timeCoracaoCodigo: updated.timeCoracaoCodigo,
      timeCoracaoNome: updated.timeCoracaoNome,
      timeCoracaoEscudoUrl: updated.timeCoracaoEscudoUrl,
      posicaoPrincipal: updated.posicaoPrincipal,
      peDominante: updated.peDominante,
    };

    setUser(nextUser);
    await AsyncStorage.setItem('@resenha:user', JSON.stringify(nextUser));
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    const response = await api.patch('/api/users/change-password', {
      senhaAtual: currentPassword,
      novaSenha: newPassword,
    });

    const updated = response.data;
    const nextToken = updated.token as string;
    const nextUser: User = {
      idUsuario: updated.idUsuario ?? user?.idUsuario ?? 0,
      nome: updated.nome ?? user?.nome ?? '',
      email: updated.email ?? user?.email ?? '',
      goleiro: updated.goleiro,
      timeCoracaoCodigo: updated.timeCoracaoCodigo,
      timeCoracaoNome: updated.timeCoracaoNome,
      timeCoracaoEscudoUrl: updated.timeCoracaoEscudoUrl,
      posicaoPrincipal: updated.posicaoPrincipal,
      peDominante: updated.peDominante,
    };

    await AsyncStorage.setItem('@resenha:token', nextToken);
    await AsyncStorage.setItem('@resenha:user', JSON.stringify(nextUser));

    setToken(nextToken);
    setUser(nextUser);
  }

  async function logout() {
    await AsyncStorage.removeItem('@resenha:token');
    await AsyncStorage.removeItem('@resenha:user');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        forgotPassword,
        validateResetToken,
        resetPassword,
        getClubOptions,
        updateProfile,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
