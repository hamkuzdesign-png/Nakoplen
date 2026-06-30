import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../src/theme';
import AnimatedPressable from '../src/components/AnimatedPressable';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Assets ──────────────────────────────────────────────────────────────────
const BG = require('../assets/images/bg_gradient.png');

const ILLUSTRATIONS: Record<string, any> = {
  daily:       require('../assets/images/illus_daily.png'),
  cashbox:     require('../assets/images/illus_cashbox.png'),
  vklad:       require('../assets/images/illus_mts_savings.png'),
  mts_money:   require('../assets/images/illus_digital.png'),
  mts_savings: require('../assets/images/illus_mts_savings2.png'),
  digital:     require('../assets/images/illus_digital2.png'),
  metals:      require('../assets/images/illus_extra2.png'),
};

// ─── Data ────────────────────────────────────────────────────────────────────
const filters = [
  { label: 'Высокий процент',       icon: '📈' },
  { label: 'Стабильный доход',      icon: '🛡️' },
  { label: 'Доступ к деньгам',      icon: '💳' },
  { label: 'Подушка безопасности',  icon: '🛋️' },
  { label: 'Без минимальной суммы', icon: '🆓' },
  { label: 'Можно пополнить',       icon: '➕' },
];

const sections = [
  {
    label: 'СЧЕТА И БОНУСЫ',
    products: [
      { id: 'daily',     name: 'Ежедневный остаток',    subtitle: 'Если часто снимаете деньги',              rate: 'До 16%',   illus: 'daily',       badge: 1 },
      { id: 'cashbox',   name: 'Кешбокс',               subtitle: 'Ставка растёт каждый день',               rate: 'До 15%',   illus: 'cashbox',     badge: 1 },
      { id: 'mts-bonus', name: 'Бонусы МТС',            subtitle: 'Кешбэк за остаток на счёте',             rate: 'До 10%',   illus: 'daily',       badge: 0 },
      { id: 'mts-prem',  name: 'МТС Premium',           subtitle: 'Повышенный процент для Premium',         rate: 'До 18%',   illus: 'cashbox',     badge: 0 },
    ],
  },
  {
    label: 'ВКЛАДЫ',
    products: [
      { id: 'vklad',     name: 'Вклад Плюс',            subtitle: 'В рублях, юанях или дирхамах',            rate: 'До 14,7%', illus: 'vklad',       badge: 1 },
      { id: 'mts-money', name: 'МТС Деньги',            subtitle: 'В рублях. Без снятия и пополнения',       rate: 'До 14,5%', illus: 'mts_money',   badge: 1 },
      { id: 'vklad-max', name: 'Вклад Максимум',        subtitle: 'Максимальная ставка на срок',             rate: 'До 18,3%', illus: 'vklad',       badge: 0 },
    ],
  },
  {
    label: 'РЫНОЧНЫЕ ИНСТРУМЕНТЫ',
    products: [
      { id: 'savings',   name: 'МТС Накопления',        subtitle: 'Получайте кешбэк за деньги на счету',     rate: 'До 16,5%', illus: 'mts_savings', badge: 1 },
      { id: 'digital',   name: 'Цифровые активы',       subtitle: 'Как облигации, только на блокчейне',      rate: 'до 21%',   illus: 'digital',     badge: 1 },
      { id: 'gold',      name: 'Золото',                subtitle: 'Инвестиции в драгоценные металлы',        rate: 'Рыночная', illus: 'mts_savings', badge: 0 },
    ],
  },
];

const faqItems = [
  'Накопительные счета',
  'Вклады',
  'МТС Накопления',
  'Цифровые финансовые активы',
  'Металлы',
  'Бонусы за накопления',
];

// ─── Rate Badge ───────────────────────────────────────────────────────────────
function RateBadge({ rate }: { rate: string }) {
  return (
    <View style={styles.rateBadge}>
      <Text style={styles.rateBadgeText}>{rate}</Text>
    </View>
  );
}

// ─── Counter Badge ────────────────────────────────────────────────────────────
function CounterBadge({ count }: { count: number }) {
  return (
    <View style={styles.counterBadge}>
      <Text style={styles.counterBadgeText}>{count}</Text>
    </View>
  );
}

// ─── Filter Chip ─────────────────────────────────────────────────────────────
function FilterChip({ icon, label, active, onPress }: {
  icon: string; label: string; active: boolean; onPress: () => void;
}) {
  return (
    <AnimatedPressable onPress={onPress} style={[styles.chip, active && styles.chipActive]} scaleValue={0.93}>
      <Text style={styles.chipIcon}>{icon}</Text>
      <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{label}</Text>
    </AnimatedPressable>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product, index,
}: {
  product: typeof sections[0]['products'][0]; index: number;
}) {
  return (
    <Animated.View style={styles.cardOuter} entering={FadeInDown.delay(100 + index * 60).springify()}>
      <AnimatedPressable
        style={styles.card}
        onPress={() => router.push({ pathname: '/account-detail', params: { id: product.id } })}
      >
        {/* Name row */}
        <View style={styles.cardNameRow}>
          <Text style={styles.cardName}>{product.name}</Text>
          {product.badge > 0 && <CounterBadge count={product.badge} />}
        </View>

        {/* Subtitle */}
        <Text style={styles.cardSubtitle}>{product.subtitle}</Text>

        {/* Rate badge */}
        <RateBadge rate={product.rate} />

        {/* 3D Illustration */}
        <Image
          source={ILLUSTRATIONS[product.illus]}
          style={styles.cardIllus}
          resizeMode="contain"
        />
      </AnimatedPressable>
    </Animated.View>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ label, index, isLast }: { label: string; index: number; isLast: boolean }) {
  const [open, setOpen] = useState(false);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(v => !v);
  };
  return (
    <Animated.View entering={FadeInDown.delay(350 + index * 40).springify()}>
      <AnimatedPressable
        style={[styles.faqRow, !isLast && styles.faqRowBorder]}
        onPress={toggle}
        scaleValue={0.988}
      >
        <Text style={styles.faqLabel}>{label}</Text>
        <Text style={[styles.faqChevron, open && styles.faqChevronOpen]}>⌄</Text>
      </AnimatedPressable>
      {open && (
        <View style={styles.faqBody}>
          <Text style={styles.faqBodyText}>
            Нажмите, чтобы узнать подробнее об этом продукте.
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CatalogScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  const toggleFilter = (label: string) => {
    setActiveFilters(prev =>
      prev.includes(label) ? prev.filter(f => f !== label) : [...prev, label]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Full-screen background gradient from Figma */}
      <Image source={BG} style={styles.bgImage} resizeMode="cover" />
      {/* Dark overlay for top area */}
      <View style={styles.bgTopOverlay} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Back */}
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        </View>

        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.hero}>
          <Text style={styles.heroTitle}>Накопления</Text>
          <Text style={styles.heroSubtitle}>Выберите критерии, покажем варианты</Text>
        </Animated.View>

        {/* Filter chips — 2 columns */}
        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.chipsGrid}>
          {filters.map(f => (
            <FilterChip
              key={f.label} icon={f.icon} label={f.label}
              active={activeFilters.includes(f.label)}
              onPress={() => toggleFilter(f.label)}
            />
          ))}
        </Animated.View>

        {/* Pagination dots */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.dot, i === 0 && styles.dotActive]} />
          ))}
        </Animated.View>

        {/* Product sections */}
        {sections.map((section, si) => (
          <View key={section.label} style={styles.section}>
            <Animated.Text
              entering={FadeInDown.delay(100 + si * 50).springify()}
              style={styles.sectionLabel}
            >
              {section.label}
            </Animated.Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cardsRow}
            >
              {section.products.map((product, pi) => (
                <ProductCard key={product.id} product={product} index={si * 3 + pi} />
              ))}
            </ScrollView>
          </View>
        ))}

        {/* FAQ */}
        <View style={styles.faqSection}>
          <Animated.Text
            entering={FadeInDown.delay(300).springify()}
            style={styles.faqTitle}
          >
            Частые вопросы
          </Animated.Text>
          <View style={styles.faqCard}>
            {faqItems.map((item, i) => (
              <FaqItem key={item} label={item} index={i} isLast={i === faqItems.length - 1} />
            ))}
          </View>
        </View>

        {/* End */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.endSection}>
          <Text style={styles.endEmoji}>🤖</Text>
          <Text style={styles.endTitle}>Конец каталога</Text>
          <Text style={styles.endSubtitle}>Показали все накопительные продукты</Text>
          <AnimatedPressable
            style={styles.upBtn}
            scaleValue={0.96}
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
          >
            <Text style={styles.upBtnText}>НАВЕРХ</Text>
          </AnimatedPressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  bgImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
  },
  bgTopOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // Header
  headerRow: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  backBtn: { padding: 8, alignSelf: 'flex-start' },
  backIcon: { color: Colors.white, fontSize: 28, fontWeight: '300' },

  // Hero
  hero: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 },
  heroTitle: {
    ...Typography.title,
    color: Colors.white,
    marginBottom: 6,
  },
  heroSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },

  // Filter chips
  chipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 6,
  },
  chipActive: {
    backgroundColor: 'rgba(143,143,255,0.18)',
    borderColor: 'rgba(143,143,255,0.5)',
  },
  chipIcon: { fontSize: 14 },
  chipLabel: { ...Typography.chip, color: Colors.textSecondary },
  chipLabelActive: { color: '#8F8FFF' },

  // Dots
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginBottom: 24 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotActive: { backgroundColor: Colors.white, width: 18, borderRadius: 3 },

  // Sections
  section: { marginBottom: 24 },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  cardsRow: { flexDirection: 'row', gap: 8, paddingLeft: 20, paddingRight: 20 },

  // Card
  cardOuter: { width: 162 },
  card: {
    backgroundColor: 'rgba(98,108,119,0.25)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    height: 192,
    padding: 12,
  },
  cardNameRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 6 },
  cardName: {
    ...Typography.cardValue,
    color: Colors.text,
    flex: 1,
    flexShrink: 1,
  },
  cardSubtitle: {
    ...Typography.cardSubtitle,
    color: Colors.textSecondary,
    marginBottom: 'auto' as any,
  },
  cardIllus: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 88,
    height: 88,
  },

  // Rate badge — green bg chip
  rateBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(38,205,88,0.12)',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 'auto' as any,
    marginBottom: 4,
  },
  rateBadgeText: {
    ...Typography.cardValue,
    color: Colors.green,
  },

  // Counter badge — red circle
  counterBadge: {
    backgroundColor: Colors.red,
    borderRadius: 99,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  counterBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },

  // FAQ
  faqSection: { paddingHorizontal: 20, marginBottom: 24 },
  faqTitle: {
    ...Typography.sectionTitle,
    color: Colors.white,
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: 'rgba(44,49,53,0.9)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  faqRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  faqLabel: { flex: 1, ...Typography.bodyLargeBold, color: Colors.text },
  faqChevron: { color: Colors.textSecondary, fontSize: 20, lineHeight: 24 },
  faqChevronOpen: { transform: [{ rotate: '180deg' }] },
  faqBody: { paddingHorizontal: 16, paddingBottom: 12 },
  faqBodyText: { ...Typography.cardSubtitle, color: Colors.textSecondary },

  // End
  endSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  endEmoji: { fontSize: 72, marginBottom: 16 },
  endTitle: { ...Typography.sectionTitle, color: Colors.white, marginBottom: 6 },
  endSubtitle: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  upBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 48,
    paddingVertical: 14,
  },
  upBtnText: {
    ...Typography.button,
    color: Colors.white,
    textTransform: 'uppercase',
  },
});
