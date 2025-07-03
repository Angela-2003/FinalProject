import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import { Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; 
import { getFolders, createFolder, deleteFolder, renameFolder, MusicFolder } from '../../utils/FolderStorage';
import { Track } from '../../components/TrackCard'; 
import { Audio } from 'expo-av'; 

export default function FolderScreen() {
  const [folders, setFolders] = useState<MusicFolder[]>([]);
  const [newName, setNewName] = useState('');
  const [editingFolder, setEditingFolder] = useState<MusicFolder | null>(null);
  const [expandedFolderId, setExpandedFolderId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);

  // Use useFocusEffect to refresh data every time the tab is focused
  useFocusEffect(
    React.useCallback(() => {
      refresh();
      return () => {
        // Clean up sound when leaving the screen
        if (sound) {
          sound.unloadAsync();
          setSound(null);
          setPlayingTrackId(null);
        }
      };
    }, [])
  );

  const refresh = async () => {
    console.log('[FolderScreen] refresh: Fetching folders...');
    const all = await getFolders();
    setFolders(all);
    console.log('[FolderScreen] refresh: Folders fetched:', all.map(f => f.name));
  };

  const onAdd = async () => {
    if (!newName.trim()) {
      Alert.alert('Input Required', 'Please enter a folder name.');
      return;
    }
    try {
    console.log('[FolderScreen] onAdd: Creating folder with name:', newName.trim());
    await createFolder(newName.trim());
    setNewName('');
    await refresh();  // ✅ await is important here
  } catch (error) {
    console.error('[FolderScreen] onAdd: Failed to create folder:', error);
    Alert.alert('Error', 'Could not create folder.');
  }
};

  const onRename = async () => {
    if (!newName.trim() || !editingFolder) {
      Alert.alert('Input Required', 'Please enter a new name for the folder.');
      return;
    }
    await renameFolder(editingFolder.id, newName.trim());
    setEditingFolder(null);
    setNewName('');
    refresh();
  };

  const onDelete = async (folder: MusicFolder) => {
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete the folder “${folder.name}”?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('[FolderScreen] onDelete: Attempting direct delete for:', folder.name);
            try {
              await deleteFolder(folder.id);
              const afterDeleteFolders = await getFolders();
              setFolders(afterDeleteFolders);
              if (expandedFolderId === folder.id) {
                setExpandedFolderId(null);
              }
              Alert.alert(
                'Folder Deleted',
                `“${folder.name}” has been deleted.`
              );
            } catch (error) {
              console.error('[FolderScreen] onDelete: Error during direct delete operation:', error);
              Alert.alert('Error', `Failed to delete folder “${folder.name}”.`);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // NEW FUNCTION: Toggle folder expansion
  const toggleFolderExpansion = (folderId: string) => {
    setExpandedFolderId(prevId => (prevId === folderId ? null : folderId));
    // Pause any playing sound when collapsing or expanding a new folder
    if (sound) {
      sound.unloadAsync();
      setSound(null);
      setPlayingTrackId(null);
    }
  };

  // NEW FUNCTION: Play track preview from folder
  const playPreview = async (track: Track) => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setPlayingTrackId(null);
    }
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.previewUrl },
        { shouldPlay: true }
      );
      setSound(newSound);
      setPlayingTrackId(track.trackId);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingTrackId(null); // Reset when track finishes
        }
      });
    } catch (error) {
      console.error("Error playing track preview:", error);
      Alert.alert("Playback Error", "Could not play track preview.");
    }
  };

  // NEW FUNCTION: Pause track preview in folder
  const pausePreview = async () => {
    if (sound) {
      await sound.pauseAsync();
      setPlayingTrackId(null);
    }
  };


  const renderFolderItem = ({ item }: { item: MusicFolder }) => (
    <View style={styles.folderContainer}>
      <TouchableOpacity
        style={styles.folderHeader}
        onPress={() => toggleFolderExpansion(item.id)}
      >
        <Text style={styles.folderName}>{item.name}</Text>
        <Text style={styles.folderTrackCount}>({item.tracks.length} songs)</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => {
              setEditingFolder(item);
              setNewName(item.name);
            }}
            style={styles.iconButton}
          >
            <Text style={styles.edit}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(item)}
            style={styles.iconButton}
          >
            <Text style={styles.delete}>🗑️</Text>
          </TouchableOpacity>
          <Text style={styles.expandIcon}>
            {expandedFolderId === item.id ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* NEW: Render tracks if folder is expanded and has tracks */}
      {expandedFolderId === item.id && item.tracks.length > 0 && (
        <View style={styles.tracksContainer}>
          <FlatList
            data={item.tracks}
            keyExtractor={(track) => track.trackId.toString()}
            renderItem={({ item: track }) => (
              <View style={styles.trackItem}>
                <Image source={{ uri: track.artworkUrl100 }} style={styles.trackArtwork} />
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle}>{track.trackName}</Text>
                  <Text style={styles.trackArtist}>{track.artistName}</Text>
                </View>
                <View style={styles.trackControls}>
                  {/* Play/Pause Buttons for tracks in folder */}
                  {playingTrackId === track.trackId ? (
                    <Button title="⏸️" onPress={pausePreview} />
                  ) : (
                    <Button title="▶️" onPress={() => playPreview(track)} />
                  )}
                </View>
              </View>
            )}
          />
        </View>
      )}
       {/* NEW: Message for empty expanded folder */}
       {expandedFolderId === item.id && item.tracks.length === 0 && (
        <Text style={styles.emptyFolderText}>This folder is empty.</Text>
      )}
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: '📁 Folders' }} />
      <View style={styles.container}>
        <Text style={styles.header}>Your Folders</Text>

        <FlatList
          data={folders}
          keyExtractor={(item) => item.id}
          renderItem={renderFolderItem} // Use the new render function
          ListEmptyComponent={<Text style={styles.empty}>No folders yet. Create one below!</Text>}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={editingFolder ? 'Rename folder…' : 'New folder name'}
            value={newName}
            onChangeText={setNewName}
          />
          <Button
            title={editingFolder ? 'Rename' : 'Add'}
            onPress={editingFolder ? onRename : onAdd}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header:    { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },

  folderContainer: { // NEW STYLE for individual folder items
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden', // Ensures rounded corners clip children
  },
  folderHeader: { // Style for the clickable part of the folder
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#eef',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  folderName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  folderTrackCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  edit: {
    fontSize: 18,
    color: 'blue',
  },
  delete: {
    fontSize: 18,
    color: 'red',
  },
  expandIcon: {
    marginLeft: 10,
    fontSize: 18,
    color: '#555',
  },

  tracksContainer: { // NEW STYLE for the expanded tracks list
    padding: 10,
    backgroundColor: '#fff',
  },
  trackItem: { // NEW STYLE for individual track within folder
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginVertical: 2,
  },
  trackArtwork: { // NEW STYLE for track artwork in folder
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  trackInfo: { // NEW STYLE for track text info in folder
    flex: 1,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 13,
    color: '#777',
  },
  trackControls: { // NEW STYLE for play/pause button in folder
    marginLeft: 10,
  },
  empty: { textAlign: 'center', marginTop: 20, color: '#666' },
  emptyFolderText: {
    textAlign: 'center',
    color: '#888',
    padding: 15,
    fontStyle: 'italic',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems:    'center',
    marginTop:     20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  input: {
    flex:          1,
    borderWidth:   1,
    borderColor:   '#ccc',
    padding:       8,
    marginRight:   8,
    borderRadius:  4,
  },
});