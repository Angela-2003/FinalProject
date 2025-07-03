import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
  ActivityIndicator
} from 'react-native';
import { getFolders, MusicFolder } from '../utils/FolderStorage'; // Adjust path if necessary
import { Track } from './TrackCard'; // Import Track interface

interface FolderSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectFolder: (folderId: string, track: Track) => void;
  track: Track | null; // The track to be added
}

export default function FolderSelectionModal({
  isVisible,
  onClose,
  onSelectFolder,
  track,
}: FolderSelectionModalProps) {
  const [folders, setFolders] = useState<MusicFolder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isVisible) { // Only load folders when modal becomes visible
      const loadFolders = async () => {
        setLoading(true);
        try {
          const allFolders = await getFolders();
          setFolders(allFolders);
        } catch (error) {
          console.error("Failed to load folders for selection:", error);
          setFolders([]);
        } finally {
          setLoading(false);
        }
      };
      loadFolders();
    }
  }, [isVisible]);

  const handleFolderPress = (folder: MusicFolder) => {
    if (track) {
      onSelectFolder(folder.id, track);
    }
    onClose(); // Close modal after selection
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Select a Folder</Text>

          {loading ? (
            <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
          ) : folders.length === 0 ? (
            <Text style={styles.emptyText}>No folders created yet. Go to 'Folders' tab to create one.</Text>
          ) : (
            <FlatList
              data={folders}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.folderItem}
                  onPress={() => handleFolderPress(item)}
                >
                  <Text style={styles.folderName}>{item.name}</Text>
                  <Text style={styles.trackCount}>{item.tracks.length} tracks</Text>
                </TouchableOpacity>
              )}
              style={styles.folderList}
            />
          )}

          <Button title="Cancel" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Dim background
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Make it take up most of the width
    maxHeight: '70%', // Limit height for scrolling
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  folderList: {
    width: '100%',
    maxHeight: 200, // Fixed height for scrollable list
    marginBottom: 15,
  },
  folderItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  folderName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1, // Take up available space
  },
  trackCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
  }
});