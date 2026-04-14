import React, { useMemo, useState, useRef } from 'react';
import {
  View, TouchableOpacity, Dimensions, FlatList, StatusBar,
  Animated, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { X, Share } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Txt } from '../components/ui/Text';
import { openFileExternal } from '../utils/fileHelper';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function ImageViewerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state } = useApp();

  const rawFileId   = params?.fileId;
  const rawCourseId = params?.courseId;
  const fileId   = Array.isArray(rawFileId)   ? rawFileId[0]   : rawFileId   as string;
  const courseId = Array.isArray(rawCourseId) ? rawCourseId[0] : rawCourseId as string;

  // All image files for this course (for swiping)
  const images = useMemo(() =>
    state.files.filter(f => f.courseId === courseId && f.type === 'image'),
    [state.files, courseId]
  );

  const initialIndex = useMemo(() => {
    const idx = images.findIndex(f => f.id === fileId);
    return idx >= 0 ? idx : 0;
  }, [images, fileId]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showControls, setShowControls] = useState(true);
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  const currentFile = images[currentIndex] ?? null;

  const toggleControls = () => {
    const next = !showControls;
    setShowControls(next);
    Animated.timing(controlsOpacity, {
      toValue: next ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  if (!images.length) {
    return (
      <SafeAreaView style={{ flex:1, backgroundColor:'#000', alignItems:'center', justifyContent:'center' }}>
        <StatusBar barStyle="light-content" />
        <Txt style={{ color:'#fff', fontSize:16 }}>Image not found</Txt>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop:16, paddingHorizontal:20, paddingVertical:10, borderRadius:10, backgroundColor:'rgba(255,255,255,0.15)' }}>
          <Txt style={{ color:'#fff', fontSize:14 }}>Go Back</Txt>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex:1, backgroundColor:'#000' }}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Image gallery - swipeable */}
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({ length: SCREEN_W, offset: SCREEN_W * index, index })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={1} onPress={toggleControls}
            style={{ width: SCREEN_W, height: SCREEN_H, alignItems:'center', justifyContent:'center' }}>
            <Image
              source={{ uri: item.uri }}
              style={{ width: SCREEN_W, height: SCREEN_H }}
              contentFit="contain"
              transition={200}
            />
          </TouchableOpacity>
        )}
      />

      {/* Top bar */}
      <Animated.View style={{
        position:'absolute', top:0, left:0, right:0,
        opacity: controlsOpacity,
        paddingTop: Platform.OS === 'android' ? 40 : 54,
        paddingHorizontal: 16, paddingBottom: 16,
        backgroundColor: 'transparent',
      }}>
        <View style={{
          flexDirection:'row', alignItems:'center', gap:12,
          backgroundColor:'rgba(0,0,0,0.55)', borderRadius:16, paddingHorizontal:14, paddingVertical:10,
          ...Platform.select({ android: { elevation:8 }, ios: { shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.4, shadowRadius:8 } }),
        }}>
          <TouchableOpacity onPress={() => router.back()}
            style={{ width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center' }}>
            <X size={20} color="#fff" />
          </TouchableOpacity>

          <View style={{ flex:1, minWidth:0 }}>
            <Txt style={{ color:'#fff', fontSize:14, fontWeight:'600' }} numberOfLines={1}>
              {currentFile?.name ?? 'Image'}
            </Txt>
            {images.length > 1 && (
              <Txt style={{ color:'rgba(255,255,255,0.6)', fontSize:11, marginTop:2 }}>
                {currentIndex + 1} of {images.length}
              </Txt>
            )}
          </View>

          <TouchableOpacity
            onPress={() => currentFile && openFileExternal(currentFile.uri, 'image')}
            style={{ width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.15)', alignItems:'center', justifyContent:'center' }}>
            <Share size={17} color="#fff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom dots indicator */}
      {images.length > 1 && (
        <Animated.View style={{
          position:'absolute', bottom:40, left:0, right:0,
          opacity: controlsOpacity,
          flexDirection:'row', justifyContent:'center', gap:6,
        }}>
          {images.map((_, i) => (
            <View key={i} style={{
              width: i === currentIndex ? 20 : 6, height:6, borderRadius:3,
              backgroundColor: i === currentIndex ? '#fff' : 'rgba(255,255,255,0.4)',
            }} />
          ))}
        </Animated.View>
      )}
    </View>
  );
}
