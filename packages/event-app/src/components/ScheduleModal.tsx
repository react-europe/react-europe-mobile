import {Ionicons} from '@expo/vector-icons';
import Fuse from 'fuse.js';
import React, {useState, useContext, useEffect, useRef} from 'react';
import {Modal, StyleSheet, View, Platform, ScrollView} from 'react-native';
import {Searchbar, List} from 'react-native-paper';

import DataContext from '../context/DataContext';
import {ScheduleDay} from '../typings/data';

type ScheduleModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
};

export default function ScheduleModal(props: ScheduleModalProps) {
  /* Fuse.js config */
  const options = {
    keys: ['slots.title'],
    threshold: 0.4,
    includeMatches: true,
  };
  const [searchQuery, setSearchQuery] = useState('');
  const {event} = useContext(DataContext);
  const [schedule, setSchedule] = useState<ScheduleDay[]>([]);
  const fuse = useRef<any>();

  function updateSlots() {
    if (!event?.groupedSchedule) return;
    if (searchQuery.length === 0) {
      setSchedule(event.groupedSchedule as ScheduleDay[]);
    } else {
      let result: any = fuse.current.search(searchQuery);
      result = result.map((match: any) => match.item);
      setSchedule(result);
    }
  }

  useEffect(() => {
    updateSlots();
  }, [searchQuery]);

  useEffect(() => {
    if (event?.groupedSchedule) {
      fuse.current = new Fuse(event?.groupedSchedule, options);
      updateSlots();
    }
  }, [event]);

  return (
    <Modal animationType="slide" transparent visible={props.modalVisible}>
      <View style={styles.modalView}>
        <Ionicons
          name={Platform.OS === 'ios' ? 'ios-close' : 'md-close'}
          size={24}
          color="black"
          style={{margin: 10}}
          onPress={() => {
            props.setModalVisible(!props.modalVisible);
          }}
        />
        <Searchbar
          placeholder="Search"
          onChangeText={(text) => setSearchQuery(text)}
          value={searchQuery}
        />
        <ScrollView>
          <List.AccordionGroup>
            {schedule?.map((day, index) => {
              const date = new Date(day?.date);
              return (
                <List.Accordion
                  key={index}
                  title={`${day?.title} - ${date.getDate()}`}
                  id={day?.date}>
                  {day?.slots?.map((slot, index) => {
                    return <List.Item key={index} title={slot?.title} />;
                  })}
                </List.Accordion>
              );
            })}
          </List.AccordionGroup>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: 'white',
    flex: 1,
  },
});