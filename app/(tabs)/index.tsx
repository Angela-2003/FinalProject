// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import MoodButton from '../../components/MoodButton';
import TrackCard, { Track } from '../../components/TrackCard';
import MusicTypeSelector, { MusicType } from '../../components/MusicTypeSelector';
import FolderSelectionModal from '../../components/FolderSelectionModal';
import { addTrackToFolder } from '../../utils/FolderStorage';
import { HistoryEntry } from '@/utils/HistoryEntry';


const MOODS = ['happy','sad','angry','tired'] as const;
type Mood = typeof MOODS[number];

const moodQuery: Record<Mood,string> = {
  happy: 'happy',
  sad:   'be better',
  angry: 'hard rock',
  tired: 'slow down',
};

// Original moodColors - we can keep these or adjust to a preferred palette
const moodColors: Record<Mood, string> = {
  happy: '#FFF9C4',    // light yellow
  sad: '#BBDEFB',      // light blue
  angry: '#FFCDD2',    // light red
  tired: '#E0E0E0',    // gray
};

const PAGE_SIZE = 10;

export default function MoodScreen() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [musicType, setMusicType] = useState<MusicType | null>(null);
  const [page, setPage] = useState(0);
  const [allFetchedResults, setAllFetchedResults] = useState<Track[]>([]);

  const [showFolderModal, setShowFolderModal] = useState<boolean>(false);
  const [trackToAddToFolder, setTrackToAddToFolder] = useState<Track | null>(null);

  const router = useRouter();
  const backgroundColor = selectedMood ? moodColors[selectedMood] : '#F8F8F8'; // Changed default to a soft gray for background

  useEffect(() => {
    if (!selectedMood || !musicType) return;

    (async () => {
      setLoading(true);
      try {
        const moodTerm = moodQuery[selectedMood];
        const term = encodeURIComponent(`${moodTerm} ${musicType}`);
        const res = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=50`);
        const json = await res.json();
        const results: Track[] = json.results || [];

        setAllFetchedResults(results);

        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const newBatch = results.slice(start, end);

        if (page === 0) {
          setTracks(newBatch);
        } else {
          setTracks((prev) => [...prev, ...newBatch]);
        }
      } catch (e) {
        console.warn(e);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedMood, musicType, page]);

  const playPreview = async (track: Track) => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: track.previewUrl },
      { shouldPlay: true }
    );
    setSound(newSound);

    const entry = {
      trackId:   track.trackId,
      trackName: track.trackName,
      artist:    track.artistName,
      playedAt:  new Date().toISOString(),
      mood:      selectedMood,
      style:     musicType,
    };

    const raw  = await AsyncStorage.getItem('history');
    let hist = raw ? JSON.parse(raw) as HistoryEntry[] : [];
    hist = hist.filter(h => h.trackId !== entry.trackId);
    hist.unshift(entry);
    await AsyncStorage.setItem('history', JSON.stringify(hist.slice(0, 50)));
  };

  const pausePreview = async () => {
    if (sound) {
      await sound.pauseAsync();
    }
  };

  const handleLoadMore = () => {
    const nextStart = (page + 1) * PAGE_SIZE;
    if (nextStart < allFetchedResults.length) {
      setPage((prev) => prev + 1);
    }
  };

  const handleAddToFolder = (track: Track) => {
    setTrackToAddToFolder(track);
    setShowFolderModal(true);
  };

  const handleSelectFolder = async (folderId: string, track: Track) => {
    setShowFolderModal(false);
    setTrackToAddToFolder(null);

    const success = await addTrackToFolder(folderId, track);

    if (success) {
      Alert.alert('Success', `“${track.trackName}” added to folder.`, [{ text: 'OK' }]); // Added OK button for iOS consistency
    } else {
      Alert.alert('Info', `“${track.trackName}” is already in this folder, or folder not found.`, [{ text: 'OK' }]);
    }
  };

  const handleCloseFolderModal = () => {
    setShowFolderModal(false);
    setTrackToAddToFolder(null);
  };


  return (
    <>
      <Stack.Screen
        options={{
          title: '🎧 Mood Tunes',
          headerLargeTitle: true, // Enable large title for iOS native feel
          headerStyle: {
            backgroundColor: '#F8F8F8', // Match header background to the container default
          },
          headerTintColor: '#000', // Header title color
        }}
      />
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={styles.header}>How are you feeling?</Text>
        <View style={styles.row}> {/* This is the parent View for your MoodButtons */}
          {MOODS.map((mood) => (
            <MoodButton
              key={mood}
              mood={mood}
              isActive={selectedMood === mood}
              onPress={() => {
                setSelectedMood(mood);
                setMusicType(null);
                setTracks([]);
                setAllFetchedResults([]);
                setPage(0);
              }}
            />
          ))}
        </View>

        {selectedMood && !musicType && (
          <MusicTypeSelector selected={musicType} onSelect={(type) => {
            setMusicType(type);
            setPage(0);
            setTracks([]);
            setAllFetchedResults([]);
          }} />
        )}

        {loading && page === 0 && <ActivityIndicator style={{ marginTop: 20 }} size="large" color="#007AFF" />}

        {!loading && selectedMood && musicType && (
          <FlatList
            data={tracks}
            keyExtractor={(t) => t.trackId.toString()}
            renderItem={({ item }) => (
              <TrackCard
                track={item}
                onPlay={playPreview}
                onPause={pausePreview}
                onAddToFolder={handleAddToFolder}
              />
            )}
            style={{ marginTop: 20 }}
            contentContainerStyle={{ paddingBottom: 24 }} // Add padding to bottom of list
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={loading && page > 0 ? (
              <ActivityIndicator style={{ marginVertical: 20 }} color="#007AFF" />
            ) : null}
          />
        )}

        {musicType && (
          <Text
            style={styles.chooseAnotherType}
            onPress={() => {
              setMusicType(null);
              setPage(0);
              setTracks([]);
              setAllFetchedResults([]);
            }}
          >
            🔙 Choose another type
          </Text>
        )}
      </View>

      <FolderSelectionModal
        isVisible={showFolderModal}
        onClose={handleCloseFolderModal}
        onSelectFolder={handleSelectFolder}
        track={trackToAddToFolder}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16, // Padding on left/right for content
    paddingTop: 16,       // Padding from the top of the view
    backgroundColor: '#F8F8F8', // Default subtle background for consistency
  },
  header: {
    fontSize: 28, // Slightly larger for main header
    fontWeight: 'bold',
    color: '#000', // Black text
    marginBottom: 20, // More space below the header
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',    // KEY CHANGE: Allow buttons to wrap to the next line
    justifyContent: 'center', // Center buttons horizontally within the wrapped layout
    marginBottom: 20,    // Space below the buttons
    paddingHorizontal: 0, // No extra padding here if MoodButton handles its own margins
  },
  // You might not have these specific styles from previous steps, so adding them for clarity
  chooseAnotherType: {
    textAlign: 'center',
    color: '#007AFF', // Standard iOS blue for links/actions
    fontSize: 15,
    marginTop: 15,
    paddingBottom: 15, // Ensure it's not too close to the bottom tab bar
  },
});