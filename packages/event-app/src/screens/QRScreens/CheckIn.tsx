import React, {useEffect, useState, useContext} from 'react';
import {Alert, AsyncStorage} from 'react-native';

import DataContext from '../../context/DataContext';
import QR_CHECKIN_QUERY from '../../data/qrCheckinQuery';
import {AppProps} from '../../typings/navigation';
import {getValueFromStore, setValueInStore} from '../../utils';
import client from '../../utils/gqlClient';
import QRScreen from './QRScreen';

export default function QRCheckinScannerModalNavigation(
  props: AppProps<'QRCheckinScanner'>
) {
  const [loading, setLoading] = useState(false);
  const params = props.route.params;
  const {event} = useContext(DataContext);

  useEffect(() => {
    AsyncStorage.removeItem('@MySuperStore2019:lastCheckedInRef');
  }, []);

  const _handleCheckinBarCodeRead = async (data: string) => {
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      if (!event?.slug) return;
      const lastCheckedInRef = await getValueFromStore(
        'lastCheckedInRef',
        event?.slug
      );
      await setValueInStore('lastCheckedInRef', data);

      if (data === lastCheckedInRef) {
        // bail out
        return;
      }

      //{ slug: GQL.slug, uuid: data };
      const variables = {
        uuid: params.uuid,
        checkinListId: params.checkinList.id,
        ref: data,
      };

      //console.log("Scanned!", data);
      //console.log("variables", variables);
      //console.log("uuid state is", this.state.uuid);
      //console.log("checkinlist state is", this.state.checkinList);

      const value = await client.mutate({
        mutation: QR_CHECKIN_QUERY,
        variables,
      });

      console.log('checkin mutation value', value);
      if (value && value.data && value.data.createCheckin === null) {
        Alert.alert(
          'This reference could not be found, make sure you selected the right Checkin List!'
        );
      } else if (value && value.data && value.data.createCheckin) {
        if (
          value.data.createCheckin.checkinMessage === 'Already checked-in today'
        ) {
          Alert.alert(
            'This reference has already been checked today! The person cannot get in as their ticket has already been used by someone else.'
          );
        }
        props.navigation.navigate('CheckedInAttendeeInfo', {
          checkedInAttendee: value.data.createCheckin,
        });
      }
      // expected output: Array [1, 2, 3]
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <QRScreen
      loading={loading}
      title={`Checking ${params.checkinList.name}`}
      onBarCodeScanned={_handleCheckinBarCodeRead}
    />
  );
}
