import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Text, StyleSheet } from 'react-native';
import { useFonts,Neucha_400Regular } from '@expo-google-fonts/neucha';

import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home'; // Import the Home component


const Stack = createStackNavigator();
const IPConfig = 'http://192.168.0.16:3000/';

const App = () => {

  let [fontLoaded] = useFonts({
    Neucha_400Regular
  });

  if (!fontLoaded) {
    return null;
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={LoginPage}
          initialParams={{IPConfig: IPConfig }}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Signup"
          component={SignupPage}
          initialParams={{ IPConfig: IPConfig }}
          options={{
            headerShown: true,
            headerTransparent: true,
            title: 'Create Account',
            headerTitleStyle: {
              fontFamily: 'Neucha_400Regular',
              fontSize: 27,
            }
          }}
        />
        <Stack.Screen
          name="Home"
          component={Home} // Use the Home component instead of MainTabNavigator
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;