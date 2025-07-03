import React from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface Track {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
}

interface TrackCardProps {
  track: Track;
  onPlay(track: Track): void;
  onPause(): void;
  onAddToFolder(track: Track): void; // NEW PROP
}

export default function TrackCard({ track, onPlay, onPause, onAddToFolder }: TrackCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: track.artworkUrl100 }} style={styles.artwork} />
      <View style={styles.info}>
        <Text style={styles.title}>{track.trackName}</Text>
        <Text style={styles.artist}>{track.artistName}</Text>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onPlay(track)}>
            <Text style={styles.actionButtonText}>▶️ Play</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={onPause}>
            <Text style={styles.actionButtonText}>⏸️ Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onAddToFolder(track)}>
            <Text style={styles.actionButtonText}>✚ Folder</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#fff', // Added for clarity
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  artwork: {
    width: 90,
    height: 90,
    borderRadius: 6,
    marginRight: 10,
  },
  info: {
    flex: 1,
    padding: 8,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 14,
    color: '#555',
    marginBottom: 0,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5, // Adjusted to give space
  },
  btnWrap: {
    flex: 1,
    marginHorizontal: 2, // Added small margin between buttons
  },
  actionButton: {
    flex: 1, // Allows buttons to share space
    marginHorizontal: 2, // Small margin between buttons
    paddingVertical: 6, // DECREASED PADDING to make buttons smaller
    paddingHorizontal: 8, // DECREASED PADDING
    backgroundColor: '#EFEFEF', // Light gray background for buttons
    borderRadius: 5, // Rounded corners for buttons
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30, // Ensure a minimum height for touchability
  },
  // NEW STYLE for the text inside the buttons
  actionButtonText: {
    fontSize: 12, // DECREASED FONT SIZE for button text/emojis
    fontWeight: '600', // Semi-bold
    color: '#007AFF', // iOS blue for button text
  },
});
