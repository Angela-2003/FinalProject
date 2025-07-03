// app/(tabs)/history.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

interface HistoryEntry {
  trackId:   number;
  trackName: string;
  artist:    string;
  playedAt:  string;
  mood:      string;
  style:     string;
}

const MOODS = ['all', 'happy', 'sad', 'angry', 'tired'];
const STYLES = ['all', 'pop', 'jazz', 'lofi', 'rock', 'classical', 'hiphop'];

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filtered, setFiltered] = useState<HistoryEntry[]>([]);
  const [moodFilter, setMoodFilter] = useState('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [filterName, setFilterName] = useState('');
  const [savedFilters, setSavedFilters] = useState<Record<string, { mood: string, style: string }>>({});

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const raw = await AsyncStorage.getItem('history');
        const parsed = raw ? JSON.parse(raw) : [];
        setHistory(parsed);
        setFiltered(parsed);

        const saved = await AsyncStorage.getItem('savedFilters');
        setSavedFilters(saved ? JSON.parse(saved) : {});
      })();
    }, [])
  );

  useEffect(() => {
    let result = [...history];
    if (moodFilter !== 'all') {
      result = result.filter((entry) => entry.mood === moodFilter);
    }
    if (styleFilter !== 'all') {
      result = result.filter((entry) => entry.style === styleFilter);
    }
    setFiltered(result);
  }, [moodFilter, styleFilter, history]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '🕘 Listening History' }} />

      {history.length === 0 ? (
        <Text style={styles.empty}>No history yet.</Text>
      ) : (
        <>
          <Button
            title="Clear History"
            onPress={async () => {
              await AsyncStorage.removeItem('history');
              setHistory([]);
              setFiltered([]);
            }}
          />

          <Text style={styles.label}>Filter by Mood</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={moodFilter}
              onValueChange={(value) => setMoodFilter(value)}
              style={styles.picker}
              itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
            >
              {MOODS.map((m) => (
                <Picker.Item key={m} label={m.charAt(0).toUpperCase() + m.slice(1)} value={m} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Filter by Style</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={styleFilter}
              onValueChange={(value) => setStyleFilter(value)}
              style={styles.picker}
              itemStyle={Platform.OS === 'ios' ? styles.pickerItem : undefined}
            >
              {STYLES.map((s) => (
                <Picker.Item key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} value={s} />
              ))}
            </Picker>
          </View>

          {filtered.length === 0 ? (
            <Text style={styles.empty}>No results for current filters.</Text>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item, i) => item.trackId ? `${item.trackId}-${i}` : i.toString()}
              renderItem={({ item }) => (
                <View style={styles.historyRow}>
                  <Text style={styles.historyTrackName}>🎵 {item.trackName} – {item.artist}</Text>
                  <Text style={styles.historyMeta}>😊 Mood: {item.mood} | 🎶 Style: {item.style}</Text>
                  <Text style={styles.historyTime}>{new Date(item.playedAt).toLocaleString()}</Text>
                </View>
              )}
              contentContainerStyle={styles.flatListContent}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#F8F8F8',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'ios' ? 48 : 48, 
    justifyContent: 'flex-start', 
},
  picker: {
    height: Platform.OS === 'ios' ? 120 : 48,
    width: '100%',
  },
  pickerItem: { // iOS specific style for Picker items, to control font size and color inside the wheel
    height: 48, // Ensure each item takes up the same height as the container
    fontSize: 16,
    color: '#333',
    textAlign: 'left', // Ensure text alignment
  },
  flatListContent: {
    paddingBottom: 20,
  },
  historyRow: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyTrackName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  historyMeta: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 11,
    color: '#999',
  },
});