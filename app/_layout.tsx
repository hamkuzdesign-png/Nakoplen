import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../src/theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'MTSWide-Medium':      require('../assets/fonts/MTSWide-Medium.ttf'),
    'MTSWide-Bold':        require('../assets/fonts/MTSWide-Bold.ttf'),
    'MTSCompact-Regular':  require('../assets/fonts/MTSCompact-Regular.ttf'),
    'MTSCompact-Medium':   require('../assets/fonts/MTSCompact-Medium.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.text} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'slide_from_right',
        }}
      />
    </GestureHandlerRootView>
  );
}
