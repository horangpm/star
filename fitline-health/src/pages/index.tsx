import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

export default function IntroPage({ onNext }: { onNext: () => void }) {
  const handleStart = () => {
    onNext();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>내 몸 사용 설명서</Text>
          <Text style={styles.subtitle}>전통 사주 명리학과 현재 건강 상태를 종합하여 나만의 맞춤형 관리를 제안해 드립니다.</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔍 사주 기반 건강 체질 분석</Text>
            <Text style={styles.cardDesc}>오행의 균형을 바탕으로 선천적인 체질과 취약한 장기를 분석합니다.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🩺 현재 건강 상태 체크</Text>
            <Text style={styles.cardDesc}>피로, 수면, 소화 등 5가지 지표를 통해 지금 내 몸의 상태를 점검합니다.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>💊 FitLine 맞춤 영양제 추천</Text>
            <Text style={styles.cardDesc}>분석된 체질과 약점에 딱 맞는 독일 PM 영양제를 1:1 맞춤 추천합니다.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleStart}>
          <Text style={styles.ctaText}>토스로 시작하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F4F6' },
  container: { flexGrow: 1 },
  content: { padding: 24, paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#191F28', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#4E5968', marginBottom: 32, lineHeight: 24 },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333D4B', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#4E5968', lineHeight: 20 },
  footer: { padding: 24, paddingBottom: 40, backgroundColor: '#F2F4F6' },
  ctaButton: { backgroundColor: '#3182F6', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' }
});
