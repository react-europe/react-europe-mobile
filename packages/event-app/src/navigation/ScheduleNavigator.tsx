import {createStackNavigator} from '@react-navigation/stack';
import React from 'react';

import DrawerOpenButton from '../components/DrawerOpenButton';
import {ScheduleStackParamList} from '../typings/navigation';
import DefaultStackConfig from '../utils/defaultNavConfig';
import DynamicScheduleNavigation from './DynamicScheduleNavigation';

const Stack = createStackNavigator<ScheduleStackParamList>();

export default function ScheduleNavigator() {
  return (
    <Stack.Navigator
      screenOptions={({route}) => ({...DefaultStackConfig(route)})}>
      <Stack.Screen
        name="Schedule"
        component={DynamicScheduleNavigation}
        options={({navigation}) => DrawerOpenButton(navigation)}
      />
    </Stack.Navigator>
  );
}
