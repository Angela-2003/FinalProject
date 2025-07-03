import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MoodButton from './MoodButton';

const MUSIC_TYPES = ['pop', 'jazz', 'lofi', 'rock', 'classical', 'hiphop'] as const;
export type MusicType = typeof MUSIC_TYPES[number];

interface Props {
  selected: MusicType | null;
  onSelect: (type: MusicType) => void;
}

export default function MusicTypeSelector({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What type of music do you want?</Text>
      <View style={styles.row}>
        {MUSIC_TYPES.map((type) => (
          <MoodButton
            key={type}
            mood={type}
            isActive={selected === type}
            onPress={() => onSelect(type)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16 },
  title: { fontSize: 18, marginBottom: 10, fontWeight: 'bold' },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around' },
});
