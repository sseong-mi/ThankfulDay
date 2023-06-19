import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ImageBackground, Image } from 'react-native';
import FirstPage from './FirstPage';
import SecondPage from './SecondPage';
import ThirdPage from './ThirdPage';
import EditEntryScreen from './EditEntryScreen';

const Tab = createBottomTabNavigator();
const image = require('../images/background.png');

const firstIcon = require('../images/calendarPlus.png');
const SecondIcon = require('../images/calendar.png');
const ThirdIcon = require('../images/chart.png');

const Home = ({ route }) => {
  const { user, IPConfig } = route.params;
  const [userData, setUserData] = useState(user);

  const fetchData = async () => {
    try {
      const payload = {
        userId: userData._id,
      };
      const response = await fetch(IPConfig + 'user/getdata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status === 'SUCCESS') {
        const updatedUser = result.data;
        setUserData(updatedUser);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.error('Error occurred while fetching user data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userData._id]); // Run the effect whenever the userData._id changes

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => (
          <View>
            <ImageBackground source={image}>
              <Text style={{ fontFamily: 'Neucha_400Regular', fontSize: 36, paddingTop: 50 }}>
                {'   '}
                Hello, {userData.nickname} !
              </Text>
            </ImageBackground>
            
          </View>
        ),
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          position: 'absolute',
          elevation: 0,
          height: 70,

        },
        
        tabBarLabel: () => null,
        tabBarIcon: ({ focused }) => {
          let icon;
          let style;

          const focusedColor = '#4a515e';
          const unfocusedColor = '#3068cf';
          if (route.name === 'FirstPage') {
            icon = firstIcon;
            style = { height: 43, width: 38 };
          } else if (route.name === 'SecondPage') {
            icon = SecondIcon;
            style = { height: 42, width: 38 };
          } else if (route.name === 'ThirdPage') {
            icon = ThirdIcon;
            style = { height: 38, width: 39 };
          }
          
          // Return the appropriate icon component based on the route and focus
          return (<View>
            <Image source={icon} style={style} />
          </View>);
        },
      })}
  
    >
      <Tab.Screen
        name="FirstPage"
        component={FirstPage}
        initialParams={{ user: userData, IPConfig: IPConfig }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            // Run the fetchData function when the FirstPage tab is pressed
            fetchData();
            navigation.navigate('FirstPage');
          },
        })}
      />
      <Tab.Screen
        name="SecondPage"
        component={SecondPage}
        initialParams={{ user: userData, IPConfig: IPConfig }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            fetchData(); // Fetch data when SecondPage tab is pressed
            navigation.navigate('SecondPage');
          },
        })}
      />
      <Tab.Screen
        name="ThirdPage"
        component={ThirdPage}
        initialParams={{ user: userData, IPConfig: IPConfig }}
        listeners={({ navigation }) => ({
          tabPress: () => {
            // Run the fetchData function when the ThirdPage tab is pressed
            fetchData();
            navigation.navigate('ThirdPage');
          },
        })}
      />
      <Tab.Screen
        name="EditEntry"
        component={EditEntryScreen}
        options={{ tabBarButton: () => null, tabBarVisible: false }}
      />
    </Tab.Navigator>
  );
};

export default Home;
