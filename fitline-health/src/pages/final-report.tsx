import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Linking } from 'react-native';
import { useSajuStore } from '../store/useSajuStore';
import { useHealthStore } from '../store/useHealthStore';
import { analyzeSaju } from '../utils/sajuLogic';
import { recommendProducts } from '../utils/recommendLogic';

export default function FinalReportPage() {
  const { input } = useSajuStore();
  const { scores } = useHealthStore();

  const sajuResult = useMemo(() => analyzeSaju(input), [input]);
  const recommendations = useMemo(() => recommendProducts(sajuResult, scores), [sajuResult, scores]);

  const sajuAvg = (sajuResult.yearlyLuck.overall + sajuResult.yearlyLuck.stamina + sajuResult.yearlyLuck.digestion) / 3;
  const healthAvg = (scores.fatigue + scores.sleep + scores.digestion + scores.immunity + scores.stamina) / 5;
  const finalScore = Math.round((sajuAvg * 0.4) + (healthAvg * 0.6));

  let scoreColor = '#34C759'; // teal/green
  let scoreStatus = '건강 상태 양호';
  if (finalScore < 60) {
    scoreColor = '#FF6B6B'; // coral
    scoreStatus = '집중 관리 필요';
  } else if (finalScore < 80) {
    scoreColor = '#FFC107'; // amber
    scoreStatus = '보통, 관리 필요';
  }

  const weakPoints = Object.entries(scores)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(entry => {
      const labels: Record<string, string> = {
        fatigue: '피로감',
        sleep: '수면',
        digestion: '소화',
        immunity: '면역력',
        stamina: '체력'
      };
      return labels[entry[0]];
    });

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>종합 건강 리포트</Text>

        {/* 1. 종합 점수 */}
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>{finalScore}</Text>
            <Text style={styles.scoreUnit}>점</Text>
          </View>
          <Text style={[styles.scoreStatus, { color: scoreColor }]}>{scoreStatus}</Text>
          <Text style={styles.scoreDesc}>사주 건강운(40%) + 현재 건강 체크(60%)</Text>
        </View>

        {/* 2. 보강 포인트 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚠️ 지금 보강해야 할 포인트</Text>
          <View style={styles.weakPointsRow}>
            {weakPoints.map((point, i) => (
              <View key={i} style={styles.weakPointTag}>
                <Text style={styles.weakPointText}>{point}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3. 영역별 점수 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 영역별 상세 점수</Text>
          {[
            { label: '피로도', val: scores.fatigue },
            { label: '수면', val: scores.sleep },
            { label: '소화', val: scores.digestion },
            { label: '면역력', val: scores.immunity },
            { label: '체력', val: scores.stamina },
          ].map((item, idx) => (
            <View key={idx} style={styles.barRow}>
              <Text style={styles.barLabel}>{item.label}</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill, { width: `${item.val}%`, backgroundColor: item.val < 60 ? '#FF6B6B' : (item.val < 80 ? '#FFC107' : '#34C759') }]} />
              </View>
              <Text style={styles.barValText}>{item.val}점</Text>
            </View>
          ))}
        </View>

        {/* 4. 추천 제품 */}
        <Text style={styles.recommendationHeader}>✨ FitLine 맞춤 솔루션</Text>
        {recommendations.map((prod, idx) => (
          <View key={idx} style={styles.productCard}>
            <View style={styles.productHeader}>
              <Text style={styles.productName}>{prod.productName}</Text>
              <Text style={styles.productRank}>추천 {idx + 1}순위</Text>
            </View>
            <Text style={styles.productReason}>{prod.reason}</Text>
            <TouchableOpacity style={styles.productBtn} onPress={() => handleOpenLink(prod.pmUrl)}>
              <Text style={styles.productBtnText}>제품 상세보기</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.ctaButton} onPress={() => handleOpenLink('https://horangpm.linkstory.co.kr')}>
          <Text style={styles.ctaText}>맞춤 제품 전체 보러가기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F4F6' },
  container: { flexGrow: 1, padding: 24, paddingTop: 32 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#191F28', marginBottom: 24, textAlign: 'center' },
  
  scoreContainer: { alignItems: 'center', marginBottom: 32 },
  scoreCircle: { width: 140, height: 140, borderRadius: 70, borderWidth: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  scoreValue: { fontSize: 48, fontWeight: 'bold' },
  scoreUnit: { fontSize: 20, color: '#8B95A1', marginTop: 16, marginLeft: 4 },
  scoreStatus: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  scoreDesc: { fontSize: 13, color: '#8B95A1', marginTop: 8 },

  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333D4B', marginBottom: 16 },
  
  weakPointsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  weakPointTag: { backgroundColor: '#FFF4E6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderColor: '#FFC107', borderWidth: 1, marginBottom: 8 },
  weakPointText: { color: '#D97706', fontSize: 14, fontWeight: 'bold' },

  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  barLabel: { width: 44, fontSize: 14, color: '#4E5968' },
  barBg: { flex: 1, height: 8, backgroundColor: '#E5E8EB', borderRadius: 4, marginHorizontal: 12, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barValText: { width: 36, fontSize: 13, color: '#8B95A1', textAlign: 'right' },

  recommendationHeader: { fontSize: 20, fontWeight: 'bold', color: '#191F28', marginTop: 16, marginBottom: 16 },
  productCard: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#3182F6' },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  productName: { fontSize: 18, fontWeight: 'bold', color: '#191F28' },
  productRank: { fontSize: 12, color: '#3182F6', fontWeight: 'bold', backgroundColor: '#E8F3FF', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 },
  productReason: { fontSize: 14, color: '#4E5968', lineHeight: 20, marginBottom: 16 },
  productBtn: { backgroundColor: '#F2F4F6', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  productBtnText: { color: '#3182F6', fontSize: 14, fontWeight: 'bold' },

  footer: { padding: 24, paddingBottom: 40, backgroundColor: '#F2F4F6' },
  ctaButton: { backgroundColor: '#3182F6', paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  ctaText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' }
});
