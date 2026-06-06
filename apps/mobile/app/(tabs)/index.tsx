import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, TrendingDown, Bot, ShieldAlert, BarChart2, MessageCircle } from 'lucide-react-native';
import { mockPortfolio, mockMarketData, mockRiskScore } from '../../../src/lib/mockData';

const COLORS = {
  bg: '#0B0E11',
  card: '#131722',
  border: '#2B3139',
  brand: '#F0B90B',
  text: '#EAECEF',
  muted: '#707A8A',
  success: '#0ECB81',
  danger: '#F6465D',
  dark700: '#1E2329',
};

const FEATURES = [
  { href: '/assistant', icon: Bot, label: 'Trợ lý AI', color: '#F0B90B', bg: 'rgba(240,185,11,0.1)' },
  { href: '/risk', icon: ShieldAlert, label: 'Rủi ro', color: '#F6465D', bg: 'rgba(246,70,93,0.1)' },
  { href: '/sentiment', icon: BarChart2, label: 'Tâm lý TT', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  { href: '/support', icon: MessageCircle, label: 'Hỗ trợ', color: '#0ECB81', bg: 'rgba(14,203,129,0.1)' },
];

export default function DashboardTab() {
  const router = useRouter();
  const portfolio = mockPortfolio;
  const risk = mockRiskScore;
  const isPnlPositive = portfolio.pnlPercent >= 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Portfolio Card */}
      <View style={styles.portfolioCard}>
        <Text style={styles.portfolioLabel}>Tổng giá trị danh mục</Text>
        <Text style={styles.portfolioValue}>
          ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Text>
        <View style={styles.pnlRow}>
          {isPnlPositive ? (
            <TrendingUp size={14} color={COLORS.success} />
          ) : (
            <TrendingDown size={14} color={COLORS.danger} />
          )}
          <Text
            style={[
              styles.pnlText,
              { color: isPnlPositive ? COLORS.success : COLORS.danger },
            ]}
          >
            {isPnlPositive ? '+' : ''}${portfolio.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })} (
            {isPnlPositive ? '+' : ''}{portfolio.pnlPercent.toFixed(2)}%)
          </Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Điểm rủi ro</Text>
          <Text style={[styles.statValue, { color: COLORS.brand }]}>{risk.score}/100</Text>
          <Text style={styles.statSub}>Trung bình</Text>
        </View>
        <View style={[styles.statCard, { marginHorizontal: 8 }]}>
          <Text style={styles.statLabel}>Biến động 24h</Text>
          <Text style={[styles.statValue, { color: COLORS.success }]}>+2.34%</Text>
          <Text style={styles.statSub}>BTC dẫn đầu</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Kế hoạch DCA</Text>
          <Text style={[styles.statValue, { color: COLORS.brand }]}>2</Text>
          <Text style={styles.statSub}>Đang chạy</Text>
        </View>
      </View>

      {/* Feature Quick Access */}
      <Text style={styles.sectionTitle}>Tính năng AI</Text>
      <View style={styles.featuresGrid}>
        {FEATURES.map((f) => (
          <TouchableOpacity
            key={f.href}
            style={[styles.featureCard, { backgroundColor: f.bg }]}
            onPress={() => router.push(f.href as Parameters<typeof router.push>[0])}
            activeOpacity={0.7}
          >
            <f.icon size={22} color={f.color} />
            <Text style={[styles.featureLabel, { color: f.color }]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Top Coins */}
      <Text style={styles.sectionTitle}>Thị trường hàng đầu</Text>
      <View style={styles.coinsCard}>
        {mockMarketData.map((coin, i) => {
          const isPos = coin.change24h >= 0;
          return (
            <View
              key={coin.id}
              style={[
                styles.coinRow,
                i < mockMarketData.length - 1 && styles.coinRowBorder,
              ]}
            >
              <View style={styles.coinIconContainer}>
                <Text style={styles.coinIconText}>{coin.symbol[0]}</Text>
              </View>
              <View style={styles.coinInfo}>
                <Text style={styles.coinSymbol}>{coin.symbol}</Text>
                <Text style={styles.coinName}>{coin.name}</Text>
              </View>
              <View style={styles.coinPriceContainer}>
                <Text style={styles.coinPrice}>
                  ${coin.price >= 1000
                    ? coin.price.toLocaleString('en-US', { minimumFractionDigits: 2 })
                    : coin.price.toFixed(coin.price >= 1 ? 2 : 4)}
                </Text>
                <View style={[styles.changeBadge, { backgroundColor: isPos ? 'rgba(14,203,129,0.1)' : 'rgba(246,70,93,0.1)' }]}>
                  <Text style={[styles.changeText, { color: isPos ? COLORS.success : COLORS.danger }]}>
                    {isPos ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16, paddingBottom: 32 },
  portfolioCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  portfolioLabel: { color: COLORS.muted, fontSize: 12, marginBottom: 6 },
  portfolioValue: { color: COLORS.text, fontSize: 28, fontWeight: 'bold', marginBottom: 6 },
  pnlRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pnlText: { fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  statLabel: { color: COLORS.muted, fontSize: 10, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  statSub: { color: COLORS.muted, fontSize: 9 },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 4,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  featureCard: {
    width: '47%',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 72,
  },
  featureLabel: { fontSize: 12, fontWeight: '600' },
  coinsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  coinRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  coinIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.dark700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinIconText: { color: COLORS.brand, fontWeight: 'bold', fontSize: 13 },
  coinInfo: { flex: 1 },
  coinSymbol: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  coinName: { color: COLORS.muted, fontSize: 11 },
  coinPriceContainer: { alignItems: 'flex-end', gap: 4 },
  coinPrice: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  changeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  changeText: { fontSize: 11, fontWeight: '600' },
});
