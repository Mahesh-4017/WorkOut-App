module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-clone-referenced-element|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|react-native-vector-icons)/)',
  ],
};
