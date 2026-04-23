import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen     from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen      from './src/screens/LoginScreen';
import RegisterScreen   from './src/screens/RegisterScreen';
import JournalScreen    from './src/screens/JournalScreen';
import HistoryScreen    from './src/screens/HistoryScreen';
import TrendsScreen     from './src/screens/TrendsScreen';
import ProfileScreen    from './src/screens/ProfileScreen';

import { getCurrentUser } from './src/utils/auth';
import { pingServer }     from './src/utils/api';
import { UserProvider }   from './src/context/UserContext';
import { COLORS }         from './src/constants/emotions';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AuthStack({ onLogin }) {
  const [screen, setScreen] = useState('login');
  if (screen === 'login') {
    return (
      <LoginScreen
        onLogin={onLogin}
        onGoRegister={() => setScreen('register')}
      />
    );
  }
  return (
    <RegisterScreen
      onRegister={onLogin}
      onGoLogin={() => setScreen('login')}
    />
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 8, paddingTop: 6, height: 62,
        },
        tabBarActiveTintColor:   COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle:        { fontSize: 11, fontWeight: '600' },
        headerStyle:             { backgroundColor: COLORS.white },
        headerTintColor:         COLORS.text,
        headerTitleStyle:        { fontWeight: '800', fontSize: 17 },
        headerShadowVisible:     false,
      }}
    >
      <Tab.Screen name="Journal" component={JournalScreen}
        options={{ headerShown: false, tabBarIcon: () => <Text style={{ fontSize: 20 }}>✍️</Text> }} />
      <Tab.Screen name="History" component={HistoryScreen}
        options={{ headerTitle: 'Journal History', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📖</Text> }} />
      <Tab.Screen name="Trends" component={TrendsScreen}
        options={{ headerTitle: 'Emotion Trends', tabBarIcon: () => <Text style={{ fontSize: 20 }}>📊</Text> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ headerTitle: 'My Profile', tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [appState, setAppState] = useState('splash'); // splash|onboarding|auth|main
  const [user,     setUser]     = useState(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const onboarded  = await AsyncStorage.getItem('@emotrack_onboarded');
      const currentUser = await getCurrentUser();
      pingServer();
      if (!onboarded)     { setAppState('onboarding'); return; }
      if (!currentUser)   { setAppState('auth');       return; }
      setUser(currentUser);
      setAppState('main');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setAppState('main');
  };

  const handleLogout = () => {
    setUser(null);
    setAppState('auth');
  };

  const handleOnboardingDone = async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) { setUser(currentUser); setAppState('main'); }
    else setAppState('auth');
  };

  if (appState === 'splash') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen />
      </SafeAreaProvider>
    );
  }

  if (appState === 'onboarding') {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OnboardingScreen onDone={handleOnboardingDone} />
      </SafeAreaProvider>
    );
  }

  if (appState === 'auth') {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AuthStack onLogin={handleLogin} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <UserProvider value={{ user, onUpdate: setUser, onLogout: handleLogout }}>
        <NavigationContainer>
          <MainTabs />
        </NavigationContainer>
      </UserProvider>
    </SafeAreaProvider>
  );
}
