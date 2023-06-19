import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Alert, Image, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { Calendar } from 'react-native-calendars';
import EditEntryScreen from './EditEntryScreen';
import SwitchToggle from 'react-native-switch-toggle';
import Modal from 'react-native-modal';

const image = require('../images/background.png');
const datePickerImage = require('../images/Calendardot.png');

const ThirdPage = ({ route }) => {
  let { IPConfig } = route.params;
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [markedDates, setMarkedDates] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandedRef = useRef(false);
  const [isMonthlyView, setisMonthlyView] = useState(false); // Indicates if the weekly view is active
  const [user, setUser] = useState(route.params.user);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [topTags, setTopTags] = useState([]);
  const [sumDays, setsumDays] = useState('');
  const [sumTags, setSumTags] = useState('');
  const [sumDiarys, setSumDiarys] = useState('');
  const [startWDate, setStartWDate] = useState(moment().startOf('week'));
  const [endWDate, setEndWDate] = useState(moment().endOf('week'));
  const [startMDate, setStartMDate] = useState(moment().startOf('month'));
  const [endMDate, setEndMDate] = useState(moment().endOf('month'));
  const [weekOrder, setWeekOrder] = useState('');


  const popDown = 500;
  const popUp = 80;

  const fetchCal = async () => {
    // Fetch data for the selected week or month based on the current view mode
    const startWDate = moment(selectedDate).startOf('week');
    const endWDate = moment(selectedDate).endOf('week');

    const startMDate = moment(selectedDate).startOf('month');
    const endMDate = moment(selectedDate).endOf('month');

    setStartWDate(startWDate);
    setEndWDate(endWDate);
    setStartMDate(startMDate);
    setEndMDate(endMDate);

    const weekOfMonth = Math.ceil(startWDate.diff(startMDate, 'days') / 7);
    let weekOrder = '';
    if (weekOfMonth === 1) {
      weekOrder = '1st';
    } else if (weekOfMonth === 2) {
      weekOrder = '2nd';
    } else if (weekOfMonth === 3) {
      weekOrder = '3rd';
    } else {
      weekOrder = `${weekOfMonth}th`;
    }
    setWeekOrder(weekOrder);
  };

  useEffect(() => {
    fetchCal();
  }, [selectedDate, isMonthlyView, user._id]);

  useEffect(() => {
    fetchData();
  }, [isMonthlyView]);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDayPress = (date) => {
    setSelectedDate(date.dateString); 
    fetchData();
  };

  const handleMonthPress = (bool) => {
    setisMonthlyView(bool);
    fetchData();
  };

  const getTopTags = async (diaryEntries) => {
    const tagCounts = {};
    const dayCounts = {};
    await Promise.all(
      diaryEntries.map(async (entry) => {
        const entryDate = moment(entry.date);
        
        let startDate = startMDate;
        let endDate = endMDate;

        if (isMonthlyView){
          startDate = startMDate;
          endDate = endMDate;
        }
        else{
          startDate = startWDate;
          endDate = endWDate;
        }
        if (
          entryDate.isSameOrAfter(startDate) &&
          entryDate.isSameOrBefore(endDate)
        ) {
          if (dayCounts[entryDate]) {
            dayCounts[entryDate]++;
          } else {
            dayCounts[entryDate] = 1;
          }
  
          const tagsUsed = entry.tagsUsed || [];
  
          await Promise.all(
            tagsUsed.map(async (tag) => {
              const word = tag;
  
              if (tagCounts[word]) {
                tagCounts[word]++;
              } else {
                tagCounts[word] = 1;
              }
            })
          );
        }
      })
    );
  
    // Sort the tags by count in descending order
    const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
    
    const sumTags = Object.values(tagCounts).reduce((accumulator, count) => accumulator + count, 0);
    const sumDays = Object.keys(dayCounts).length;
    const sumDiarys = Object.values(dayCounts).reduce((accumulator, count) => accumulator + count, 0);
    // Return the top 3 tags
    return {'sortedTags': sortedTags.slice(0, 3), 'sumTags': sumTags, 'sumDays': sumDays, 'sumDiarys': sumDiarys}
  };

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
        setUser(updatedUser);
  
        // Update the user state with the updated diary entries
        const diaryEntries = updatedUser.diary || [];
        const staticsEntries = await getTopTags(diaryEntries);
        setTopTags(staticsEntries.sortedTags);
        setSumDiarys(staticsEntries.sumDiarys);
        setsumDays(staticsEntries.sumDays);
        setSumTags(staticsEntries.sumTags);
      } else {
        console.log(result.message);
      }
    } catch (error) {
      console.error('Error occurred while fetching user data:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode='cover' style={styles.backgroundImage}>
      <View style={styles.calendarContainer}>
      <TouchableOpacity onPress={showDatePicker} style={styles.datepickerContainer}>
          <Image source={datePickerImage} style={styles.showDatePickerButton} />
        </TouchableOpacity>
      </View>
        <View style={styles.dateShow}>
          <View style={styles.dateTextContainer}>
            <Text style={styles.dateText}>
              {isMonthlyView ? moment(selectedDate).format('YY.MM') : (moment(selectedDate).format('YY.MM.') + weekOrder ) + ' week'} 
            </Text>
          </View>
          <TouchableOpacity
 // Toggle the view mode when the switch is pressed
            style={styles.switchButton}
          >
            <SwitchToggle
              switchOn={isMonthlyView}
              onPress={() => handleMonthPress(!isMonthlyView)} // Toggle the view mode when the switch is pressed
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
        <Modal
        isVisible={isDatePickerVisible}
        onBackdropPress={hideDatePicker}
        backdropOpacity={0}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        >
        <View style={styles.modalContent}>
        <View style={styles.renderCalendar}>
        <Calendar
          onDayPress={handleDayPress}
          hideExtraDays={true}
          markingType="custom"
          markedDates={{
            [selectedDate]: {
              customStyles: {
                container: {
                  backgroundColor: '#FFD7AE',
                },
              },
              renderMarker: () => <CustomMarker />,
            },
          }}
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
      </Modal>
      <View style={{paddingLeft: '5%', paddingTop: '5%'}}>
        <Text style={styles.title}>most tag</Text>
        <View >
          <Text style={styles.title}>Top Tags</Text>
          {topTags.map((tag, index) => (
            <Text key={index} style={styles.content}>{tag}</Text>
          ))}
        </View>
      </View>
      <View style={{paddingLeft: '5%', paddingTop: '5%', top: 50}}>
        <Text style={styles.title} >Information</Text>
        <Text style={styles.content}>Tags: {sumTags}</Text>
        <Text style={styles.content}>Days: {isMonthlyView ? `${sumDays}/31` : `${sumDays}/7`}</Text>
        <Text style={styles.content}>Diary Entries: {sumDiarys}</Text>
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
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  dateShow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between'
  },
  dateTextContainer: {
    alignContent: 'flex-start',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingRight: '5%',
    paddingLeft: '5%'
  },
  switchButton: {
    top: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    alignItems: 'flex-end',
    alignContent: 'flex-end',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    marginTop: 10,
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingRight: 10,
  },
  selectedDateContainer: {
    marginTop: 20,
  },
  selectedDateText: {
    fontSize: 18,
    fontFamily: 'Neucha_400Regular',
  },
  dateText: {
    fontSize: 35,
    fontFamily: 'Neucha_400Regular',
    paddingTop: '10%'
  },
  showDatePickerButton: {
    width: 42,
    height:47,
    paddingRight: 10,
  },
  datepickerContainer: {
    paddingTop: '10%',
    alignItems: 'flex-end'
  },
  calendarContainer: {
    alignContent: 'flex-end',
    paddingRight: '5%',
    justifyContent: 'flex-start'
  },
  title: {
    fontSize: 35,
    fontFamily: 'Neucha_400Regular',
    marginBottom: '5%'
  },
  content: {
    fontSize: 28,
    fontFamily: 'Neucha_400Regular',
  },
  calendar: {
    borderRadius: 15,
    height: 400,
    width: 350,
  },
  headerText: {
    fontFamily: 'Neucha_400Regular',
    fontSize: 25,
  },
  renderCalendar: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '100%'
  }
});

export default ThirdPage;