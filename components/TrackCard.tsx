// a single row in your FlatList: artwork, title, artist + play button
import React from 'react';
import { View, Image, Text, Button, StyleSheet } from 'react-native';

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
}

export default function TrackCard({ track, onPlay, onPause }: TrackCardProps) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: track.artworkUrl100 }} style={styles.artwork} />
      <View style={styles.info}>
        <Text style={styles.title}>{track.trackName}</Text>
        <Text style={styles.artist}>{track.artistName}</Text>
        <View style={styles.controls}>
          <View style={styles.btnWrap}>
            <Button title="▶️ Play" onPress={() => onPlay(track)} />
          </View>
          <View style={styles.btnWrap}>
            <Button title="⏸️ Pause" onPress={onPause} />
          </View>
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
  },
  artwork: {
    width: 90,
    height: 90,
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
    marginTop: 0,
  },
  btnWrap: {
    flex: 1,
    marginHorizontal: 0,
  },
});
