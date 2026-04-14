import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import { FileType } from '../constants/types';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'heif', 'svg', 'tiff', 'tif'];

export function getFileType(name: string): FileType {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx' || ext === 'doc') return 'docx';
  if (ext === 'pptx' || ext === 'ppt') return 'pptx';
  if (ext && IMAGE_EXTENSIONS.includes(ext)) return 'image';
  return 'other';
}

export function isImageFile(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase();
  return !!ext && IMAGE_EXTENSIONS.includes(ext);
}

export async function pickFile(): Promise<{ name: string; uri: string; size?: number; type: FileType } | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.ms-powerpoint',
      '*/*',
    ],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  return {
    name: asset.name,
    uri:  asset.uri,
    size: asset.size,
    type: getFileType(asset.name),
  };
}

const MIME_MAP: Record<string, string> = {
  pdf:   'application/pdf',
  docx:  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx:  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  note:  'text/plain',
  image: 'image/*',
  other: '*/*',
};

export async function openFile(uri: string, type: FileType) {
  if (!uri) return;
  try {
    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: uri,
        flags: 1,
        type: MIME_MAP[type] ?? '*/*',
      });
    } else {
      // iOS — share sheet lets user pick an app
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) await Sharing.shareAsync(uri, { mimeType: MIME_MAP[type] ?? '*/*' });
    }
  } catch {
    // Fallback: always works
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) await Sharing.shareAsync(uri);
  }
}

export async function openFileExternal(uri: string, type: FileType = 'other') {
  await openFile(uri, type);
}

export async function pickFiles(): Promise<{ name: string; uri: string; size?: number; type: FileType }[]> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/msword','application/vnd.ms-powerpoint','*/*'],
    copyToCacheDirectory: true,
    multiple: true,
  });
  if (result.canceled || !result.assets?.length) return [];
  return result.assets.map(asset => ({
    name: asset.name,
    uri:  asset.uri,
    size: asset.size,
    type: getFileType(asset.name),
  }));
}

export async function pickImages(): Promise<{ name: string; uri: string; size?: number; type: FileType }[]> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return [];

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    quality: 0.9,
  });

  if (result.canceled || !result.assets?.length) return [];

  return result.assets.map((asset, i) => {
    // Extract a filename from the URI or generate one
    const uriParts = asset.uri.split('/');
    const rawName = uriParts[uriParts.length - 1] || `photo_${Date.now()}_${i}`;
    // Clean up the name — decode URI encoding
    const name = decodeURIComponent(rawName);
    return {
      name,
      uri:  asset.uri,
      size: asset.fileSize,
      type: 'image' as FileType,
    };
  });
}

export async function takePhoto(): Promise<{ name: string; uri: string; size?: number; type: FileType } | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.9,
  });

  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  const name = `photo_${Date.now()}.jpg`;
  return {
    name,
    uri:  asset.uri,
    size: asset.fileSize,
    type: 'image' as FileType,
  };
}
