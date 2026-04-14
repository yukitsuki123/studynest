import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Check, Book, Calendar } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useApp } from '../../context/AppContext';
import { TodoItem, Course } from '../../constants/types';
import { Txt } from '../ui/Text';
import { formatDeadline, daysUntil } from '../../utils/storage';

const PRIORITY_COLORS = { low:'#4A7C59', medium:'#C5813A', high:'#C0392B' };

interface DeadlineCardProps {
  todo: TodoItem;
  course?: Course;
  onPress?: () => void;
}

export function DeadlineCard({ todo, course, onPress }: DeadlineCardProps) {
  const t = useTheme();
  const { toggleTodo } = useApp();
  const overdue = todo.deadline && !todo.done && todo.deadline < Date.now();
  const urgent  = todo.deadline && !todo.done && daysUntil(todo.deadline!) <= 2 && !overdue;
  const days    = todo.deadline ? daysUntil(todo.deadline) : null;
  const pColor  = PRIORITY_COLORS[todo.priority];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      style={{ flexDirection:'row', alignItems:'center', gap:12, backgroundColor:t.card,
        borderWidth:1, borderColor:overdue?t.red+'55':t.border2, borderRadius:12,
        padding:14, marginHorizontal:20, marginBottom:8 }}>
      <TouchableOpacity onPress={() => toggleTodo(todo.id)}
        style={{ width:24, height:24, borderRadius:7, borderWidth:2,
          borderColor:todo.done?t.accent3:pColor,
          backgroundColor:todo.done?t.accent3:'transparent',
          alignItems:'center', justifyContent:'center' }}>
        {todo.done && <Check size={13} color="#fff" />}
      </TouchableOpacity>
      <View style={{ flex:1, minWidth:0 }}>
        <Txt variant={todo.done?'bodyItalic':'bodySemi'} size={14} numberOfLines={1}
          style={{ textDecorationLine:todo.done?'line-through':'none', color:todo.done?t.text3:t.text }}>
          {todo.title}
        </Txt>
        <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginTop:3 }}>
          {course && (
            <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
              <Book size={10} color={course.color} />
              <Txt variant="mono" size={10} style={{ color:course.color }}>{course.name}</Txt>
            </View>
          )}
          {todo.deadline && (
            <View style={{ flexDirection:'row', alignItems:'center', gap:4 }}>
              <Calendar size={10} color={overdue?t.red:urgent?t.accent2:t.text3} />
              <Txt variant="mono" size={10} style={{ color:overdue?t.red:urgent?t.accent2:t.text3 }}>
                {formatDeadline(todo.deadline)}{overdue?' · Overdue':days!==null&&days<=2?` · ${days}d left`:''}
              </Txt>
            </View>
          )}
        </View>
      </View>
      <View style={{ width:6, height:6, borderRadius:3, backgroundColor:pColor }} />
    </TouchableOpacity>
  );
}
