// app/index.tsx
import useSession from '@/src/store/useSession';
import { Redirect } from 'expo-router';

export default function Index() {
  const token = useSession(s => s.token);
  return token ? <Redirect href="/(tabs)/home" /> : <Redirect href="/(auth)/login" />;
}
