import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useHealthStore } from '../store/useHealthStore';

const QUESTIONS = [
  {
    key: 'fatigue',
    q: '요즘 하루 중 피로감이\n어느 정도인가요?',
    options: [
      { label: '거의 없음', score: 100 },
      { label: '가끔 피곤함', score: 75 },
      { label: '자주 피곤함', score: 40 },
      { label: '항상 피곤함', score: 10 },
    ],
  },
  {
    key: 'sleep',
    q: '최근 수면의 질은\n어떤가요?',
    options: [
      { label: '깊게 잘 잠', score: 100 },
      { label: '가끔 뒤척임', score: 75 },
      { label: '자주 깨거나 얕음', score: 40 },
      { label: '불면 잦음', score: 10 },
    ],
  },
  {
    key: 'digestion',
    q: '식후 소화 상태는\n어떤가요?',
    options: [
      { label: '쾌적함', score: 100 },
      { label: '가끔 더부룩함', score: 75 },
      { label: '자주 불편함', score: 40 },
      { label: '매일 문제 있음', score: 10 },
    ],
  },
  {
    key: 'immunity',
    q: '감기나 잔병치레\n빈도는 어떠신가요?',
    options: [
      { label: '거의 안 걸림', score: 100 },
      { label: '1년에 1~2회', score: 75 },
      { label: '자주 걸림', score: 40 },
      { label: '달고 삼', score: 10 },
    ],
  },
  {
    key: 'stamina',
    q: '일상 체력 수준은\n어느 정도인가요?',
    options: [
      { label: '체력이 넘침', score: 100 },
      { label: '적당한 편임', score: 75 },
      { label: '자주 부족함', score: 40 },
      { label: '많이 부족함', score: 10 },
    ],
  },
];

export default function HealthCheckPage({ onNext }: { onNext: () => void }) {
  const { setScore } = useHealthStore();
  const [step, setStep] = useState(0);

  const currentQuestion = QUESTIONS[step];

  const handleSelect = (score: number) => {
    setScore(currentQuestion.key as any, score);
    
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      onNext();
    }
  };

  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.stepText}>{step + 1} / {QUESTIONS.length}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.questionText}>{currentQuestion.q}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((opt, idx) => (
            <TouchableOpacity key={idx} style={styles.optionBtn} onPress={() => handleSelect(opt.score)}>
              <Text style={styles.optionText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { padding: 24, paddingTop: 16 },
  progressBarBg: { height: 6, backgroundColor: '#E5E8EB', borderRadius: 3, marginBottom: 8, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#3182F6', borderRadius: 3 },
  stepText: { fontSize: 13, color: '#8B95A1', textAlign: 'right', fontWeight: 'bold' },
  content: { flex: 1, padding: 24, justifyContent: 'center', paddingBottom: 60 },
  questionText: { fontSize: 26, fontWeight: 'bold', color: '#191F28', marginBottom: 40, lineHeight: 36 },
  optionsContainer: { gap: 12 },
  optionBtn: { paddingVertical: 20, paddingHorizontal: 24, backgroundColor: '#F2F4F6', borderRadius: 16, alignItems: 'center' },
  optionText: { fontSize: 17, color: '#333D4B', fontWeight: 'bold' },
});
