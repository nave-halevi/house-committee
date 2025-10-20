// client/app/login.tsx
import useSession from '@/src/store/useSession';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const setToken = useSession((s) => s.setToken);

  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [navigated, setNavigated] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
    redirectUri: 'https://auth.expo.io/@nave_lev/house-committee',

  });
  console.log('🔗 redirectUri:', request?.redirectUri);

  useEffect(() => {
    if (!navigated && response?.type === 'success' && response.authentication?.accessToken) {
      setNavigated(true);
      const accessToken = response.authentication.accessToken;
      setToken(accessToken);
      router.replace('/(tabs)/home');
    } else if (response?.type === 'error') {
      setError('Google sign-in canceled or failed');
    }
  }, [response, navigated, setToken, router]);

  const onGooglePress = () => {
    setError('');
    setIsBusy(true);
    promptAsync().finally(() => setIsBusy(false));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>House Committee</Text>
      <Text style={styles.subtitle}>נהל הוצאות, חיובים ותשלומים של הבניין</Text>

      <Pressable
        style={[styles.btn, (!request || isBusy) && styles.btnDisabled]}
        onPress={() => promptAsync()}
        disabled={!request || isBusy}
      >
        <Text style={styles.btnText}>התחבר עם Google</Text>
      </Pressable>

      {isBusy && <ActivityIndicator style={{ marginTop: 12 }} />}
      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0b1320', gap: 16
  },
  title: { color: '#fff', fontSize: 24, fontWeight: '700' },
  subtitle: { color: '#cbd5e1', fontSize: 14, textAlign: 'center' },
  btn: { paddingVertical: 14, paddingHorizontal: 18, borderRadius: 12, backgroundColor: '#1a73e8' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  error: { color: '#ff6b6b', marginTop: 10, textAlign: 'center' },
});
