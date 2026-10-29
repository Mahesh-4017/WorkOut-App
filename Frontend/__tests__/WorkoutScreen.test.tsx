import React from 'react';
import { Text } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';

import Workout from '../src/pages/workout/Workout';
import { ThemeProvider } from '../src/theme/ThemeProvider';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
}));

jest.mock('../src/data/UserProvider', () => ({
  useUser: () => ({ history: [] }),
}));

jest.mock('@react-native-vector-icons/ionicons', () => {
  const ReactLib = require('react');
  const ReactNative = require('react-native');

  return function MockIonicons(props: any) {
    return ReactLib.createElement(ReactNative.Text, props, props.name || 'icon');
  };
});

describe('Workout screen', () => {
  it('renders the workout details and CTA', () => {
    let component!: ReactTestRenderer.ReactTestRenderer;

    act(() => {
      component = ReactTestRenderer.create(
        <ThemeProvider>
          <Workout />
        </ThemeProvider>
      );
    });

    const textNodes = component.root.findAllByType(Text);
    const toText = (value: unknown) => {
      if (Array.isArray(value)) {
        return value.join('');
      }
      return value ?? '';
    };

    const hasTitle = textNodes.some((node) => toText(node.props.children) === 'Upper Body Push');
    const hasCta = textNodes.some((node) => toText(node.props.children) === 'Start Workout');
    const hasHeading = textNodes.some((node) => toText(node.props.children) === 'Exercises');

    expect(hasTitle).toBe(true);
    expect(hasCta).toBe(true);
    expect(hasHeading).toBe(true);
  });
});
