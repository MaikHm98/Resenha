import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { Colors } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import JoinGroupScreen from '../screens/JoinGroupScreen';
import GroupDashboardScreen from '../screens/GroupDashboardScreen';
import CreateMatchScreen from '../screens/CreateMatchScreen';
import CaptainScreen from '../screens/CaptainScreen';
import VoteScreen from '../screens/VoteScreen';
import ClassificationScreen from '../screens/ClassificationScreen';
import MyPerformanceScreen from '../screens/MyPerformanceScreen';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  CreateGroup: undefined;
  JoinGroup: undefined;
  GroupDashboard: { groupId: number; groupName: string; isAdmin: boolean };
  CreateMatch: { groupId: number; limiteGrupo: number };
  Captain: { groupId: number; isAdmin: boolean };
  Vote: { matchId: number; isAdmin: boolean };
  Classification: { groupId: number };
  MyPerformance: { groupId: number };
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

const headerOptions = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.primary,
  headerTitleStyle: { fontWeight: 'bold' as const },
  headerShadowVisible: false,
};

function AppNavigatorStack() {
  return (
    <AppStack.Navigator screenOptions={headerOptions}>
      <AppStack.Screen name="Home" component={HomeScreen} options={{ title: 'Resenha ⚽' }} />
      <AppStack.Screen name="CreateGroup" component={CreateGroupScreen} options={{ title: 'Novo Grupo' }} />
      <AppStack.Screen name="JoinGroup" component={JoinGroupScreen} options={{ title: 'Entrar no Grupo' }} />
      <AppStack.Screen
        name="GroupDashboard"
        component={GroupDashboardScreen}
        options={({ route }) => ({ title: route.params.groupName })}
      />
      <AppStack.Screen name="CreateMatch" component={CreateMatchScreen} options={{ title: 'Nova Partida' }} />
      <AppStack.Screen name="Captain" component={CaptainScreen} options={{ title: 'Capitão' }} />
      <AppStack.Screen name="Vote" component={VoteScreen} options={{ title: 'Votação' }} />
      <AppStack.Screen name="Classification" component={ClassificationScreen} options={{ title: 'Ranking' }} />
      <AppStack.Screen name="MyPerformance" component={MyPerformanceScreen} options={{ title: 'Meu Desempenho' }} />
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
    <NavigationContainer>
      {token ? <AppNavigatorStack /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
