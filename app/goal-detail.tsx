import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../src/theme';
import { goals, accounts } from '../src/data/mock';
import AnimatedPressable from '../src/components/AnimatedPressable';
import ProgressBar from '../src/components/ProgressBar';

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function GoalDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const goal = goals.find((g) => g.id === id) ?? goals[0];
  const linkedAccounts = accounts.filter((a) => goal.linkedAccounts.includes(a.id));
  const pct = goal.current / goal.target;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(50,30,150,0.85)', 'rgba(22,22,24,0)']}
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
        <Animated.View entering={ZoomIn.delay(0).springify()} style={styles.heroEmoji}>
          <Text style={styles.bigEmoji}>{goal.emoji}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.heroSection}>
          <Text style={styles.goalName}>{goal.name}</Text>
          <Text style={styles.goalTag}>Цель</Text>
          <Text style={styles.goalBalance}>{formatMoney(goal.current)} ₽</Text>
          <Text style={styles.goalMeta}>
            Из {formatMoney(goal.target)} ₽ до {goal.deadline}
          </Text>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.actionsRow}>
          <AnimatedPressable style={styles.actionBtn} scaleValue={0.94}>
            <Text style={styles.actionIcon}>+</Text>
            <Text style={styles.actionLabel}>Пополнить</Text>
          </AnimatedPressable>
          <AnimatedPressable style={styles.actionBtn} scaleValue={0.94}>
            <Text style={styles.actionIcon}>↑</Text>
            <Text style={styles.actionLabel}>Перевести</Text>
          </AnimatedPressable>
          <AnimatedPressable
            style={styles.actionBtn}
            onPress={() => router.push('/goal-create')}
            scaleValue={0.94}
          >
            <Text style={styles.actionIcon}>✏️</Text>
            <Text style={styles.actionLabel}>Изменить</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Progress card */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Прогресс цели</Text>
            <Text style={styles.cardSubtitle}>
              В таком темпе вы закроете цель к {goal.deadline}
            </Text>
            <Text style={styles.progressAmount}>
              {formatMoney(goal.current)} ₽ из {formatMoney(goal.target)} ₽
            </Text>
            <View style={{ marginTop: 12 }}>
              <ProgressBar progress={pct} height={8} delay={400} />
            </View>
          </View>
        </Animated.View>

        {/* Linked accounts */}
        <Animated.View entering={FadeInDown.delay(280).springify()} style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Привязанные счета</Text>
            {linkedAccounts.map((acc, i) => (
              <AnimatedPressable
                key={acc.id}
                style={[
                  styles.linkedRow,
                  i < linkedAccounts.length - 1 && styles.linkedRowBorder,
                ]}
                onPress={() =>
                  router.push({ pathname: '/account-detail', params: { id: acc.id } })
                }
                scaleValue={0.98}
              >
                <View style={[styles.accIcon, { backgroundColor: acc.color + '33' }]}>
                  <Text>{acc.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.accName}>{acc.name}</Text>
                  <Text style={styles.accSub}>{acc.subtitle}</Text>
                </View>
                <Text style={styles.accBalance}>{formatMoney(acc.balance)} ₽</Text>
              </AnimatedPressable>
            ))}
          </View>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeInDown.delay(340).springify()} style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Настройки</Text>
            <View style={styles.settingRow}>
              <View>
                <Text style={styles.settingLabel}>Скрыть остаток</Text>
                <Text style={styles.settingSubtitle}>На главном экране</Text>
              </View>
              <Switch
                value={false}
                trackColor={{ false: Colors.bgCardHover, true: Colors.primary }}
                thumbColor={Colors.white}
                ios_backgroundColor={Colors.bgCardHover}
              />
            </View>
          </View>
        </Animated.View>

        {/* Delete button */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <AnimatedPressable style={styles.deleteBtn} scaleValue={0.97}>
            <Text style={styles.deleteBtnText}>УДАЛИТЬ ЦЕЛЬ</Text>
          </AnimatedPressable>
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
    height: 380,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  backBtn: { padding: 8, alignSelf: 'flex-start' },
  backIcon: { color: Colors.white, fontSize: 28, fontWeight: '300' },

  heroEmoji: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  bigEmoji: { fontSize: 80 },

  heroSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  goalName: { ...Typography.h2, color: Colors.white },
  goalTag: { color: Colors.textSecondary, ...Typography.caption, marginTop: 2, marginBottom: 12 },
  goalBalance: { fontSize: 38, fontWeight: '700', color: Colors.white, letterSpacing: -1 },
  goalMeta: { color: Colors.textSecondary, ...Typography.caption, marginTop: 4 },

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
  actionIcon: { fontSize: 18, marginBottom: 4, color: Colors.white },
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
  cardSubtitle: { color: Colors.textSecondary, ...Typography.caption, marginBottom: Spacing.md },
  progressAmount: { color: Colors.white, ...Typography.bodyMedium },

  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  linkedRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  accIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accName: { color: Colors.white, ...Typography.bodyMedium },
  accSub: { color: Colors.textSecondary, ...Typography.caption, marginTop: 2 },
  accBalance: { color: Colors.white, ...Typography.bodyMedium },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  settingLabel: { color: Colors.white, ...Typography.bodyMedium },
  settingSubtitle: { color: Colors.textSecondary, ...Typography.caption, marginTop: 2 },

  deleteBtn: {
    borderWidth: 1,
    borderColor: Colors.red + '55',
    borderRadius: Radius.xl,
    paddingVertical: 17,
    alignItems: 'center',
  },
  deleteBtnText: { color: Colors.red, ...Typography.bodyMedium, letterSpacing: 0.5 },
});
