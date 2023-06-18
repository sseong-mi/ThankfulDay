import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, ImageBackground, TouchableOpacity, Pressable } from 'react-native';
import { useFonts,Neucha_400Regular } from '@expo-google-fonts/neucha';
import { Text } from 'react-native';

const image = require('../images/background.png');

const SignupPage = ({ navigation, route }) => {
  let {IPConfig } = route.params;

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  let [fontLoaded] = useFonts({
    Neucha_400Regular
  });

  if (!fontLoaded) {
    return null;
  };

  const handleSignup = () => {
    // Make a POST request to the signup endpoint
    fetch(IPConfig+ 'user/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        if (data.status === 'SUCCESS') {
          // Signup successful, navigate to the login screen
          navigation.navigate('Login');
        } else {
          // Signup failed, display an error message or handle the error
          console.log('Signup failed:', data.message);
        }
      })
      .catch((error) => {
        console.log('Error occurred:', error);
      });
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode='cover'>
        <View style = {styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nickname"
            value={nickname}
            onChangeText={setNickname}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
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
        <TouchableOpacity onPress={handleSignup} style={styles.signupButton}>
          <Text style={styles.signup}> Sign Up</Text>
        </TouchableOpacity>
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
    backgroundColor: '#FAFAFA',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 15,
    fontFamily: 'Neucha_400Regular',
    textAlign: 'center',
    fontSize: 21,
  },
  inputContainer: {
    alignSelf: 'center',
    alignContent: 'center'
  },
  signupButton: {
    width: 118,
    height: 35,
    backgroundColor: '#FAFAFA',
    borderWidth: 2,
    borderRadius: 15,
    borderColor: '#626262',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: '10%'
  },
  signup: {
    fontFamily: 'Neucha_400Regular',
    fontSize: 18,
    alignItems: 'center',
  }
});

export default SignupPage;
