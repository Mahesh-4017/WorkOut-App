/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {},
}));

jest.mock('../src/services/appleAuth', () => ({
  signInWithApple: jest.fn(),
}));

jest.mock('react-native-notification-sounds', () => ({
  createSoundChannel: jest.fn(),
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    onForegroundEvent: jest.fn(() => jest.fn()),
  },
  EventType: {
    ACTION_PRESS: 1,
  },
}));

jest.mock('../src/data/SessionProvider', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/navigation/Navigation', () => () => null);

test('renders correctly', async () => {
  let component!: ReactTestRenderer.ReactTestRenderer;

  await ReactTestRenderer.act(() => {
    component = ReactTestRenderer.create(<App />);
  });

  await ReactTestRenderer.act(() => {
    component.unmount();
  });
});
