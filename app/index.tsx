import React from 'react';
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
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { Colors, Spacing, Radius, Fonts } from '../src/theme';
import { accounts, totalBalance, totalIncome } from '../src/data/mock';
import AnimatedPressable from '../src/components/AnimatedPressable';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function formatMoney(n: number) {
  return n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatIncome(n: number) {
  return '+' + n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Product Row ──────────────────────────────────────────────────────────────
function ProductRow({
  account,
  index,
  isLast,
}: {
  account: (typeof accounts)[0];
  index: number;
  isLast: boolean;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(200 + index * 60).springify()}>
      <AnimatedPressable
        style={[styles.productRow, !isLast && styles.productRowBorder]}
        onPress={() => router.push({ pathname: '/account-detail', params: { id: account.id } })}
        scaleValue={0.985}
      >
        <View style={[styles.productIcon, { backgroundColor: account.color + '33' }]}>
          <Text style={styles.productIconText}>{account.icon}</Text>
        </View>
        <View style={styles.productMeta}>
          <Text style={styles.productName}>{account.name}</Text>
          <Text style={styles.productSubtitle} numberOfLines={1}>
            {account.subtitle}
          </Text>
        </View>
        <View style={styles.productRight}>
          <Text style={styles.productBalance}>{formatMoney(account.balance)} ₽</Text>
          <Text style={styles.productIncome}>{formatIncome(account.income)} ₽</Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const heroStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 100], [1, 0.3], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(scrollY.value, [0, 100], [0, -20], Extrapolation.CLAMP) },
    ],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AnimatedScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* Navbar */}
        <View style={styles.navbar}>
          <Pressable style={styles.navBtn} onPress={() => router.back()}>
            <Text style={styles.navBtnBack}>{'<'}</Text>
          </Pressable>
          <Pressable style={styles.navBtn}>
            <Text style={styles.navBtnIcon}>🔔</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <Animated.View style={[styles.hero, heroStyle]}>
          <Text style={styles.heroLabel}>Накопления</Text>
          <Text style={styles.heroBalance}>{formatMoney(totalBalance)} ₽</Text>
          <Animated.View entering={FadeIn.delay(120)} style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              +{totalIncome.toLocaleString('ru-RU')} ₽{'  '}
              <Text style={styles.heroBadgeLabel}>за всё время ↑</Text>
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Action row 1 — Пополнить / Перевести */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.actionRow1}>
          <AnimatedPressable style={styles.actionBtn1} scaleValue={0.95}>
            <Text style={styles.actionBtn1Text}>Пополнить</Text>
          </AnimatedPressable>
          <AnimatedPressable style={styles.actionBtn1} scaleValue={0.95}>
            <Text style={styles.actionBtn1Text}>Перевести</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Action row 2 — chips */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.actionRow2}>
          <AnimatedPressable
            style={styles.actionChip}
            scaleValue={0.93}
            onPress={() => router.push('/analytics')}
          >
            <Text style={styles.actionChipIcon}>📊</Text>
            <Text style={styles.actionChipText}>Аналитика</Text>
          </AnimatedPressable>
          <AnimatedPressable
            style={styles.actionChip}
            scaleValue={0.93}
            onPress={() => router.push('/goal-create')}
          >
            <Text style={styles.actionChipIcon}>🎯</Text>
            <Text style={styles.actionChipText}>Новая цель</Text>
          </AnimatedPressable>
          <AnimatedPressable
            style={styles.actionChip}
            scaleValue={0.93}
            onPress={() => router.push('/catalog')}
          >
            <Text style={styles.actionChipIcon}>🔓</Text>
            <Text style={styles.actionChipText}>Открыть</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Product list */}
        <View style={styles.productList}>
          {accounts.map((acc, i) => (
            <ProductRow
              key={acc.id}
              account={acc}
              index={i}
              isLast={i === accounts.length - 1}
            />
          ))}

          {/* Add product row */}
          <Animated.View entering={FadeInDown.delay(200 + accounts.length * 60).springify()}>
            <AnimatedPressable
              style={styles.addRow}
              scaleValue={0.985}
              onPress={() => router.push('/catalog')}
            >
              <View style={styles.addIcon}>
                <Text style={styles.addIconText}>+</Text>
              </View>
              <View style={styles.productMeta}>
                <Text style={styles.productName}>Накопительный счёт «Кэшбокс»</Text>
                <Text style={styles.productSubtitle}>до 15% с ежедневной выплатой</Text>
              </View>
            </AnimatedPressable>
          </Animated.View>
        </View>

        {/* CTA button */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          style={styles.ctaWrap}
        >
          <AnimatedPressable
            style={styles.ctaOuter}
            scaleValue={0.97}
            onPress={() => router.push('/catalog')}
          >
            <LinearGradient
              colors={['#6B5FE6', '#4A3FC8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaTitle}>Подобрать накопление</Text>
              <Text style={styles.ctaSubtitle}>с умным поиском продуктов</Text>
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: { flex: 1 },

  // Navbar
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  navBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnBack: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: Fonts.compact,
    lineHeight: 28,
  },
  navBtnIcon: { fontSize: 18 },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  heroLabel: {
    fontFamily: Fonts.compact,
    fontSize: 17,
    lineHeight: 24,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  heroBalance: {
    fontFamily: Fonts.wideBold,
    fontSize: 36,
    lineHeight: 40,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  heroBadge: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.greenDim,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroBadgeText: {
    fontFamily: Fonts.compactMedium,
    fontSize: 13,
    color: Colors.green,
  },
  heroBadgeLabel: {
    fontFamily: Fonts.compact,
    fontSize: 13,
    color: Colors.textSecondary,
  },

  // Action row 1
  actionRow1: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  actionBtn1: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtn1Text: {
    fontFamily: Fonts.compactMedium,
    fontSize: 15,
    color: Colors.text,
  },

  // Action row 2 — chips
  actionRow2: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  actionChip: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionChipIcon: { fontSize: 14 },
  actionChipText: {
    fontFamily: Fonts.compact,
    fontSize: 11,
    color: Colors.text,
  },

  // Product list
  productList: {
    marginHorizontal: Spacing.xl,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.xxl,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  productRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  productIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  productIconText: { fontSize: 18 },
  productMeta: { flex: 1, marginRight: Spacing.sm },
  productName: {
    fontFamily: Fonts.compactMedium,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  productSubtitle: {
    fontFamily: Fonts.compact,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  productRight: { alignItems: 'flex-end' },
  productBalance: {
    fontFamily: Fonts.compactMedium,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text,
  },
  productIncome: {
    fontFamily: Fonts.compact,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.green,
    marginTop: 2,
  },

  // Add product row
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  addIconText: {
    color: Colors.textTertiary,
    fontSize: 20,
    lineHeight: 24,
    fontFamily: Fonts.compact,
  },

  // CTA
  ctaWrap: {
    paddingHorizontal: Spacing.xl,
  },
  ctaOuter: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: 18,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontFamily: Fonts.wideBold,
    fontSize: 15,
    lineHeight: 20,
    color: Colors.text,
  },
  ctaSubtitle: {
    fontFamily: Fonts.compact,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
});
