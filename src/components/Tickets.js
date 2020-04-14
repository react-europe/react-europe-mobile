import React from 'react';
import {View} from 'react-native';
import {Title} from 'react-native-paper';

import TicketCard from './TicketCard';

export function Tickets(props) {
  let tix = props.tickets || [];

  /* function _renderDateTime() {
    if (conferenceHasEnded()) {
      return null;
    }

    const {dateTime} = state;

    if (dateTime) {
      return (
        <RegularText style={styles.time}>
          {convertUtcDateToEventTimezoneDaytime(dateTime)}
        </RegularText>
      );
    } else {
      // handle after conf thing
    }
  } */

  return (
    <View style={[{marginHorizontal: 10}, props.style]}>
      <Title>My Tickets</Title>
      {tix.map(ticket =>
        ticket ? (
          <TicketCard
            key={ticket.ref}
            ticket={ticket}
            style={{marginTop: 10, marginBottom: 10}}
          />
        ) : null
      )}
    </View>
  );
}

/* const styles = StyleSheet.create({
  time: {
    color: Colors.faint,
    fontSize: FontSizes.subtitle,
  },
}); */
