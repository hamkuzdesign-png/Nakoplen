import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Colors, Radius } from '../theme';

interface Props {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  delay?: number;
}

export default function ProgressBar({
  progress,
  height = 6,
  color = Colors.green,
  delay = 300,
}: Props) {
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withDelay(
      delay,
      withSpring(progress, { damping: 20, stiffness: 80 })
    );
  }, [progress]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fill, { height, backgroundColor: color }, animStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: Radius.full,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    borderRadius: Radius.full,
  },
});
