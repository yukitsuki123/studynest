import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useApp } from '../../context/AppContext';
import { Course } from '../../constants/types';
import { FOLDER_ICONS, FOLDER_COLORS } from '../../constants/icons';
import { BottomSheet } from '../ui/BottomSheet';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Txt } from '../ui/Text';

interface EditCourseSheetProps {
  course?: Course | null;
  visible: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

export function EditCourseSheet({ course, visible, onClose, onDelete }: EditCourseSheetProps) {
  const t = useTheme();
  const { addCourse, updateCourse, deleteCourse } = useApp();
  const isNew = !course;

  const [name,  setName]  = useState('');
  const [icon,  setIcon]  = useState('book');
  const [color, setColor] = useState(FOLDER_COLORS[0]);

  useEffect(() => {
    if (visible) { 
      setName(course?.name ?? ''); 
      setIcon(course?.icon ?? 'book'); 
      setColor(course?.color ?? FOLDER_COLORS[0]); 
    }
  }, [visible, course]);

  const handleSave = () => {
    if (!name.trim()) return;
    if (isNew) addCourse(name.trim(), icon, color);
    else updateCourse(course!.id, { name: name.trim(), icon, color });
    onClose();
  };

  const handleDelete = () => {
    Alert.alert('Delete Course', `Delete "${course?.name}"? All data will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { deleteCourse(course!.id); onDelete?.(); onClose(); } },
    ]);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={isNew ? 'New Course' : 'Edit Course'} scrollable>
      <Input label="Course Name" value={name} onChangeText={setName} placeholder="e.g. Mathematics" autoFocus={isNew} />
      <Txt variant="mono" size={11} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Choose Icon</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {FOLDER_ICONS.map((ic) => (
          <TouchableOpacity key={ic} onPress={() => setIcon(ic)}
            style={{ width: 44, height: 44, borderRadius: 10, borderWidth: 2, borderColor: icon === ic ? t.accent : t.border2, backgroundColor: icon === ic ? t.accent + '11' : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={ic as any} size={20} color={icon === ic ? t.accent : t.text3} />
          </TouchableOpacity>
        ))}
      </View>
      <Txt variant="mono" size={11} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Folder Color</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {FOLDER_COLORS.map((c) => (
          <TouchableOpacity key={c} onPress={() => setColor(c)}
            style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c, borderWidth: 2.5, borderColor: color === c ? t.text : 'transparent' }} />
        ))}
      </View>
      <Button label={isNew ? 'Create Course' : 'Save Changes'} onPress={handleSave} style={{ marginBottom: course ? 10 : 0 }} />
      {!isNew && <Button label="Delete Course" variant="danger" onPress={handleDelete} />}
    </BottomSheet>
  );
}
