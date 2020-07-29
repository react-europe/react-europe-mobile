import {Ionicons} from '@expo/vector-icons';
import Fuse from 'fuse.js';
import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Searchbar, List} from 'react-native-paper';

import DataContext from '../context/DataContext';
import {ScheduleDay, Schedule} from '../typings/data';
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
      const result: any = fuse.current.search(searchQuery);
      let ScheduleCpy = JSON.parse(JSON.stringify(result));
      ScheduleCpy = ScheduleCpy.map((match: any) => {
        const selectedIndex = match.matches.map((match: any) => match.refIndex);
        const selected = match.item.slots.filter(
          (slot: Schedule, index: number) => {
            if (selectedIndex.includes(index)) {
              return true;
            }
            return false;
          }
        );
        match.item.slots = selected;
        return match.item;
      });
      setSchedule(ScheduleCpy);
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
        <TouchableOpacity
          onPress={() => {
            console.log('CLOSE');
            props.setModalVisible(!props.modalVisible);
          }}>
          <Ionicons
            name={Platform.OS === 'ios' ? 'ios-close' : 'md-close'}
            size={24}
            color="black"
            style={{margin: 10}}
          />
        </TouchableOpacity>

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
