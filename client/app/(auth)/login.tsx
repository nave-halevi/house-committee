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

  // דיבוג: לוודא שה-env וה-redirect נטענים
  console.log('ENV clientId starts with:', process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.slice(0, 10));
  console.log('🔗 redirectUri (computed):', request?.redirectUri);

  useEffect(() => {
    // לוג מלא של התגובה מה-Auth (יכול להיות null עד שהמשתמש חוזר)
    console.log('🔍 Google response (raw):', JSON.stringify(response));

    if (navigated) return;

    if (response?.type === 'success') {
      // לפעמים הטוקן ב-authentication:
      let token = response.authentication?.accessToken;
      // לפעמים (במימושים מסוימים) הטוקן מגיע ב-params:
      token = token ?? response?.params?.access_token ?? response?.params?.id_token;

      if (token) {
        console.log('✅ Got token (length):', String(token).length);
        setNavigated(true);
        setToken(token);
        router.replace('/(tabs)/home');
      } else {
        console.log('⚠️ Success without token payload:', response);
        setError('Signed in but did not receive a token. Check Google client/flows.');
      }
    } else if (response?.type === 'error') {
      console.log('❌ Google error details:', response?.error || response?.params);
      setError('Google sign-in failed');
    }
  }, [response, navigated, setToken, router]);

  const onGooglePress = async () => {
    setError('');
    setIsBusy(true);
    try {
      console.log('🔘 request ready:', !!request);
      console.log('👉 Calling promptAsync');
      const res = await promptAsync();
      console.log('🔁 prompt result:', JSON.stringify(res));
      // success/cancel/error — הטיפול הסופי נעשה ב-useEffect
    } catch (e) {
      console.log('💥 prompt exception:', e);
      setError('Sign-in failed (exception)');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>House Committee</Text>
      <Text style={styles.subtitle}>נהל הוצאות, חיובים ותשלומים של הבניין</Text>

      <Pressable
        style={[styles.btn, (!request || isBusy) && styles.btnDisabled]}
        onPress={onGooglePress}
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
