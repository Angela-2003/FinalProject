import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MoodButton from '../../components/MoodButton';
import TrackCard, { Track } from '../../components/TrackCard';

const MOODS = ['happy','sad','angry','tired'] as const;
type Mood = typeof MOODS[number];
const moodQuery: Record<Mood,string> = {
  happy: 'happy',
  sad:   'everything will be better',
  angry: 'hard rock',
  tired: 'slow down',
};

export default function MoodScreen() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!selectedMood) return;
    (async () => {
      setLoading(true);
      try {
        const term = encodeURIComponent(moodQuery[selectedMood]);
        const res  = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=10`);
        const json = (await res.json()) as { results: Track[] };
        setTracks(json.results);
      } catch (e) {
        console.warn(e);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedMood]);

  // unified “play & save to history” handler
  const playPreview = async (track: Track) => {
    // 1) play
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: track.previewUrl },
      { shouldPlay: true }
    );
    setSound(newSound);

    // 2) store in AsyncStorage
    const entry = {
      trackId:   track.trackId,
      trackName: track.trackName,
      artist:    track.artistName,
      playedAt:  new Date().toISOString(),
    };
    const raw  = await AsyncStorage.getItem('history');
    const hist = raw ? JSON.parse(raw) as any[] : [];
    hist.unshift(entry);
    // keep only the most recent 50 entries
    await AsyncStorage.setItem('history', JSON.stringify(hist.slice(0,50)));
  };

  // Pause the current music
  const pausePreview = async () => {
    if (sound) {
      await sound.pauseAsync();
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Mood Tunes' }} />
      <View style={styles.container}>
        <Text style={styles.header}>How are you feeling?</Text>
        <View style={styles.row}>
          {MOODS.map((mood) => (
            <MoodButton
              key={mood}
              mood={mood}
              isActive={selectedMood === mood}
              onPress={() => setSelectedMood(mood)}
            />
          ))}
        </View>

        {loading && <ActivityIndicator style={{ marginTop: 20 }} size="large" />}

        {!loading && selectedMood && (
          <FlatList
            data={tracks}
            keyExtractor={(t) => t.trackId.toString()}
            renderItem={({ item }) => (
              <TrackCard track={item} onPlay={playPreview} onPause={pausePreview} />
            )}
            style={{ marginTop: 20 }}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header:    { fontSize: 24, fontWeight: 'bold', marginVertical: 16 },
  row:       { flexDirection: 'row', justifyContent: 'space-around' },
});
