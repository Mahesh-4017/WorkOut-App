import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  showDescription?: boolean;
  description?: string;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  showDescription = true,
  description = 'Already a member? Log in',
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.button}
        onPress={onPress}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </TouchableOpacity>

      {showDescription && (
        <Text style={styles.description}>
          {description}
        </Text>
      )}
    </View>
  );
};

export default PrimaryButton;

const createStyles = (theme: { colors: { primary: string; onPrimary: string; textSecondary: string } }) => StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },

  button: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.onPrimary,
  },

  description: {
    marginTop: 8,
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});