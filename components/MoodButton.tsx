// components/MoodButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface MoodButtonProps {
  mood: string;
  isActive: boolean;
  onPress(): void;
}

// map moods → background colors
const moodColors: Record<MoodButtonProps['mood'], string> = {
  happy: '#FFD700', // Brighter yellow for "happy"
  sad:   '#64B5F6',   // A slightly richer blue for "sad"
  angry: '#E57373', // A softer red for "angry"
  tired: '#BDBDBD', // A neutral gray for "tired"
};

export default function MoodButton({ mood, isActive, onPress }: MoodButtonProps) {
  const isMood = mood in moodColors; // Check if it's one of the primary moods
  const bgColor = isMood ? moodColors[mood] : '#FFFFFF'; // Default white for non-mood buttons

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: bgColor },
        isMood && isActive && styles.moodBtnActive, // Specific active style for mood buttons
        !isMood && styles.musicTypeBtn, // Style for music type buttons
        !isMood && isActive && styles.musicTypeBtnActive, // Active style for music type buttons
      ]}
      onPress={onPress}
    >
      <Text style={styles.text}>{mood.toUpperCase()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    // REMOVED: flex: 1, // Remove flex:1 so that width can be controlled for wrapping
    width: '46%', // Each button takes up slightly less than half the width
    marginHorizontal: '2%', // This creates the spacing between buttons in a row
    marginVertical: 8, // Spacing between rows and from top/bottom
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10, // More rounded corners for modern iOS look
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Ensure a minimum touch target size for iOS
    // iOS shadow properties for a subtle lifted effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Android elevation for shadow (similar visual effect)
    elevation: 3,
  },
  moodBtnActive: {
    borderWidth: 2,
    borderColor: '#007AFF', // Standard iOS blue for active border
    shadowOpacity: 0.2, // Slightly more pronounced shadow when active
  },
  // Renamed styleButton to musicTypeBtn for clarity
  musicTypeBtn: {
    backgroundColor: '#FFFFFF', // White background
    borderWidth: 1,
    borderColor: '#E0E0E0', // Light gray border
    // Remove shadow for these if they should appear flatter than mood buttons
    shadowOpacity: 0,
    elevation: 0,
  },
  // Renamed styleButtonActive to musicTypeBtnActive for clarity
  musicTypeBtnActive: {
    borderColor: '#007AFF', // Active border in iOS blue
    backgroundColor: '#F0F0F0', // Slightly darker background when active
    borderWidth: 2, // Thicker border for emphasis
    shadowOpacity: 0, // Ensure no shadow even when active if it's flatter
    elevation: 0,
  },
  text: {
    fontWeight: '600', // Semi-bold for better readability
    fontSize: 16, // Good size for touch targets
    color: '#333', // Dark text color for contrast
  },
});
