import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function handleLogin() {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha seu e-mail e sua senha.');
      return;
    }

    // Aqui posteriormente entra a autenticação do Firebase
    console.log('Login:', {
      email,
      senha,
    });
  }

  function handleEsqueciSenha() {
    console.log('Recuperar senha');
  }

  function handleCriarConta() {
    router.push('/cadastro');
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#A90008', '#570005', '#000000']}
        locations={[0, 0.22, 0.52]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Espaço reservado para a logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/iconhome.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* FORMULÁRIO */}
          <View style={styles.form}>
            {/* EMAIL */}
            <Text style={styles.label}>Email</Text>

            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              placeholderTextColor="#9A9A9A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* SENHA */}
            <Text style={[styles.label, styles.passwordLabel]}>
              Senha
            </Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite sua senha"
                placeholderTextColor="#9A9A9A"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
              />

              <Pressable
                onPress={() => setMostrarSenha(!mostrarSenha)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={mostrarSenha ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#777"
                />
              </Pressable>
            </View>

            {/* ESQUECI SENHA */}
            <Pressable
              onPress={handleEsqueciSenha}
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>
                Esqueceu sua senha?
              </Text>
            </Pressable>

            {/* ENTRAR */}
            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleLogin}
            >
              <Text style={styles.loginText}>
                Entrar
              </Text>
            </Pressable>

            {/* OU */}
            <View style={styles.dividerContainer}>
              <Text style={styles.orText}>OU</Text>
            </View>

            {/* CRIAR CONTA */}
            <Pressable
              onPress={handleCriarConta}
              style={styles.createAccountButton}
            >
              <Text style={styles.createAccountText}>
                Crie sua conta!
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },

  keyboard: {
    flex: 1,
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },

  logo: {
    width: 120,
    height: 120,
  },

  form: {
    width: '100%',
  },

  label: {
    color: '#BDBDBD',
    fontSize: 10,
    marginBottom: 7,
    marginLeft: 2,
  },

  passwordLabel: {
    marginTop: 20,
  },

  input: {
    height: 34,
    backgroundColor: '#303030',
    borderRadius: 9,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 10,
  },

  passwordContainer: {
    height: 34,
    backgroundColor: '#303030',
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    flex: 1,
    height: 34,
    paddingHorizontal: 12,
    color: '#FFFFFF',
    fontSize: 10,
  },

  eyeButton: {
    width: 38,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  forgotButton: {
    alignItems: 'center',
    marginTop: 10,
  },

  forgotText: {
    color: '#BDBDBD',
    fontSize: 10,
    fontWeight: '500',
  },

  loginButton: {
    height: 35,
    backgroundColor: '#F3222A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  dividerContainer: {
    alignItems: 'center',
    marginTop: 45,
  },

  orText: {
    color: '#8D8D8D',
    fontSize: 10,
  },

  createAccountButton: {
    alignItems: 'center',
    marginTop: 12,
  },

  createAccountText: {
    color: '#F3222A',
    fontSize: 12,
    fontWeight: '700',
  },
});