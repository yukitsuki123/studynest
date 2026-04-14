import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Check, Calendar, Edit2 } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';
import { useApp } from '../../context/AppContext';
import { TodoItem as TodoItemType } from '../../constants/types';
import { PRIORITY_COLORS } from '../../constants/icons';
import { Txt } from '../ui/Text';
import { formatDeadline, daysUntil } from '../../utils/storage';

interface TodoItemProps {
  todo: TodoItemType;
  onPress?: () => void;
  onLongPress?: () => void;
}

export function TodoItem({ todo, onPress, onLongPress }: TodoItemProps) {
  const t = useTheme();
  const { toggleTodo } = useApp();
  const overdue = todo.deadline && !todo.done && todo.deadline < Date.now();
  const urgent  = todo.deadline && !todo.done && daysUntil(todo.deadline) <= 2 && !overdue;

  return (
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress} activeOpacity={0.9}
      style={{ flexDirection:'row',alignItems:'flex-start',gap:12,backgroundColor:t.card,borderWidth:1,
        borderColor:overdue?t.red+'44':t.border2,borderRadius:10,padding:12,marginHorizontal:20,marginBottom:8 }}>
      <TouchableOpacity onPress={() => toggleTodo(todo.id)}
        style={{ width:22,height:22,borderRadius:6,borderWidth:2,borderColor:todo.done?t.accent:t.border,
          backgroundColor:todo.done?t.accent:'transparent',alignItems:'center',justifyContent:'center',marginTop:1 }}>
        {todo.done && <Check size={12} color="#fff" />}
      </TouchableOpacity>
      <View style={{ flex:1 }}>
        <Txt variant={todo.done?'bodyItalic':'body'} size={14}
          style={{ textDecorationLine:todo.done?'line-through':'none',color:todo.done?t.text3:t.text,lineHeight:20 }}>
          {todo.title}
        </Txt>
        {todo.deadline && (
          <Txt variant="mono" size={10} style={{ marginTop:3,color:overdue?t.red:urgent?t.accent2:t.text3 }}>
            <Calendar size={10} color={t.text3} /> <Txt variant="mono" size={10} style={{ color:overdue?t.red:urgent?t.accent2:t.text3 }}>{formatDeadline(todo.deadline)}{overdue?' • Overdue':urgent?` • ${daysUntil(todo.deadline)}d left`:''}</Txt>
          </Txt>
        )}
      </View>
      <View style={{ flexDirection:'row',alignItems:'center',gap:6 }}>
        <View style={{ width:6,height:6,borderRadius:3,backgroundColor:PRIORITY_COLORS[todo.priority],marginTop:6 }} />
        {onPress && <Edit2 size={12} color={t.text3} style={{ marginTop:4 }} />}
      </View>
    </TouchableOpacity>
  );
}
