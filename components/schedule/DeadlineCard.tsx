import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { TodoItem, Course } from '../../constants/types';
import { Txt } from '../ui/Text';
import { daysUntil } from '../../utils/storage';

interface DeadlineCardProps {
  todo: TodoItem;
  course?: Course;
  onPress?: () => void;
}

export function DeadlineCard({ todo, course, onPress }: DeadlineCardProps) {
  const t = useTheme();
  if (!todo.deadline) return null;

  const d        = new Date(todo.deadline);
  const day      = d.getDate();
  const month    = d.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
  const days     = daysUntil(todo.deadline);
  const overdue  = days < 0;
  const urgent   = !overdue && days <= 2;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ flexDirection: 'row', gap: 12, backgroundColor: t.card, borderWidth: 1, borderColor: overdue ? t.red + '55' : t.border2, borderRadius: 14, padding: 14, marginHorizontal: 20, marginBottom: 10, opacity: todo.done ? 0.5 : 1 }}
    >
      <View style={{ width: 48, alignItems: 'center' }}>
        <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.8 }}>{month}</Txt>
        <Txt variant="display" size={28} color="accent" style={{ lineHeight: 32 }}>{day}</Txt>
      </View>

      <View style={{ flex: 1 }}>
        <Txt variant="bodySemi" size={14} style={{ textDecorationLine: todo.done ? 'line-through' : 'none', marginBottom: 3 }}>{todo.title}</Txt>
        {course && (
          <Txt variant="bodyItalic" size={12} color="tertiary">{course.icon} {course.name}</Txt>
        )}
        <Txt variant="mono" size={10} style={{ marginTop: 6, color: overdue ? t.red : urgent ? t.accent2 : t.text3 }}>
          {todo.done ? '✓ Submitted' : overdue ? 'Overdue' : days === 0 ? 'Due today' : `${days}d left`}
        </Txt>
      </View>

      {urgent && !todo.done && (
        <View style={{ backgroundColor: t.red, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' }}>
          <Txt variant="mono" size={9} style={{ color: '#fff', textTransform: 'uppercase' }}>Urgent</Txt>
        </View>
      )}
    </TouchableOpacity>
  );
}
