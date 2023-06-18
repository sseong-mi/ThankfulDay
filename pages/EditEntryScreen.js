import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ImageBackground, Image } from 'react-native';
import { LongPressGestureHandler, State } from 'react-native-gesture-handler';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Modal from 'react-native-modal';
import moment from 'moment';

const image = require('../images/background.png');
const datePickerImage = require('../images/Calendardot.png');
const morning = require('../images/mornig.png');
const noon = require('../images/lunch.png');
const moon = require('../images/moon.png');
const dinner = require('../images/evening.png');

const EditEntryScreen = ({ route }) => {
  const navigation = useNavigation();
  let { entry, user, _, IPConfig} = route.params;
  const [editedEntry, setEditedEntry] = useState(entry);
  const [selectedWords, setSelectedWords] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [deletedtag, setDeletedTag] = useState('');
  const [alertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    loadTagData(); // Load the tag data from user.tags
    loadData();
  }, [route]);

  const handleSaveChanges = () => {
    const diaryEntry = {
      date: entry.date,
      tagsUsed: selectedWords,
      time: selectedTime,
      notes: notes,
    };

    const payload = {
      userId: user._id,
      diaryEntryId: entry._id,
      updatedData: diaryEntry,
    };

    fetch(IPConfig + 'diary/update', {
      method: 'PUT',
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
          setSelectedWords([]);
          setSelectedTime(null);
          setNotes('');
          const previousScreen = route.params.previousScreen;
          navigation.navigate(previousScreen); // Navigate back to the previous screen
        } else {
          console.log(result.message);
        }
      })
      .catch((error) => {
        console.error('Error occurred while saving diary entry:', error);
      });
  };

  const loadData = () => {
    // First load and update tag data
    const usedTags = entry.tagsUsed.filter((value) => tags.includes(value));
    setSelectedWords(usedTags);
    setSelectedTime(entry.time);
    setNotes(entry.notes);
  };

  const loadTagData = () => {
    const userTags = user.tags.map(tag => tag.word);
    setTags(userTags);
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
        } else {
          console.log(result.message);
        }
      })
      .catch((error) => {
        console.error('Error occurred while deleting tag:', error);
      });
  };

  const handleTimeSelection = (time) => {
    setSelectedTime(time);
  };

  const handleNotesChange = (text) => {
    setNotes(text);
  };

  const hideDeleteTag = () =>{
    setAlertVisible(false);
  };

  const handleGoBack = () => {
    const previousScreen = route.params.previousScreen;
    navigation.navigate(previousScreen); // Navigate back to the previous screen
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode='cover' style={styles.backgroundImage}>
      <View style={styles.headerContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          </TouchableOpacity>
        </View>
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateText}>
            {moment(entry.date).format('YY.MM.DD')}
          </Text>
      </View>
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
      <View style={styles.DiaryInsertContainer}>
        <TouchableOpacity onPress={handleSaveChanges} style={styles.diarysaveButton}>
          <Text style={{fontFamily: 'Neucha_400Regular', fontSize: 35}}>
            Re Write
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 10,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 13,
    borderWidth: 2,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  textQuestion: {
    fontSize: 34,
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
    bottom: 10,
    right: 20,
  },
  selectedDateText: {
    fontSize: 40,
    fontFamily: 'Neucha_400Regular',
    justifyContent: 'center',
  },
  wordButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: '3%',
    flexWrap: 'wrap',
    paddingLeft: '4%',
  },
  selectedWordsContainer: {
    marginTop: '3%',
    left: 20
  },
  selectedWordsText: {
    fontSize: 30,
    fontFamily: 'Neucha_400Regular',
  },
  tagText: {
    fontFamily: 'Neucha_400Regular',
    fontSize: 24,
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
  timePickerContainer: {
    marginTop: '3%',
    flexDirection: 'column',
    marginLeft: '4%',
    paddingTop: '2%'
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
  notesContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
    paddingLeft: '5%',
    paddingTop: '5%'
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notesInput: {
    width: '80%',
    height: 100,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    textAlignVertical: 'top',
  },
  input: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
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
});

export default EditEntryScreen;
