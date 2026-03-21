import React, { useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useApp } from '../../context/AppContext';
import { StudySet } from '../../constants/types';
import { Txt } from '../ui/Text';
import { ProgressBar } from '../ui/ProgressBar';

interface MilestoneCardProps {
  set: StudySet;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MilestoneCard({ set, onEdit, onDelete }: MilestoneCardProps) {
  const t = useTheme();
  const { toggleStep } = useApp();
  const doneCount = useMemo(() => set.steps.filter(s => s.done).length, [set.steps]);
  const progress  = set.steps.length ? doneCount / set.steps.length : 0;
  const pct       = Math.round(progress * 100);

  return (
    <View style={{ backgroundColor:t.card,borderWidth:1,borderColor:t.border2,borderRadius:14,padding:16,marginHorizontal:20,marginBottom:12 }}>
      <View style={{ flexDirection:'row',alignItems:'center',marginBottom:8 }}>
        <Txt variant="display" size={15} style={{ flex:1 }}>{set.title}</Txt>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={{ padding:4 }}>
            <Feather name="edit-2" size={14} color={t.text3} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={onDelete} style={{ padding:4,marginLeft:4 }}>
            <Feather name="trash-2" size={14} color={t.red} />
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:6 }}>
        <Txt variant="mono" size={10} color="tertiary">{doneCount} of {set.steps.length} completed</Txt>
        <Txt variant="mono" size={10} color="accent" style={{ fontFamily:'JetBrainsMono_500Medium' }}>{pct}%</Txt>
      </View>
      <ProgressBar progress={progress} height={6} />
      <View style={{ marginTop:14 }}>
        {set.steps.map((step, i) => (
          <TouchableOpacity key={step.id} onPress={() => toggleStep(set.id, step.id)}
            style={{ flexDirection:'row',alignItems:'center',gap:10,paddingVertical:7,borderBottomWidth:i<set.steps.length-1?1:0,borderBottomColor:t.border2 }}>
            <View style={{ width:18,height:18,borderRadius:5,borderWidth:1.5,borderColor:step.done?t.accent3:t.border,backgroundColor:step.done?t.accent3:'transparent',alignItems:'center',justifyContent:'center' }}>
              {step.done && <Feather name="check" size={10} color="#fff" />}
            </View>
            <Txt variant="body" size={13} style={{ color:step.done?t.text3:t.text2,textDecorationLine:step.done?'line-through':'none',flex:1 }}>{step.label}</Txt>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
