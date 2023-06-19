import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const SplashScreen = () => {
    return (
      <View style={styles.container}>
        <Image
          source={require('../images/logo.png')}
          style={styles.logo}
        />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
    },
  });
  