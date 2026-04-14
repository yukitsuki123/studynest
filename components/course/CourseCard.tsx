import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Book, Check, MoreVertical, Folder } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useApp } from '../../context/AppContext';
import { Course } from '../../constants/types';
import { Txt } from '../ui/Text';
import { ProgressBar } from '../ui/ProgressBar';
import { DynamicIcon } from '../ui/DynamicIcon';

interface CourseCardProps {
  course: Course;
  onPress?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
}

export function CourseCard({ course, onPress, onLongPress, selected }: CourseCardProps) {
  const t = useTheme();
  const { state } = useApp();
  const todos = useMemo(() => state.todos.filter(td => td.courseId === course.id), [state.todos, course.id]);
  const files = useMemo(() => state.files.filter(f  => f.courseId  === course.id), [state.files, course.id]);
  const done  = todos.filter(td => td.done).length;
  const progress = todos.length ? done / todos.length : 0;
  
  // Icon name is now stored directly in the course object
  // Dynamic icon rendering
  const IconComponent = Book; // Fallback for now, could be mapped later

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.85}
      style={{ backgroundColor:t.card, borderRadius:14, borderWidth:selected?2:1,
        borderColor:selected?t.accent:t.border2, borderTopWidth:3, borderTopColor:course.color,
        padding:16, flex:1, shadowColor:'#000', shadowOffset:{width:0,height:2},
        shadowOpacity:0.05, shadowRadius:6, elevation:1 }}>
      <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <View style={{ width:38, height:38, borderRadius:10, backgroundColor:course.color+'22', alignItems:'center', justifyContent:'center' }}>
          <DynamicIcon name={course.icon} size={18} color={course.color} />
        </View>
        {selected ? (
          <View style={{ width:22, height:22, borderRadius:11, backgroundColor:t.accent, alignItems:'center', justifyContent:'center' }}>
            <Check size={12} color="#fff" />
          </View>
        ) : (
          <TouchableOpacity onPress={onLongPress} style={{ padding: 4, marginRight:-8 }}>
            <MoreVertical size={16} color={t.text3} />
          </TouchableOpacity>
        )}
      </View>
      <Txt variant="bodySemi" size={14} numberOfLines={1} style={{ marginBottom:4 }}>{course.name}</Txt>
      <Txt variant="mono" size={10} color="tertiary" style={{ marginBottom:10 }}>{files.length} files · {todos.length} tasks</Txt>
      <ProgressBar progress={progress} color={course.color} height={4} />
      <Txt variant="mono" size={9} color="tertiary" style={{ marginTop:5 }}>{Math.round(progress*100)}% done</Txt>
    </TouchableOpacity>
  );
}
