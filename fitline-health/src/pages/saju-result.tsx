import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useSajuStore } from '../store/useSajuStore';
import { analyzeSaju } from '../utils/sajuLogic';

const ELEMENT_COLORS = {
  '목': '#34C759', // green
  '화': '#FF6B6B', // coral
  '토': '#FFC107', // amber
  '금': '#8E8E93', // gray
  '수': '#3182F6', // blue
};

export default function SajuResultPage({ onNext }: { onNext: () => void }) {
  const { input } = useSajuStore();

  const result = useMemo(() => analyzeSaju(input), [input]);

  const handleNext = () => {
    onNext();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>선천적 건강 운세 분석</Text>

        {/* 1. 오행 균형 바 차트 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 오행의 균형</Text>
          <View style={styles.chartContainer}>
            {Object.entries(result.elementBalance).map(([element, value]) => (
              <View key={element} style={styles.barRow}>
                <Text style={styles.barLabel}>{element}</Text>
                <View style={styles.barBackground}>
                  <View style={[styles.barFill, { width: `${value}%`, backgroundColor: ELEMENT_COLORS[element as keyof typeof ELEMENT_COLORS] }]} />
                </View>
                <Text style={styles.barValue}>{value}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 2. 체질 유형 카드 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 {result.constitutionType}</Text>
          <Text style={styles.cardDesc}>{result.constitutionDesc}</Text>
          <View style={styles.organTags}>
            {result.weakOrgans.map(organ => (
              <View key={organ} style={styles.tag}>
                <Text style={styles.tagText}>취약: {organ}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3. 2025 건강운 점수 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 2025년 (을사년) 건강운</Text>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>전체 건강운</Text>
            <Text style={styles.scoreValue}>{result.yearlyLuck.overall}점</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>체력 및 면역</Text>
            <Text style={styles.scoreValue}>{result.yearlyLuck.stamina}점</Text>
          </View>
          <View style={[styles.scoreRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.scoreLabel}>소화 및 대사</Text>
            <Text style={styles.scoreValue}>{result.yearlyLuck.digestion}점</Text>
          </View>
        </View>

        {/* 4. 주의 시기 경고 카드 */}
        <View style={[styles.card, styles.warningCard]}>
          <Text style={styles.warningTitle}>⚠️ {result.warningMonths} 주의보</Text>
          <Text style={styles.warningDesc}>{result.warningDesc}</Text>
        </View>

        <Text style={styles.disclaimer}>* 이 분석은 전통 사주 이론을 참고한 것으로, 의학적 진단이 아닙니다.</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleNext}>
          <Text style={styles.ctaText}>현재 건강 체크하기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F4F6' },
  container: { flexGrow: 1, padding: 24, paddingTop: 32 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#191F28', marginBottom: 24 },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333D4B', marginBottom: 12 },
  cardDesc: { fontSize: 15, color: '#4E5968', lineHeight: 22, marginBottom: 16 },
  chartContainer: { marginTop: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  barLabel: { width: 24, fontSize: 15, fontWeight: 'bold', color: '#4E5968' },
  barBackground: { flex: 1, height: 12, backgroundColor: '#E5E8EB', borderRadius: 6, marginHorizontal: 12, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  barValue: { width: 36, fontSize: 13, color: '#8B95A1', textAlign: 'right' },
  organTags: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { backgroundColor: '#F2F4F6', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginRight: 8, marginBottom: 8 },
  tagText: { fontSize: 13, color: '#4E5968', fontWeight: '500' },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F4F6' },
  scoreLabel: { fontSize: 15, color: '#4E5968' },
  scoreValue: { fontSize: 16, fontWeight: 'bold', color: '#3182F6' },
  warningCard: { backgroundColor: '#FFF4E6', borderColor: '#FFC107', borderWidth: 1 },
  warningTitle: { fontSize: 16, fontWeight: 'bold', color: '#D97706', marginBottom: 8 },
  warningDesc: { fontSize: 14, color: '#B45309', lineHeight: 20 },
  disclaimer: { fontSize: 12, color: '#8B95A1', textAlign: 'center', marginTop: 16, marginBottom: 32 },
  footer: { padding: 24, paddingBottom: 40, backgroundColor: '#F2F4F6' },
  ctaButton: { backgroundColor: '#3182F6', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' }
});
