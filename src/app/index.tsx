import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

export default function LoadingScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('./login');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrapper}>
        <Image
          source={require('@/assets/images/Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <ActivityIndicator size="large" color="#F3222A" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
  },

  logoWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: '80%',
    maxWidth: 360,
    aspectRatio: 2080 / 756,
  },

  spinner: {
    paddingBottom: 90,
  },
});