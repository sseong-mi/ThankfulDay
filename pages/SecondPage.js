import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, SafeAreaView, ScrollView, StatusBar} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import EditEntryScreen from './EditEntryScreen';
import SwitchToggle from 'react-native-switch-toggle';
import Modal from 'react-native-modal';

const SecondPage = ({ route }) => {
  let { IPConfig } = route.params;
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [markedDates, setMarkedDates] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandedRef = useRef(false);
  const [user, setUser] = useState(route.params.user);
  const [alertVisible, setAlertVisible] = useState(false);
  const [tempEntry, setEntry] = useState();

  const colorSet = ['#FFD7AE', '#FFD6C8', '#FFC2A8', '#E66D5E', '#E66D5E', '#E66D5E'];

  const popDown = 500;
  const popUp = 80;

  const panY = useRef(new Animated.Value(popDown)).current; // Initialize to the starting position
  const navigation = useNavigation();

  useEffect(() => {
    generateMarkedDates();
    fetchData();
  }, [selectedDate, route]);

  useEffect(() => {
    setIsExpanded(isExpandedRef.current);
  }, [isExpandedRef]);

  const fetchData = async () => {
    try {
      const payload = {
        userId: user._id,
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
        setUser(updatedUser); // Update the user state with the updated diary entries
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.error('Error occurred while fetching user data:', error);
    }
  };

  const hideDeleteDiary = () => {
    setAlertVisible(false);
  };

  const setDeleteEntry = (entry) => {
    setAlertVisible(true);
    setEntry(entry);
  };

  const generateMarkedDates = () => {
    const markedDatesObj = {};
    user.diary.forEach((diaryEntry) => {
      const date = diaryEntry.date.slice(0, 10);
      if (markedDatesObj[date]) {
        markedDatesObj[date] = {
          ...markedDatesObj[date],
          selectedColor: colorSet[colorSet.indexOf(markedDatesObj[date].selectedColor) + 1],
        };
      } else {
        markedDatesObj[date] = {
          selected: true,
          selectedColor: colorSet[0],
        };
      }
    });
    markedDatesObj[selectedDate] = { selected: true, selectedColor: '#FF8184' };
    setMarkedDates(markedDatesObj);
  };

  const handleDayPress = (date) => {
    setSelectedDate(date.dateString);
    generateMarkedDates();
  };

  const renderExpandedContent = () => {
    console.log('updated expanded content')
    const diaryEntries = user.diary.filter((entry) => entry.date.slice(0, 10) === selectedDate);

    if (diaryEntries.length === 0) {
      return (
        <View style={styles.expandedContent}>
          <Text style={{textAlign: 'left', fontFamily: 'Neucha_400Regular', fontSize: 20, paddingLeft: '10%'}}>No diary entries found for selected date</Text>
        </View>
      );
    }

    const handleEditEntry = (entry) => {
      // For example, you can navigate to the edit screen with the entry data:
      navigation.navigate('EditEntry', { entry, user, previousScreen: 'SecondPage', IPConfig });
    };

    const deleteDiary = (entryId) => {
      const payload = {
        userId: user._id,
        diaryEntryId: entryId,
      };

      fetch(IPConfig + 'diary/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.status === 'SUCCESS') {
            console.log('Diary entry deleted successfully');
            // Update the user state or perform any other necessary actions
            fetchData();
            setAlertVisible(false);
          } else {
            console.log(result.message);
          }
        })
        .catch((error) => {
          console.error('Error occurred while deleting diary entry:', error);
        });
    }

    // Render the content for the expanded content here
    return (
      <SafeAreaView style={styles.expandedContent}>
        <ScrollView contentContainerStyle={styles.expandedContentContainer} showsVerticalScrollIndicator={false}>
        {diaryEntries.map((entry) => (
          <View key={entry._id}>
            <Text style={styles.expandedText}>{entry.time}</Text>
            <Text style={styles.expandedText}>Tags Used: {entry.tagsUsed.join(', ')}</Text>
            <Text style={styles.expandedTextNotes}>Notes: {entry.notes === '' ? 'No notes' : entry.notes}</Text>
            <View style={styles.expandedButtons}>
              <TouchableOpacity onPress={() => handleEditEntry(entry)} style={styles.expandedButton}>
                <Text style={{fontFamily: 'Neucha_400Regular', fontSize: 20}}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeleteEntry(entry)} style={styles.expandedButton}>
                <Text style={{fontFamily: 'Neucha_400Regular', fontSize: 20}}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        </ScrollView>
      <Modal isVisible={alertVisible} backdropOpacity={0} onBackdropPress={hideDeleteDiary}>
        <View style={styles.deleteTagcontainer}>
          <View style={styles.modal}>
            <Text style={styles.message}>Are you sure you want to delete diary?</Text>
            <View style={styles.tagButtonContainer}>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteDiary(tempEntry._id)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    );
  };

  const renderCollapsedContent = () => {
    const diaryEntries = user.diary.filter((entry) => entry.date.slice(0, 10) === selectedDate);
  
    if (diaryEntries.length === 0) {
      return (
        <View style={styles.collapsedContent}>
          <Text style={{ textAlign: 'left', fontFamily: 'Neucha_400Regular', fontSize: 20, paddingLeft: '10%'}}>
            No diary entries found for selected date
          </Text>
        </View>
      );
    }
  
    return (
      <SafeAreaView style={styles.collapsedContent}>
        <ScrollView contentContainerStyle={styles.collapsedContentContainer} showsVerticalScrollIndicator={false}>
          {diaryEntries.map((entry) => (
            <View key={entry._id}>
              <Text style={styles.collapsedTextTags}>{entry.tagsUsed.join(', ')}</Text>
              <Text style={styles.collapsedTextNotes}>
                {entry.notes === '' ? 'No notes' : entry.notes}
              </Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  };

  const additionalPageStyle = {
    transform: [{ translateY: panY }],
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarWrapper}>
        <View style={styles.dateShow}>
          <Text style={styles.dateText}>
          {moment(selectedDate).format('YY.MM.DD')}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setIsExpanded(!isExpanded);
              isExpandedRef.current = !isExpanded;
              if (isExpanded) {
                Animated.spring(panY, {
                  toValue: popDown,
                  useNativeDriver: true,
                }).start();
              } else {
                Animated.spring(panY, {
                  toValue: popUp,
                  useNativeDriver: true,
                }).start();
              }
            }}
            style={styles.switchButton}
          >
            <SwitchToggle
              switchOn={isExpanded}
              onPress={() => {
                setIsExpanded(!isExpanded);
                isExpandedRef.current = !isExpanded;
                if (isExpanded) {
                  Animated.spring(panY, {
                    toValue: popDown,
                    useNativeDriver: true,
                  }).start();
                } else {
                  Animated.spring(panY, {
                    toValue: popUp,
                    useNativeDriver: true,
                  }).start();
                }
              }}
              circleColorOn="#FFFFFF"
              circleColorOff="#FFFFFF"
              backgroundColorOn="#424242"
              backgroundColorOff="#D9D9D9"
              duration={300}
              containerStyle={styles.switchContainer}
              circleStyle={styles.switchCircle}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={handleDayPress}
            hideExtraDays={true}
            markedDates={markedDates}
            theme={{
              selectedDayBackgroundColor: '#007AFF',
              selectedDayTextColor: '#000000',
              todayTextColor: '#000000',
              arrowColor: 'black',
            }}
            style={styles.calendar}
            renderHeader={(date) => {
              // Custom header component with custom styles
              const monthText = date.toString('MMMM');
              const yearText = date.toString('yyyy');

              return (
                <View>
                  <Text style={styles.headerText}>
                    {monthText}
                  </Text>
                  <Text style={styles.headerText}>
                    {yearText}
                  </Text>
                </View>
              );
            }}
          />
        </View>
      </View>
      <Animated.View style={[styles.additionalPage, additionalPageStyle]}>
        {isExpanded ? renderExpandedContent() : renderCollapsedContent()}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align content at the top
  },
  headerText: {
    fontFamily: 'Neucha_400Regular',
    fontSize: 25,
  },
  dateShow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  dateText: {
    fontFamily: 'Neucha_400Regular',
    fontSize: 30,
    top: 23,
    left: 30,
  },
  additionalPage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    justifyContent: 'center',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowColor: 'black',
  },
  collapsedContent: {
    flex: 1,
    justifyContent: 'flex-start', // Align content at the top
    alignItems: 'flex-start',
    paddingBottom: '7%', // Add padding to create space from the top
    paddingTop: '7%',
    height: 750,
    marginRight: 50
  },
  collapsedContentContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: 900,
    paddingLeft: '10%',
    flexGrow: 1,
  },
  collapsedTextTags: {
    fontFamily: 'Neucha_400Regular', 
    fontSize: 20,
    paddingTop: 5,
  },
  collapsedTextNotes: {
    fontFamily: 'Neucha_400Regular', 
    fontSize: 17,
    color: '#898989',
    paddingTop: 3,
  },
  expandedText: {
    fontFamily: 'Neucha_400Regular', 
    fontSize: 24,
    paddingTop: 5,
  },
  expandedTextNotes: {
    fontFamily: 'Neucha_400Regular', 
    fontSize: 20,
    color: '#898989',
    paddingTop: 3,
  },
  expandedContent: {
    flex: 1,
    justifyContent: 'flex-start', // Align content at the top
    alignItems: 'flex-start',
    paddingTop: 20, // Add padding to create space from the top
    height: 750,
  },
  expandedContentContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    height: 1000,
    paddingLeft: '10%',
    flexGrow: 1,
  },
  expandedButtons: {
    flexDirection: 'row',
    padding: 10,
  },
  expandedButton: {
    borderWidth: 1,
    padding: 4,
    marginHorizontal: 19,
    borderRadius: 9
  },
  switchButton: {
    top: 20,
    right: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: 'flex-end',
  },
  switchContainer: {
    width: 60,
    height: 30,
    borderRadius: 15,
    padding: 5,
  },
  switchCircle: {
    width: 15,
    height: 15,
    borderRadius: 10,
  },
  calendarContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '50%'
  },
  calendarWrapper: {
    flex: 1,
    width: '100%',
  },
  calendar: {
    borderRadius: 15,
    height: 350,
    width: 300,
  },
  deleteTagContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
  },
  message: {
    fontSize: 23,
    marginBottom: 20,
    fontFamily: 'Neucha_400Regular',
  },
  tagButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    fontFamily: 'Neucha_400Regular',
    fontSize: 22,
  },
});

export default SecondPage;
