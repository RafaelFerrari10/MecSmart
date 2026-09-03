import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { definirUsuarioLogado } from '@/store';
import { cadastrar } from '@/services/api';
import { ScreenHeader } from '@/components/ui';

type Perfil = 'mecanico' | 'cliente' | null;

function formatarCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarTelefone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function formatarDataNascimento(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2');
}

export default function CadastroScreen() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [perfil, setPerfil] = useState<Perfil>(null);
  const [especialidade, setEspecialidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [complemento, setComplemento] = useState('');

  const [carregando, setCarregando] = useState(false);

  async function handleCadastrar() {
    if (!nome || !cpf || !telefone || !dataNascimento || !email || !senha || !confirmarSenha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    if (cpf.replace(/\D/g, '').length !== 11) {
      Alert.alert('Atenção', 'Informe um CPF válido.');
      return;
    }

    if (telefone.replace(/\D/g, '').length < 10) {
      Alert.alert('Atenção', 'Informe um telefone válido.');
      return;
    }

    if (dataNascimento.replace(/\D/g, '').length !== 8) {
      Alert.alert('Atenção', 'Informe uma data de nascimento válida.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    if (!perfil) {
      Alert.alert('Atenção', 'Selecione se você é mecânico ou cliente.');
      return;
    }

    if (perfil === 'mecanico' && !especialidade.trim()) {
      Alert.alert('Atenção', 'Informe sua especialidade.');
      return;
    }

    if (perfil === 'cliente' && !endereco.trim()) {
      Alert.alert('Atenção', 'Informe seu endereço.');
      return;
    }

    // Aqui posteriormente entra o cadastro do Firebase
    setCarregando(true);
    try {
      const resultado = await cadastrar({
        tipo: perfil,
        nome,
        email,
        senha,
        dataNascimento,
        telefone,
        cpf,
        especialidade: perfil === 'mecanico' ? especialidade : undefined,
        endereco: perfil === 'cliente' ? endereco : undefined,
        complemento: perfil === 'cliente' ? complemento : undefined,
      });

      definirUsuarioLogado(resultado.usuario);
      router.replace('/home');
    } catch (erro) {
      Alert.alert('Erro no cadastro', erro instanceof Error ? erro.message : 'Tente novamente.');
    } finally {
      setCarregando(false);
    }
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
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <ScreenHeader titulo="Cadastro" voltar esconderPerfil />

          {/* LOGO */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/iconhome.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* FORMULÁRIO */}
          <View style={styles.form}>
            {/* NOME */}
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              placeholderTextColor="#9A9A9A"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />

            {/* CPF */}
            <Text style={[styles.label, styles.fieldSpacing]}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor="#9A9A9A"
              value={cpf}
              onChangeText={(text) => setCpf(formatarCPF(text))}
              keyboardType="number-pad"
            />

            {/* TELEFONE */}
            <Text style={[styles.label, styles.fieldSpacing]}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor="#9A9A9A"
              value={telefone}
              onChangeText={(text) => setTelefone(formatarTelefone(text))}
              keyboardType="phone-pad"
            />

            {/* DATA DE NASCIMENTO */}
            <Text style={[styles.label, styles.fieldSpacing]}>
              Data de nascimento
            </Text>
            <TextInput
              style={styles.input}
              placeholder="dd/mm/aaaa"
              placeholderTextColor="#9A9A9A"
              value={dataNascimento}
              onChangeText={(text) => setDataNascimento(formatarDataNascimento(text))}
              keyboardType="number-pad"
            />

            {/* EMAIL */}
            <Text style={[styles.label, styles.fieldSpacing]}>Email</Text>
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
            <Text style={[styles.label, styles.fieldSpacing]}>Senha</Text>
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

            {/* CONFIRMAR SENHA */}
            <Text style={[styles.label, styles.fieldSpacing]}>
              Confirmar senha
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirme sua senha"
                placeholderTextColor="#9A9A9A"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry={!mostrarConfirmarSenha}
                autoCapitalize="none"
              />

              <Pressable
                onPress={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={mostrarConfirmarSenha ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#777"
                />
              </Pressable>
            </View>

            {/* PERFIL */}
            <Text style={[styles.label, styles.fieldSpacing]}>
              Você é:
            </Text>
            <View style={styles.profileContainer}>
              <Pressable
                style={[
                  styles.profileOption,
                  perfil === 'mecanico' && styles.profileOptionSelected,
                ]}
                onPress={() => setPerfil('mecanico')}
              >
                <Ionicons
                  name="build"
                  size={16}
                  color={perfil === 'mecanico' ? '#FFFFFF' : '#9A9A9A'}
                />
                <Text
                  style={[
                    styles.profileText,
                    perfil === 'mecanico' && styles.profileTextSelected,
                  ]}
                >
                  Mecânico
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.profileOption,
                  perfil === 'cliente' && styles.profileOptionSelected,
                ]}
                onPress={() => setPerfil('cliente')}
              >
                <Ionicons
                  name="car"
                  size={16}
                  color={perfil === 'cliente' ? '#FFFFFF' : '#9A9A9A'}
                />
                <Text
                  style={[
                    styles.profileText,
                    perfil === 'cliente' && styles.profileTextSelected,
                  ]}
                >
                  Cliente
                </Text>
              </Pressable>
            </View>

            {/* ESPECIALIDADE (mecânico) */}
            {perfil === 'mecanico' && (
              <>
                <Text style={[styles.label, styles.fieldSpacing]}>Especialidade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: Motor e suspensão"
                  placeholderTextColor="#9A9A9A"
                  value={especialidade}
                  onChangeText={setEspecialidade}
                />
              </>
            )}

            {/* ENDEREÇO (cliente) */}
            {perfil === 'cliente' && (
              <>
                <Text style={[styles.label, styles.fieldSpacing]}>Endereço</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Rua, número, bairro"
                  placeholderTextColor="#9A9A9A"
                  value={endereco}
                  onChangeText={setEndereco}
                />

                <Text style={[styles.label, styles.fieldSpacing]}>Complemento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Apto, bloco (opcional)"
                  placeholderTextColor="#9A9A9A"
                  value={complemento}
                  onChangeText={setComplemento}
                />
              </>
            )}

            {/* CADASTRAR */}
            <Pressable
              style={({ pressed }) => [
                styles.cadastrarButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleCadastrar}
            >
              <Text style={styles.cadastrarText}>
                Cadastrar
              </Text>
            </Pressable>

            {/* JÁ TEM CONTA */}
            <Pressable
              onPress={() => router.push('/login')}
              style={styles.loginButton}
            >
              <Text style={styles.loginText}>
                Já tem conta? <Text style={styles.loginLink}>Entrar</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
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
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
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

  fieldSpacing: {
    marginTop: 16,
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

  profileContainer: {
    flexDirection: 'row',
    gap: 10,
  },

  profileOption: {
    flex: 1,
    height: 44,
    backgroundColor: '#303030',
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  profileOptionSelected: {
    backgroundColor: '#F3222A',
  },

  profileText: {
    color: '#9A9A9A',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  profileTextSelected: {
    color: '#FFFFFF',
  },

  cadastrarButton: {
    height: 35,
    backgroundColor: '#F3222A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  cadastrarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  loginButton: {
    alignItems: 'center',
    marginTop: 16,
  },

  loginText: {
    color: '#8D8D8D',
    fontSize: 10,
  },

  loginLink: {
    color: '#F3222A',
    fontWeight: '700',
  },
});