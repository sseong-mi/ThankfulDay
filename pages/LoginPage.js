import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ImageBackground, Image } from 'react-native';
import { useFonts,Neucha_400Regular } from '@expo-google-fonts/neucha';

const image = require('../images/background.png');
const logo = require('../images/logo.png');

const LoginPage = ({ navigation, route }) => {
  let { IPConfig } = route.params;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  let [fontLoaded] = useFonts({
    Neucha_400Regular
  });

  if (!fontLoaded) {
    return null;
  };

  const handleLogin = () => {
    // Make a POST request to the login endpoint
    fetch(IPConfig + 'user/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        if (data.status === 'SUCCESS') {
          // Login successful, pass user data to Home page
          const user = data.data;
          navigation.navigate('Home', { user, IPConfig }); // Pass the user data as a parameter
        } else {
          // Login failed, display an error message or handle the error
          console.log('Login failed:', data.message);
        }
      })
      .catch((error) => {
        console.log('Error occurred:', error);
      });
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode="cover" style={styles.backgroundImage}>
        <View style={styles.logoContainer}>
          <Image style={styles.logo} source={logo} />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <View style={styles.loginContainer}>
          <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
          <Text style={styles.loginButtonText}>
            Login
          </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.lineContainer}>
          <View style={styles.line} />
          <Text style={styles.signupText}>Don't have an account yet?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupButton}>
            Signup
          </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: 246,
    height: 45,
    borderWidth: 2,
    borderColor: '#626262',
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 10,
    alignSelf: 'center',
    borderRadius: 15,
    fontFamily: 'Neucha_400Regular',
    fontSize: 21,
    textAlign: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  logo: {
    width: 222,
    height: 130,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: '70%',
    marginBottom: '20%'
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: '30%',
    marginTop: '10%',
    textAlign: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  loginButton: {
    width: 118,
    height: 35,
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    borderColor: '#626262',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Neucha_400Regular'
  },
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'Neucha_400Regular'
  },
  lineContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: '30%',
    marginTop: '50%'
  },
  line: {
    width: '80%',
    height: 1,
    backgroundColor: '#000000',
    // marginVertical: 10,
  },
  signupText: {
    color: '#000000',
    fontSize: 22,
    marginBottom: 5,
    fontFamily: 'Neucha_400Regular'
  },
  signupButton: {
    color: '#000000',
    fontSize: 19,
    fontFamily: 'Neucha_400Regular',
    marginBottom: '10%'
  },
});

export default LoginPage;
