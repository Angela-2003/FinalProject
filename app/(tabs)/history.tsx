// app/(tabs)/history.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';

interface HistoryEntry {
  trackId:   number;
  trackName: string;
  artist:    string;
  playedAt:  string;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('history');
      setHistory(raw ? JSON.parse(raw) : []);
    })();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: 'Listening History' }} />
      <View style={styles.container}>
        {history.length === 0 ? (
          <Text style={styles.empty}>No history yet.</Text>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Text>🎵 {item.trackName} – {item.artist}</Text>
                <Text style={styles.time}>
                  {new Date(item.playedAt).toLocaleString()}
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16, backgroundColor:'#fff' },
  empty:    { textAlign:'center', marginTop:20, color:'#666' },
  row:      { marginBottom:12 },
  time:     { fontSize:12, color:'#999' },
});

