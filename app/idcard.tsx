import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Image as RNImage, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Txt } from '../components/ui/Text';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BottomSheet } from '../components/ui/BottomSheet';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';
import { useSettings } from '../context/SettingsContext';
import * as ImagePicker from 'expo-image-picker';

const AVATAR_EMOJIS = ['🎓','📚','🔬','🎨','💻','⚗️','🏛️','📖','🎵','🌍','🧬','⚖️','🎭','🌱','🔭'];
const AVATAR_COLORS = ['#8B4513','#2C5F8A','#4A7C59','#6B4C8A','#C0622A','#1A7A6E','#C03020','#7A5A2A','#4A6A8A','#8A4A6A'];

export default function IDCardScreen() {
  const tColor = useTheme();
  const router = useRouter();
  const { state, updateProfile, addProfile, deleteProfile, addAchievement, removeAchievement } = useApp();
  const { t, isRTL } = useSettings();
  const profiles = state.profiles;

  const { width } = Dimensions.get('window');
  const cardWidth = width - 40;

  const [activeIndex, setActiveIndex] = useState(0);
  const activeProfile = profiles[activeIndex] || null;

  const [editing,    setEditing]    = useState(false);
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [university, setUniversity] = useState('');
  const [major,      setMajor]      = useState('');
  const [year,       setYear]       = useState('');
  const [emoji,      setEmoji]      = useState('🎓');
  const [bg,         setBg]         = useState('#8B4513');
  const [avatarUri,  setAvatarUri]  = useState<string | undefined>(undefined);

  const [showAddAch, setShowAddAch] = useState(false);
  const [achTitle,   setAchTitle]   = useState('');
  const [achIcon,    setAchIcon]    = useState('🏆');

  // Sync form fields whenever activeProfile changes
  useEffect(() => {
    if (activeProfile) {
      setName(activeProfile.name ?? '');
      setEmail(activeProfile.email ?? '');
      setUniversity(activeProfile.university ?? '');
      setMajor(activeProfile.major ?? '');
      setYear(activeProfile.year ?? '');
      setEmoji(activeProfile.avatarEmoji ?? '🎓');
      setBg(activeProfile.avatarBg ?? '#8B4513');
      setAvatarUri(activeProfile.avatarUri);
    }
  }, [activeProfile]);

  const handleSave = () => {
    if (activeProfile) {
      updateProfile(activeProfile.id, { 
        name, email, university, major, year, 
        avatarEmoji: emoji, avatarBg: bg, avatarUri 
      });
    }
    setEditing(false);
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleAddNew = () => {
    addProfile(t('add_new_id'));
    setActiveIndex(profiles.length);
    setEditing(true);
  };

  const handleDelete = () => {
    if (activeProfile) {
      deleteProfile(activeProfile.id);
      setActiveIndex(Math.max(0, activeIndex - 1));
      setEditing(false);
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / cardWidth);
    if (idx !== activeIndex && idx >= 0 && idx < profiles.length) {
      setActiveIndex(idx);
      setEditing(false);
    }
  };

  const handleAddAchievement = () => {
    if (!achTitle.trim() || !activeProfile) return;
    addAchievement(activeProfile.id, achTitle.trim(), achIcon);
    setShowAddAch(false);
    setAchTitle('');
    setAchIcon('🏆');
  };

  const handleLongPressAch = (achId: string) => {
    Alert.alert(t('delete_achievement'), t('delete_achievement_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => {
          if (activeProfile) removeAchievement(activeProfile.id, achId);
        } 
      }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: tColor.bg }} edges={['top']}>
      <View style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: tColor.border }}>
        <TouchableOpacity onPress={() => router.back()}
          style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: tColor.card, borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name={isRTL?"chevron-right":"x"} size={18} color={tColor.text2} />
        </TouchableOpacity>
        <Txt variant="display" size={20} style={{ flex: 1, marginLeft: isRTL?0:12, marginRight: isRTL?12:0, textAlign:isRTL?'right':'left' }}>{t('id_cards')} ({profiles.length})</Txt>
        
        {activeProfile && (
          <TouchableOpacity
            onPress={() => editing ? handleSave() : setEditing(true)}
            style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: editing ? tColor.accent : tColor.bg2, borderWidth: 1, borderColor: editing ? tColor.accent : tColor.border }}>
            <Txt variant="mono" size={11} style={{ color: editing ? '#fff' : tColor.text2, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {editing ? t('save_changes').split(' ')[0] : t('edit_card')}
            </Txt>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>

        {/* ── ID Cards Carousel ── */}
        <View style={{ marginTop: 20 }}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            snapToInterval={cardWidth + 20}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 20, flexDirection: isRTL?'row-reverse':'row' }}
            onMomentumScrollEnd={onScroll}
          >
            {profiles.map((p, idx) => {
              const isEditingThisCard = editing && activeIndex === idx;
              
              const pName       = isEditingThisCard ? name       || t('full_name') : p.name || t('full_name');
              const pEmail      = isEditingThisCard ? email      || 'email@university.edu' : p.email;
              const pUniversity = isEditingThisCard ? university || null                   : p.university;
              const pMajor      = isEditingThisCard ? major      || null                   : p.major;
              const pYear       = isEditingThisCard ? year       || null                   : p.year;
              const pEmoji      = isEditingThisCard ? emoji                                : p.avatarEmoji;
              const pBg         = isEditingThisCard ? bg                                   : p.avatarBg;
              const pUri        = isEditingThisCard ? avatarUri                            : p.avatarUri;

              return (
                <View key={p.id} style={{ width: cardWidth, backgroundColor: tColor.card, borderRadius: 20, borderWidth: 1.5, borderColor: tColor.border2, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 6 }}>
                  <View style={{ backgroundColor: pBg, paddingVertical: 12, paddingHorizontal: 20, flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Txt variant="mono" size={11} style={{ color: '#fff', textTransform: 'uppercase', letterSpacing: 1.5 }}>{t('student_id')}</Txt>
                    <Txt variant="mono" size={11} style={{ color: '#ffffff88' }}>StudyNest</Txt>
                  </View>

                  <View style={{ padding: 24, flexDirection: isRTL?'row-reverse':'row', gap: 20, alignItems: 'center' }}>
                    <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: pBg, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#ffffff44', overflow: 'hidden' }}>
                      {pUri ? (
                        <RNImage source={{ uri: pUri }} style={{ width: 84, height: 84 }} />
                      ) : (
                        <Txt style={{ fontSize: 38 }}>{pEmoji}</Txt>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt variant="display" size={20} style={{ marginBottom: 4, lineHeight: 24, textAlign:isRTL?'right':'left' }}>{pName}</Txt>
                      <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12, textAlign:isRTL?'right':'left' }}>{pEmail || t('no_email_set')}</Txt>
                      
                      <View style={{ gap: 4 }}>
                        {pUniversity && <View style={{ flexDirection: isRTL?'row-reverse':'row', gap: 6 }}><Txt size={12}>🏛</Txt><Txt variant="body" size={12} color="secondary">{pUniversity}</Txt></View>}
                        {pMajor      && <View style={{ flexDirection: isRTL?'row-reverse':'row', gap: 6 }}><Txt size={12}>📚</Txt><Txt variant="body" size={12} color="secondary">{pMajor}</Txt></View>}
                        {pYear       && <View style={{ flexDirection: isRTL?'row-reverse':'row', gap: 6 }}><Txt size={12}>🗓</Txt><Txt variant="body" size={12} color="secondary">{t('year_label')} {pYear}</Txt></View>}
                      </View>
                    </View>
                  </View>

                  {/* Achievements Bar */}
                  <View style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: tColor.bg2, borderTopWidth: 1, borderTopColor: tColor.border2 }}>
                     <Txt variant="mono" size={9} color="tertiary" style={{ textTransform: 'uppercase', marginBottom: 6 }}>{t('achievements')}</Txt>
                     <View style={{ flexDirection: isRTL?'row-reverse':'row', gap: 8 }}>
                        {(p.achievements || []).length > 0 ? (
                            p.achievements?.slice(0, 4).map(a => (
                                <View key={a.id} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: tColor.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: tColor.border }}>
                                    <Txt style={{ fontSize: 14 }}>{a.icon}</Txt>
                                </View>
                            ))
                        ) : (
                             <Txt variant="bodyItalic" size={10} color="tertiary">No milestones yet</Txt>
                        )}
                        <TouchableOpacity onPress={isEditingThisCard ? undefined : () => setShowAddAch(true)} style={{ width: 28, height: 28, borderRadius: 14, borderStyle: 'dashed', borderWidth: 1, borderColor: tColor.border, alignItems: 'center', justifyContent: 'center' }}>
                             <Feather name="plus" size={12} color={tColor.text3} />
                        </TouchableOpacity>
                     </View>
                  </View>

                  <View style={{ paddingHorizontal: 24, paddingVertical: 12, borderTopWidth: 1, borderTopColor: tColor.border2, flexDirection: isRTL?'row-reverse':'row', justifyContent: 'space-between' }}>
                    <Txt variant="mono" size={9} color="tertiary">ID: {p.id.toUpperCase().slice(0, 8)}</Txt>
                    <Txt variant="mono" size={9} color="tertiary">{new Date().getFullYear()} — {new Date().getFullYear() + 1}</Txt>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Dots Indicator */}
          <View style={{ flexDirection: isRTL?'row-reverse':'row', justifyContent: 'center', gap: 6, marginTop: 16 }}>
            {profiles.map((_, idx) => (
              <View key={idx} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: activeIndex === idx ? tColor.accent : tColor.border2 }} />
            ))}
          </View>
        </View>

        {/* ── Action Buttons ── */}
        <View style={{ padding: 20 }}>
          {editing && activeProfile ? (
            <View>
              <View style={{ flexDirection: isRTL?'row-reverse':'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                 <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2 }}>{t('avatar')}</Txt>
                 <TouchableOpacity onPress={handlePickAvatar} style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 6 }}>
                    <Feather name="image" size={14} color={tColor.accent} />
                    <Txt variant="bodySemi" size={12} color="accent">Choose Photo</Txt>
                 </TouchableOpacity>
              </View>

              <View style={{ flexDirection: isRTL?'row-reverse':'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: isRTL?'flex-start':'flex-start' }}>
                {AVATAR_EMOJIS.map(e => (
                  <TouchableOpacity key={e} onPress={() => { setEmoji(e); setAvatarUri(undefined); }}
                    style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: bg, borderWidth: 2.5, borderColor: (emoji === e && !avatarUri) ? tColor.text : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                    <Txt style={{ fontSize: 22 }}>{e}</Txt>
                  </TouchableOpacity>
                ))}
              </View>

              <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, textAlign:isRTL?'right':'left' }}>{t('bg_color')}</Txt>
              <View style={{ flexDirection: isRTL?'row-reverse':'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                {AVATAR_COLORS.map(c => (
                  <TouchableOpacity key={c} onPress={() => setBg(c)}
                    style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, borderWidth: 3, borderColor: bg === c ? tColor.text : 'transparent' }} />
                ))}
              </View>

              <View style={{ backgroundColor: tColor.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: tColor.border2, marginBottom: 20 }}>
                 <Txt variant="bodySemi" size={14} style={{ marginBottom: 16, color: tColor.accent }}>{t('edit_basic_info')}</Txt>
                 <Input label={t('full_name')}       value={name}       onChangeText={setName}       placeholder="e.g. Omar Al-Hassan" />
                 <Input label={t('email')}           value={email}      onChangeText={setEmail}      placeholder="student@university.edu" keyboardType="email-address" />
                 <Input label={t('university')}      value={university} onChangeText={setUniversity} placeholder="e.g. University of Oxford" />
                 <Input label={t('major_field')}     value={major}      onChangeText={setMajor}      placeholder="e.g. Computer Science" />
                 <Input label={t('academic_year')}   value={year}       onChangeText={setYear}       placeholder="2" keyboardType="numeric" />
              </View>

              <Button label={t('save_changes')} onPress={handleSave} style={{ marginTop: 8 }} />
              {profiles.length > 1 && (
                <Button label={t('delete_card')} variant="danger" onPress={handleDelete} style={{ marginTop: 12 }} />
              )}
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {activeProfile && (
                <TouchableOpacity onPress={() => setEditing(true)}
                  style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 10, backgroundColor: tColor.card, borderRadius: 12, borderWidth: 1, borderColor: tColor.border2, padding: 16 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: tColor.accent + '15', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="edit-2" size={14} color={tColor.accent} />
                  </View>
                  <Txt variant="body" size={14} color="secondary" style={{ flex: 1, textAlign:isRTL?'right':'left' }}>{t('tap_edit_profile')}</Txt>
                  <Feather name={isRTL?'chevron-left':'chevron-right'} size={16} color={tColor.text3} />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity onPress={handleAddNew}
                style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 10, backgroundColor: tColor.bg2, borderRadius: 12, borderWidth: 1.5, borderColor: tColor.border, borderStyle: 'dashed', padding: 16, justifyContent: 'center' }}>
                <Feather name="plus" size={18} color={tColor.text2} />
                <Txt variant="bodySemi" size={14} color="secondary">{t('add_new_id')}</Txt>
              </TouchableOpacity>

              {/* Achievements Quick List */}
              {activeProfile && (
                <View style={{ marginTop: 10 }}>
                   <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12, textAlign:isRTL?'right':'left' }}>{t('achievements')}</Txt>
                   <View style={{ backgroundColor: tColor.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: tColor.border2 }}>
                      {(!activeProfile.achievements || activeProfile.achievements.length === 0) ? (
                        <Txt variant="bodyItalic" size={13} color="tertiary" style={{ textAlign: 'center', paddingVertical: 20 }}>No achievements added yet.</Txt>
                      ) : (
                        activeProfile.achievements.map((a, i) => (
                           <TouchableOpacity key={a.id} onLongPress={() => handleLongPressAch(a.id)}
                            style={{ flexDirection: isRTL?'row-reverse':'row', alignItems: 'center', gap: 12, marginBottom: i < activeProfile.achievements!.length - 1 ? 12 : 0 }}>
                              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: tColor.bg2, alignItems: 'center', justifyContent: 'center' }}>
                                 <Txt style={{ fontSize: 18 }}>{a.icon}</Txt>
                              </View>
                              <View style={{ flex: 1 }}>
                                 <Txt variant="bodySemi" size={14} style={{ textAlign:isRTL?'right':'left' }}>{a.title}</Txt>
                                 <Txt variant="mono" size={10} color="tertiary" style={{ textAlign:isRTL?'right':'left' }}>{new Date(a.date).toLocaleDateString()}</Txt>
                              </View>
                           </TouchableOpacity>
                        ))
                      )}
                   </View>
                </View>
              )}
            </View>
          )}
        </View>

      </ScrollView>

      <BottomSheet visible={showAddAch} onClose={() => setShowAddAch(false)} title="New Achievement" scrollable>
        <Input label="Title" value={achTitle} onChangeText={setAchTitle} placeholder="e.g. Dean's List 2026" />
        
        <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, marginTop: 10, textAlign:isRTL?'right':'left' }}>Icon</Txt>
        <View style={{ flexDirection: isRTL?'row-reverse':'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {['🏆','⭐','🏅','📈','🎓','🌟','✨','🎯','📚','💡'].map(e => (
            <TouchableOpacity key={e} onPress={() => setAchIcon(e)}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: tColor.bg2, borderWidth: 2.5, borderColor: achIcon === e ? tColor.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
              <Txt style={{ fontSize: 22 }}>{e}</Txt>
            </TouchableOpacity>
          ))}
        </View>

        <Button label="Add Milestone" onPress={handleAddAchievement} />
      </BottomSheet>
    </SafeAreaView>
  );
}
