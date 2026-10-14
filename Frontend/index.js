/**
 * @format
 */

import { AppRegistry } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.ACTION_PRESS && ['pause', 'resume', 'stop'].includes(detail.pressAction?.id ?? '')) {
    await AsyncStorage.setItem('@workout/pending-timer-action', detail.pressAction.id);
  }
});

AppRegistry.registerComponent(appName, () => App);
