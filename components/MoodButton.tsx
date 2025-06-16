import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface MoodButtonProps {
  mood:      'happy' | 'sad' | 'angry' | 'tired';
  isActive:  boolean;
  onPress(): void;
}

// map moods → background colors
const moodColors: Record<MoodButtonProps['mood'], string> = {
  happy: '#fdd835',  // yellow
  sad:   '#90caf9',  // light blue
  angry: '#ef5350',  // red
  tired: '#a5d6a7',  // green
};

export default function MoodButton({ mood, isActive, onPress }: MoodButtonProps) {
  const bg = moodColors[mood];

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: bg }, 
        isActive && styles.btnActive  // you can e.g. darken or add border on active
      ]}
      onPress={onPress}
    >
      <Text style={styles.text}>{mood.toUpperCase()}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flex:            1,
    marginHorizontal:5,
    padding:         12,
    borderRadius:    6,
    alignItems:      'center',
  },
  btnActive: {
    borderWidth: 2,
    borderColor: '#333',
  },
  text: {
    fontWeight: '600',
    color:      '#000',
  },
});
