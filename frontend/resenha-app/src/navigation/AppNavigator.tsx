import React from 'react';
import * as Linking from 'expo-linking';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { Colors, FontSize } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import JoinGroupScreen from '../screens/JoinGroupScreen';
import GroupDashboardScreen from '../screens/GroupDashboardScreen';
import CreateMatchScreen from '../screens/CreateMatchScreen';
import CaptainScreen from '../screens/CaptainScreen';
import VoteScreen from '../screens/VoteScreen';
import ClassificationScreen from '../screens/ClassificationScreen';
import MyPerformanceScreen from '../screens/MyPerformanceScreen';
import ManageMembersScreen from '../screens/ManageMembersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import HistoricoPartidasScreen from '../screens/HistoricoPartidasScreen';
import DetalhePartidaScreen from '../screens/DetalhePartidaScreen';
import DesafioEmAndamentoScreen from '../screens/DesafioEmAndamentoScreen';
import ClubLogo from '../components/ClubLogo';

export type AuthStackParamList = {
  Login: undefined;
  Register: { email?: string; invite?: string } | undefined;
  ForgotPassword: { email?: string } | undefined;
  ResetPassword: { token?: string } | undefined;
};

export type AppStackParamList = {
  Home: undefined;
  CreateGroup: undefined;
  JoinGroup: undefined;
  GroupDashboard: {
    groupId: number;
    groupName: string;
    isAdmin: boolean;
    diaSemana?: number;
    horarioFixo?: string;
    limiteJogadores: number;
  };
  CreateMatch: { groupId: number; limiteGrupo: number; diaSemana?: number; horarioFixo?: string };
  Captain: { groupId: number; isAdmin: boolean };
  Vote: { matchId: number; isAdmin: boolean };
  Classification: { groupId: number };
  MyPerformance: { groupId: number };
  ManageMembers: { groupId: number; groupName: string; isAdmin: boolean };
  HistoricoPartidas: { groupId: number; groupName: string };
  DetalhePartida: { matchId: number };
  DesafioEmAndamento: { matchId: number; groupId: number; groupName: string };
  Profile: undefined;
  ChangePassword: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const linking = {
  prefixes: [Linking.createURL('/'), 'resenha://'],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password',
    },
  },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

const headerOptions = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.text,
  headerTitleStyle: {
    fontWeight: '800' as const,
    fontSize: FontSize.md,
  },
  headerShadowVisible: false,
};

function AppNavigatorStack() {
  const { user } = useAuth();

  return (
    <AppStack.Navigator screenOptions={headerOptions}>
      <AppStack.Screen name="Home" component={HomeScreen} options={{ title: 'Resenha' }} />
      <AppStack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Novo Grupo' }} />
      <AppStack.Screen name="JoinGroup" component={JoinGroupScreen} options={{ title: 'Entrar no Grupo' }} />
      <AppStack.Screen
        name="GroupDashboard"
        component={GroupDashboardScreen}
        options={({ route }) => ({
          headerTitle: () => (
            <View style={styles.groupHeaderTitle}>
              <Text style={styles.groupHeaderName} numberOfLines={1}>
                {route.params.groupName}
              </Text>
              <View style={styles.groupHeaderUserRow}>
                <Ionicons
                  name={route.params.isAdmin ? 'shield-checkmark-outline' : 'person-outline'}
                  size={12}
                  color={route.params.isAdmin ? Colors.gold : Colors.textMuted}
                />
                <ClubLogo
                  uri={user?.timeCoracaoEscudoUrl}
                  clubName={user?.timeCoracaoNome ?? user?.nome}
                  size={14}
                />
                <Text style={styles.groupHeaderUser} numberOfLines={1}>
                  {user?.nome ?? 'Usuario'}
                </Text>
              </View>
            </View>
          ),
        })}
      />
      <AppStack.Screen name="CreateMatch" component={CreateMatchScreen} options={{ title: 'Nova Partida' }} />
      <AppStack.Screen name="Captain" component={CaptainScreen} options={{ title: 'Capitao' }} />
      <AppStack.Screen name="Vote" component={VoteScreen} options={{ title: 'Votacao' }} />
      <AppStack.Screen name="Classification" component={ClassificationScreen} options={{ title: 'Classificacao' }} />
      <AppStack.Screen name="MyPerformance" component={MyPerformanceScreen} options={{ title: 'Meu Desempenho' }} />
      <AppStack.Screen name="ManageMembers" component={ManageMembersScreen} options={{ title: 'Membros' }} />
      <AppStack.Screen name="HistoricoPartidas" component={HistoricoPartidasScreen} options={{ title: 'Histórico de Partidas' }} />
      <AppStack.Screen name="DetalhePartida" component={DetalhePartidaScreen} options={{ title: 'Detalhe da Partida' }} />
      <AppStack.Screen name="DesafioEmAndamento" component={DesafioEmAndamentoScreen} options={{ title: 'Desafio em Andamento' }} />
      <AppStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Meu Perfil' }} />
      <AppStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Alterar Senha' }} />
    </AppStack.Navigator>
  );
}

export default function AppNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: Colors.bg }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      {token ? <AppNavigatorStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  groupHeaderTitle: {
    maxWidth: 250,
  },
  groupHeaderName: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '800',
  },
  groupHeaderUser: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
  },
  groupHeaderUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
});
