import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ShieldAlert, AlertTriangle, BarChart2, TrendingDown, Droplets } from 'lucide-react-native';
import { mockRiskScore, mockPortfolio } from '../../../src/lib/mockData';

const COLORS = {
  bg: '#0B0E11',
  card: '#131722',
  border: '#2B3139',
  brand: '#F0B90B',
  text: '#EAECEF',
  muted: '#707A8A',
  dark700: '#1E2329',
  success: '#0ECB81',
  danger: '#F6465D',
};

function getRiskColor(score: number): string {
  if (score < 30) return COLORS.success;
  if (score < 60) return COLORS.brand;
  if (score < 80) return COLORS.danger;
  return '#8B0000';
}

function getRiskLevelText(level: string): string {
  switch (level) {
    case 'low': return 'Thấp';
    case 'medium': return 'Trung bình';
    case 'high': return 'Cao';
    case 'extreme': return 'Cực cao';
    default: return level;
  }
}

const BREAKDOWN_ITEMS = [
  { key: 'concentration' as const, label: 'Rủi ro tập trung', Icon: BarChart2 },
  { key: 'volatility' as const, label: 'Rủi ro biến động', Icon: TrendingDown },
  { key: 'marketRisk' as const, label: 'Rủi ro thị trường', Icon: AlertTriangle },
  { key: 'liquidityRisk' as const, label: 'Rủi ro thanh khoản', Icon: Droplets },
];

export default function RiskTab() {
  const riskScore = mockRiskScore;
  const portfolio = mockPortfolio;
  const scoreColor = getRiskColor(riskScore.score);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Risk Score Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <ShieldAlert size={20} color={COLORS.danger} />
          <Text style={styles.heroTitle}>Điểm rủi ro tổng thể</Text>
        </View>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>{riskScore.score}</Text>
          <Text style={[styles.scoreLabel, { color: scoreColor }]}>
            Mức {getRiskLevelText(riskScore.level)}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${riskScore.score}%` as `${number}%`,
                backgroundColor: scoreColor,
              },
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabelText}>Thấp</Text>
          <Text style={styles.progressLabelText}>Trung bình</Text>
          <Text style={styles.progressLabelText}>Cao</Text>
        </View>
      </View>

      {/* Risk Breakdown */}
      <Text style={styles.sectionTitle}>Phân tích chi tiết</Text>
      {BREAKDOWN_ITEMS.map((item) => {
        const score = riskScore.breakdown[item.key];
        const color = getRiskColor(score);
        return (
          <View key={item.key} style={styles.breakdownCard}>
            <View style={styles.breakdownHeader}>
              <View style={styles.breakdownLeft}>
                <item.Icon size={14} color={COLORS.muted} />
                <Text style={styles.breakdownLabel}>{item.label}</Text>
              </View>
              <Text style={[styles.breakdownScore, { color }]}>{score}/100</Text>
            </View>
            <View style={styles.progressTrackSmall}>
              <View
                style={[
                  styles.progressFillSmall,
                  {
                    width: `${score}%` as `${number}%`,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}

      {/* Portfolio Allocation */}
      <Text style={styles.sectionTitle}>Phân bổ danh mục</Text>
      <View style={styles.allocationCard}>
        {portfolio.coins.map((coin) => (
          <View key={coin.id} style={styles.allocationRow}>
            <View style={styles.allocationLeft}>
              <View style={styles.coinDot}>
                <Text style={styles.coinDotText}>{coin.symbol[0]}</Text>
              </View>
              <View>
                <Text style={styles.allocationSymbol}>{coin.symbol}</Text>
                <Text style={styles.allocationName}>{coin.name}</Text>
              </View>
            </View>
            <View style={styles.allocationRight}>
              <Text style={styles.allocationPercent}>{coin.allocation.toFixed(1)}%</Text>
              <View style={styles.allocationBar}>
                <View
                  style={[
                    styles.allocationBarFill,
                    { width: `${coin.allocation}%` as `${number}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Recommendations */}
      {riskScore.recommendations && riskScore.recommendations.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Khuyến nghị AI</Text>
          {riskScore.recommendations.map((rec, i) => (
            <View key={i} style={styles.recCard}>
              <View style={styles.recNumber}>
                <Text style={styles.recNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.recText}>{rec}</Text>
            </View>
          ))}
        </>
      )}

      <TouchableOpacity style={styles.refreshBtn}>
        <Text style={styles.refreshBtnText}>Phân tích lại</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 32 },
  heroCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  heroTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    borderColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.dark700,
  },
  scoreText: { fontSize: 36, fontWeight: 'bold' },
  scoreLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.dark700,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  progressLabelText: { color: COLORS.muted, fontSize: 10 },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 10, marginTop: 4 },
  breakdownCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  breakdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  breakdownLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  breakdownLabel: { color: COLORS.text, fontSize: 13, fontWeight: '500' },
  breakdownScore: { fontSize: 13, fontWeight: 'bold' },
  progressTrackSmall: {
    height: 4,
    backgroundColor: COLORS.dark700,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFillSmall: { height: '100%', borderRadius: 2 },
  allocationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  allocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 10,
  },
  allocationLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  coinDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.dark700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinDotText: { color: COLORS.brand, fontWeight: 'bold', fontSize: 12 },
  allocationSymbol: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  allocationName: { color: COLORS.muted, fontSize: 11 },
  allocationRight: { flex: 1, alignItems: 'flex-end', gap: 4 },
  allocationPercent: { color: COLORS.brand, fontWeight: 'bold', fontSize: 13 },
  allocationBar: {
    width: 80,
    height: 4,
    backgroundColor: COLORS.dark700,
    borderRadius: 2,
    overflow: 'hidden',
  },
  allocationBarFill: {
    height: '100%',
    backgroundColor: COLORS.brand,
    borderRadius: 2,
  },
  recCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  recNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(240,185,11,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  recNumberText: { color: COLORS.brand, fontSize: 11, fontWeight: 'bold' },
  recText: { color: COLORS.muted, fontSize: 12, lineHeight: 18, flex: 1 },
  refreshBtn: {
    backgroundColor: COLORS.dark700,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  refreshBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
});
