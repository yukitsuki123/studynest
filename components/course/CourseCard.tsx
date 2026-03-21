import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useApp } from '../../context/AppContext';
import { Course } from '../../constants/types';
import { Txt } from '../ui/Text';
import { ProgressBar } from '../ui/ProgressBar';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

export function CourseCard({ course, onPress }: CourseCardProps) {
  const t = useTheme();
  const { state } = useApp();

  const todos = useMemo(() => state.todos.filter((td) => td.courseId === course.id), [state.todos, course.id]);
  const files = useMemo(() => state.files.filter((f)  => f.courseId  === course.id), [state.files, course.id]);
  const done  = useMemo(() => todos.filter((td) => td.done).length, [todos]);
  const progress = todos.length ? done / todos.length : 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82}
      style={{ backgroundColor: t.card, borderRadius: 14, borderWidth: 1, borderColor: t.border2, borderTopWidth: 3, borderTopColor: course.color, padding: 16, flex: 1 }}>
      <Txt style={{ fontSize: 26, marginBottom: 10 }}>{course.icon}</Txt>
      <Txt variant="display" size={15} style={{ lineHeight: 20, marginBottom: 4 }}>{course.name}</Txt>
      <Txt variant="mono" size={10} color="tertiary">{files.length} files · {todos.filter((td) => !td.done).length} tasks</Txt>
      <View style={{ marginTop: 10 }}>
        <ProgressBar progress={progress} color={course.color} />
      </View>
    </TouchableOpacity>
  );
}
