import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../src/theme';
import { accounts, totalBalance, totalIncome } from '../src/data/mock';
import AnimatedPressable from '../src/components/AnimatedPressable';
import ProgressBar from '../src/components/ProgressBar';

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const periods = ['Неделя', 'Месяц', '3 мес', 'Год', 'Всё время'];

const monthlyIncome = [
  { label: 'Янв', value: 820, pct: 0.55 },
  { label: 'Фев', value: 740, pct: 0.50 },
  { label: 'Мар', value: 950, pct: 0.64 },
  { label: 'Апр', value: 1100, pct: 0.74 },
  { label: 'Май', value: 1280, pct: 0.86 },
  { label: 'Июн', value: 1426, pct: 1.0 },
];

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [activePeriod, setActivePeriod] = useState('Месяц');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(40,20,130,0.8)', 'rgba(22,22,24,0)']}
        style={styles.bgGradient}
        pointerEvents="none"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.heroSection}>
          <Text style={styles.heroTitle}>Накопления</Text>
          <Text style={styles.heroBalance}>{formatMoney(totalBalance)} ₽</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>+{totalIncome.toLocaleString('ru-RU')} ₽</Text>
            <Text style={styles.heroBadgeLabel}> за все время ↑</Text>
          </View>
        </Animated.View>

        {/* Period selector */}
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodsRow}
          >
            {periods.map((p) => (
              <AnimatedPressable
                key={p}
                style={[styles.periodChip, activePeriod === p && styles.periodChipActive]}
                onPress={() => setActivePeriod(p)}
                scaleValue={0.9}
              >
                <Text
                  style={[
                    styles.periodText,
                    activePeriod === p && styles.periodTextActive,
                  ]}
                >
                  {p}
                </Text>
              </AnimatedPressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Chart */}
        <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Доход по месяцам</Text>
            <Text style={styles.cardSubtitle}>1 426 ₽ в июне 2025</Text>
            <View style={styles.chart}>
              {monthlyIncome.map((m, i) => (
                <Animated.View
                  key={m.label}
                  style={styles.barWrap}
                  entering={FadeInDown.delay(300 + i * 60).springify()}
                >
                  <View style={styles.barContainer}>
                    <Animated.View
                      style={[
                        styles.bar,
                        {
                          height: `${m.pct * 100}%`,
                          backgroundColor:
                            i === monthlyIncome.length - 1
                              ? Colors.primary
                              : Colors.primaryDim,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{m.label}</Text>
                  <Text style={styles.barValue}>{m.value}</Text>
                </Animated.View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* By product */}
        <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>По продуктам</Text>
            {accounts.slice(0, 4).map((acc, i) => {
              const pct = acc.balance / totalBalance;
              return (
                <Animated.View
                  key={acc.id}
                  entering={FadeInDown.delay(400 + i * 70).springify()}
                  style={styles.productRow}
                >
                  <View style={[styles.productIcon, { backgroundColor: acc.color + '33' }]}>
                    <Text style={styles.productEmoji}>{acc.icon}</Text>
                  </View>
                  <View style={styles.productMeta}>
                    <View style={styles.productHeaderRow}>
                      <Text style={styles.productName}>{acc.name}</Text>
                      <Text style={styles.productBalance}>{formatMoney(acc.balance)} ₽</Text>
                    </View>
                    <View style={{ marginTop: 6 }}>
                      <ProgressBar
                        progress={pct}
                        height={4}
                        color={acc.color}
                        delay={500 + i * 80}
                      />
                    </View>
                    <Text style={styles.productPct}>{(pct * 100).toFixed(1)}%</Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Summary stats */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.section}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Ср. ставка</Text>
              <Text style={styles.statValue}>14,2%</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Продуктов</Text>
              <Text style={styles.statValue}>7</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Целей</Text>
              <Text style={styles.statValue}>2</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Доход/мес</Text>
              <Text style={styles.statValue}>1 426 ₽</Text>
            </View>
          </View>
        </Animated.View>

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  backBtn: { padding: 8, alignSelf: 'flex-start' },
  backIcon: { color: Colors.white, fontSize: 28, fontWeight: '300' },

  heroSection: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  heroTitle: { ...Typography.h3, color: Colors.textSecondary, marginBottom: 4 },
  heroBalance: { fontSize: 36, fontWeight: '700', color: Colors.white, letterSpacing: -1 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.greenDim,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  heroBadgeText: { color: Colors.green, ...Typography.captionMedium },
  heroBadgeLabel: { color: Colors.textSecondary, ...Typography.caption },

  periodsRow: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  periodChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodChipActive: {
    backgroundColor: Colors.primaryDim,
    borderColor: Colors.primaryBorder,
  },
  periodText: { color: Colors.textSecondary, ...Typography.captionMedium },
  periodTextActive: { color: Colors.primary },

  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: { color: Colors.white, ...Typography.h3, marginBottom: 4 },
  cardSubtitle: { color: Colors.textSecondary, ...Typography.caption, marginBottom: Spacing.xl },

  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    gap: Spacing.sm,
  },
  barWrap: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  bar: {
    width: '100%',
    borderRadius: Radius.sm,
    minHeight: 4,
  },
  barLabel: { color: Colors.textSecondary, ...Typography.tiny },
  barValue: { color: Colors.textTertiary, fontSize: 9, marginTop: 1 },

  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  productIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  productEmoji: { fontSize: 16 },
  productMeta: { flex: 1 },
  productHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { color: Colors.white, ...Typography.bodyMedium },
  productBalance: { color: Colors.white, ...Typography.bodyMedium },
  productPct: { color: Colors.textSecondary, ...Typography.tiny, marginTop: 2 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  statLabel: { color: Colors.textSecondary, ...Typography.caption, marginBottom: 6 },
  statValue: { color: Colors.white, ...Typography.h2 },
});
