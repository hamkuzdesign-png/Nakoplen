import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { Colors, Spacing, Radius, Typography } from '../src/theme';
import { goalEmojis, accounts } from '../src/data/mock';
import AnimatedPressable from '../src/components/AnimatedPressable';

const goalPresets = [
  { emoji: '🚗', name: 'Автомобиль', amount: '1 500 000' },
  { emoji: '🌴', name: 'Отпуск', amount: '150 000' },
  { emoji: '🏠', name: 'Квартира', amount: '5 000 000' },
  { emoji: '✈️', name: 'Путешествие', amount: '200 000' },
  { emoji: '📱', name: 'Гаджет', amount: '80 000' },
  { emoji: '🎓', name: 'Обучение', amount: '300 000' },
];

export default function GoalCreateScreen() {
  const insets = useSafeAreaInsets();
  const [selectedEmoji, setSelectedEmoji] = useState('🚗');
  const [goalName, setGoalName] = useState('Автомобиль');
  const [amount, setAmount] = useState('1 500 000');
  const [showAccountSheet, setShowAccountSheet] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]);
  const emojiScale = useSharedValue(1);

  const emojiStyle = useAnimatedStyle(() => ({
    transform: [{ scale: emojiScale.value }],
  }));

  const handleEmojiSelect = (emoji: string, name: string, amt: string) => {
    emojiScale.value = withSpring(1.3, { damping: 10 }, () => {
      emojiScale.value = withSpring(1);
    });
    setSelectedEmoji(emoji);
    setGoalName(name);
    setAmount(amt);
  };

  const handleCreate = () => {
    router.replace('/');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['rgba(50,30,150,0.9)', 'rgba(22,22,24,0)']}
        style={styles.bgGradient}
        pointerEvents="none"
      />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        </View>

        {/* Goal name + date */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.titleRow}>
          <TextInput
            style={styles.goalNameInput}
            value={goalName}
            onChangeText={setGoalName}
            placeholderTextColor={Colors.textSecondary}
          />
          <Text style={styles.editIcon}>✏️</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>📅 ДАТА НАКОПЛЕНИЯ</Text>
        </Animated.View>

        {/* Big emoji illustration */}
        <Animated.View entering={ZoomIn.delay(100).springify()} style={styles.illustrationWrap}>
          <Animated.Text style={[styles.bigEmoji, emojiStyle]}>{selectedEmoji}</Animated.Text>
        </Animated.View>

        {/* Emoji picker */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.emojiRow}>
          {goalPresets.map((p) => (
            <AnimatedPressable
              key={p.emoji}
              onPress={() => handleEmojiSelect(p.emoji, p.name, p.amount)}
              style={[
                styles.emojiBtn,
                selectedEmoji === p.emoji && styles.emojiBtnActive,
              ]}
              scaleValue={0.85}
            >
              <Text style={styles.emojiPicker}>{p.emoji}</Text>
            </AnimatedPressable>
          ))}
        </Animated.View>

        {/* Amount */}
        <Animated.View entering={FadeInDown.delay(280).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>Сколько нужно накопить?</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholderTextColor={Colors.textSecondary}
            />
            <Text style={styles.amountCurrency}>₽</Text>
          </View>
        </Animated.View>

        {/* Account selector */}
        <Animated.View entering={FadeInDown.delay(340).springify()} style={styles.section}>
          <AnimatedPressable
            style={styles.accountSelector}
            onPress={() => setShowAccountSheet(true)}
            scaleValue={0.97}
          >
            <View style={[styles.accountSelectorIcon, { backgroundColor: selectedAccount.color + '33' }]}>
              <Text>{selectedAccount.icon}</Text>
            </View>
            <Text style={styles.accountSelectorText}>
              {selectedAccount.name} − {selectedAccount.id.slice(-4)}
            </Text>
            <Text style={styles.selectorChevron}>∨</Text>
          </AnimatedPressable>
        </Animated.View>

        {/* Hint */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.hintBox}>
          <Text style={styles.hintIcon}>ℹ️</Text>
          <Text style={styles.hintText}>
            Пополните на <Text style={styles.hintAccent}>5 000 ₽ в месяц</Text>, чтобы
            закрыть цель до конца 2026 года
          </Text>
        </Animated.View>

        {/* Create button */}
        <Animated.View entering={FadeInDown.delay(460).springify()} style={styles.createBtnWrap}>
          <AnimatedPressable
            style={styles.createBtn}
            onPress={handleCreate}
            scaleValue={0.97}
          >
            <LinearGradient
              colors={['#6B6BFF', '#4A4ADB']}
              style={styles.createBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.createBtnText}>СОЗДАТЬ ЦЕЛЬ</Text>
            </LinearGradient>
          </AnimatedPressable>
        </Animated.View>

        <View style={{ height: insets.bottom + 32 }} />
      </ScrollView>

      {/* Account selection bottom sheet */}
      <Modal
        visible={showAccountSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAccountSheet(false)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setShowAccountSheet(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Где будете копить?</Text>
            <Pressable onPress={() => setShowAccountSheet(false)}>
              <Text style={styles.sheetClose}>✕</Text>
            </Pressable>
          </View>

          {accounts.slice(0, 3).map((acc) => (
            <AnimatedPressable
              key={acc.id}
              style={styles.sheetRow}
              onPress={() => {
                setSelectedAccount(acc);
                setShowAccountSheet(false);
              }}
              scaleValue={0.97}
            >
              <View style={[styles.sheetAccountIcon, { backgroundColor: acc.color + '33' }]}>
                <Text>{acc.icon}</Text>
              </View>
              <Text style={styles.sheetAccountName}>
                {acc.name} ·· {acc.id.slice(-4)}
              </Text>
              {selectedAccount.id === acc.id && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}
            </AnimatedPressable>
          ))}

          <AnimatedPressable
            style={styles.sheetSelectBtn}
            onPress={() => setShowAccountSheet(false)}
            scaleValue={0.97}
          >
            <LinearGradient
              colors={['#6B6BFF', '#4A4ADB']}
              style={styles.sheetSelectGradient}
            >
              <Text style={styles.sheetSelectText}>ВЫБРАТЬ</Text>
            </LinearGradient>
          </AnimatedPressable>

          <AnimatedPressable style={styles.sheetOpenNewBtn} scaleValue={0.97}>
            <Text style={styles.sheetOpenNewText}>ОТКРЫТЬ НОВЫЙ</Text>
          </AnimatedPressable>
        </View>
      </Modal>
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

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  goalNameInput: {
    ...Typography.h1,
    color: Colors.white,
    flex: 1,
    padding: 0,
  },
  editIcon: { fontSize: 18, marginLeft: 8 },

  dateBadge: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dateBadgeText: {
    color: Colors.textSecondary,
    ...Typography.captionMedium,
    letterSpacing: 0.5,
  },

  illustrationWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  bigEmoji: { fontSize: 110 },

  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  emojiBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emojiBtnActive: {
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.primaryDim,
  },
  emojiPicker: { fontSize: 22 },

  section: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectionLabel: { color: Colors.textSecondary, ...Typography.body, marginBottom: Spacing.sm },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountInput: {
    ...Typography.h2,
    color: Colors.white,
    flex: 1,
    padding: 0,
  },
  amountCurrency: { ...Typography.h3, color: Colors.textSecondary },

  accountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  accountSelectorIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  accountSelectorText: { flex: 1, color: Colors.white, ...Typography.bodyMedium },
  selectorChevron: { color: Colors.textSecondary, fontSize: 16 },

  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.primaryDim,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    gap: Spacing.sm,
  },
  hintIcon: { fontSize: 16 },
  hintText: { flex: 1, color: Colors.textSecondary, ...Typography.caption },
  hintAccent: { color: Colors.primary, fontWeight: '600' },

  createBtnWrap: { paddingHorizontal: Spacing.xl },
  createBtn: { borderRadius: Radius.xl, overflow: 'hidden' },
  createBtnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  createBtnText: { color: Colors.white, ...Typography.h3, letterSpacing: 0.5 },

  // Bottom sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.bgSheet,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderStrong,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  sheetTitle: { ...Typography.h2, color: Colors.white },
  sheetClose: { color: Colors.textSecondary, fontSize: 18 },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetAccountIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sheetAccountName: { flex: 1, color: Colors.white, ...Typography.bodyMedium },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  sheetSelectBtn: {
    marginTop: Spacing.xl,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  sheetSelectGradient: {
    paddingVertical: 17,
    alignItems: 'center',
  },
  sheetSelectText: { color: Colors.white, ...Typography.h3, letterSpacing: 0.5 },
  sheetOpenNewBtn: {
    marginTop: Spacing.md,
    paddingVertical: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderRadius: Radius.xl,
  },
  sheetOpenNewText: { color: Colors.white, ...Typography.h3, letterSpacing: 0.5 },
});
