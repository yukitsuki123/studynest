import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Dimensions, Share, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../components/ui/Text';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../context/SettingsContext';

export default function PdfViewerScreen() {
  const tColor = useTheme();
  const router = useRouter();
  const { fileId: fileIdParam } = useLocalSearchParams<{ fileId: string }>();
  const fileId = Array.isArray(fileIdParam) ? fileIdParam[0] : fileIdParam;
  const { state } = useApp();
  const { isRTL, t } = useSettings();

  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const file = useMemo(() => state.files.find(f => f.id === fileId), [state.files, fileId]);

  const handleShare = async () => {
    if (!file) return;
    try {
      await Share.share({
        url: file.uri,
        title: file.name,
      });
    } catch (e: any) {
      console.error(e);
    }
  };

  if (!file) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <Txt variant="display" size={18} color="tertiary" style={{ textAlign: 'center' }}>{t('read_file_error')}</Txt>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
            <Txt variant="mono" size={12} color="accent">← {t('go_back')}</Txt>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: tColor.border }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={isRTL ? "chevron-right" : "chevron-left"} size={18} color={tColor.text2} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Txt variant="display" size={16} numberOfLines={1} style={{ textAlign: isRTL ? 'right' : 'left' }}>{file.name}</Txt>
          <Txt variant="mono" size={10} color="tertiary" style={{ textAlign: isRTL ? 'right' : 'left' }}>{currentPage} / {totalPages || '--'}</Txt>
        </View>
        <TouchableOpacity onPress={handleShare} style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="share-2" size={16} color={tColor.text2} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, backgroundColor: '#525659' }}>
        <Pdf
          source={{ 
            uri: file.uri.startsWith('file://') || file.uri.startsWith('content://') || file.uri.startsWith('http') 
              ? file.uri 
              : `file://${file.uri}`, 
            cache: true 
          }}
          trustAllCerts={false}
          onLoadComplete={(numberOfPages) => {
            setTotalPages(numberOfPages);
            setError(null);
          }}
          onPageChanged={(page) => {
            setCurrentPage(page);
          }}
          onError={(error) => {
            console.log(error);
            setError(error.toString());
          }}
          onPressLink={(uri) => {
             console.log(`Link pressed: ${uri}`);
          }}
          style={{
            flex: 1,
            width: Dimensions.get('window').width,
            height: Dimensions.get('window').height,
            backgroundColor: '#525659',
          }}
          renderActivityIndicator={() => <ActivityIndicator size="large" color={tColor.accent} />}
        />
      </View>

      {error && (
        <View style={{ position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: tColor.red + 'EE', padding: 12, borderRadius: 10 }}>
          <Txt variant="mono" size={11} style={{ color: '#fff' }}>Error: {error}</Txt>
        </View>
      )}

      {/* Basic Controls Overlay */}
      <View style={{ position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <TouchableOpacity onPress={() => { /* Pdf ref jump would be better but let's stick to basic for now */ }}>
           <Feather name="chevron-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Txt variant="mono" size={12} style={{ color: '#fff' }}>{currentPage} / {totalPages}</Txt>
        <TouchableOpacity onPress={() => { }}>
           <Feather name="chevron-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
