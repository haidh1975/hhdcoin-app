import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react-native';
import { mockSentimentData, mockMarketOverview } from '../../src/lib/mockData';
import type { SignalType } from '@hhd-i/types';
import { COLORS, SCORE_COLORS, withAlpha } from '../../src/theme';

function getFearGreedColor(index: number): string {
  if (index <= 20) return SCORE_COLORS.extreme;
  if (index <= 40) return COLORS.danger;
  if (index <= 60) return COLORS.brand;
  if (index <= 80) return COLORS.success;
  return COLORS.success;
}

function SignalIndicator({ type }: { type: SignalType }) {
  if (type === 'bullish') {
    return (
      <View style={[styles.signalBadge, { backgroundColor: withAlpha(COLORS.success, 0.15) }]}>
        <TrendingUp size={10} color={COLORS.success} />
        <Text style={[styles.signalText, { color: COLORS.success }]}>Tăng</Text>
      </View>
    );
  }
  if (type === 'bearish') {
    return (
      <View style={[styles.signalBadge, { backgroundColor: withAlpha(COLORS.danger, 0.15) }]}>
        <TrendingDown size={10} color={COLORS.danger} />
        <Text style={[styles.signalText, { color: COLORS.danger }]}>Giảm</Text>
      </View>
    );
  }
  return (
    <View style={[styles.signalBadge, { backgroundColor: withAlpha(COLORS.dark500, 0.4) }]}>
      <Minus size={10} color={COLORS.muted} />
      <Text style={[styles.signalText, { color: COLORS.muted }]}>Trung lập</Text>
    </View>
  );
}

export default function SentimentTab() {
  const overview = mockMarketOverview;
  const overallColor = getFearGreedColor(overview.fearGreedIndex);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Overall Fear & Greed */}
      <View style={[styles.overallCard, { borderColor: `${overallColor}40` }]}>
        <Text style={styles.overallLabel}>Chỉ số Fear &amp; Greed Tổng thể</Text>
        <View style={styles.overallMain}>
          <Text style={[styles.overallScore, { color: overallColor }]}>
            {overview.fearGreedIndex}
          </Text>
          <View>
            <Text style={[styles.overallFgLabel, { color: overallColor }]}>
              {overview.fearGreedLabel}
            </Text>
            <Text style={styles.overallSub}>Cập nhật hôm nay</Text>
          </View>
        </View>

        {/* Gauge bar */}
        <View style={styles.gaugeTrack}>
          <View
            style={[
              styles.gaugeFill,
              {
                width: `${overview.fearGreedIndex}%` as `${number}%`,
                backgroundColor: overallColor,
              },
            ]}
          />
        </View>
        <View style={styles.gaugeLabels}>
          <Text style={styles.gaugeLabelText}>Sợ hãi</Text>
          <Text style={styles.gaugeLabelText}>Trung lập</Text>
          <Text style={styles.gaugeLabelText}>Tham lam</Text>
        </View>
      </View>

      {/* Coin Cards */}
      <Text style={styles.sectionTitle}>Phân tích theo coin</Text>
      {mockSentimentData.map((data) => {
        const color = getFearGreedColor(data.fearGreedIndex);
        return (
          <View key={data.symbol} style={styles.coinCard}>
            {/* Coin Header */}
            <View style={styles.coinCardHeader}>
              <View>
                <View style={styles.coinTitleRow}>
                  <Text style={styles.coinSymbol}>{data.symbol}</Text>
                  <Text style={styles.coinName}>{data.coin}</Text>
                </View>
                <View style={styles.fgRow}>
                  <Text style={[styles.fgScore, { color }]}>{data.fearGreedIndex}</Text>
                  <View style={[styles.fgBadge, { backgroundColor: `${color}20` }]}>
                    <Text style={[styles.fgBadgeText, { color }]}>{data.label}</Text>
                  </View>
                </View>
              </View>
              <View style={[styles.coinProgress, { borderColor: color }]}>
                <Text style={[styles.coinProgressText, { color }]}>
                  {data.fearGreedIndex}%
                </Text>
              </View>
            </View>

            {/* Signals */}
            {data.signals.map((signal, i) => (
              <View key={i} style={styles.signalRow}>
                <SignalIndicator type={signal.type} />
                <View style={styles.signalContent}>
                  <Text style={styles.signalSource}>{signal.source}</Text>
                  <Text style={styles.signalSummary}>{signal.summary}</Text>
                </View>
                <Text style={styles.signalConf}>{signal.confidence}%</Text>
              </View>
            ))}

            {/* News Summary */}
            {data.newsSummary && (
              <View style={styles.newsSummary}>
                <Text style={styles.newsSummaryLabel}>Tin tức</Text>
                <Text style={styles.newsSummaryText}>{data.newsSummary}</Text>
              </View>
            )}
          </View>
        );
      })}

      <TouchableOpacity style={styles.updateBtn}>
        <RefreshCw size={14} color={COLORS.text} />
        <Text style={styles.updateBtnText}>Cập nhật phân tích</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 32 },
  overallCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  overallLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 10 },
  overallMain: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  overallScore: { fontSize: 52, fontWeight: 'bold' },
  overallFgLabel: { fontSize: 18, fontWeight: '700' },
  overallSub: { color: COLORS.muted, fontSize: 11, marginTop: 2 },
  gaugeTrack: {
    height: 10,
    backgroundColor: COLORS.dark700,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  gaugeFill: { height: '100%', borderRadius: 5 },
  gaugeLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  gaugeLabelText: { color: COLORS.muted, fontSize: 10 },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginBottom: 10 },
  coinCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    gap: 10,
  },
  coinCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coinTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  coinSymbol: { color: COLORS.text, fontWeight: '700', fontSize: 16 },
  coinName: { color: COLORS.muted, fontSize: 12 },
  fgRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  fgScore: { fontSize: 24, fontWeight: 'bold' },
  fgBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  fgBadgeText: { fontSize: 11, fontWeight: '600' },
  coinProgress: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dark700,
  },
  coinProgressText: { fontSize: 10, fontWeight: 'bold' },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.dark700,
    borderRadius: 10,
    padding: 10,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 0,
  },
  signalText: { fontSize: 10, fontWeight: '600' },
  signalContent: { flex: 1 },
  signalSource: { color: COLORS.text, fontSize: 11, fontWeight: '600' },
  signalSummary: { color: COLORS.muted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  signalConf: { color: COLORS.muted, fontSize: 11, flexShrink: 0 },
  newsSummary: {
    backgroundColor: COLORS.dark700,
    borderRadius: 10,
    padding: 10,
  },
  newsSummaryLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '600', marginBottom: 4 },
  newsSummaryText: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.dark700,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 4,
  },
  updateBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
});
