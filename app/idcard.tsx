import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Txt } from '../components/ui/Text';
import { useApp } from '../context/AppContext';
import { useTheme } from '../hooks/useTheme';

const AVATAR_EMOJIS = ['🎓','📚','🔬','🎨','💻','⚗️','🏛️','📖','🎵','🌍','🧬','⚖️','🎭','🌱','🔭'];
const AVATAR_COLORS = ['#8B4513','#2C5F8A','#4A7C59','#6B4C8A','#C0622A','#1A7A6E','#C03020','#7A5A2A','#4A6A8A','#8A4A6A'];

export default function IDCardScreen() {
  const t      = useTheme();
  const router = useRouter();
  const { state, updateProfile } = useApp();
  const profile = state.profile;

  const [editing,    setEditing]    = useState(false);
  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [university, setUniversity] = useState('');
  const [major,      setMajor]      = useState('');
  const [year,       setYear]       = useState('');
  const [emoji,      setEmoji]      = useState('🎓');
  const [bg,         setBg]         = useState('#8B4513');

  // Sync form fields whenever profile loads or changes
  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '');
      setEmail(profile.email ?? '');
      setUniversity(profile.university ?? '');
      setMajor(profile.major ?? '');
      setYear(profile.year ?? '');
      setEmoji(profile.avatarEmoji ?? '🎓');
      setBg(profile.avatarBg ?? '#8B4513');
    }
  }, [profile]);

  const handleSave = () => {
    updateProfile({ name, email, university, major, year, avatarEmoji: emoji, avatarBg: bg });
    setEditing(false);
  };

  // Preview always uses the live state vars — not the stale `profile` snapshot
  const previewName       = name       || 'Student Name';
  const previewEmail      = email      || 'email@university.edu';
  const previewUniversity = university || null;
  const previewMajor      = major      || null;
  const previewYear       = year       || null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.border }}>
        <TouchableOpacity onPress={() => router.back()}
          style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="x" size={18} color={t.text2} />
        </TouchableOpacity>
        <Txt variant="display" size={20} style={{ flex: 1, marginLeft: 12 }}>Student ID Card</Txt>
        <TouchableOpacity
          onPress={() => editing ? handleSave() : setEditing(true)}
          style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, backgroundColor: editing ? t.accent : t.bg2, borderWidth: 1, borderColor: editing ? t.accent : t.border }}>
          <Txt variant="mono" size={11} style={{ color: editing ? '#fff' : t.text2, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {editing ? 'Save' : 'Edit'}
          </Txt>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* ── ID Card Preview — always reflects current form state ── */}
        <View style={{ backgroundColor: t.card, borderRadius: 20, borderWidth: 1.5, borderColor: t.border2, overflow: 'hidden', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 6 }}>
          <View style={{ backgroundColor: t.accent, paddingVertical: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Txt variant="mono" size={11} style={{ color: '#fff', textTransform: 'uppercase', letterSpacing: 1.5 }}>Student ID</Txt>
            <Txt variant="mono" size={11} style={{ color: '#ffffff88' }}>StudyNest</Txt>
          </View>

          <View style={{ padding: 24, flexDirection: 'row', gap: 20, alignItems: 'flex-start' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: t.accent + '44' }}>
              <Txt style={{ fontSize: 36 }}>{emoji}</Txt>
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="display" size={20} style={{ marginBottom: 4, lineHeight: 24 }}>{previewName}</Txt>
              <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>{previewEmail}</Txt>
              {previewUniversity && <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}><Txt size={12}>🏛</Txt><Txt variant="body" size={13} color="secondary">{previewUniversity}</Txt></View>}
              {previewMajor      && <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}><Txt size={12}>📚</Txt><Txt variant="body" size={13} color="secondary">{previewMajor}</Txt></View>}
              {previewYear       && <View style={{ flexDirection: 'row', gap: 6 }}><Txt size={12}>📅</Txt><Txt variant="body" size={13} color="secondary">Year {previewYear}</Txt></View>}
            </View>
          </View>

          <View style={{ paddingHorizontal: 24, paddingBottom: 16, borderTopWidth: 1, borderTopColor: t.border2, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt variant="mono" size={9} color="tertiary">ID: {profile?.id?.toUpperCase().slice(0, 8) ?? 'ME'}</Txt>
            <Txt variant="mono" size={9} color="tertiary">{new Date().getFullYear()} — {new Date().getFullYear() + 1}</Txt>
          </View>
        </View>

        {/* ── Edit Form ── */}
        {editing ? (
          <View>
            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Avatar</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {AVATAR_EMOJIS.map(e => (
                <TouchableOpacity key={e} onPress={() => setEmoji(e)}
                  style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: bg, borderWidth: 2.5, borderColor: emoji === e ? t.text : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                  <Txt style={{ fontSize: 22 }}>{e}</Txt>
                </TouchableOpacity>
              ))}
            </View>

            <Txt variant="mono" size={10} color="tertiary" style={{ textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Background Color</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
              {AVATAR_COLORS.map(c => (
                <TouchableOpacity key={c} onPress={() => setBg(c)}
                  style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c, borderWidth: 3, borderColor: bg === c ? t.text : 'transparent' }} />
              ))}
            </View>

            <Input label="Full Name"            value={name}       onChangeText={setName}       placeholder="e.g. Omar Al-Hassan" />
            <Input label="Email"                value={email}      onChangeText={setEmail}      placeholder="student@university.edu" keyboardType="email-address" autoCapitalize="none" />
            <Input label="University"           value={university} onChangeText={setUniversity} placeholder="e.g. University of Oxford" />
            <Input label="Major / Field"        value={major}      onChangeText={setMajor}      placeholder="e.g. Computer Science" />
            <Input label="Year (e.g. 2)"        value={year}       onChangeText={setYear}       placeholder="2" keyboardType="numeric" />

            <Button label="Save Changes" onPress={handleSave} style={{ marginTop: 8 }} />
          </View>
        ) : (
          /* Not editing — show a hint to tap Edit */
          <TouchableOpacity onPress={() => setEditing(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.card, borderRadius: 12, borderWidth: 1, borderColor: t.border2, padding: 16 }}>
            <Feather name="edit-2" size={16} color={t.accent} />
            <Txt variant="body" size={14} color="secondary">Tap Edit to update your profile</Txt>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}