import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import { FileType } from '../constants/types';

export function getFileType(name: string): FileType {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'docx' || ext === 'doc') return 'docx';
  if (ext === 'pptx' || ext === 'ppt') return 'pptx';
  return 'other';
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
  // copyToCacheDirectory:true already copies the file — just use the cache URI directly
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
