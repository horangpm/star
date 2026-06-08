import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, SafeAreaView } from 'react-native';
import { useSajuStore } from '../store/useSajuStore';

const ZODIAC_HOURS = [
  { label: '자시 (23:30~01:29)', value: '자시' },
  { label: '축시 (01:30~03:29)', value: '축시' },
  { label: '인시 (03:30~05:29)', value: '인시' },
  { label: '묘시 (05:30~07:29)', value: '묘시' },
  { label: '진시 (07:30~09:29)', value: '진시' },
  { label: '사시 (09:30~11:29)', value: '사시' },
  { label: '오시 (11:30~13:29)', value: '오시' },
  { label: '미시 (13:30~15:29)', value: '미시' },
  { label: '신시 (15:30~17:29)', value: '신시' },
  { label: '유시 (17:30~19:29)', value: '유시' },
  { label: '술시 (19:30~21:29)', value: '술시' },
  { label: '해시 (21:30~23:29)', value: '해시' },
];

export default function SajuInputPage({ onNext }: { onNext: () => void }) {
  const { input, setInput } = useSajuStore();

  const handleNext = () => {
    onNext();
  };

  const isFormValid = input.birthYear && input.birthMonth && input.birthDay && input.gender && (input.birthHour !== null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>태어난 정보를 알려주세요</Text>
        <Text style={styles.privacyNotice}>* 입력한 정보는 건강 분석에만 활용되며 외부에 제공되지 않아요</Text>

        {/* 생년월일 */}
        <View style={styles.section}>
          <Text style={styles.label}>생년월일</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateInputWrapper}>
              <TextInput style={styles.input} placeholder="YYYY" keyboardType="number-pad" maxLength={4}
                onChangeText={(t) => setInput({ birthYear: Number(t) || null })} />
              <Text style={styles.unit}>년</Text>
            </View>
            <View style={styles.dateInputWrapper}>
              <TextInput style={styles.input} placeholder="MM" keyboardType="number-pad" maxLength={2}
                onChangeText={(t) => setInput({ birthMonth: Number(t) || null })} />
              <Text style={styles.unit}>월</Text>
            </View>
            <View style={styles.dateInputWrapper}>
              <TextInput style={styles.input} placeholder="DD" keyboardType="number-pad" maxLength={2}
                onChangeText={(t) => setInput({ birthDay: Number(t) || null })} />
              <Text style={styles.unit}>일</Text>
            </View>
          </View>
        </View>

        {/* 음/양력 */}
        <View style={styles.sectionRow}>
          <Text style={styles.labelRow}>음력 / 양력</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity 
              style={[styles.toggleBtn, input.calendarType === 'solar' && styles.toggleBtnActive]}
              onPress={() => setInput({ calendarType: 'solar' })}>
              <Text style={[styles.toggleText, input.calendarType === 'solar' && styles.toggleTextActive]}>양력</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, input.calendarType === 'lunar' && styles.toggleBtnActive]}
              onPress={() => setInput({ calendarType: 'lunar' })}>
              <Text style={[styles.toggleText, input.calendarType === 'lunar' && styles.toggleTextActive]}>음력</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 태어난 시간 */}
        <View style={styles.section}>
          <Text style={styles.label}>태어난 시간</Text>
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setInput({ birthHour: input.birthHour === '' ? null : '' })}>
            <View style={[styles.checkbox, input.birthHour === '' && styles.checkboxChecked]} />
            <Text style={styles.checkboxLabel}>시간을 모르겠어요</Text>
          </TouchableOpacity>
          
          {input.birthHour !== '' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourScroll}>
              {ZODIAC_HOURS.map((hour) => (
                <TouchableOpacity 
                  key={hour.value} 
                  style={[styles.hourChip, input.birthHour === hour.value && styles.hourChipActive]}
                  onPress={() => setInput({ birthHour: hour.value })}
                >
                  <Text style={[styles.hourChipText, input.birthHour === hour.value && styles.hourChipTextActive]}>
                    {hour.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* 성별 */}
        <View style={styles.sectionRow}>
          <Text style={styles.labelRow}>성별</Text>
          <View style={styles.toggleGroup}>
            <TouchableOpacity 
              style={[styles.toggleBtn, input.gender === 'female' && styles.toggleBtnActive]}
              onPress={() => setInput({ gender: 'female' })}>
              <Text style={[styles.toggleText, input.gender === 'female' && styles.toggleTextActive]}>여성</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, input.gender === 'male' && styles.toggleBtnActive]}
              onPress={() => setInput({ gender: 'male' })}>
              <Text style={[styles.toggleText, input.gender === 'male' && styles.toggleTextActive]}>남성</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.ctaButton, !isFormValid && styles.ctaButtonDisabled]} onPress={handleNext} disabled={!isFormValid}>
          <Text style={styles.ctaText}>사주 분석하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flexGrow: 1, padding: 24, paddingTop: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#191F28', marginBottom: 8 },
  privacyNotice: { fontSize: 13, color: '#8B95A1', marginBottom: 32 },
  section: { marginBottom: 28 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333D4B', marginBottom: 12 },
  labelRow: { fontSize: 16, fontWeight: 'bold', color: '#333D4B' },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateInputWrapper: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  input: { flex: 1, backgroundColor: '#F2F4F6', padding: 14, borderRadius: 12, fontSize: 16, color: '#191F28', textAlign: 'center' },
  unit: { fontSize: 15, color: '#4E5968', marginLeft: 6 },
  toggleGroup: { flexDirection: 'row', backgroundColor: '#F2F4F6', borderRadius: 8, padding: 4 },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  toggleText: { fontSize: 15, color: '#8B95A1', fontWeight: '500' },
  toggleTextActive: { color: '#333D4B', fontWeight: 'bold' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: '#D1D6DB', marginRight: 10, backgroundColor: '#fff' },
  checkboxChecked: { backgroundColor: '#3182F6', borderColor: '#3182F6' },
  checkboxLabel: { fontSize: 15, color: '#4E5968' },
  hourScroll: { flexDirection: 'row', marginLeft: -24, paddingLeft: 24 },
  hourChip: { backgroundColor: '#F2F4F6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, marginRight: 8 },
  hourChipActive: { backgroundColor: '#E8F3FF', borderWidth: 1, borderColor: '#3182F6' },
  hourChipText: { color: '#4E5968', fontSize: 14 },
  hourChipTextActive: { color: '#3182F6', fontWeight: 'bold' },
  footer: { padding: 24, paddingBottom: 40, backgroundColor: '#FFFFFF' },
  ctaButton: { backgroundColor: '#3182F6', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  ctaButtonDisabled: { backgroundColor: '#D1D6DB' },
  ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' }
});
