import { ChevronRight, ChevronLeft, Share as ShareIcon, AlertCircle } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Dimensions, Share, TouchableOpacity, View, ActivityIndicator, NativeModules } from 'react-native';

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

  const [PdfComponent, setPdfComponent] = useState<any>(null);
  const [nativeError, setNativeError] = useState(false);

  useEffect(() => {
    // Avoid evaluating react-native-pdf in Expo Go or web where native parts are missing
    if (!NativeModules.RNFetchBlob && !NativeModules.RNReactNativePdf) {
      setNativeError(true);
      return;
    }
    try {
      const Pdf = require('react-native-pdf').default;
      setPdfComponent(() => Pdf);
    } catch (e) {
      setNativeError(true);
    }
  }, []);

  const pdfRef = useRef<any>(null);
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

  const handlePrevPage = () => {
    if (pdfRef.current && currentPage > 1) {
      pdfRef.current.setPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pdfRef.current && currentPage < totalPages) {
      pdfRef.current.setPage(currentPage + 1);
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
          {isRTL ? <ChevronRight size={18} color={tColor.text2} /> : <ChevronLeft size={18} color={tColor.text2} />}
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Txt variant="display" size={16} numberOfLines={1} style={{ textAlign: isRTL ? 'right' : 'left' }}>{file.name}</Txt>
          <Txt variant="mono" size={10} color="tertiary" style={{ textAlign: isRTL ? 'right' : 'left' }}>{currentPage} / {totalPages || '--'}</Txt>
        </View>
        <TouchableOpacity onPress={handleShare} style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
          <ShareIcon size={16} color={tColor.text2} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, backgroundColor: '#525659' }}>
        {nativeError ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
            <AlertCircle size={40} color={tColor.text3} style={{ marginBottom: 16 }} />
            <Txt variant="bodySemi" size={16} color="secondary" style={{ textAlign: 'center', marginBottom: 8 }}>Native Module Required</Txt>
            <Txt variant="body" size={13} color="tertiary" style={{ textAlign: 'center' }}>Viewing PDFs requires a custom Development Build. It is not supported in the standard Expo Go app.</Txt>
          </View>
        ) : PdfComponent ? (
          <PdfComponent
            ref={pdfRef}
            source={{ 
              uri: file.uri.startsWith('file://') || file.uri.startsWith('content://') || file.uri.startsWith('http') 
                ? file.uri 
                : `file://${file.uri}`, 
              cache: true 
            }}
            trustAllCerts={false}
            onLoadComplete={(numberOfPages: number) => {
              setTotalPages(numberOfPages);
              setError(null);
            }}
            onPageChanged={(page: number) => {
              setCurrentPage(page);
            }}
            onError={(err: any) => {
              console.log(err);
              setError(err.toString());
            }}
            onPressLink={(uri: string) => {
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
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
             <ActivityIndicator size="large" color={tColor.accent} />
          </View>
        )}
      </View>

      {error && (
        <View style={{ position: 'absolute', bottom: 40, left: 20, right: 20, backgroundColor: tColor.red + 'EE', padding: 12, borderRadius: 10 }}>
          <Txt variant="mono" size={11} style={{ color: '#fff' }}>Error: {error}</Txt>
          <Txt variant="mono" size={9} style={{ color: '#ffffffcc', marginTop: 4 }}>Ensure react-native-blob-util is installed correctly.</Txt>
        </View>
      )}

      {/* Basic Controls Overlay */}
      {!error && totalPages > 0 && (
        <View style={{ position: 'absolute', bottom: 30, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 }}>
          <TouchableOpacity onPress={handlePrevPage} disabled={currentPage <= 1} style={{ opacity: currentPage <= 1 ? 0.3 : 1 }}>
             <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ alignItems: 'center', minWidth: 60 }}>
            <Txt variant="mono" size={13} style={{ color: '#fff' }}>{currentPage} / {totalPages}</Txt>
          </View>
          <TouchableOpacity onPress={handleNextPage} disabled={currentPage >= totalPages} style={{ opacity: currentPage >= totalPages ? 0.3 : 1 }}>
             <ChevronRight size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
