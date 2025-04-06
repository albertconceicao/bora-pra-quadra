import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../database/users';
import { RootStackParamList } from '../types/navigation';

// Import screens
import CourtDetailsScreen from '../screens/CourtDetailsScreen';
import { CourtsScreen } from '../screens/CourtsScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchCourtsScreen from '../screens/SearchCourtsScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication state
    const checkAuth = async () => {
      const user = getCurrentUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    // Add a loading screen here if needed
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Home' : 'SignIn'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="SignIn" 
          component={SignInScreen}
          options={{ 
            title: 'Sign In',
            headerShown: !isAuthenticated 
          }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen}
          options={{ 
            title: 'Sign Up',
            headerShown: !isAuthenticated 
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'É o Voley',
            headerShown: isAuthenticated 
          }}
        />
        <Stack.Screen 
          name="Courts" 
          component={CourtsScreen}
          options={{ 
            title: 'Gerenciar Quadras',
            headerShown: isAuthenticated 
          }}
        />
        <Stack.Screen 
          name="SearchCourts" 
          component={SearchCourtsScreen}
          options={{ 
            title: 'Buscar Quadras',
            headerShown: isAuthenticated 
          }}
        />
        <Stack.Screen 
          name="CourtDetails" 
          component={CourtDetailsScreen}
          options={{ 
            title: 'Detalhes da Quadra',
            headerShown: isAuthenticated 
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 