import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

export default function HomeScreen() {
  const [status, setStatus] = useState('Testando conexão...');

  useEffect(() => {
    testarFirebase();
  }, []);

  async function testarFirebase() {
    try {
      await getDocs(collection(db, 'teste'));

      setStatus('🔥 Firebase conectado!');
    } catch (error) {
      console.error(error);

      setStatus('❌ Erro ao conectar ao Firebase');
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        MecSmart
      </Text>

      <Text style={styles.subtitle}>
        Gestão inteligente para oficinas
      </Text>

      <View style={styles.card}>
        <Text style={styles.status}>
          {status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  logo: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800',
  },

  subtitle: {
    color: '#A0A0A0',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },

  card: {
    marginTop: 40,
    paddingVertical: 18,
    paddingHorizontal: 28,
    backgroundColor: '#181818',
    borderRadius: 16,
  },

  status: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});