import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../src/theme';
import { accounts, goals } from '../src/data/mock';
import AnimatedPressable from '../src/components/AnimatedPressable';
import ProgressBar from '../src/components/ProgressBar';

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function AccountDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const account = accounts.find((a) => a.id === id) ?? accounts[0];
  const linkedGoal = goals.find((g) => g.id === account.goalId);

  const monthlyData = [
    { label: 'Июнь', value: 708 },
    { label: 'Июль', value: 718 },
    { label: 'Авг (прогноз)', value: 214, forecast: true },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(60,40,160,0.8)', 'rgba(22,22,24,0)']}
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

        {/* Title + balance */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.heroSection}>
          <Text style={styles.accountTitle}>{account.name}</Text>
          {linkedGoal && (
            <Text style={styles.accountSubtitle}>Цель</Text>
          )}
          {!linkedGoal && (
            <Text style={styles.accountSubtitle}>Доход на ежедневный остаток</Text>
          )}
          <Text style={styles.balance}>{formatMoney(account.balance)} ₽</Text>
          <Pressable style={styles.rateLink}>
            <Text style={styles.rateLinkText}>Базовая ставка 5% ›</Text>
          </Pressable>
        </Animated.View>

        {/* Action buttons */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.actionsRow}>
          <AnimatedPressable style={styles.actionBtn} scaleValue={0.95}>
            <Text style={styles.actionIcon}>+</Text>
            <Text style={styles.actionLabel}>Пополнить</Text>
          </AnimatedPressable>
          <AnimatedPressable style={styles.actionBtn} scaleValue={0.95}>
            <Text style={styles.actionIcon}>↑</Text>
            <Text style={styles.actionLabel}>Перевести</Text>
          </AnimatedPressable>
          {linkedGoal && (
            <AnimatedPressable style={styles.actionBtn} scaleValue={0.95}>
              <Text style={styles.actionIcon}>✏️</Text>
              <Text style={styles.actionLabel}>Изменить</Text>
            </AnimatedPressable>
          )}
        </Animated.View>

        {/* Rate boost card */}
        <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.section}>
          <AnimatedPressable style={styles.rateCard} scaleValue={0.98}>
            <View style={styles.rateCardLeft}>
              <Text style={styles.rateCardEmoji}>🚀</Text>
            </View>
            <View style={styles.rateCardContent}>
              <Text style={styles.rateCardTitle}>Увеличьте ставку месяца</Text>
              <Text style={styles.rateCardSubtitle}>За покупки по дебетовым картам</Text>
              <View style={styles.rateBarRow}>
                <Text style={styles.rateLabel}>Ставка 12%</Text>
              </View>
              <ProgressBar progress={0.65} height={6} delay={400} />
              <Text style={styles.rateHint}>Потратьте ещё 7 500 ₽</Text>
            </View>
            <Text style={styles.rateChevron}>›</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Income section */}
        <Animated.View entering={FadeInDown.delay(240).springify()} style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Доход: 1 426 ₽</Text>
            <Text style={styles.cardSubtitle}>С 1 июня 2025</Text>
            <View style={styles.monthsRow}>
              {monthlyData.map((m) => (
                <AnimatedPressable
                  key={m.label}
                  style={[styles.monthChip, m.forecast && styles.monthChipActive]}
                  scaleValue={0.94}
                >
                  <Text
                    style={[
                      styles.monthValue,
                      m.forecast && { color: Colors.primary },
                    ]}
                  >
                    {m.forecast ? '~' : ''}{formatMoney(m.value)} ₽
                  </Text>
                  <Text style={styles.monthLabel}>{m.label}</Text>
                </AnimatedPressable>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* History row */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <AnimatedPressable style={styles.listRow} scaleValue={0.98}>
            <Text style={styles.listRowIcon}>🕐</Text>
            <Text style={styles.listRowTitle}>История операций</Text>
            <Text style={styles.listRowChevron}>›</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Goal section */}
        <Animated.View entering={FadeInDown.delay(360).springify()} style={styles.section}>
          {linkedGoal ? (
            <AnimatedPressable
              style={styles.card}
              onPress={() =>
                router.push({ pathname: '/goal-detail', params: { id: linkedGoal.id } })
              }
              scaleValue={0.98}
            >
              <Text style={styles.cardSectionTitle}>Прогресс цели</Text>
              <Text style={styles.cardSubtitle}>
                Выполните цель до {linkedGoal.deadline}
              </Text>
              <View style={styles.goalRow}>
                <View style={styles.goalIconWrap}>
                  <Text style={styles.goalEmoji}>{linkedGoal.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.goalName}>{linkedGoal.name}</Text>
                  <Text style={styles.goalProgress}>
                    {formatMoney(linkedGoal.current)} ₽ из {formatMoney(linkedGoal.target)} ₽
                  </Text>
                  <View style={{ marginTop: 8 }}>
                    <ProgressBar
                      progress={linkedGoal.current / linkedGoal.target}
                      height={6}
                      delay={600}
                    />
                  </View>
                </View>
              </View>
            </AnimatedPressable>
          ) : (
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Цель</Text>
              <Text style={styles.cardSubtitle}>
                Создайте цель и копите на мечту, образование или что-то своё
              </Text>
              <AnimatedPressable
                style={styles.createGoalBtn}
                onPress={() => router.push('/goal-create')}
                scaleValue={0.97}
              >
                <Text style={styles.createGoalBtnText}>СОЗДАТЬ ЦЕЛЬ</Text>
              </AnimatedPressable>
            </View>
          )}
        </Animated.View>

        {/* Requisites */}
        <Animated.View entering={FadeInDown.delay(420).springify()} style={styles.section}>
          <View style={styles.reqCard}>
            <View style={styles.reqHeader}>
              <Text style={styles.cardSectionTitle}>Реквизиты</Text>
              <Pressable>
                <Text style={styles.reqAll}>Все</Text>
              </Pressable>
            </View>
            <View style={styles.reqRow}>
              <Text style={styles.reqLabel}>Номер счёта</Text>
              <Pressable style={styles.reqCopy}>
                <Text style={styles.reqValue} numberOfLines={1}>
                  40781923891328489371481
                </Text>
                <Text style={styles.reqCopyIcon}>⎘</Text>
              </Pressable>
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
    height: 300,
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
  accountTitle: { ...Typography.h3, color: Colors.white, marginBottom: 2 },
  accountSubtitle: { color: Colors.textSecondary, ...Typography.caption, marginBottom: 12 },
  balance: { fontSize: 44, fontWeight: '700', color: Colors.white, letterSpacing: -1 },
  rateLink: { marginTop: 6 },
  rateLinkText: { color: Colors.primary, ...Typography.caption },

  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: { fontSize: 20, marginBottom: 4, color: Colors.white },
  actionLabel: { color: Colors.white, ...Typography.captionMedium },

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
  cardSectionTitle: { color: Colors.white, ...Typography.h3, marginBottom: 4 },
  cardSubtitle: { color: Colors.textSecondary, ...Typography.caption, marginBottom: Spacing.md },

  rateCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  rateCardLeft: { marginRight: Spacing.md },
  rateCardEmoji: { fontSize: 32 },
  rateCardContent: { flex: 1 },
  rateCardTitle: { color: Colors.white, ...Typography.bodyMedium, marginBottom: 2 },
  rateCardSubtitle: { color: Colors.textSecondary, ...Typography.caption, marginBottom: 8 },
  rateBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  rateLabel: { color: Colors.white, ...Typography.captionMedium },
  rateHint: { color: Colors.textSecondary, ...Typography.tiny, marginTop: 4 },
  rateChevron: { color: Colors.textSecondary, fontSize: 20 },

  monthsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  monthChip: {
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthChipActive: {
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryDim,
  },
  monthValue: { color: Colors.white, ...Typography.captionMedium },
  monthLabel: { color: Colors.textSecondary, ...Typography.tiny, marginTop: 2 },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listRowIcon: { fontSize: 20, marginRight: Spacing.md },
  listRowTitle: { flex: 1, color: Colors.white, ...Typography.bodyMedium },
  listRowChevron: { color: Colors.textSecondary, fontSize: 20 },

  goalRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  goalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalEmoji: { fontSize: 22 },
  goalName: { color: Colors.white, ...Typography.bodyMedium },
  goalProgress: { color: Colors.textSecondary, ...Typography.caption, marginTop: 2 },

  createGoalBtn: {
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  createGoalBtnText: {
    color: Colors.white,
    ...Typography.captionMedium,
    letterSpacing: 1,
  },

  reqCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  reqAll: { color: Colors.primary, ...Typography.body },
  reqRow: {},
  reqLabel: { color: Colors.textSecondary, ...Typography.caption, marginBottom: 4 },
  reqCopy: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reqValue: {
    color: Colors.white,
    ...Typography.caption,
    flex: 1,
    fontVariant: ['tabular-nums'],
  },
  reqCopyIcon: { color: Colors.textSecondary, fontSize: 16 },
});
