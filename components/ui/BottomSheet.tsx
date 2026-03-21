/**
 * BottomSheet — implemented as a full Modal so keyboard avoidance works
 * correctly on both iOS and Android without conflicting with the nav bar.
 */
import React from 'react';
import {
  KeyboardAvoidingView, Modal, Platform, Pressable,
  ScrollView, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { Txt } from './Text';

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  scrollable?: boolean;
}

export function BottomSheet({ visible, onClose, title, children, scrollable }: BottomSheetProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Backdrop */}
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.52)' }}
          onPress={onClose}
        />

        {/* Sheet panel */}
        <View
          style={{
            backgroundColor: t.card,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16) + 4,
            maxHeight: '82%',
          }}
        >
          {/* Drag handle */}
          <View style={{ width: 38, height: 4, backgroundColor: t.border, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

          {title && (
            <Txt variant="display" size={20} style={{ marginBottom: 18 }}>{title}</Txt>
          )}

          {scrollable ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              bounces={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View>{children}</View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
