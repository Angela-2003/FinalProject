import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { Track } from '../components/TrackCard'; 

export interface MusicFolder {
  id: string;
  name: string;
  tracks: Track[]; 
}

const FOLDER_KEY = 'folders';

export const getFolders = async (): Promise<MusicFolder[]> => {
  console.log('[FolderStorage] getFolders: Attempting to retrieve folders...');
  try {
    const raw = await AsyncStorage.getItem(FOLDER_KEY);
    if (!raw) {
      console.log('[FolderStorage] getFolders: No folders found.');
      return [];
    }
    const folders = JSON.parse(raw);
    console.log('[FolderStorage] getFolders: Retrieved folders →', folders.map((f: any) => f.name));
    return folders;
  } catch (error) {
    console.error('[FolderStorage] getFolders: Error retrieving folders:', error);
    return [];
  }
};

const saveFolders = async (folders: MusicFolder[]) => {
  try {
    const json = JSON.stringify(folders ?? []);
    await AsyncStorage.setItem(FOLDER_KEY, json);
    console.log('[FolderStorage] saveFolders: Folders saved successfully →', folders.map(f => f.name));
    console.log('[FolderStorage] raw content after save:', await AsyncStorage.getItem(FOLDER_KEY));
  } catch (error) {
    console.error('[FolderStorage] saveFolders: Error saving folders:', error);
  }
};

export const createFolder = async (name: string) => {
  console.log('[FolderStorage] createFolder: Creating new folder with name:', name);
  try {
    const folders = await getFolders();
    const newFolder: MusicFolder = { id: uuid.v4() as string, name, tracks: [] };
    await saveFolders([newFolder, ...folders]);
    console.log('[FolderStorage] createFolder: New folder created and saved:', newFolder.name);
    return newFolder;
  } catch (error) {
    console.error('[FolderStorage] createFolder: Error creating folder:', error);
    throw error;
  }
};

export const renameFolder = async (id: string, newName: string) => {
  const folders = await getFolders();
  const updated = folders.map(f => f.id === id ? { ...f, name: newName } : f);
  await saveFolders(updated);
};

export const deleteFolder = async (id: string) => {
  const folders = await getFolders();
  const updated = folders.filter(f => f.id !== id);
  await saveFolders(updated);
};

export const addTrackToFolder = async (folderId: string, track: Track): Promise<boolean> => {
  try {
    const folders = await getFolders();
    let folderFound = false;
    const updatedFolders = folders.map(folder => {
      if (folder.id === folderId) {
        folderFound = true;
        if (!folder.tracks.some(t => t.trackId === track.trackId)) {
          return { ...folder, tracks: [...folder.tracks, track] };
        }
      }
      return folder;
    });

    if (folderFound) {
      await saveFolders(updatedFolders);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('[FolderStorage] addTrackToFolder: Error adding track:', error);
    return false;
  }
};