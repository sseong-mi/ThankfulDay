import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, ImageBackground, Image, Touchable } from 'react-native';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { Alert } from 'react-native';
import Modal from 'react-native-modal';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const image = require('../images/background.png');
const datePickerImage = require('../images/Calendardot.png');
const morning = require('../images/mornig.png');
const noon = require('../images/lunch.png');
const moon = require('../images/moon.png');
const dinner = require('../images/evening.png');

const FirstPage = ({ route }) => {
  let { user, IPConfig } = route.params;
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedWords, setSelectedWords] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);
  const [deletedtag, setDeletedTag] = useState('');

  useEffect(() => {
    loadTagData(); // Load the tag data from user.tags
  },[]);

  const loadTagData = () => {
    const userTags = user.tags.map(tag => tag.word);
    setTags(userTags);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleDayPress = (date) => {
    setSelectedDate(date.dateString);
  };

  const hideDeleteTag = () => {
    setAlertVisible(false);
  };

  const handleWordPress = (word) => {
    const wordIndex = selectedWords.indexOf(word);
    if (wordIndex === -1) {
      // Word is not selected, add it to the selectedWords array
      setSelectedWords([...selectedWords, word]);
    } else {
      // Word is already selected, remove it from the selectedWords array
      const updatedWords = [...selectedWords];
      updatedWords.splice(wordIndex, 1);
      setSelectedWords(updatedWords);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() !== '') {
      let formattedTag = newTag.trim();
      if (!formattedTag.startsWith('#')) {
        formattedTag = `#${formattedTag}`;
      }

      const payload = {
        userId: user._id,
        tag: formattedTag,
      };

      fetch(IPConfig + 'tag/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.status === 'SUCCESS') {
            const updatedTags = result.data.map((tag) => tag.word);
            setTags(updatedTags);
            setNewTag('');
            setIsAddingTag(false);
          } else {
            console.log(result.message);
          }
        })
        .catch((error) => {
          console.error('Error occurred while adding tag:', error);
        });
    }
    else if(newTag.trim() == ''){
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const handleTagInputChange = (text) => {
    setNewTag(text);
  };
  const handleTagLongPress = (word) => {
    setAlertVisible(true);
    setDeletedTag(word);
  };

  const deleteTag = (word) => {
    const payload = {
      userId: user._id,
      tagId: word,
    };

    fetch(IPConfig + 'tag/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.status === 'SUCCESS') {
          const updatedTags = result.data.map((tag) => tag.word);
          setTags(updatedTags);

          // Update selectedWords by filtering out the deleted tag
          setSelectedWords((prevSelectedWords) =>
            prevSelectedWords.filter((selectedWord) => selectedWord !== word)
          );
          setAlertVisible(false);
        } else {
          console.log(result.message);
        }
      })
      .catch((error) => {
        console.error('Error occurred while deleting tag:', error);
      });
  };

  const handleSaveDiary = () => {
    if (selectedWords.length === 0 || selectedTime === null) {
      console.log('Please select words and time before saving the diary entry.');
      return;
    }
  
    const diaryEntry = {
      date: selectedDate,
      tagsUsed: selectedWords,
      time: selectedTime,
      notes: notes,
    };
  
    const payload = {
      userId: user._id,
      diaryEntry: diaryEntry,
    };
  
    fetch(IPConfig + 'diary/insert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.status === 'SUCCESS') {
          console.log('Diary entry saved successfully');
          // Clear the selected data
          setSelectedDate(moment().format('YYYY-MM-DD'));
          setSelectedWords([]);
          setSelectedTime(null);
          setNotes('');
        } else {
          console.log(result.message);
        }
      })
      .catch((error) => {
        console.error('Error occurred while saving diary entry:', error);
      });
  };

  const handleTimeSelection = (time) => {
    setSelectedTime(time);
  };

  const handleNotesChange = (text) => {
    setNotes(text);
  };

  const CustomMarker = () => (
    <View style={styles.markerContainer}>
      <FontAwesomeIcon icon={faHeart} size={30} color={red} />
    </View>
  );

  return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode='cover' style={styles.backgroundImage}>
      <View style={styles.headerContainer}>
      <View style={styles.selectedDateContainer}>
        <Text style={styles.selectedDateText}>
          {moment(selectedDate).format('YY.MM.DD')}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={showDatePicker}>
          <Image source={datePickerImage} style={styles.showDatePickerButton} />
        </TouchableOpacity>
      </View>
    </View>
      <Modal
        isVisible={isDatePickerVisible}
        onBackdropPress={hideDatePicker}
        backdropOpacity={0}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContent}>
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
            selectedDayTextColor: '#FFFFFF',
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
      </Modal>
      <View style={styles.tagcontainer}>
        <View style={styles.textContainer}>
          <Text style={styles.textQuestion}> What are you <Text style={{color: '#F82626'}}>thankful</Text> for today?</Text>
        </View>
        <View style={styles.wordButtonContainer}>
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => handleWordPress(tag)}
              onLongPress={() => handleTagLongPress(tag)}
              style={{
                marginVertical: 5,
                borderRadius: 15,
                borderWidth: 2,
                paddingHorizontal: 10,
                paddingVertical: 5,
                marginHorizontal: 4,
                backgroundColor: selectedWords.includes(tag) ? '#D9D9D9' : undefined
              }}
              activeOpacity={1}
              
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}

          {!isAddingTag && (
            <TouchableOpacity onPress={() => setIsAddingTag(true)} style={styles.tagButton}>
              <Text style={styles.tagText}> + </Text>
            </TouchableOpacity>
          )}
        </View>

        {isAddingTag && (
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Enter a new tag"
              value={newTag}
              onChangeText={handleTagInputChange}
              autoFocus={true}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity onPress={handleAddTag} style={styles.tagButton}>
              <Text style={styles.tagText}>Add</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.selectedWordsContainer}>
          <Text style={styles.selectedWordsText}>
              : {selectedWords.join(', ')}
          </Text>
        </View>
      </View>

      <View style={styles.timePickerContainer}>
        <Text style={styles.textQuestion}>What time did this happen?</Text>
        <Text style={styles.selectedWordsText}>
          : {(selectedTime !== null) ? selectedTime: null }
        </Text>
        <View style={styles.timePickerIcons}>
          <TouchableOpacity
            style={[
              styles.timePickerIcon,
              selectedTime === 'morning' && styles.selectedTimePickerIcon,
            ]}
            onPress={() => handleTimeSelection('morning')}
            activeOpacity={1}
          >
            <Image source={morning} style={{
              width: 85,
              height: 45,
            }} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timePickerIcon,
              selectedTime === 'noon' && styles.selectedTimePickerIcon,
            ]}
            onPress={() => handleTimeSelection('noon')}
            activeOpacity={1}
          >
            <Image source={noon} style={{
              width: 66,
              height: 59,
            }} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timePickerIcon,
              selectedTime === 'dinner' && styles.selectedTimePickerIcon,
            ]}
            onPress={() => handleTimeSelection('dinner')}
            activeOpacity={1}
          >
            <Image source={dinner} style={{
              width: 52,
              height: 44,
            }} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timePickerIcon,
              selectedTime === 'moon' && styles.selectedTimePickerIcon,
            ]}
            onPress={() => handleTimeSelection('moon')}
            activeOpacity={1}
          >
            <Image source={moon} style={{
              width: 43,
              height: 45,
            }} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal isVisible={alertVisible} backdropOpacity={0} onBackdropPress={hideDeleteTag}>
        <View style={styles.deleteTagcontainer}>
          <View style={styles.modal}>
            <Text style={styles.message}>Are you sure you want to delete the tag {deletedtag}?</Text>
            <View style={styles.tagButtonContainer}>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTag(deletedtag)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.notesContainer}>
        <Text style={styles.textQuestion}>Do you have any additional notes?</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Write your notes here"
          value={notes}
          onChangeText={handleNotesChange}
          multiline={true}
        />
      </View>
      <View style={styles.DiaryInsertContainer}>
        <TouchableOpacity onPress={handleSaveDiary} style={styles.diarysaveButton}>
          <Text style={{fontFamily: 'Neucha_400Regular', fontSize: 35}}>
            Write
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
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 10,
  },
  selectedDateContainer: {
    alignContent:'center'
  },
  selectedDateText: {
    fontSize: 40,
    fontFamily: 'Neucha_400Regular',
    justifyContent: 'center',
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginRight: 30,
    flex: 1,
  },
  showDatePickerButton: {
    width: 42,
    height:47,
  },
  tagcontainer: {
    flexDirection: 'column',
    marginLeft: '4%',
  },
  textContainer: {
    marginTop: '5%'
  },
  textQuestion: {
    fontSize: 30,
    fontFamily: 'Neucha_400Regular',
  },
  DiaryInsertContainer: {
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDateContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  wordButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: '3%',
    flexWrap: 'wrap'
  },
  selectedWordsContainer: {
    marginleft: '10%',
    marginTop: '3%'
  },
  selectedWordsText: {
    fontSize: 30,
    fontFamily: 'Neucha_400Regular',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingLeft: '1%'
  },
  tagInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 15,
    borderWidth: 2,
    fontFamily: 'Neucha_400Regular',
  },
  tagButton: {
    marginVertical: 5,
    borderRadius: 15,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 5, 
    marginHorizontal: 4,
    marginRight: '5%'
  },
  tagText: {
    fontFamily: 'Neucha_400Regular',
    fontSize: 24,
  },
  timePickerContainer: {
    marginTop: '3%',
    flexDirection: 'column',
    marginLeft: '4%',
  },
  timePickerTitle: {
    fontSize: 24,
    fontFamily: 'Neucha_400Regular',
    marginBottom: 10,
  },
  timePickerIcons: {
    flexDirection: 'row',
    marginTop: '3%',
    justifyContent: 'space-evenly',
  },
  timePickerIcon: {
    width: 50,
    height: 50,
    marginHorizontal: 10,
    borderRadius: 25,
    paddingRight: 40,
    justifyContent: 'space-between',
  },
  timeIcon: {
    width: 85,
    height: 45,
  },
  selectedTimePickerIcon: {
    borderColor: '#007AFF',
    isVisible: true,
  },
  notesContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingTop: '5%',
    paddingLeft: '5%'
  },
  notesInput: {
    width: '100%',
    height: 100,
    textAlignVertical: 'top',
    fontFamily: 'Neucha_400Regular',
    fontSize: 18,
    color: '#797979'
  },
  diarysaveButton: {
    fontFamily: 'Neucha_400Regular',
    fontSize: 41,
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
  calendar: {
    borderRadius: 15,
    height: 350,
    width: 300,
  },
  headerText: {
    fontFamily: 'Neucha_400Regular',
    fontSize: 25,
  },
});

export default FirstPage;